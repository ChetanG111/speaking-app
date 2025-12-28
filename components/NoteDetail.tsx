
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { PlaybackBar } from './PlaybackBar';
import { storageService } from '../services/storageService';
import { transcribeAudio, generateTitle } from '../services/aiService';

interface NoteDetailProps {
  note: Note;
  onBack: () => void;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  onError?: (error: Error) => void;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ note, onBack, onUpdate, onDelete, onError }) => {
  const [title, setTitle] = useState(note.title);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isLocalTranscribing, setIsLocalTranscribing] = useState(false);

  useEffect(() => {
    storageService.getAudio(note.id).then(setAudioBlob);
  }, [note.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate({ ...note, title: newTitle });
  };

  const handleTranscribe = async () => {
    if (!audioBlob || isLocalTranscribing || note.status === 'transcribing') return;

    setIsLocalTranscribing(true);
    onUpdate({ ...note, status: 'transcribing' });

    try {
      const transcript = await transcribeAudio(audioBlob);
      // Only generate a new title if the current one is default/placeholder
      let newTitle = note.title;
      if (note.title === "New Voice Note" || note.title === "New Recording" || note.title === "Untitled Note") {
        newTitle = await generateTitle(transcript);
        setTitle(newTitle);
      }

      onUpdate({
        ...note,
        transcript,
        title: newTitle,
        status: 'completed'
      });
    } catch (err: any) {
      console.error("Manual transcription failed", err);
      onUpdate({ ...note, status: 'failed' });
      if (onError) onError(err);
    } finally {
      setIsLocalTranscribing(false);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (s: number) => {
    return `${Math.floor(s).toString().padStart(2, '0')}S RECORDING`;
  };

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      onDelete(note.id);
    } else {
      setIsConfirmingDelete(true);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };

  const showTranscribing = note.status === 'transcribing' || isLocalTranscribing;
  const hasTranscript = note.transcript && note.transcript.trim().length > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface">
        <button onClick={onBack} className="text-secondary hover:text-primary transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
        <span className="text-[10px] sm:text-xs text-secondary font-mono tracking-widest uppercase">Note Details</span>
        <button
          onClick={handleDeleteClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${isConfirmingDelete
              ? 'bg-accent text-background font-bold text-[10px] sm:text-xs animate-pulse'
              : 'text-secondary hover:text-accent p-2'
            }`}
          aria-label="Delete note"
        >
          {isConfirmingDelete ? (
            "Tap to confirm"
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          )}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 sm:p-6 pb-40">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="bg-transparent border-none text-3xl sm:text-4xl lg:text-5xl font-bold text-primary w-full outline-none placeholder:text-surface leading-tight"
              placeholder="Untitled Note"
            />
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-secondary mt-4 font-medium uppercase tracking-wider">
              <span>{formatDate(note.createdAt)}</span>
              <span className="opacity-30 hidden sm:inline">•</span>
              <span>{formatDuration(note.duration)}</span>
              <span className="opacity-30 hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
                Voice Note
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {showTranscribing ? (
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-4 sm:mb-6 text-accent flex items-center gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent animate-pulse" />
                Transcribing...
              </div>
            ) : hasTranscript ? (
              <h4 className="text-[9px] sm:text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-4 sm:mb-6 opacity-60 select-none">
                Transcript
              </h4>
            ) : (
              <button
                onClick={handleTranscribe}
                className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-4 sm:mb-6 transition-all flex items-center gap-2 bg-accent/10 text-accent px-3 py-2 sm:px-4 sm:py-2.5 rounded-full hover:bg-accent/20 active:scale-95"
              >
                Transcribe
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            )}

            {showTranscribing ? (
              <div className="flex flex-col gap-2">
                <div className="h-3 bg-surface rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-surface rounded w-1/2 animate-pulse" />
                <div className="h-3 bg-surface rounded w-2/3 animate-pulse" />
              </div>
            ) : (
              <p className="text-lg sm:text-xl leading-relaxed text-secondary/90 whitespace-pre-wrap font-medium">
                {note.transcript || (
                  <span className="italic opacity-30 text-sm sm:text-base">
                    Transcript not yet generated.
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <PlaybackBar audioBlob={audioBlob} duration={note.duration} />
    </div>
  );
};

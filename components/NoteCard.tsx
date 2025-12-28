
import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-surface p-6 rounded-[24px] border border-elevated hover:bg-elevated transition-all duration-200 cursor-pointer group flex flex-col"
    >
      <h3 className="text-[19px] font-bold text-primary mb-3 leading-tight">
        {note.title || "Untitled Note"}
      </h3>

      <p className="text-secondary/80 text-[15px] leading-relaxed line-clamp-2 mb-6 min-h-[44px]">
        {note.status === 'transcribing' ? (
          <span className="italic flex items-center gap-2 text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Transcribing...
          </span>
        ) : (
          note.transcript || "No transcript available."
        )}
      </p>

      <div className="pt-4 border-t border-secondary/10 flex items-center justify-between">
        <span className="text-secondary/50 text-[13px] font-medium tracking-tight">
          {formatDate(note.createdAt)}
        </span>
        <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full text-accent text-[12px] font-bold tabular-nums">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          {formatDuration(note.duration)}
        </div>
      </div>
    </div>
  );
};

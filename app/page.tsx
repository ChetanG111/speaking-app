'use client';

import React, { useState, useEffect } from 'react';
import { Note, AppState } from '../types';
import { storageService } from '../services/storageService';
import { RecordingScreen } from '../components/RecordingScreen';
import { NoteCard } from '../components/NoteCard';
import { NoteDetail } from '../components/NoteDetail';
import { ErrorDialog } from '../components/ErrorDialog';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>({ view: 'list' });
    const [notes, setNotes] = useState<Note[]>([]);
    const [showQuotaError, setShowQuotaError] = useState(false);

    // Load notes on mount
    useEffect(() => {
        const loadedNotes = storageService.getNotes();
        setNotes(loadedNotes);
    }, []);

    const handleStartRecording = () => {
        setAppState({ view: 'recording' });
    };

    const handleRecordingStop = async (audioBlob: Blob, duration: number) => {
        // Automatically discard recordings shorter than or equal to 1 second (accidental taps)
        if (duration <= 1) {
            setAppState({ view: 'list' });
            return;
        }

        const id = crypto.randomUUID();
        const newNote: Note = {
            id,
            title: "New Voice Note",
            transcript: "",
            duration,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'completed'
        };

        // Save locally immediately
        storageService.addNote(newNote);
        await storageService.saveAudio(id, audioBlob);
        setNotes(prev => [newNote, ...prev]);
        setAppState({ view: 'list' });
    };

    const handleUpdateNote = (updatedNote: Note) => {
        storageService.updateNote(updatedNote);
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    };

    const handleDeleteNote = (id: string) => {
        storageService.deleteNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
        setAppState({ view: 'list' });
    };

    const handleApiError = (error: Error) => {
        if (error.message === 'QUOTA_EXHAUSTED') {
            setShowQuotaError(true);
        }
    };

    const currentNote = notes.find(n => n.id === appState.selectedNoteId);

    return (
        <div className="min-h-screen bg-background text-primary selection:bg-accent/30 selection:text-primary">
            {appState.view === 'list' && (
                <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32">
                    {/* Custom Header */}
                    <header className="flex items-center justify-between mb-8 sm:mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent/10 flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="3" y="10" width="2" height="4" rx="1" />
                                    <rect x="7" y="7" width="2" height="10" rx="1" />
                                    <rect x="11" y="4" width="2" height="16" rx="1" />
                                    <rect x="15" y="7" width="2" height="10" rx="1" />
                                    <rect x="19" y="10" width="2" height="4" rx="1" />
                                </svg>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight">VoiceNotes</h1>
                        </div>

                        <button className="p-2 text-secondary hover:text-primary transition-colors">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                        </button>
                    </header>

                    <div className="flex gap-4 sm:gap-8 border-b border-surface mb-6 sm:mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <button className="pb-4 border-b-2 border-accent text-primary text-xs sm:text-sm font-medium">All Notes</button>
                        <button className="pb-4 text-secondary/40 text-xs sm:text-sm font-medium cursor-not-allowed">Speaking Coach (Soon)</button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {notes.length === 0 ? (
                            <div className="py-20 text-center text-secondary/50 px-4">
                                <p>No voice notes yet.</p>
                                <p className="text-xs sm:text-sm mt-1">Tap the button below to start recording.</p>
                            </div>
                        ) : (
                            notes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onClick={() => setAppState({ view: 'detail', selectedNoteId: note.id })}
                                />
                            ))
                        )}
                    </div>

                    <button
                        onClick={handleStartRecording}
                        className="fixed bottom-6 sm:bottom-10 right-6 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center text-background shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all z-40"
                    >
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                    </button>
                </div>
            )}

            {appState.view === 'recording' && (
                <RecordingScreen
                    onStop={handleRecordingStop}
                    onCancel={() => setAppState({ view: 'list' })}
                />
            )}

            {appState.view === 'detail' && currentNote && (
                <NoteDetail
                    note={currentNote}
                    onBack={() => setAppState({ view: 'list' })}
                    onUpdate={handleUpdateNote}
                    onDelete={handleDeleteNote}
                    onError={handleApiError}
                />
            )}

            {showQuotaError && <ErrorDialog onClose={() => setShowQuotaError(false)} />}
        </div>
    );
};

export default App;

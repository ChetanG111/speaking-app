
export type NoteStatus = 'recording' | 'transcribing' | 'completed' | 'failed';

export interface Note {
  id: string;
  title: string;
  transcript: string;
  duration: number; // in seconds
  createdAt: number;
  updatedAt: number;
  status: NoteStatus;
}

export interface AppState {
  view: 'list' | 'recording' | 'detail';
  selectedNoteId?: string;
}

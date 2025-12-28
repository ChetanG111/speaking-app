
import { Note } from '../types';

const NOTES_KEY = 'voicenotes_metadata';
const DB_NAME = 'VoiceNotesDB';
const STORE_NAME = 'audio_blobs';

/**
 * Handles persistent storage for notes metadata (LocalStorage) 
 * and audio blobs (IndexedDB).
 */
class StorageService {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveAudio(id: string, blob: Blob): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAudio(id: string): Promise<Blob | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  getNotes(): Note[] {
    const data = localStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveNotes(notes: Note[]): void {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }

  addNote(note: Note): void {
    const notes = this.getNotes();
    this.saveNotes([note, ...notes]);
  }

  updateNote(updatedNote: Note): void {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === updatedNote.id);
    if (index !== -1) {
      notes[index] = { ...updatedNote, updatedAt: Date.now() };
      this.saveNotes(notes);
    }
  }

  deleteNote(id: string): void {
    const notes = this.getNotes();
    this.saveNotes(notes.filter(n => n.id !== id));
    // Optional: Delete audio blob from IndexedDB as well
    this.getDB().then(db => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
    });
  }
}

export const storageService = new StorageService();

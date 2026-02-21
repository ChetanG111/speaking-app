
import { create } from 'zustand';
import { auth, db } from '@/lib/firebase';
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt?: Timestamp; // Add this field to align with UserProfile type
    stats: {
        xp: number;
        streak: number;
        level: string;
        totalSessions: number;
    };
}

interface AuthState {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    error: string | null;

    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => () => void; // Returns unsubscribe function
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    userData: null,
    loading: true,
    error: null,

    signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle the rest
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
            set({ user: null, userData: null });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    initialize: () => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, fetch/create profile
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        set({ user, userData: userSnap.data() as UserData, loading: false });
                    } else {
                        // Create new profile
                        const newUserData: UserData = {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            stats: {
                                xp: 0,
                                streak: 1, // Start streak
                                level: 'Beginner',
                                totalSessions: 0
                            }
                        };

                        await setDoc(userRef, {
                            ...newUserData,
                            createdAt: serverTimestamp()
                        });

                        set({ user, userData: newUserData, loading: false });
                    }
                } catch (error: any) {
                    console.error("Error fetching user data:", error);
                    set({ user, userData: null, loading: false, error: 'Failed to load user data' });
                }
            } else {
                // User is signed out
                set({ user: null, userData: null, loading: false });
            }
        });

        return unsubscribe;
    }
}));

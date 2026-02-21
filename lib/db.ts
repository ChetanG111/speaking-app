
import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    orderBy,
    limit
} from 'firebase/firestore';

// Types
export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Timestamp;
    stats: {
        xp: number;
        streak: number;
        level: string;
        totalSessions: number;
    };
}

export interface SpeechSession {
    id?: string;
    userId: string;
    topic: string;
    date: Timestamp;
    duration: number; // in seconds
    analysis: any; // Store the full analysis object
    score: number; // Store just the overall score for quick sorting
}

export interface Topic {
    id?: string;
    title: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    prompt?: string;
}

// User Functions
export const createUserProfile = async (user: any) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newUser: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: Timestamp.now(),
            stats: {
                xp: 0,
                streak: 0,
                level: "Beginner",
                totalSessions: 0
            }
        };
        await setDoc(userRef, newUser);
        return newUser;
    }

    return userSnap.data() as UserProfile;
};

export const getUserProfile = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
};

export const updateUserStats = async (uid: string, newStats: Partial<UserProfile['stats']>) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const currentStats = userSnap.data().stats;
        await updateDoc(userRef, {
            stats: { ...currentStats, ...newStats }
        });
    } else {
        console.warn(`User profile with uid ${uid} not found for stats update.`);
    }
};


// Session Functions
export const saveSession = async (session: Omit<SpeechSession, 'id'>) => {
    const sessionsRef = collection(db, 'speeches');
    const docRef = await addDoc(sessionsRef, session);
    return docRef.id;
};

export const getUserSessions = async (userId: string) => {
    const sessionsRef = collection(db, 'speeches');
    const q = query(
        sessionsRef,
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(20)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId || "",
            topic: data.topic || "Untitled Topic",
            date: data.date || Timestamp.now(),
            duration: data.duration || 0,
            analysis: data.analysis || {},
            score: data.score || 0
        } as SpeechSession;
    });
};

// Topic Functions (Optional)
export const saveTopic = async (topic: Topic) => {
    const topicsRef = collection(db, 'topics');
    await addDoc(topicsRef, topic);
};

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    increment,
    runTransaction,
    orderBy
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
    uid: string;
    preferences: string[] | null;
    recordingCount: number;
    lastRecordingAt?: Timestamp;
}

export interface Recording {
    userId: string;
    topic: string;
    transcript: string;
    metrics: {
        wpm: number;
        fillers: number;
        pauseDensity: number;
        structureScore: number;
    };
    feedback: {
        timestamp: string;
        text: string;
        type: "positive" | "negative" | "neutral";
    }[];
    createdAt: Timestamp;
}

/**
 * Initializes or fetches a user profile
 */
export async function getOrCreateUserProfile(uid: string): Promise<UserProfile> {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    } else {
        const newUser: UserProfile = {
            uid,
            preferences: null,
            recordingCount: 0,
        };
        await setDoc(userRef, newUser);
        return newUser;
    }
}

/**
 * Saves onboarding preferences
 */
export async function saveUserPreferences(uid: string, preferences: string[]) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
        preferences,
    });
}

/**
 * Saves a new recording and increments the user's recording count atomically
 */
export async function saveRecording(recording: Omit<Recording, "createdAt">) {
    return await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", recording.userId);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
            throw new Error("User profile not found");
        }

        const userData = userSnap.data() as UserProfile;

        if (userData.recordingCount >= 5) {
            throw new Error("Maximum recording limit reached (5/5)");
        }

        // Generate a new ID for the recording document
        const recordingRef = doc(collection(db, "recordings"));
        const recordingData = {
            ...recording,
            createdAt: Timestamp.now(),
        };

        // Perform atomic writes
        transaction.set(recordingRef, recordingData);
        transaction.update(userRef, {
            recordingCount: increment(1),
            lastRecordingAt: Timestamp.now()
        });

        return recordingRef.id;
    });
}

/**
 * Fetches all recordings for a user
 */
export async function getUserRecordings(uid: string): Promise<Recording[]> {
    const q = query(
        collection(db, "recordings"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Recording);
}

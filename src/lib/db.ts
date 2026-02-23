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
    increment
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
 * Saves a new recording and increments the user's recording count
 */
export async function saveRecording(recording: Omit<Recording, "createdAt">) {
    // 1. Double check the limit (though this should be handled on server in prod)
    const userRef = doc(db, "users", recording.userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() as UserProfile;

    if (userData.recordingCount >= 5) {
        throw new Error("Maximum recording limit reached (5/5)");
    }

    // 2. Save the recording
    const recordingData = {
        ...recording,
        createdAt: Timestamp.now(),
    };
    const recordingRef = await addDoc(collection(db, "recordings"), recordingData);

    // 3. Increment the user's count
    await updateDoc(userRef, {
        recordingCount: increment(1),
        lastRecordingAt: Timestamp.now()
    });

    return recordingRef.id;
}

/**
 * Fetches all recordings for a user
 */
export async function getUserRecordings(uid: string): Promise<Recording[]> {
    const q = query(collection(db, "recordings"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Recording);
}

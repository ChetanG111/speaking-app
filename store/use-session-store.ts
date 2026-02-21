"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { analyzeAudio, AnalysisResult } from '@/lib/analysis-service';
import { saveSession, updateUserStats } from '@/lib/db';
import { useAuthStore } from './use-auth-store';
import { Timestamp } from 'firebase/firestore';

interface SessionStore {
    status: 'IDLE' | 'CHOOSING_TOPIC' | 'GENERATING_POINTS' | 'PREPARING' | 'RECORDING' | 'ANALYZING' | 'PROGRESS' | 'HISTORY';
    topic: string;
    topicPoints: string[];
    isFallback?: boolean;
    prepTimeRemaining: number;
    recordingDuration: number;
    userProgress: {
        streak: number;
        xp: number;
        level: string;
    };
    analysis: AnalysisResult | null;

    setStatus: (status: 'IDLE' | 'CHOOSING_TOPIC' | 'GENERATING_POINTS' | 'PREPARING' | 'RECORDING' | 'ANALYZING' | 'PROGRESS' | 'HISTORY') => void;
    enterTopicSelection: () => void;
    setTopic: (topic: string) => void;
    setTopicPoints: (points: string[], isFallback?: boolean) => void;
    startSession: () => void;
    startPrep: () => void;
    cancelSession: () => void;
    updatePrepTime: (time: number) => void;
    startRecording: () => void;
    stopRecording: (audioBlob?: Blob | null) => Promise<void>;
    incrementRecordingTime: () => void;
}

export const useSessionStore = create<SessionStore>()(
    persist(
        (set, get) => ({
            status: 'IDLE',
            topic: 'Describe a challenge you overcame recently.',
            topicPoints: [],
            isFallback: false,
            prepTimeRemaining: 45,
            recordingDuration: 0,
            userProgress: {
                streak: 12,
                xp: 2450,
                level: 'Orator I',
            },
            analysis: null,

            setStatus: (status) => set({ status }),

            enterTopicSelection: () => set({ status: 'CHOOSING_TOPIC' }),
            setTopic: (topic) => set({ topic }),
            setTopicPoints: (points, isFallback = false) => set({ topicPoints: points, isFallback }),

            startSession: () => set({
                status: 'GENERATING_POINTS',
                prepTimeRemaining: 45,
                recordingDuration: 0,
                analysis: null,
                topicPoints: [], // Reset points for new session (will refetch)
                isFallback: false
            }),

            startPrep: () => set({
                status: 'PREPARING'
            }),

            cancelSession: () => set({
                status: 'IDLE',
                prepTimeRemaining: 45,
                recordingDuration: 0,
                analysis: null,
                topicPoints: []
            }),

            updatePrepTime: (time) => set({ prepTimeRemaining: time }),

            startRecording: () => set({
                status: 'RECORDING',
                recordingDuration: 0
            }),

            stopRecording: async (audioBlob) => {
                set({ status: 'ANALYZING' });

                try {
                    const blobToAnalyze = audioBlob || new Blob([], { type: 'audio/webm' });
                    const results = await analyzeAudio(blobToAnalyze);

                    const { user, userData } = useAuthStore.getState();

                    if (user && userData) { // Ensure both user and userData are available
                        try {
                            const currentTopic = get().topic || "General Practice";
                            const currentDuration = get().recordingDuration || 0;
                            const finalScore = Math.round(((results.fluencyScore || 0) + (results.grammarScore || 0)) / 2) || 0;

                            // Save to Firestore
                            await saveSession({
                                userId: user.uid,
                                topic: currentTopic,
                                date: Timestamp.now(),
                                duration: currentDuration,
                                analysis: results,
                                score: finalScore
                            });

                            // Update User Stats (XP)
                            // specific logic can be refined later
                            await updateUserStats(user.uid, {
                                xp: (userData.stats.xp || 0) + 50, // Use userData directly
                                totalSessions: (userData.stats.totalSessions || 0) + 1
                            });

                        } catch (dbError) {
                            console.error("Failed to save session to DB:", dbError);
                        }
                    } else {
                        console.warn("Session not saved: User or user data not available.");
                    }

                    // Update local state
                    set((state) => ({
                        analysis: results,
                        userProgress: {
                            ...state.userProgress,
                            xp: state.userProgress.xp + 50,
                            streak: state.userProgress.streak
                        }
                    }));

                } catch (e) {
                    console.error("Analysis failed", e);
                    set({ status: 'IDLE' }); // Reset on error
                }
            },

            incrementRecordingTime: () => set((state) => ({
                recordingDuration: state.recordingDuration + 1
            })),
        }),
        {
            name: 'fluent-arena-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ userProgress: state.userProgress }), // Only persist progress
        }
    )
);

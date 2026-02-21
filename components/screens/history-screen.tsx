"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, Calendar, ChevronRight, Mic } from "lucide-react";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useSessionStore } from "@/store/use-session-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useHaptics } from "@/hooks/use-haptics";
import { motion } from "framer-motion";
import { getUserSessions, SpeechSession } from "@/lib/db";
import { format } from "date-fns";

export const HistoryScreen = () => {
    const { setStatus, cancelSession } = useSessionStore();
    const { user } = useAuthStore();
    const { trigger } = useHaptics();
    const [sessions, setSessions] = useState<SpeechSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            if (user) {
                try {
                    const data = await getUserSessions(user.uid);
                    setSessions(data);

                    // Background Healing: identify sessions with missing fields and fix them
                    const malformed = data.filter(s => !s.topic || s.score === undefined || !s.date);
                    if (malformed.length > 0) {
                        console.log(`Found ${malformed.length} malformed sessions, healing...`);
                        // We don't await this to keep the UI fast
                        malformed.forEach(async (session) => {
                            if (!session.id) return;
                            const { db } = await import('@/lib/firebase');
                            const { doc, updateDoc } = await import('firebase/firestore');
                            const docRef = doc(db, 'speeches', session.id);
                            await updateDoc(docRef, {
                                topic: session.topic || "Untitled Topic",
                                score: session.score || 0,
                                duration: session.duration || 0
                            }).catch(err => console.error("Healing failed for", session.id, err));
                        });
                    }
                } catch (error) {
                    console.error("Error fetching sessions:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [user]);

    const handleBack = () => {
        trigger('medium');
        setStatus('IDLE');
    };

    const handleDragEnd = (_: any, info: any) => {
        // Swipe Left (negative X) to go back to Dashboard
        if (info.offset.x < -50) {
            trigger('medium');
            setStatus('IDLE');
        }
    };

    const formatDuration = (seconds: number) => {
        const s = seconds || 0;
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const safeFormatDate = (date: any) => {
        try {
            if (!date) return "Unknown date";

            // Check if it's a Firestore Timestamp instance
            if (date.toDate && typeof date.toDate === 'function') {
                return format(date.toDate(), "MMM d, yyyy");
            }

            // Handle plain object timestamp {seconds, nanoseconds}
            if (typeof date === 'object' && 'seconds' in date) {
                return format(new Date(date.seconds * 1000), "MMM d, yyyy");
            }

            // Check if it's already a JS Date
            if (date instanceof Date) {
                return format(date, "MMM d, yyyy");
            }

            // Try to parse as date string
            const parsed = new Date(date);
            if (!isNaN(parsed.getTime())) {
                return format(parsed, "MMM d, yyyy");
            }

            return "Invalid date";
        } catch (e) {
            console.error("Format date error:", e, date);
            return "Date error";
        }
    };

    return (
        <motion.div
            className="w-full h-full bg-[#0A0A0A] relative"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            onDragEnd={handleDragEnd as any}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.2, right: 0 }}
        >
            <ScreenContainer>
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        History
                    </h1>
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-white/60 text-sm font-medium active:scale-[0.98] transition-all"
                    >
                        Dashboard
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-10 touch-pan-y">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-3">
                            <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-white/40 text-sm">Loading recordings...</span>
                        </div>
                    ) : sessions.length > 0 ? (
                        <div className="space-y-4">
                            {sessions.map((session) => (
                                <motion.div
                                    key={session.id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="glass-panel p-4 rounded-2xl flex flex-col gap-3 group border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1 max-w-[80%]">
                                            <span className="text-xs text-blue-400 font-medium uppercase tracking-wider">
                                                {session.topic ? (
                                                    session.topic.length > 30 ? session.topic.substring(0, 30) + '...' : session.topic
                                                ) : 'Untitled Topic'}
                                            </span>
                                            <span className="text-sm font-medium text-white/90 line-clamp-1">
                                                {session.topic || "No topic recorded"}
                                            </span>
                                        </div>
                                        <div className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-500/20">
                                            {session.score || 0}%
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-white/40 text-[11px]">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {safeFormatDate(session.date)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {formatDuration(session.duration)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Mic className="w-3 h-3" />
                                            Recorded
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <Mic className="w-6 h-6 text-white/20" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium mb-1">No recordings yet</h3>
                                <p className="text-white/40 text-xs px-10">
                                    Start your first session to see your past recordings here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </ScreenContainer>
        </motion.div>
    );
};

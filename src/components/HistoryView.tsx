"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { getUserRecordings, Recording } from "@/lib/db";
import {
    Calendar,
    ChevronRight,
    Trophy,
    Clock,
    Mic2,
    ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryViewProps {
    uid: string;
    onBack: () => void;
    onSelect: (recording: Recording) => void;
}

export function HistoryView({ uid, onBack, onSelect }: HistoryViewProps) {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const data = await getUserRecordings(uid);
                // Sort by date desc
                setRecordings(data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [uid]);

    return (
        <div className="flex flex-col min-h-screen bg-background p-6">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 -ml-2 text-dimmed">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold tracking-tight">Your Journey</h1>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                </div>
            ) : recordings.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-4 opacity-50">
                        <Mic2 className="text-dimmed" />
                    </div>
                    <p className="text-dimmed">No sessions recorded yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recordings.map((rec, i) => (
                        <motion.button
                            key={rec.createdAt.toMillis()}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => onSelect(rec)}
                            className="w-full text-left"
                        >
                            <Card className="flex items-center gap-4 py-5 hover:border-orange/50 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
                                    <Trophy className="text-orange w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate mb-0.5">{rec.topic}</h3>
                                    <div className="flex items-center gap-3 text-dimmed text-[10px] font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} />
                                            {rec.createdAt.toDate().toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {rec.metrics.wpm} WPM
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-dimmed" />
                            </Card>
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}

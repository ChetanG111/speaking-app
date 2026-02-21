"use client";

import React, { useEffect } from "react";
import { X, Clock, Loader2 } from "lucide-react";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useSessionStore } from "@/store/use-session-store";
import { useHaptics } from "@/hooks/use-haptics";

import { motion } from "framer-motion";

export const PrepScreen = () => {
    const { 
        prepTimeRemaining, 
        updatePrepTime, 
        startRecording, 
        cancelSession, 
        topic, 
        topicPoints, 
        status, 
        isFallback, 
        startSession 
    } = useSessionStore();
    const { trigger } = useHaptics();

    useEffect(() => {
        // Only run timer if we are in PREPARING state
        if (status !== 'PREPARING') return;

        let interval: NodeJS.Timeout;
        if (prepTimeRemaining > 0) {
            interval = setInterval(() => {
                updatePrepTime(prepTimeRemaining - 1);
            }, 1000);
        } else if (prepTimeRemaining === 0) {
            // Auto-start recording
            trigger('success');
            startRecording();
        }
        return () => clearInterval(interval);
    }, [prepTimeRemaining, updatePrepTime, startRecording, trigger, status]);




    const handleSkip = () => {
        trigger('medium');
        startRecording();
    };

    const handleCancel = () => {
        trigger('medium');
        cancelSession();
    };

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.y > 100) {
            handleCancel();
        }
    };

    return (
        <motion.div
            className="w-full h-full"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
        >
            <ScreenContainer>
                {/* Navbar */}
                <div className="h-12 w-full flex justify-between items-center px-6 pt-8 pb-4 z-10">
                    <button
                        onClick={handleCancel}
                        className="w-10 h-10 flex items-center justify-center rounded-full glass-panel text-white/60 hover:text-white transition-colors active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-sm font-mono text-blue-400">
                            00:{prepTimeRemaining.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-8 pt-6 flex flex-col overflow-y-auto hide-scrollbar pb-10">
                    <span className="text-xs font-medium text-blue-500 uppercase tracking-widest mb-4">
                        Topic
                    </span>
                    <h2 className="text-2xl font-semibold tracking-tight leading-snug text-white mb-10">
                        {topic}
                    </h2>

                    <div className="space-y-6">
                        {isFallback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.02]"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-medium text-white/80">AI Suggestion Failed</span>
                                </div>
                                <p className="text-sm text-white/40 font-light leading-relaxed mb-4">
                                    We couldn't generate specific talking points for this topic right now. You can try again or use these general suggestions.
                                </p>
                                <button
                                    onClick={() => {
                                        trigger('medium');
                                        startSession();
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-600/30 transition-colors active:scale-95"
                                >
                                    Retry Generation
                                </button>
                            </motion.div>
                        )}

                        {topicPoints.length === 0 ? (
                            !isFallback && (
                                <div className="flex flex-col items-center justify-center py-10 opacity-50 gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                                    <span className="text-xs font-mono">Generating ideas...</span>
                                </div>
                            )
                        ) : (
                            topicPoints.map((point, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4 items-start group"
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full mt-2.5 ${index === 0 ? "bg-blue-500 shadow-[0_0_8px_#3B82F6]" : "bg-white/20"}`}></div>
                                    <p className={`text-base font-light leading-relaxed ${index === 0 ? "text-white/90" : "text-white/60"}`}>
                                        {point}
                                    </p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Bottom */}
                <div className="px-8 pb-12 cursor-pointer active:opacity-80 transition-opacity" onClick={handleSkip}>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${(prepTimeRemaining / 45) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-center text-xs text-white/30">
                        Timer auto-starts recording at 00:00 (Tap to skip)
                    </p>
                </div>
            </ScreenContainer>
        </motion.div>
    );
};

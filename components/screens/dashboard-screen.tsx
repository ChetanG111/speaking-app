"use client";

import React, { useState } from "react";
import { Flame, ArrowRight, ArrowLeft, Smartphone } from "lucide-react";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useSessionStore } from "@/store/use-session-store";
import { useHaptics } from "@/hooks/use-haptics";
import { motion, useDragControls } from "framer-motion";
import { useAuthStore } from "@/store/use-auth-store";
import { User, LogOut } from "lucide-react";

export const DashboardScreen = () => {
    const { startSession, userProgress, setStatus, enterTopicSelection } = useSessionStore();
    const { user, signInWithGoogle, logout } = useAuthStore();
    const { trigger } = useHaptics();
    const [imageError, setImageError] = useState(false);

    const handleStart = () => {
        trigger('medium');
        enterTopicSelection();
    };

    // Simple drag handling for swipe gestures
    const handleDragEnd = (_: any, info: any) => {
        const threshold = 50;
        const { offset } = info;

        if (offset.y < -threshold) {
            // Swipe Up -> Start Session
            trigger('success');
            enterTopicSelection();
        } else if (offset.x < -threshold) {
            // Swipe Left -> Progress Screen
            trigger('medium');
            setStatus('PROGRESS');
        } else if (offset.x > threshold) {
            // Swipe Right -> History Screen
            trigger('medium');
            setStatus('HISTORY');
        }
    };


    return (
        <motion.div
            drag
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd as any}
            className="w-full h-full"
        >
            <ScreenContainer>
                {/* Header */}
                <div className="px-6 mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-2 group relative">
                                {user.photoURL && !imageError ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || "User"}
                                        className="w-8 h-8 rounded-full border border-white/10"
                                        referrerPolicy="no-referrer"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                        <User className="w-4 h-4 text-white/60" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-white/90 leading-tight">
                                        {user.displayName?.split(' ')[0]}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="text-[10px] text-white/40 hover:text-white transition-colors text-left"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={signInWithGoogle}
                                className="flex items-center gap-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <User className="w-3 h-3" />
                                Sign In
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <Flame className="text-blue-500 w-4 h-4" />
                        <span className="text-sm font-medium">{userProgress.streak}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    {/* Level/XP Circle */}
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>

                        {/* SVG Ring */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="48%"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="2"
                                fill="none"
                            ></circle>
                            <circle
                                cx="50%"
                                cy="50%"
                                r="48%"
                                stroke="#3B82F6"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="300"
                                strokeDashoffset="100"
                                strokeLinecap="round"
                            ></circle>
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs tracking-widest text-blue-400 uppercase mb-2">
                                Level 0{userProgress.level}
                            </span>
                            <span className="text-3xl font-semibold text-white">
                                {userProgress.xp}
                            </span>
                            <span className="text-sm text-white/40 mt-1">Total XP</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full px-6 mt-10">
                        <div className="glass-panel rounded-2xl p-4 flex flex-col items-center">
                            <span className="text-xs text-white/40 mb-1">Personal Best</span>
                            <span className="text-xl font-medium tracking-tight">
                                45
                                <span className="text-sm text-white/40 ml-1">sec</span>
                            </span>
                        </div>
                        <div className="glass-panel rounded-2xl p-4 flex flex-col items-center">
                            <span className="text-xs text-white/40 mb-1">Fluency</span>
                            <span className="text-xl font-medium tracking-tight">
                                92
                                <span className="text-sm text-white/40 ml-1">%</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-6 pb-10 w-full flex flex-col items-center gap-6">
                    <div className="haptic-tag opacity-50 flex items-center gap-2">
                        <Smartphone size={12} />
                        Swipe Up Gesture
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium py-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 group active:scale-95 duration-100"
                    >
                        <span>Start Session</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex w-full justify-between items-center text-xs text-white/30 px-2">
                        <div onClick={() => setStatus('HISTORY')} className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>History</span>
                        </div>

                        <div onClick={() => setStatus('PROGRESS')} className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group">
                            <span>Progress</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </ScreenContainer>
        </motion.div>
    );
};

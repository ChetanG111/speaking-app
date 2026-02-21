"use client";

import React from "react";
import { ArrowLeft, Calendar, BarChart2 } from "lucide-react";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useSessionStore } from "@/store/use-session-store";
import { useHaptics } from "@/hooks/use-haptics";
import { motion } from "framer-motion";

export const ProgressScreen = () => {
    const { cancelSession } = useSessionStore();
    const { trigger } = useHaptics();

    const handleBack = () => {
        trigger('medium');
        cancelSession();
    };

    const handleDragEnd = (_: any, info: any) => {
        // Swipe Right (positive X) to go back
        if (info.offset.x > 50) {
            trigger('medium');
            cancelSession();
        }
    };

    return (
        <motion.div
            className="w-full h-full bg-[#0A0A0A] relative"
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="x"
            onDragEnd={handleDragEnd as any}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ right: 0.2 }}
        >
            <ScreenContainer>
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-white/60 text-sm font-medium active:scale-[0.98] transition-all"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        Your Progress
                    </h1>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-10 touch-pan-y">
                    {/* Summary Cards */}
                    <div className="flex gap-4 mb-8 overflow-x-auto hide-scrollbar pb-2">
                        <div className="min-w-[140px] glass-panel p-4 rounded-2xl">
                            <Calendar className="text-blue-500 mb-2 w-5 h-5" />
                            <div className="text-2xl font-medium">12</div>
                            <div className="text-xs text-white/40">Day Streak</div>
                        </div>
                        <div className="min-w-[140px] glass-panel p-4 rounded-2xl">
                            <BarChart2 className="text-white/60 mb-2 w-5 h-5" />
                            <div className="text-2xl font-medium">
                                4.5
                                <span className="text-sm text-white/40 ml-1">h</span>
                            </div>
                            <div className="text-xs text-white/40">Practice Time</div>
                        </div>
                    </div>

                    {/* Filler Trend Graph */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-sm font-medium text-white">
                                Filler Words Reduction
                            </h3>
                            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                                -24% this week
                            </span>
                        </div>

                        <div className="glass-panel rounded-2xl p-5 h-48 relative flex items-end justify-between gap-2">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none">
                                <div className="w-full h-px bg-white/5"></div>
                                <div className="w-full h-px bg-white/5"></div>
                                <div className="w-full h-px bg-white/5"></div>
                            </div>

                            {/* Bars */}
                            <div className="w-full bg-white/10 h-[80%] rounded-t-sm relative group"></div>
                            <div className="w-full bg-white/10 h-[60%] rounded-t-sm"></div>
                            <div className="w-full bg-white/10 h-[65%] rounded-t-sm"></div>
                            <div className="w-full bg-white/10 h-[50%] rounded-t-sm"></div>
                            <div className="w-full bg-white/10 h-[40%] rounded-t-sm"></div>
                            <div className="w-full bg-white/10 h-[35%] rounded-t-sm"></div>
                            <div className="w-full bg-blue-500 h-[20%] rounded-t-sm shadow-[0_0_10px_#3B82F6] relative">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white">
                                    2%
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-white/20 mt-2 px-1">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>

                    {/* WPM Graph (Line) */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-white mb-4">
                            Fluency Consistency
                        </h3>
                        <div className="glass-panel rounded-2xl p-0 h-40 overflow-hidden relative flex items-center">
                            <svg
                                className="w-full h-full"
                                viewBox="0 0 300 100"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2"></stop>
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,80 C50,70 80,90 120,50 C160,10 200,40 300,30"
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="2"
                                ></path>
                                <path
                                    d="M0,80 C50,70 80,90 120,50 C160,10 200,40 300,30 V100 H0 Z"
                                    fill="url(#grad)"
                                    stroke="none"
                                ></path>
                            </svg>
                            {/* Data Point */}
                            <div className="absolute right-[10%] top-[30%] w-2 h-2 bg-white rounded-full shadow-[0_0_0_4px_rgba(59,130,246,0.5)]"></div>
                        </div>
                    </div>
                </div>
            </ScreenContainer>
        </motion.div>
    );
};

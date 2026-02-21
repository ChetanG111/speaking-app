"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { DashboardScreen } from "@/components/screens/dashboard-screen";
import { PrepScreen } from "@/components/screens/prep-screen";
import { RecordingScreen } from "@/components/screens/recording-screen";
import { AnalysisScreen } from "@/components/screens/analysis-screen";
import { ProgressScreen } from "@/components/screens/progress-screen";
import { TopicSelectionScreen } from "@/components/screens/topic-selection-screen";
import { GeneratingPointsScreen } from "@/components/screens/generating-points-screen";
import { HistoryScreen } from "@/components/screens/history-screen";
import { useSessionStore } from "@/store/use-session-store";
import { useAuthStore } from "@/store/use-auth-store";

export default function Home() {
    const { status, setStatus, cancelSession } = useSessionStore();
    const { initialize } = useAuthStore();

    useEffect(() => {
        const unsubscribe = initialize();
        return () => unsubscribe();
    }, [initialize]);

    // Handle Hardware Back Button
    useEffect(() => {
        // Push a new state whenever we leave IDLE
        if (status !== 'IDLE') {
            window.history.pushState({ screen: status }, '', '');
        }

        const handlePopState = (event: PopStateEvent) => {
            // If we hit back, we likely want to go "back" a step or cancel
            // Simple logic: If not IDLE, go to IDLE (or previous logical step)
            if (status !== 'IDLE') {
                // Check if we are in a session state that should cancel to dashboard
                cancelSession();
                // setStatus('IDLE'); // cancelSession does this usually
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [status, cancelSession]);

    return (
        <div className="relative w-full h-[100dvh] bg-[#050505] overflow-hidden">
            <AnimatePresence mode="wait">
                {status === "IDLE" && (
                    <motion.div key="dashboard" className="w-full h-full">
                        <DashboardScreen />
                    </motion.div>
                )}

                {status === "CHOOSING_TOPIC" && (
                    <motion.div key="topic-selection" className="w-full h-full">
                        <TopicSelectionScreen />
                    </motion.div>
                )}

                {status === "GENERATING_POINTS" && (
                    <motion.div key="generating-points" className="w-full h-full">
                        <GeneratingPointsScreen />
                    </motion.div>
                )}

                {status === "PREPARING" && (
                    <motion.div key="prep" className="w-full h-full">
                        <PrepScreen />
                    </motion.div>
                )}

                {status === "RECORDING" && (
                    <motion.div key="recording" className="w-full h-full">
                        <RecordingScreen />
                    </motion.div>
                )}

                {status === "ANALYZING" && (
                    <motion.div key="analysis" className="w-full h-full">
                        <AnalysisScreen />
                    </motion.div>
                )}

                {status === "PROGRESS" && (
                    <motion.div key="progress" className="w-full h-full">
                        <ProgressScreen />
                    </motion.div>
                )}

                {status === "HISTORY" && (
                    <motion.div key="history" className="w-full h-full">
                        <HistoryScreen />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

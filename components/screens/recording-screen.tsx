"use client";

import React, { useEffect } from "react";
import { ArrowDown, Square, Smartphone } from "lucide-react";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useSessionStore } from "@/store/use-session-store";
import { useHaptics } from "@/hooks/use-haptics";
import { motion } from "framer-motion";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

export const RecordingScreen = () => {
    const { stopRecording, cancelSession, incrementRecordingTime, recordingDuration } = useSessionStore();
    const { trigger } = useHaptics();

    // Initialize the real recorder
    const {
        startRecording: startMic,
        stopRecording: stopMic,
        cancelRecording: cancelMic,
        recordingTime,
        visualizerData,
        hasPermission
    } = useAudioRecorder();

    // Auto-start recording on mount
    useEffect(() => {
        startMic();
        return () => {
            cancelMic(); // Safety cleanup
        };
    }, [startMic, cancelMic]);

    // Sync hook time to store time (so Analysis has data)
    // If mic fails (hasPermission === false), runs a fallback timer here
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (hasPermission === false) {
            // Fallback simulation timer
            interval = setInterval(() => {
                incrementRecordingTime();
            }, 1000);
        } else if (recordingTime > 0) {
            // Sync with real recorder time
            incrementRecordingTime();
        }

        return () => clearInterval(interval);
    }, [recordingTime, hasPermission, incrementRecordingTime]);


    const formatTime = (seconds: number) => {
        // Use global store duration or local recordingTime? 
        // Better to use a local or store one consistently. 
        // Let's use the hook time if available, otherwise store time (which we are syncing)
        // Actually, let's just use the store's recordingDuration from the hook for display if valid
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Display time: use hook time if mic works, otherwise we need a local counter or use store
    // Let's simply use a local display state that updates from either source
    const displayTime = hasPermission === false ? recordingDuration : recordingTime;


    const handleStop = async () => {
        trigger('success');
        let blob: Blob | null = null;
        try {
            blob = await stopMic();
        } catch (e) {
            console.error("Stop mic failed", e);
        } finally {
            // Always transition, even if mic error
            stopRecording(blob);
        }
    };

    const handleCancel = () => {
        cancelMic();
        cancelSession();
    };

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.y > 100) {
            trigger('medium');
            handleCancel();
        }
    };

    // Helper to map visualizer data to bar heights
    // Data is 0.1 to 1.0. We scale to height in pixels or %
    // The design has specific heights. Let's multiply the normalized val by a max height.
    const getBarStyle = (index: number) => {
        const val = visualizerData[index] || 0.1;
        // Max height around 128px (h-32) or 192px (h-48)
        // Let's make the center bars taller
        const layoutScale = [0.4, 0.6, 0.8, 1.0, 1.2, 0.8, 0.6, 0.4, 0.2]; // Shape factor
        const height = val * 100 * (layoutScale[index] || 1); // Base multiplier

        return {
            height: `${Math.max(10, height)}px`,
            transition: 'height 0.1s ease'
        };

    };

    return (
        <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd as any}
            className="w-full h-full"
        >
            <ScreenContainer color="#050507">
                {/* Active Timer */}
                <div className="pt-16 pb-10 flex flex-col items-center z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-xs tracking-widest uppercase text-white/40">
                            Recording
                        </span>
                    </div>
                    <span className="text-4xl font-mono text-white tracking-tighter font-light">
                        {formatTime(displayTime)}
                    </span>
                </div>

                {/* Waveform Visualization */}
                <div className="flex-1 flex items-center justify-center px-8 gap-1.5 h-full relative">
                    {/* Mic Error Message */}
                    {hasPermission === false && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-mono">
                            Microphone Unavailable (HTTP)
                        </div>
                    )}

                    {/* Map 9 bars */}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                            key={i}
                            className={`w-1.5 rounded-full ${i === 3 || i === 4 || i === 5 ? 'bg-blue-500 shadow-[0_0_15px_#3B82F6]' : 'bg-blue-500/40'}`}
                            style={getBarStyle(i)}
                        ></div>
                    ))}
                </div>

                {/* Controls */}
                <div className="pb-14 flex flex-col items-center justify-center gap-8 w-full z-10">
                    <div className="text-xs text-white/20">Tap to finish</div>

                    <button
                        onClick={handleStop}
                        className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-all group active:scale-95 duration-100"
                    >
                        <div className="w-8 h-8 rounded-md bg-white group-hover:scale-90 transition-transform duration-200">
                            <Square className="w-4 h-4 text-black m-auto sr-only" fill="currentColor" />
                        </div>
                    </button>

                    <div className="haptic-tag opacity-30 mt-4 flex items-center gap-2">
                        <Smartphone size={12} />
                        Session End
                    </div>

                    <div className="absolute bottom-4 text-[10px] text-white/20 flex items-center gap-1 pointer-events-none">
                        <ArrowDown className="w-3 h-3" />
                        Swipe down to cancel
                    </div>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050507] to-transparent pointer-events-none"></div>
            </ScreenContainer>
        </motion.div>
    );
};

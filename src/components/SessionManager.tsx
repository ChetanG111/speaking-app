"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
    X,
    Mic,
    ChevronRight,
    Timer,
    AlertCircle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateTopics } from "@/lib/gemini";

type SessionStatus =
    | "idle"
    | "generating_topics"
    | "selecting_topic"
    | "countdown"
    | "recording"
    | "processing"
    | "result";

interface Topic {
    id: string;
    title: string;
    description: string;
}

interface SessionManagerProps {
    preferences: string[];
    onCancel: () => void;
    onComplete: (data: any) => void;
}

export function SessionManager({ preferences, onCancel, onComplete }: SessionManagerProps) {
    const [status, setStatus] = useState<SessionStatus>("generating_topics");
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [countdown, setCountdown] = useState(3);
    const [recordingTime, setRecordingTime] = useState(0);

    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    // Real topic generation
    useEffect(() => {
        async function getTopics() {
            if (status === "generating_topics") {
                try {
                    const aiTopics = await generateTopics(preferences);
                    setTopics(aiTopics);
                    setStatus("selecting_topic");
                } catch (error) {
                    console.error("Failed to generate topics:", error);
                    setStatus("selecting_topic");
                }
            }
        }
        getTopics();
    }, [status, preferences]);

    // Countdown logic
    useEffect(() => {
        if (status === "countdown") {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setStatus("recording");
            }
        }
    }, [status, countdown]);

    // Recording logic
    useEffect(() => {
        if (status === "recording") {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);
                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) {
                            setAudioChunks(prev => [...prev, e.data]);
                        }
                    };
                    recorder.start();
                })
                .catch(err => {
                    console.error("Microphone access denied:", err);
                    setStatus("selecting_topic");
                });
        }

        return () => {
            // Clean up tracks if component unmounts during recording
            if (status === "recording" && mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [status, mediaRecorder]);

    // Recording timer
    useEffect(() => {
        if (status === "recording") {
            const timer = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status]);

    const handleStartRecording = () => {
        setStatus("countdown");
    };

    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                onComplete({
                    topic: selectedTopic,
                    time: recordingTime,
                    audioBlob
                });
            };
            mediaRecorder.stop();
            // Stop all tracks to turn off recording indicator
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setStatus("processing");
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        status === "recording" ? "bg-red-500 animate-pulse" : "bg-dimmed"
                    )} />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-dimmed">
                        {status.replace("_", " ")}
                    </span>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 -mr-2 text-dimmed hover:text-foreground transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {status === "generating_topics" && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center"
                    >
                        <Loader2 className="w-12 h-12 text-orange animate-spin mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Curating topics...</h2>
                        <p className="text-dimmed">Finding themes based on your focus.</p>
                    </motion.div>
                )}

                {status === "selecting_topic" && (
                    <motion.div
                        key="selecting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col"
                    >
                        <h2 className="text-3xl font-extrabold mb-8 tracking-tight">Select a Topic</h2>
                        <div className="space-y-4 mb-8">
                            {topics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={cn(
                                        "w-full text-left p-6 rounded-[1.5rem] border transition-all",
                                        selectedTopic?.id === topic.id
                                            ? "bg-surface border-orange"
                                            : "bg-surface border-border hover:border-dimmed"
                                    )}
                                >
                                    <h3 className="font-bold text-lg mb-1">{topic.title}</h3>
                                    <p className="text-dimmed text-sm">{topic.description}</p>
                                </button>
                            ))}
                        </div>

                        <Button
                            disabled={!selectedTopic}
                            onClick={handleStartRecording}
                            className="mt-auto py-5 text-xl rounded-[1.5rem]"
                        >
                            Confirm Topic
                        </Button>
                    </motion.div>
                )}

                {status === "countdown" && (
                    <motion.div
                        key="countdown"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="flex-1 flex items-center justify-center"
                    >
                        <motion.span
                            key={countdown}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="text-9xl font-black text-orange"
                        >
                            {countdown}
                        </motion.span>
                    </motion.div>
                )}

                {status === "recording" && (
                    <motion.div
                        key="recording"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center"
                    >
                        <div className="w-full flex-1 flex flex-col items-center justify-center relative">
                            <div className="flex items-center gap-1 h-32 mb-12">
                                {[...Array(24)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: [20, 40 + Math.random() * 60, 20],
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.5 + Math.random() * 0.5,
                                            ease: "easeInOut"
                                        }}
                                        className="w-1.5 bg-orange rounded-full opacity-60"
                                    />
                                ))}
                            </div>

                            <div className="text-center">
                                <p className="text-5xl font-mono font-bold mb-4 tracking-tighter">
                                    {formatTime(recordingTime)}
                                </p>
                                <div className="bg-surface border border-border px-6 py-3 rounded-2xl max-w-sm mx-auto">
                                    <p className="text-foreground font-medium text-lg leading-snug">
                                        {selectedTopic?.title}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStopRecording}
                            className="mt-12 w-24 h-24 rounded-full bg-red-500/10 border-4 border-red-500 flex items-center justify-center group transition-all active:scale-90"
                        >
                            <div className="w-8 h-8 bg-red-500 rounded-sm group-hover:scale-110 transition-transform" />
                        </button>
                    </motion.div>
                )}

                {status === "processing" && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center"
                    >
                        <div className="relative mb-8">
                            <Loader2 className="w-16 h-16 text-orange animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Mic size={20} className="text-orange" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Analyzing speech...</h2>
                        <p className="text-dimmed max-w-[240px]">We're measuring your structure, speed, and focus.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

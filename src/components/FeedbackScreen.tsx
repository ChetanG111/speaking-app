"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
    CheckCircle2,
    AlertTriangle,
    Clock,
    FileText,
    BarChart3,
    ChevronLeft,
    Share2
} from "lucide-react";
import { AnalysisResult } from "@/lib/analysis";
import { cn } from "@/lib/utils";

interface FeedbackScreenProps {
    topic: string;
    result: AnalysisResult;
    onDone: () => void;
}

export function FeedbackScreen({ topic, result, onDone }: FeedbackScreenProps) {
    const metrics = [
        { label: "WPM", value: result.wpm, unit: "words", icon: Clock, color: "text-orange" },
        { label: "Fillers", value: result.fillers, unit: "detected", icon: AlertTriangle, color: result.fillers > 5 ? "text-yellow-500" : "text-green-500" },
        { label: "Structure", value: result.structureScore, unit: "out of 100", icon: BarChart3, color: "text-orange" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onDone} className="p-2 -ml-2 text-dimmed">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Session Review</h1>
                    <p className="text-dimmed text-sm">{topic}</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                {metrics.map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="flex items-center gap-5 py-6">
                                <div className={cn("w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center", m.color)}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <p className="text-dimmed text-[10px] uppercase font-bold tracking-widest mb-1">{m.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black">{m.value}</span>
                                        <span className="text-dimmed text-xs font-bold uppercase">{m.unit}</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Transcript Segment */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-orange" />
                    <h2 className="font-bold text-lg uppercase tracking-tight">Transcript</h2>
                </div>
                <Card className="bg-surface/50 border-dimmed/10">
                    <p className="text-foreground/90 leading-relaxed text-sm italic">
                        "{result.transcript}"
                    </p>
                </Card>
            </motion.div>

            {/* Feedback Points */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-12"
            >
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={18} className="text-orange" />
                    <h2 className="font-bold text-lg uppercase tracking-tight">Coach's Insights</h2>
                </div>
                <div className="space-y-4">
                    {result.feedback.map((f, i) => (
                        <Card key={i} className="border-l-4 border-l-orange py-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] bg-orange/10 text-orange px-2 py-0.5 rounded font-bold uppercase">
                                    Point {i + 1}
                                </span>
                                <span className="text-[10px] text-dimmed font-mono">{f.timestamp}</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed">{f.text}</p>
                        </Card>
                    ))}
                </div>
            </motion.div>

            {/* Actions */}
            <div className="mt-auto pt-8 flex gap-4">
                <Button variant="outline" className="flex-1 py-4 flex items-center justify-center gap-2">
                    <Share2 size={18} />
                    Share result
                </Button>
                <Button onClick={onDone} className="flex-1 py-4">
                    Complete Day
                </Button>
            </div>
        </div>
    );
}

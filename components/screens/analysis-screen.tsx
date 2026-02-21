"use client";

import React from "react";
import { Zap, Gauge, Mic, ChevronDown, Hash, Sparkles } from "lucide-react";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useSessionStore } from "@/store/use-session-store";
import { useHaptics } from "@/hooks/use-haptics";

export const AnalysisScreen = () => {
    const { startSession, analysis, enterTopicSelection, cancelSession } = useSessionStore();
    const { trigger } = useHaptics();

    if (!analysis) {
        return (
            <ScreenContainer>
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                    <span className="text-white/40 font-mono text-sm animate-pulse">Analyzing Speech...</span>
                </div>
            </ScreenContainer>
        );
    }

    const handleNewTopic = () => {
        trigger('medium');
        enterTopicSelection();
    };

    const handleRetry = () => {
        trigger('medium');
        startSession();
    };

    const handleDone = () => {
        trigger('light');
        cancelSession();
    };

    return (
        <ScreenContainer>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-6 pb-24">
                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <Gauge className="text-white/40 w-4 h-4" />
                            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                ↑ 12%
                            </span>
                        </div>
                        <div className="text-2xl font-medium tracking-tight">
                            {analysis.wpm}
                        </div>
                        <div className="text-xs text-white/40">WPM</div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <Mic className="text-white/40 w-4 h-4" />
                            <span className="text-[10px] text-white/40 px-1.5 py-0.5">− 2%</span>
                        </div>
                        <div className="text-2xl font-medium tracking-tight">
                            {analysis.fillerCount}
                        </div>
                        <div className="text-xs text-white/40">Filler Words</div>
                    </div>

                    {/* Full width panel */}
                    <div className="glass-panel p-4 rounded-2xl col-span-2 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-white/40 mb-1">Grammar Score</div>
                            <div className="text-xl font-medium text-white">{analysis.grammarScore}/100</div>
                        </div>
                        <Sparkles className="text-blue-400 w-5 h-5" />
                    </div>
                </div>

                {/* Analysis Section */}
                <h3 className="text-sm font-medium text-white mb-3 mt-8">Top Mistake</h3>
                <div className="glass-panel p-4 rounded-2xl border-l-2 border-blue-500 mb-6">
                    <p className="text-sm text-white/80 leading-relaxed font-light">
                        You used <span className="text-blue-400 font-normal">"basically"</span> 5 times in the first minute. Try pausing instead.
                    </p>
                </div>

                <h3 className="text-sm font-medium text-white mb-3">Transcript Snippet</h3>
                <div className="p-4 rounded-2xl bg-white/5 mb-8">
                    <p className="text-sm text-white/60 font-light leading-relaxed">
                        ...so I think the technology is <span className="text-white decoration-blue-500/50 underline decoration-wavy">basically</span> moving too fast for us to regulate, and <span className="text-white decoration-blue-500/50 underline decoration-wavy">basically</span> we need to...
                    </p>
                    <button className="mt-3 text-xs text-blue-400 flex items-center gap-1">
                        Expand Full
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="absolute bottom-0 w-full glass-panel border-t border-white/5 p-6 flex gap-3 z-20">
                <button
                    onClick={handleDone}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors active:scale-95 duration-100"
                >
                    Done
                </button>
                <button
                    onClick={handleNewTopic}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors active:scale-95 duration-100"
                >
                    New Topic
                </button>
                <button
                    onClick={handleRetry}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:bg-blue-500 transition-colors active:scale-95 duration-100"
                >
                    Retry
                </button>
            </div>
        </ScreenContainer >
    );
};

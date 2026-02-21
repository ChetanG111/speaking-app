"use client";

import React, { useState } from "react";
import { ArrowLeft, Sparkles, Briefcase, BookOpen, MessageSquare, UserCheck, Brain, RefreshCw, ChevronRight } from "lucide-react";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useSessionStore } from "@/store/use-session-store";
import { useHaptics } from "@/hooks/use-haptics";
import { motion, AnimatePresence } from "framer-motion";

const TOPIC_CATEGORIES = [
    { id: 'random', label: 'Surprise Me', icon: Sparkles, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { id: 'business', label: 'Business', icon: Briefcase, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: 'storytelling', label: 'Storytelling', icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10" },
    { id: 'debate', label: 'Debate', icon: MessageSquare, color: "text-red-400", bg: "bg-red-400/10" },
    { id: 'interview', label: 'Interview', icon: UserCheck, color: "text-green-400", bg: "bg-green-400/10" },
    { id: 'philosophy', label: 'Philosophy', icon: Brain, color: "text-pink-400", bg: "bg-pink-400/10" },
];

export const TopicSelectionScreen = () => {
    const { startSession, setTopic, cancelSession } = useSessionStore();
    const { trigger } = useHaptics();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [topics, setTopics] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleBack = () => {
        trigger('medium');
        if (selectedCategory) {
            setSelectedCategory(null);
            setTopics([]);
        } else {
            cancelSession();
        }
    };

    const fetchTopics = async (category: string) => {
        setIsLoading(true);
        setSelectedCategory(category);
        setTopics([]); // Clear previous topics

        try {
            const response = await fetch('/api/generate-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category }),
            });

            if (!response.ok) throw new Error('Failed to generate topics');

            const data = await response.json();
            if (data.topics && Array.isArray(data.topics)) {
                setTopics(data.topics);
            }
        } catch (error) {
            console.error(error);
            // Handle error (maybe show toast)
        } finally {
            setIsLoading(false);
        }
    };

    const handleTopicSelect = (topic: string) => {
        trigger('success');
        setTopic(topic);
        startSession();
    };

    return (
        <ScreenContainer>
            {/* Header */}
            <div className="px-6 py-6 flex items-center gap-4">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/60 active:scale-95 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold tracking-tight">
                    {selectedCategory ? 'Choose a Topic' : 'Select Category'}
                </h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-24 hide-scrollbar">
                <AnimatePresence mode="wait">
                    {!selectedCategory ? (
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            {TOPIC_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        trigger('light');
                                        fetchTopics(cat.label);
                                    }}
                                    className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/5 transition-colors active:scale-95 duration-200 aspect-square justify-center"
                                >
                                    <div className={`w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center mb-1`}>
                                        <cat.icon className={`w-6 h-6 ${cat.color}`} />
                                    </div>
                                    <span className="font-medium text-sm">{cat.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="topics"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-white/40 text-sm animate-pulse">Generating topics...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
                                            Generated for {selectedCategory}
                                        </span>
                                        <button
                                            onClick={() => fetchTopics(selectedCategory)}
                                            className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Regenerate
                                        </button>
                                    </div>

                                    {topics.map((topic, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleTopicSelect(topic)}
                                            className="w-full text-left p-4 rounded-xl glass-panel hover:bg-white/10 transition-colors active:scale-[0.98] group"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <p className="lex-1 text-sm leading-relaxed font-light text-white/90 group-hover:text-white">
                                                    {topic}
                                                </p>
                                                <ChevronRight className="w-4 h-4 text-white/20 mt-0.5 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </motion.button>
                                    ))}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ScreenContainer>
    );
};

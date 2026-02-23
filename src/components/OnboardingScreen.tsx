"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
    Briefcase,
    Cpu,
    MessageCircle,
    Globe,
    Lightbulb,
    Mic2,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "tech", label: "Tech & Futurism", icon: Cpu },
    { id: "business", label: "Business & Startups", icon: Briefcase },
    { id: "daily", label: "Daily Life & Stories", icon: MessageCircle },
    { id: "abstract", label: "Abstract Thinking", icon: Lightbulb },
    { id: "debate", label: "Debate & Rhetoric", icon: Mic2 },
    { id: "culture", label: "Culture & Society", icon: Globe },
];

interface OnboardingProps {
    onComplete: (preferences: string[]) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingProps) {
    const [selected, setSelected] = useState<string[]>([]);
    const [isExiting, setIsExiting] = useState(false);

    const toggleCategory = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((item) => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleConfirm = () => {
        if (selected.length === 0) return;
        setIsExiting(true);
        // Delay to allow exit animation to play
        setTimeout(() => {
            onComplete(selected);
        }, 800);
    };

    return (
        <div className="flex flex-col min-h-[80vh]">
            <div className="mb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-extrabold mb-3 tracking-tight"
                >
                    What sparks your focus?
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-dimmed"
                >
                    Choose topics you want to master. These are locked permanently for V1.
                </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
                <AnimatePresence mode="popLayout">
                    {!isExiting && CATEGORIES.map((cat, index) => {
                        const isSelected = selected.includes(cat.id);
                        return (
                            <motion.div
                                key={cat.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.95,
                                    y: -20,
                                    filter: "blur(10px)",
                                    transition: { delay: index * 0.06 }
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    delay: index * 0.05
                                }}
                            >
                                <button
                                    onClick={() => toggleCategory(cat.id)}
                                    className={cn(
                                        "w-full h-full text-left p-5 rounded-[1.5rem] border transition-all duration-300 relative overflow-hidden group",
                                        isSelected
                                            ? "bg-surface border-orange shadow-[0_0_20px_rgba(255,136,0,0.15)]"
                                            : "bg-surface border-border hover:border-dimmed"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                                        isSelected ? "bg-orange/10" : "bg-background"
                                    )}>
                                        <cat.icon className={cn(
                                            "w-5 h-5 transition-colors",
                                            isSelected ? "text-orange" : "text-dimmed"
                                        )} />
                                    </div>

                                    <p className={cn(
                                        "font-bold text-sm leading-tight transition-colors",
                                        isSelected ? "text-foreground" : "text-dimmed"
                                    )}>
                                        {cat.label}
                                    </p>

                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-4 right-4 w-5 h-5 bg-orange rounded-full flex items-center justify-center"
                                        >
                                            <Check className="text-black w-3 h-3 stroke-[4px]" />
                                        </motion.div>
                                    )}
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12"
            >
                <Button
                    disabled={selected.length === 0 || isExiting}
                    onClick={handleConfirm}
                    className={cn(
                        "w-full py-4 text-lg font-bold transition-all",
                        selected.length === 0 ? "opacity-50 grayscale" : "opacity-100"
                    )}
                >
                    Lock Preferences
                </Button>
            </motion.div>
        </div>
    );
}

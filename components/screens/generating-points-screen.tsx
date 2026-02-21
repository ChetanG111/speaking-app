"use client";

import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ScreenContainer } from "@/components/ui/screen-container";
import { useSessionStore } from "@/store/use-session-store";
import { useHaptics } from "@/hooks/use-haptics";
import { motion } from "framer-motion";

export const GeneratingPointsScreen = () => {
    const { topic, setTopicPoints, startPrep } = useSessionStore();
    const { trigger } = useHaptics();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchPoints = async () => {
            try {
                // Simulate a minimum loading time for better UX (so it doesn't flash too fast)
                const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));

                const apiCall = fetch('/api/generate-points', {
                    method: 'POST',
                    body: JSON.stringify({ topic }),
                    headers: { 'Content-Type': 'application/json' },
                    signal
                });

                const [response] = await Promise.all([apiCall, minLoadTime]);

                if (response.ok) {
                    const data = await response.json();
                    if (data.points) {
                        setTopicPoints(data.points, !!data.isFallback);
                        trigger('success'); // Little haptic feedback when ready
                        startPrep(); // Move to prep screen
                    } else {
                        console.warn("No points returned in response", data);
                        setTopicPoints([], true); // Mark as fallback empty
                        startPrep();
                    }
                } else {
                    const errorText = await response.text().catch(() => "Unknown error");
                    console.error("API error response:", response.status, errorText);
                    setTopicPoints([], true); // Mark as fallback failure
                    startPrep();
                }
            } catch (error: unknown) {
                // Assert error is an object with a 'name' property for AbortError check
                if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError') {
                    console.log("Fetch aborted");
                    return;
                }
                const message = error instanceof Error ? error.message : String(error);
                console.error("Failed to fetch points:", message);
                startPrep(); // Always ensure we move forward
            }
        };

        if (topic) {
            fetchPoints();
        } else {
            console.warn("No topic found, skipping fetch");
            startPrep(); // Should not happen, but safe guard
        }

        return () => {
            controller.abort();
        };
    }, [topic, setTopicPoints, startPrep, trigger]);

    return (
        <ScreenContainer>
            <div className="flex flex-col items-center justify-center h-full gap-6 px-10 text-center">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Generating Ideas</h3>
                    <p className="text-sm text-white/40 font-light leading-relaxed">
                        Crafting talking points for <br />
                        <span className="text-blue-400">"{topic}"</span>
                    </p>
                </div>
            </div>
        </ScreenContainer>
    );
};

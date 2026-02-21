import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface ScreenContainerProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    color?: string;
}

export const ScreenContainer = ({ children, className, id, color = "#0B0B0F" }: ScreenContainerProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
                "relative w-full h-[100dvh] overflow-hidden flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
                "bg-[#0B0B0F] text-white", // Ensure default bg and text
                className
            )}
            style={{ backgroundColor: color }}
        >
            {children}
        </motion.div>
    );
};

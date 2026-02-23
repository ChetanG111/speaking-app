"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: "default" | "mistake";
    className?: string;
    children: React.ReactNode;
}

export const Card = ({
    variant = "default",
    className,
    children,
    ...props
}: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
                variant === "mistake" ? "card-mistake" : "card-premium",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

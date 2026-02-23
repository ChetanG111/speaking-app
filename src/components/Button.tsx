"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "outline";
    className?: string;
    children: React.ReactNode;
}

export const Button = ({
    variant = "primary",
    className,
    children,
    ...props
}: ButtonProps) => {
    return (
        <motion.button
            whileTap={{ scale: 0.94 }}
            className={cn(
                variant === "primary" ? "btn-primary" : "btn-outline",
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};

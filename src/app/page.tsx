"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LogOut, Mic, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <main className="app-container flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app-container flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <div className="w-20 h-20 bg-surface border border-border rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Mic className="text-orange w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Structured Speaking</h1>
          <p className="text-dimmed max-w-[280px] mx-auto leading-relaxed">
            Master the art of clear, organized, and confident speaking with AI.
          </p>
        </motion.div>

        <Button onClick={signInWithGoogle} className="w-full max-w-[280px] py-4 text-lg">
          Sign In with Google
        </Button>
      </main>
    );
  }

  return (
    <main className="app-container">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex flex-col items-start gap-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={signOut}
            className="group flex flex-col items-start cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden group-hover:border-orange transition-colors">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="text-dimmed group-hover:text-orange" />
              )}
            </div>
            <span className="text-[10px] text-dimmed uppercase tracking-widest font-bold mt-1 group-hover:text-orange transition-colors cursor-pointer">
              Sign Out
            </span>
          </motion.button>
        </div>

        <div className="text-right">
          <p className="text-xs text-dimmed uppercase tracking-tighter font-bold mb-1">Session Limit</p>
          <p className="text-foreground font-extrabold">0 / 5</p>
        </div>
      </div>

      {/* Main CTA Area */}
      <div className="flex flex-col items-center justify-center flex-1 py-12">
        <Card className="w-full mb-8 text-center py-10">
          <p className="text-dimmed text-sm font-medium mb-2">Ready to sharpen your thinking?</p>
          <h2 className="text-2xl font-bold tracking-tight">Generate a daily prompt and start training.</h2>
        </Card>

        <Button className="w-full py-5 text-xl rounded-[2rem] shadow-[0_20px_40px_rgba(255,136,0,0.2)] animate-pulse hover:animate-none">
          Start Recording
        </Button>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-dimmed uppercase tracking-widest font-bold">V1.0 • Built for focus</p>
      </div>
    </main>
  );
}

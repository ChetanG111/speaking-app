"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { SessionManager } from "@/components/SessionManager";
import { FeedbackScreen } from "@/components/FeedbackScreen";
import { HistoryView } from "@/components/HistoryView";
import { analyzeRecording, AnalysisResult } from "@/lib/analysis";
import { LogOut, Mic, User as UserIcon, Sparkles, Loader2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOrCreateUserProfile, saveUserPreferences, UserProfile, saveRecording } from "@/lib/db";

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ topic: string, result: AnalysisResult } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [view, setView] = useState<"dashboard" | "history">("dashboard");

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        setProfileLoading(true);
        try {
          const uProfile = await getOrCreateUserProfile(user.uid);
          setProfile(uProfile);
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleOnboardingComplete = async (preferences: string[]) => {
    if (!user) return;
    try {
      await saveUserPreferences(user.uid, preferences);
      setProfile(prev => prev ? { ...prev, preferences } : null);
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  };

  interface SessionData {
    topic: { title: string };
    audioBlob: Blob;
    time: number;
  }

  const handleSessionComplete = async (sessionData: SessionData) => {
    if (!user) return;
    setIsAnalyzing(true);
    setIsSessionActive(false);

    try {
      const result = await analyzeRecording(sessionData.audioBlob, sessionData.topic.title);

      // Save to database
      await saveRecording({
        userId: user.uid,
        topic: sessionData.topic.title,
        transcript: result.transcript,
        metrics: {
          wpm: result.wpm,
          fillers: result.fillers,
          pauseDensity: result.pauseDensity,
          structureScore: result.structureScore
        },
        feedback: result.feedback
      });

      setAnalysisResult({ topic: sessionData.topic.title, result });

      // Refresh profile to update recording count
      const updatedProfile = await getOrCreateUserProfile(user.uid);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Analysis/Save Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDone = () => {
    setAnalysisResult(null);
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <main className="app-container flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (isAnalyzing) {
    return (
      <main className="app-container flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-orange animate-spin mb-6" />
        <h2 className="text-2xl font-bold mb-2">Analyzing your session...</h2>
        <p className="text-dimmed">AI is measuring your structure and metrics.</p>
      </main>
    );
  }

  // Result Screen
  if (analysisResult) {
    return (
      <FeedbackScreen
        topic={analysisResult.topic}
        result={analysisResult.result}
        onDone={handleDone}
      />
    );
  }

  if (view === "history" && user) {
    return (
      <HistoryView
        uid={user.uid}
        onBack={() => setView("dashboard")}
        onSelect={(rec) => {
          setAnalysisResult({
            topic: rec.topic,
            result: {
              transcript: rec.transcript,
              wpm: rec.metrics.wpm,
              fillers: rec.metrics.fillers,
              pauseDensity: rec.metrics.pauseDensity,
              structureScore: rec.metrics.structureScore,
              feedback: rec.feedback
            }
          });
        }}
      />
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

  if (!profile?.preferences) {
    return (
      <main className="app-container">
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </main>
    );
  }

  return (
    <main className="app-container relative">
      <AnimatePresence>
        {isSessionActive && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            <SessionManager
              preferences={profile.preferences || []}
              onCancel={() => setIsSessionActive(false)}
              onComplete={handleSessionComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

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

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setView("history")}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-orange transition-colors">
            <Calendar className="text-dimmed group-hover:text-orange" size={20} />
          </div>
          <span className="text-[10px] text-dimmed uppercase tracking-widest font-bold group-hover:text-orange transition-colors">History</span>
        </motion.button>

        <div className="text-right">
          <p className="text-xs text-dimmed uppercase tracking-tighter font-bold mb-1">Session Limit</p>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-foreground font-extrabold">{profile.recordingCount}</span>
            <span className="text-dimmed font-bold text-xs">/ 5</span>
          </div>
        </div>
      </div>

      {/* Main CTA Area */}
      <div className="flex flex-col items-center justify-center flex-1 py-12">
        <Card className="w-full mb-10 text-center py-12 relative overflow-hidden group border-orange/20">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Sparkles className="text-orange" size={24} />
          </div>
          <p className="text-dimmed text-sm font-medium mb-3 uppercase tracking-widest">Ready to sharpen your thinking?</p>
          <h2 className="text-3xl font-bold tracking-tight mb-2 px-4 leading-tight">Generate a daily prompt and start training.</h2>
        </Card>

        <Button
          onClick={() => setIsSessionActive(true)}
          className="w-full py-6 text-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,136,0,0.15)] animate-shimmer bg-gradient-to-r from-orange via-orange/90 to-orange"
        >
          Start Training
        </Button>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-dimmed uppercase tracking-widest font-bold">V1.0 • Built for focus</p>
      </div>
    </main>
  );
}

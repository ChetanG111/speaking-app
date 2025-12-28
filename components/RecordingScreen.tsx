
import React, { useState, useEffect, useRef } from 'react';
import { Waveform } from './Waveform';

interface RecordingScreenProps {
  onStop: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const RecordingScreen: React.FC<RecordingScreenProps> = ({ onStop, onCancel }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | undefined>(undefined);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const secondsRef = useRef(0);

  // Keep ref in sync with state for access in the onstop closure
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup Web Audio API for visualization
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;
        source.connect(analyserNode);
        
        audioContextRef.current = audioCtx;
        setAnalyser(analyserNode);

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          onStop(audioBlob, secondsRef.current);
          stream.getTracks().forEach(track => track.stop());
          if (audioCtx.state !== 'closed') audioCtx.close();
        };

        recorder.start();
        startTimer();
      } catch (err) {
        console.error("Failed to start recording", err);
        alert("Microphone access denied or error starting recorder.");
      }
    };

    startRecording();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      if (audioContextRef.current) audioContextRef.current.resume();
      startTimer();
    } else {
      mediaRecorderRef.current.pause();
      if (audioContextRef.current) audioContextRef.current.suspend();
      stopTimer();
    }
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  };

  const handleDiscard = () => {
    if (mediaRecorderRef.current) {
      // Override onstop to prevent saving
      mediaRecorderRef.current.onstop = () => {
        if (mediaRecorderRef.current?.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      };
      
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        // Already inactive, just clean up manually
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      }
    }
    stopTimer();
    onCancel();
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        stopRecording();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seconds]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      <div className="absolute top-8 sm:top-10 flex items-center gap-2 text-secondary text-[10px] sm:text-xs font-medium tracking-widest uppercase">
        <div className={`w-2 h-2 rounded-full bg-accent ${!isPaused ? 'animate-pulse' : ''}`} />
        {isPaused ? 'Paused' : 'Recording...'}
      </div>

      <div className="mb-8 sm:mb-12 w-full max-w-sm sm:max-w-md">
        <Waveform isAnimating={!isPaused} analyser={analyser} count={36} color="#FFFFFF" />
      </div>

      <div className="text-center mb-10 sm:mb-16">
        <h2 className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tighter text-primary mb-2 tabular-nums">
          {formatTime(seconds)}
        </h2>
        <p className="text-secondary text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Duration</p>
      </div>

      <div className="flex items-center gap-6 sm:gap-10">
        <button
          onClick={togglePause}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-elevated border border-surface flex items-center justify-center text-primary hover:bg-surface transition-all active:scale-90"
          aria-label={isPaused ? "Resume Recording" : "Pause Recording"}
        >
          {isPaused ? (
            <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          ) : (
            <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          )}
        </button>

        <button
          onClick={stopRecording}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-accent flex items-center justify-center text-background hover:scale-105 active:scale-95 transition-all"
          aria-label="Stop and Save Recording"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background rounded-md" />
        </button>

        <button 
          onClick={handleDiscard}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-elevated border border-surface flex items-center justify-center text-secondary hover:text-accent transition-all active:scale-90"
          aria-label="Discard Recording"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      <div className="absolute bottom-8 sm:bottom-10 text-secondary text-[10px] tracking-[0.3em] uppercase font-bold opacity-40 hidden sm:block">
        Press <span className="bg-surface px-2 py-1 rounded text-primary border border-elevated mx-1">Space</span> to stop
      </div>
    </div>
  );
};

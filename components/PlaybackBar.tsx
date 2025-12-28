
import React, { useState, useEffect, useRef, useMemo } from 'react';

interface PlaybackBarProps {
  audioBlob: Blob | null;
  duration: number;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({ audioBlob, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Constants for precise alignment
  const BAR_WIDTH = 3;
  const BAR_GAP = 2;
  const BARS_PER_SECOND = 15;
  const UNIT_WIDTH = BAR_WIDTH + BAR_GAP;

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  const barCount = useMemo(() => Math.max(40, Math.floor(duration * BARS_PER_SECOND)), [duration]);
  const totalWaveformWidth = useMemo(() => (barCount * UNIT_WIDTH) - BAR_GAP, [barCount, UNIT_WIDTH, BAR_GAP]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / totalWaveformWidth));
    const time = percentage * (duration || 1);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Improved scroll logic: keep the scrubber centered in the view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const progress = currentTime / (duration || 1);
      const container = scrollContainerRef.current;
      const clientWidth = container.clientWidth;
      
      const scrubberPosition = progress * totalWaveformWidth;
      const targetScroll = scrubberPosition - (clientWidth / 2);
      
      container.scrollLeft = targetScroll;
    }
  }, [currentTime, duration, totalWaveformWidth]);

  if (!audioUrl) return null;

  const progressPercent = (currentTime / (duration || 1)) * 100;

  return (
    <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-2xl bg-surface border border-elevated rounded-full p-1 sm:p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex items-center transition-all duration-300">
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      
      <button
        onClick={togglePlay}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent flex items-center justify-center text-background flex-shrink-0 hover:brightness-90 active:scale-95 transition-all mr-2 sm:mr-3 ml-1"
      >
        {isPlaying ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      {/* Waveform Scrubber with horizontal scroll support */}
      <div 
        ref={scrollContainerRef}
        className="flex-grow min-w-0 h-10 sm:h-12 flex items-center overflow-x-hidden no-scrollbar relative mr-1.5 sm:mr-2.5 select-none cursor-pointer"
        style={{ scrollbarWidth: 'none' }}
      >
        <div 
          className="h-full flex items-center relative"
          onClick={handleSeek}
          style={{ 
            width: `${totalWaveformWidth}px`,
            gap: `${BAR_GAP}px`
          }}
        >
          {Array.from({ length: barCount }).map((_, i) => {
            const barProgress = (i / barCount) * 100;
            const isActive = barProgress <= progressPercent;
            
            // Deterministic height generation
            const h1 = Math.sin(i * 0.2) * 8;
            const h2 = Math.cos(i * 0.5) * 6;
            const height = Math.abs(h1 + h2) + 6;

            return (
              <div
                key={i}
                className={`flex-shrink-0 rounded-full transition-colors duration-200 ${
                  isActive ? 'bg-accent' : 'bg-elevated'
                }`}
                style={{ 
                  width: `${BAR_WIDTH}px`,
                  height: `${Math.min(window.innerWidth < 640 ? 20 : 32, height)}px` 
                }}
              />
            );
          })}
          
          {/* Moving Scrubber Line - precise pixel positioning */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-[2px] h-6 sm:h-10 bg-accent rounded-full pointer-events-none z-10 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
            style={{ 
              left: `${(currentTime / (duration || 1)) * totalWaveformWidth}px`,
              transform: 'translate(-50%, -50%)',
              transition: isPlaying ? 'none' : 'left 0.1s ease-out'
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[12px] font-mono font-bold tracking-tight whitespace-nowrap tabular-nums mr-1.5 sm:mr-2.5 flex-shrink-0">
        <span className="text-accent">{formatTime(currentTime)}</span>
        <span className="text-secondary/20">/</span>
        <span className="text-secondary/60">{formatTime(duration)}</span>
      </div>

      <div className="bg-elevated px-2 py-1 rounded-lg border border-surface/50 text-[8px] sm:text-[10px] font-black text-primary/80 flex items-center justify-center mr-1 sm:mr-1.5 shadow-sm flex-shrink-0 select-none">
        1X
      </div>
    </div>
  );
};

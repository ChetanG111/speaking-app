
import React, { useEffect, useState, useRef } from 'react';

interface WaveformProps {
  isAnimating: boolean;
  analyser?: AnalyserNode;
  color?: string;
  count?: number;
}

export const Waveform: React.FC<WaveformProps> = ({ 
  isAnimating, 
  analyser,
  color = '#FFFFFF', 
  count = 32 
}) => {
  const [heights, setHeights] = useState<number[]>(new Array(count).fill(4));
  const requestRef = useRef<number>(null);
  
  // For simulated animation when no analyser is present
  const phaseRef = useRef<number>(0);

  const updateWaveform = () => {
    if (analyser) {
      // Real-time audio data
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const newHeights = [];
      const step = Math.floor(bufferLength / count);
      
      for (let i = 0; i < count; i++) {
        // Average a slice of the frequency data for each bar
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const average = sum / step;
        // Scale to 4-64px range
        const height = (average / 255) * 60 + 4;
        newHeights.push(height);
      }
      setHeights(newHeights);
    } else if (isAnimating) {
      // Sophisticated simulated animation (Sine-wave based for organic feel)
      phaseRef.current += 0.15;
      const newHeights = Array.from({ length: count }).map((_, i) => {
        const sin1 = Math.sin(phaseRef.current + i * 0.2);
        const sin2 = Math.sin(phaseRef.current * 0.7 + i * 0.5);
        const noise = (sin1 + sin2 + 2) / 4; // Normalize to 0-1
        return noise * 40 + 6;
      });
      setHeights(newHeights);
    } else {
      // Static state
      setHeights(prev => prev.map(h => Math.max(4, h * 0.9))); // Smoothly decay to minimum
    }

    requestRef.current = requestAnimationFrame(updateWaveform);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateWaveform);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isAnimating, analyser, count]);

  return (
    <div className="flex items-center justify-center gap-[3px] h-20 w-full">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-75 ease-out"
          style={{ 
            height: `${h}px`, 
            backgroundColor: color,
            opacity: isAnimating || analyser ? (0.6 + (Math.sin(i * 0.1) * 0.4)) : 0.2
          }}
        />
      ))}
    </div>
  );
};

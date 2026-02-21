import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderReturn {
    isRecording: boolean;
    recordingTime: number;
    visualizerData: number[]; // Array of normalized values (0-1) for visualization
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    cancelRecording: () => void;
    hasPermission: boolean | null;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [visualizerData, setVisualizerData] = useState<number[]>(new Array(30).fill(0.1)); // 30 bars

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Initialize Audio Context and Analyser
    const setupAudioAnalysis = (stream: MediaStream) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const audioContext = audioContextRef.current;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Small size for performance, we only need ~9 bars
        analyser.smoothingTimeConstant = 0.8;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyserRef.current = analyser;
        sourceRef.current = source;

        updateVisualizer();
    };

    const updateVisualizer = () => {
        if (!analyserRef.current || !isRecording) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Normalize and pick a subset of data points to match our UI bars (9 bars in the design)
        // We'll generate 9 values from the frequency data
        const barCount = 9;
        const step = Math.floor(dataArray.length / barCount);
        const newVisuals = [];

        for (let i = 0; i < barCount; i++) {
            const value = dataArray[i * step];
            // Normalize to 0.1 - 1.0 range (keep a minimum height)
            newVisuals.push(Math.max(0.1, value / 255));
        }

        setVisualizerData(newVisuals);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    // Cleanup visualizer loop when recording stops, but we need to reference the state carefully
    // Using a ref-based loop or effect might be safer. 
    // Ideally updateVisualizer should check a ref, not state.
    const isRecordingRef = useRef(false);

    useEffect(() => {
        isRecordingRef.current = isRecording;
        if (isRecording) {
            updateVisualizer();
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
    }, [isRecording]);


    const startRecording = useCallback(async () => {
        try {
            // Check for API support (handles HTTP contexts where mediaDevices is undefined)
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn("Media Devices API not available (AudioContext might require HTTPS)");
                setHasPermission(false);
                // Start Timer fallback immediately so user isn't stuck
                setIsRecording(true);
                setRecordingTime(0);
                timerIntervalRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setHasPermission(true);

            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start();
            setupAudioAnalysis(stream);

            setIsRecording(true);

            // Start Timer
            setRecordingTime(0);
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            setHasPermission(false);
            // Fallback: Start timer anyway so the app is usable
            setIsRecording(true);
            setRecordingTime(0);
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                resolve(null);
                return;
            }

            // Cleanup Timer
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                resolve(audioBlob);

                // Cleanup Audio Context
                // Don't close context if we want to reuse? Better to close to save battery
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    // audioContextRef.current.close(); 
                }

                // Stop tracks to release mic
                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.stop();
            setIsRecording(false);
        });
    }, []);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        setIsRecording(false);
        audioChunksRef.current = [];
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return {
        isRecording,
        recordingTime,
        visualizerData,
        startRecording,
        stopRecording,
        cancelRecording,
        hasPermission
    };
};

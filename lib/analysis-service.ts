
export interface AnalysisResult {
    transcript: string;
    wpm: number;
    fillerCount: number;
    fluencyScore: number;
    grammarScore: number;
    topMistake: string;
    feedback: string;
    fillerUsage: Record<string, number>;
}

export async function analyzeAudio(audioBlob: Blob): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to analyze audio');
        }

        const data = await response.json();

        // Calculate a simple fluency score based on wpm and fillers if not provided
        // or just use what we have. API returns:
        // transcript, wpm, fillerCount, grammarScore, topMistake, feedback, fillerUsage

        // We map it to our interface
        return {
            transcript: data.transcript,
            wpm: data.wpm,
            fillerCount: data.fillerCount,
            fluencyScore: Math.max(0, 100 - (data.fillerCount * 5)), // Simple heuristic
            grammarScore: data.grammarScore,
            topMistake: data.topMistake,
            feedback: data.feedback,
            fillerUsage: data.fillerUsage || {}
        };
    } catch (error) {
        console.error("Analysis service error:", error);
        throw error;
    }
}

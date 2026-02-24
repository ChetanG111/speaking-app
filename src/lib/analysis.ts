import { aiModel } from "./gemini";

export interface AnalysisResult {
    transcript: string;
    wpm: number;
    fillers: number;
    pauseDensity: number;
    structureScore: number;
    feedback: {
        text: string;
        type: "positive" | "negative" | "neutral";
        timestamp: string;
    }[];
}

export async function analyzeRecording(audioBlob: Blob, topicTitle: string): Promise<AnalysisResult> {
    // Convert blob to base64 for Gemini
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
    });

    const base64Audio = await base64Promise;

    const prompt = `
    You are a professional speaking coach. Analyze this 1-2 minute speech on the topic: "${topicTitle}".
    
    Tasks:
    1. Transcribe the speech accurately.
    2. Detect filler words (um, uh, like, so, basically, you know).
    3. Evaluate the structure (Hook, Point 1, Point 2, Conclusion).
    4. Calculate WPM (Words Per Minute).
    5. Provide 3 specific, actionable feedback points.
    
    Return strictly as JSON:
    {
      "transcript": "...",
      "wpm": 0,
      "fillers": 0,
      "pauseDensity": 0.0,
      "structureScore": 0,
      "feedback": [
        { "text": "...", "type": "positive", "timestamp": "0:05" },
        ...
      ]
    }
  `;

    try {
        const result = await aiModel.generateContent([
            {
                inlineData: {
                    mimeType: "audio/webm",
                    data: base64Audio
                }
            },
            { text: prompt }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0].trim());
        }
        throw new Error("Invalid analysis format");
    } catch (error) {
        console.error("AI Analysis Error:", error);
        // Return empty mock result if AI fails
        return {
            transcript: "[Transcription failed]",
            wpm: 0,
            fillers: 0,
            pauseDensity: 0,
            structureScore: 0,
            feedback: [{ text: "Could not analyze speech. Please ensure API key is valid.", type: "negative", timestamp: "0:00" }]
        };
    }
}

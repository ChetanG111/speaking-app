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

    if (!base64Audio || base64Audio.length < 100) {
        throw new Error("Recording too short or audio capture failed. Please try again.");
    }

    const prompt = `
    You are a professional speaking coach. I have provided an audio recording of a speech on the topic: "${topicTitle}".
    
    CRITICAL: You MUST analyze the PROVIDED AUDIO. Do not provide generic feedback.
    If the audio is silent or unintelligible, state that in the transcript field but still return a valid JSON object.
    
    Tasks:
    1. Transcribe the speech accurately from the audio.
    2. Detect filler words (um, uh, like, so, basically, you know).
    3. Evaluate how well the speaker followed a structure (Hook, Main Points, Conclusion).
    4. Calculate WPM (Words Per Minute) based on the transcript and audio duration.
    5. Provide 3 specific, actionable feedback points based EXACTLY on what was said.
    
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
                    mimeType: audioBlob.type || "audio/webm",
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
    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        // Return descriptive error result if AI fails
        return {
            transcript: "[Transcription failed]",
            wpm: 0,
            fillers: 0,
            pauseDensity: 0,
            structureScore: 0,
            feedback: [{
                text: error.message || "Could not analyze speech. Please ensure API key is valid.",
                type: "negative",
                timestamp: "0:00"
            }]
        };
    }
}

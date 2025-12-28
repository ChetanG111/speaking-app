
import { GoogleGenAI } from "@google/genai";

/**
 * Transcribes audio using Gemini 3 Flash.
 * Converts blob to base64 and prompts the model for transcription.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  // Convert blob to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(audioBlob);
  });

  const base64Data = await base64Promise;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Data,
            },
          },
          {
            text: "Please transcribe this audio exactly. If no speech is found, return an empty string. Only return the transcription text, nothing else.",
          },
        ],
      },
    });

    return response.text?.trim() || "No transcript available.";
  } catch (error: any) {
    const message = error?.message?.toLowerCase() || "";
    if (message.includes("quota") || message.includes("429") || message.includes("billing")) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    console.error("Transcription error:", error);
    throw error;
  }
}

/**
 * Generates a title based on a transcript.
 */
export async function generateTitle(transcript: string): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey || !transcript.trim()) return "Voice Note";

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this text into a concise 3-5 word title: "${transcript}"`,
      config: {
        maxOutputTokens: 20,
      }
    });

    return response.text?.trim().replace(/^"|"$/g, '') || "New Voice Note";
  } catch (error: any) {
    const message = error?.message?.toLowerCase() || "";
    if (message.includes("quota") || message.includes("429") || message.includes("billing")) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    return "New Voice Note";
  }
}

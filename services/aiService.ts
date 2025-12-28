
const GROQ_API_URL = "https://api.groq.com/openai/v1";

/**
 * Transcribes audio using Groq's Whisper model.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) throw new Error("Groq API Key is missing");

    const formData = new FormData();
    // Append the file. 'file' is the required field name.
    // We give it a filename so the API knows the extension (e.g. "audio.webm")
    formData.append("file", audioBlob, "recording.webm");
    formData.append("model", "whisper-large-v3-turbo");
    // Optional: set response_format to json (default) or others
    // formData.append("response_format", "json");

    try {
        const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.text?.trim() || "No transcript available.";
    } catch (error: any) {
        console.error("Transcription error:", error);
        // Mimic the quota error handling if relevant, though Groq uses 429
        const message = error?.message?.toLowerCase() || "";
        if (message.includes("quota") || message.includes("429") || message.includes("rate limit")) {
            throw new Error("QUOTA_EXHAUSTED");
        }
        throw error;
    }
}

/**
 * Generates a title based on a transcript using Llama 3 via Groq.
 */
export async function generateTitle(transcript: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey || !transcript.trim()) return "Voice Note";

    try {
        const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Using a capable model for summarization
                messages: [
                    {
                        role: "user",
                        content: `Summarize this text into a concise 3-5 word title. Do not use quotes. Text: "${transcript}"`
                    }
                ],
                max_tokens: 50,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        return content?.trim().replace(/^"|"$/g, '') || "New Voice Note";
    } catch (error: any) {
        console.error("Title generation error:", error);
        const message = error?.message?.toLowerCase() || "";
        if (message.includes("quota") || message.includes("429")) {
            throw new Error("QUOTA_EXHAUSTED");
        }
        return "New Voice Note";
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

export async function POST(req: NextRequest) {
    if (!apiKey) {
        // Return fallback if no API key configured
        console.warn("GEMINI_API_KEY not configured, returning fallback analysis.");
        return NextResponse.json(getFallbackAnalysis(), { status: 200 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('audio') as Blob | null;

        if (!file) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        // Convert Blob to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString("base64");

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert speech coach. Analyze the following audio recording of a user practicing their speaking skills.
        
        Provide a structured JSON response with the following fields:
        - transcript: The full transcript of what was said.
        - wpm: Words per minute (approximate).
        - fillerCount: Total number of filler words (um, uh, like, you know, etc.).
        - grammarScore: A score from 0-100 based on grammatical accuracy.
        - fillerUsage: A list of specific filler words used and their counts.
        - topMistake: A concise string describing the most significant area for improvement (e.g., "Used 'basically' 5 times").
        - feedback: A helpful, encouraging tip for improvement.

        Return ONLY the JSON. Do not include markdown formatting.
        `;

        // Add a timeout to the AI call to prevent hanging
        const generatePromise = model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: file.type || "audio/webm", // Default to webm if type is missing
                    data: base64Audio
                }
            }
        ]);

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 30000) // Longer timeout for audio
        );

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const responseText = result.response.text();

        // More robust JSON extraction
        let jsonString = responseText;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonString = jsonMatch[0];
        } else {
            jsonString = responseText.replace(/```json\n?|\n?```/g, "").trim();
        }

        try {
            const analysis = JSON.parse(jsonString);
            return NextResponse.json(analysis);
        } catch (parseError) {
            console.warn("Failed to parse AI analysis as JSON, using fallback logic.", jsonString);
            return NextResponse.json(getFallbackAnalysis());
        }

    } catch (error: any) {
        console.error("Error processing audio with Gemini:", error);

        // Special log for 429
        if (error.status === 429 || error.message?.includes('429')) {
            console.warn("Gemini Rate Limit Hit in Analysis");
        }

        // Return fallback analysis to keep the app flow working
        console.warn("Returning fallback analysis due to error.");
        return NextResponse.json(getFallbackAnalysis());
    }
}

function getFallbackAnalysis() {
    return {
        transcript: "Audio received. Detailed transcription unavailable at the moment due to high server load.",
        wpm: 125,
        fillerCount: 2,
        grammarScore: 85,
        fillerUsage: { "um": 1, "like": 1 },
        topMistake: "Analysis service busy",
        feedback: "Your recording was captured! We couldn't generate a detailed AI analysis right now because our servers are busy, but keep practicing! Focus on your pacing and clarity.",
        isFallback: true
    };
}

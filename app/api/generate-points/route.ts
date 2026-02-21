import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

const FALLBACK_POINTS = [
    "Consider the main impact on your daily life.",
    "Think about a personal story that relates to this.",
    "What are the pros and cons?",
    "How does this affect society as a whole?",
    "What is your personal stance on this?",
    "Can you compare this to a past event?",
    "What advice would you give to others about this?"
];

export async function POST(req: NextRequest) {
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not configured, returning fallback points.");
        return NextResponse.json({ points: FALLBACK_POINTS.slice(0, 5), isFallback: true });
    }

    try {
        const { topic } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are a speech coach. A user is preparing a short impromptu speech on the topic: "${topic}".
        Generate 5 to 7 short, simple, and punchy talking points or questions to help them brainstorm.
        Keep them concise (under 15 words each).

        Return ONLY a JSON object with a single key "points" which is an array of strings.
        Example: { "points": ["Define the core problem.", "Share a personal anecdote."] }
        Do not include markdown formatting.
        `;

        // Add a timeout to the AI call to prevent hanging
        const generatePromise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 15000)
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
            const data = JSON.parse(jsonString);
            if (data && Array.isArray(data.points)) {
                return NextResponse.json(data);
            }
            throw new Error("Invalid format from AI");
        } catch (parseError) {
            console.warn("Failed to parse AI response as JSON, using fallback logic.", jsonString);
            return NextResponse.json({
                points: FALLBACK_POINTS.slice(0, 5),
                isFallback: true
            });
        }

    } catch (error: any) {
        console.error("Error generating points:", error);
        // Special log for 429 to be clearer
        if (error.status === 429 || error.message?.includes('429')) {
            console.warn("Gemini Rate Limit Hit");
        }

        return NextResponse.json({
            points: FALLBACK_POINTS.slice(0, 5),
            isFallback: true,
            error: error.message || "Unknown error"
        });
    }
}

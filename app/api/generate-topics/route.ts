import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

const FALLBACK_TOPICS: Record<string, string[]> = {
    "Business": [
        "The impact of AI on local businesses",
        "Remote work vs. Office work: The future",
        "How to handle a difficult client",
        "The importance of networking in 2024",
        "A business idea that could change the world",
        "Leadership qualities every manager needs",
        "Ethical dilemmas in modern marketing"
    ],
    "Storytelling": [
        "A time you failed and what you learned",
        "Your most memorable travel experience",
        "A childhood memory that shaped you",
        "The most interesting person you've met",
        "A coincidence that felt like destiny",
        "The day everything went wrong",
        "A small decision with a big impact"
    ],
    "Debate": [
        "Should social media be regulated?",
        "Is space exploration worth the cost?",
        "Universal Basic Income: Pro or Con?",
        "Tradition vs. Innovation",
        "Does money buy happiness?",
        "Should education be free for everyone?",
        "The impact of video games on society"
    ],
    "Interview": [
        "Tell me about a challenge you overcame",
        "Where do you see yourself in 5 years?",
        "What is your greatest weakness?",
        "Describe a time you showed leadership",
        "How do you handle stress?",
        "Why should we hire you?",
        "Describe your ideal work environment"
    ],
    "Philosophy": [
        "What does it mean to live a good life?",
        "Is free will an illusion?",
        "The nature of happiness",
        "If you could live forever, would you?",
        "The relationship between power and corruption",
        "What do we owe to future generations?",
        "Is truth absolute or relative?"
    ],
    "Surprise Me": [
        "The best advice you've ever received",
        "A skill you wish you had",
        "Your favorite book and why",
        "The most overrated trend today",
        "What would you do with a million dollars?",
        "A futuristic invention you want to see",
        "If you could have dinner with anyone, dead or alive"
    ]
};

export async function POST(req: NextRequest) {
    if (!apiKey) {
        // Return fallback if no API key configured, for dev convenience
        console.warn("GEMINI_API_KEY not configured, returning fallback topics.");
        return NextResponse.json({
            topics: FALLBACK_TOPICS["Surprise Me"],
            isFallback: true
        });
    }

    let category = "Surprise Me";

    try {
        const body = await req.json();
        if (body.category) {
            category = body.category;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are a creative speech coach. Generate 5 to 15 interesting, diverse, and thought-provoking speaking topics based on the category: "${category}".
        The topics should be suitable for a 1-2 minute impromptu speech.

        Return ONLY a JSON object with a single key "topics" which is an array of strings.
        Example: { "topics": ["The future of AI", "My favorite memory"] }
        Do not include markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up markdown code blocks if present
        const jsonString = responseText.replace(/```json\n?|\n?```/g, "").trim();
        const data = JSON.parse(jsonString);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Error generating topics:", error);

        // Normalize category key for fallback lookup (e.g. handles slight casing mismatch if needed, though exact match is expected)
        // TopicSelectionScreen sends labels like 'Business', 'Storytelling', etc.
        const fallbackList = FALLBACK_TOPICS[category] || FALLBACK_TOPICS["Surprise Me"];

        console.warn(`Falling back to static topics for category: ${category} due to error.`);

        return NextResponse.json({
            topics: fallbackList,
            isFallback: true
        });
    }
}

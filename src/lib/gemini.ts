import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateTopics(preferences: string[]) {
    const prompt = `
    You are an expert speaking coach. Based on these user interests: ${preferences.join(", ")}, 
    generate 3 diverse, high-impact speaking topics for a 1-2 minute practice session.
    
    Return the response in strictly this JSON format:
    [
      { "id": "1", "title": "Topic Name", "description": "Brief context for the user" },
      ...
    ]
  `;

    try {
        const result = await aiModel.generateContent(prompt);
        const text = result.response.text();
        // Simple JSON extraction
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid AI response format");
    } catch (error) {
        console.error("AI Topic Generation Error:", error);
        return [
            { id: "fallback-1", title: "The Art of Persuasion", description: "How to convince anyone using logic alone." },
            { id: "fallback-2", title: "Public Speaking Hacks", description: "Discuss the three most effective ways to calm nerves." },
            { id: "fallback-3", title: "The Impact of Technology", description: "How is AI changing the way we communicate?" },
        ];
    }
}

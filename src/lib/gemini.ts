import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        // Simple JSON extraction - fixed regex for older targets
        const jsonMatch = text.match(/\[[\s\S]*\]/);
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

export async function generatePoints(topic: string) {
    const prompt = `
    You are an expert speaking coach. For the topic: "${topic}", 
    generate 5-6 concise, high-impact talking points to guide a 90-second speech.
    The points should follow a logical structure:
    - An engaging hook
    - 3-4 distinct main arguments or insights
    - A memorable conclusion
    
    IMPORTANT: Do NOT label them as "Hook", "Point 1", etc. Just provide the content of each point.
    Keep each point extremely concise (max 12 words) so they are easy to read at a glance.
    
    Return the response in strictly this JSON format:
    ["Point 1 text", "Point 2 text", "Point 3 text", "Point 4 text", "Point 5 text", "Point 6 text"]
  `;

    try {
        const result = await aiModel.generateContent(prompt);
        const text = result.response.text();
        // Ensure regex matches across newlines if the JSON is formatted with them
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid AI response format");
    } catch (error) {
        console.error("AI Point Generation Error:", error);
        return [
            "Hook the audience with a relevant personal story.",
            "Discuss the current landscape and its main challenges.",
            "Explain the first key pillar of your argument.",
            "Provide a secondary insight that adds necessary depth.",
            "Address a potential counter-perspective or limitation.",
            "Finish with a powerful call to action or closing thought."
        ];
    }
}



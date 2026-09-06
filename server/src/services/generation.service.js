//  /src/services/generation.service.js
import { GoogleGenAI } from "@google/genai";
import { buildRagPrompt } from "../builders/prompt.builder.js";

export const generateAnswer = async (query, chunks) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = buildRagPrompt(query, chunks);

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });
    // console.log(response);

    let parsed;
    try {
        parsed = JSON.parse(response.text);
    } catch (err) {
        return {
            answer: "Something went wrong generating a response. Please try again or contact HR.",
            sufficientContext: false,
            citations: []
        };
    }
    finally {
        return parsed;
    }



};
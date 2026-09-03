import { GoogleGenAI } from "@google/genai";


export const embedChunks = async (chunks) => {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    const records = [];

    for (const chunk of chunks) {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-2",
            contents: chunk.text
        });

        const embeddingValues = response.embeddings[0].values;
        // console.log(embeddingValues)
        records.push({
            type: chunk.type,
            text: chunk.text,
            metadata: chunk.metadata,
            embedding: embeddingValues
        });
    }

    return records;
};
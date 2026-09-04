//  /src/services/chunkers/pdf.chunk.js
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 70,
});



export const createPdfChunks = async (pages, fileName) => {
    const finalChunks = [];
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const textChunks = await textSplitter.splitText(page.text);
        for (const text of textChunks) {
            finalChunks.push({
                text,
                type: "text",
                metadata: {
                    section: `Page Number ${i}`,
                    fileName
                }
            });
        }

    }
    return finalChunks;



};
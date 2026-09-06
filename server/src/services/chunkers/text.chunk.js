//  /src/services/chunkers/text.chunk.js

const MAX_CHUNK_CHARS = 700;
const OVERLAP_CHARS = 70;

export const createTextChunks = (rawText) => {
    const lines = rawText.split("\n");
    const chunks = [];

    let currentText = "";
    let startLine = 1;
    let currentLine = 1;

    for (const line of lines) {
        currentText += line + "\n";

        if (currentText.length >= MAX_CHUNK_CHARS) {
            chunks.push({
                type: "text",
                text: currentText.trim(),
                section: `Lines ${startLine}-${currentLine}`
            });

            const overlapText = currentText.slice(-OVERLAP_CHARS);
            currentText = overlapText;
            startLine = currentLine;
        }

        currentLine++;
    }
    if (currentText.trim()) {
        chunks.push({
            type: "text",
            text: currentText.trim(),
            section: `Lines ${startLine}-${currentLine}`
        });
    }

    return chunks;
};
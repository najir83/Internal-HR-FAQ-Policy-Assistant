// chunkers/chunk.text.js

const MAX_CHUNK_CHARS = 1000;
const OVERLAP_CHARS = 100;

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

            // start next chunk with a small overlap from the end of this one
            const overlapText = currentText.slice(-OVERLAP_CHARS);
            currentText = overlapText;
            startLine = currentLine;
        }

        currentLine++;
    }
    // push whatever's left
    if (currentText.trim()) {
        chunks.push({
            type: "text",
            text: currentText.trim(),
            section: `Lines ${startLine}-${currentLine}`
        });
    }

    return chunks;
};
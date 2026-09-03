import path from "path";
import fs from "fs/promises";
import { createChunks } from "./chunkers/chunk.markdown-block.js";
import {
    parseMarkdown
} from "./parsers/markdown.parser.js";
import { embedChunks } from "./embedding.service.js";
import { storeChunks } from "./qdrant.service.js";
import { createTextChunks } from "./chunkers/chunk.text.js";

export const processDocument = async (file) => {

    const extension =
        path.extname(file.originalname).toLowerCase();

    switch (extension) {

        case ".md": {
            const blocks = await parseMarkdown(file.path);

            const chunks = await createChunks(blocks);

            const chunkWithSectionMarked = chunks.map(chunk => ({
                type: chunk.type,
                text: `Section: ${chunk.metadata.headingPath.join(" > ")}: \n\n` + chunk.text,
                metadata: { section: chunk.metadata.headingPath.join(" > "), fileName: file.originalname }
            }));

            // return chunkWithSectionMarked;

            const newChunks = await embedChunks(chunkWithSectionMarked);
            // console.log(newChunks);
            storeChunks(newChunks);

            return newChunks;

        }

        case ".txt": {
            const rawText = await fs.readFile(file.path, "utf-8");
            const chunks = createTextChunks(rawText);

            const chunkWithSectionMarked = chunks.map(chunk => ({
                type: chunk.type,
                text: `Section: ${chunk.section}: \n\n` + chunk.text,
                metadata: { section: chunk.section, fileName: file.originalname }
            }));
            // console.log(chunkWithSectionMarked);
            const newChunks = await embedChunks(chunkWithSectionMarked);
            storeChunks(newChunks);
            return newChunks;
        }

        case ".pdf":
            // later
            throw new Error("PDF parser not implemented");

        default:
            throw new Error(
                `Unsupported file type: ${extension}`
            );
    }
};
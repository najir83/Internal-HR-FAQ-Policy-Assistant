import path from "path";
import { createChunks } from "./chunkers/chunk.markdown-block.js";
import {
    parseMarkdown
} from "./parsers/markdown.parser.js";
import { embedChunks } from "./embedding.service.js";

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
                metadata: chunk.metadata.headingPath
            }));

            const newChunks = embedChunks(chunkWithSectionMarked);

            return newChunks;

        }

        case ".txt":
            // later
            throw new Error("TXT parser not implemented");

        case ".pdf":
            // later
            throw new Error("PDF parser not implemented");

        default:
            throw new Error(
                `Unsupported file type: ${extension}`
            );
    }
};
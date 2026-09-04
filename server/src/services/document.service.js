import path from "path";
import fs from "fs/promises";
import { createChunks } from "./chunkers/chunk.markdown-block.js";
import {
    parseMarkdown
} from "./parsers/markdown.parser.js";
import { embedChunks } from "./embedding.service.js";
import { storeChunks } from "./qdrant.service.js";
import { createTextChunks } from "./chunkers/chunk.text.js";
import { parsePdf } from "./parsers/pdf.parser.js";
import { createPdfChunks } from "./chunkers/chunk.pdf.js";

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

            const embChunks = await embedChunks(chunkWithSectionMarked);
            storeChunks(embChunks);

            return embChunks;

        }

        case ".txt": {
            const rawText = await fs.readFile(file.path, "utf-8");
            const chunks = createTextChunks(rawText);

            const chunkWithSectionMarked = chunks.map(chunk => ({
                type: chunk.type,
                text: chunk.text,
                metadata: { section: chunk.section, fileName: file.originalname }
            }));
            // console.log(chunkWithSectionMarked);
            const embChunks = await embedChunks(chunkWithSectionMarked);
            storeChunks(embChunks);
            return embChunks;
        }

        case ".pdf": {
            const results = await parsePdf(file.path); // parsePdf should return an array directly
            const chunks = await createPdfChunks(results.pages, file.originalname);

            const embChunks = await embedChunks(chunks);
            storeChunks(embChunks);
            return embChunks;
        }

        default:
            throw new Error(
                `Unsupported file type: ${extension}`
            );
    }
};
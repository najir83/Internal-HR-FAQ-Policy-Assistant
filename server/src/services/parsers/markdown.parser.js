//  /src/services/markdown.parser.js

import fs from "fs/promises";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const extractText = (node) => {

    if (node.type === "text") {
        return node.value;
    }

    if (!node.children) {
        return "";
    }

    return node.children
        .map(child => extractText(child))
        .join("");
};
const extractPosition = (node) => {
    return { startLine: node.position.start.line, endLine: node.position.end.line };
};

const extractTableHeaders = (tableNode) => {

    const firstRow = tableNode.children[0];

    return firstRow.children.map(cell =>
        extractText(cell).trim()
    );
};

const extractTableRows = (tableNode) => {

    return tableNode.children
        .slice(1)
        .map(row =>
            row.children.map(cell =>
                extractText(cell).trim()
            )
        );
};
const normalizeBlocks = (tree) => {

    const blocks = [];

    for (const node of tree.children) {

        if (node.type === "heading") {

            blocks.push({
                type: "heading",
                depth: node.depth,
                text: extractText(node),
                position: extractPosition(node)
            });

        }

        else if (node.type === "paragraph") {

            blocks.push({
                type: "paragraph",
                text: extractText(node),
                position: extractPosition(node)

            });

        }
        else if (node.type === "list") {

            blocks.push({
                type: "list",
                ordered: node.ordered,
                items: node.children.map(item =>
                    extractText(item).trim()
                ),
                position: {
                    startLine: node.position.start.line,
                    endLine: node.position.end.line
                }
            });

        }
        else if (node.type === "table") {

            blocks.push({
                type: "table",
                headers: extractTableHeaders(node),
                rows: extractTableRows(node),
                position: extractPosition(node)

            });

        }
    }

    return blocks;
};
export const parseMarkdown = async (filePath) => {

    const markdown = await fs.readFile(
        filePath,
        "utf-8"
    );

    const tree = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .parse(markdown);

    return normalizeBlocks(tree);
};
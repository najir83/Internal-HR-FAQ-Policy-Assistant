import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 70,
});


const tableToText = (table) => {

    const header = table.headers.join(" | ");

    const rows = table.rows.map(row =>
        row.join(" | ")
    );

    return [
        header,
        ...rows
    ].join("\n");
};


const getPreviousWords = (blocks, index) => {

    let text = "";

    for (let i = index - 1; i >= 0; i--) {

        if (blocks[i].type === "paragraph") {
            text =
                blocks[i].text + " " + text;
        }

        if (text.split(/\s+/).length >= 20) {
            break;
        }
    }

    const words = text
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    return words.slice(-20).join(" ");
};

const getNextWords = (blocks, index) => {

    let text = "";

    for (let i = index + 1; i < blocks.length; i++) {

        if (blocks[i].type === "paragraph") {
            text += " " + blocks[i].text;
        }

        if (text.split(/\s+/).length >= 20) {
            break;
        }
    }

    const words = text
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    return words.slice(0, 20).join(" ");
};

export const createChunks = async (blocks) => {

    const finalChunks = [];

    let headingPath = [];

    for (let i = 0; i < blocks.length; i++) {

        const block = blocks[i];


        if (block.type === "heading") {

            headingPath = [
                ...headingPath.slice(0, block.depth - 1),
                block.text
            ];

            continue;
        }
        if (block.type === "list") {

            const text = block.items.map(text => `- ${text}`).join('.\n');
            const textChunks = await textSplitter.splitText(text);
            for (const text of textChunks) {

                finalChunks.push({
                    type: "text", text, metadata: {
                        headingPath: [...headingPath],
                        position: block.position,
                        blockType: "list"
                    }
                });
            }

            continue;
        }

        if (block.type === "paragraph") {

            const textChunks =
                await textSplitter.splitText(
                    block.text
                );

            for (const text of textChunks) {

                finalChunks.push({

                    type: "text",

                    text,

                    metadata: {
                        headingPath: [...headingPath],

                        position: block.position,

                        blockType: "paragraph"
                    }
                });
            }

            continue;
        }
        if (block.type === "table") {

            const previous =
                getPreviousWords(blocks, i);

            const next =
                getNextWords(blocks, i);

            const tableText =
                tableToText(block);


            const fullText = [

                previous
                    ? `Context:\n${previous}`
                    : "",

                `Table:\n${tableText}`,

                next
                    ? `Context:\n${next}`
                    : ""

            ]
                .filter(Boolean)
                .join("\n\n");


            finalChunks.push({

                type: "table",

                text: fullText,

                metadata: {

                    headingPath: [...headingPath],

                    position: block.position,

                    blockType: "table"
                }
            });
        }
    }

    return finalChunks;
};
import pdf from "pdf-parse-new";
import fs from "fs/promises"
export const parsePdf = async (filePath) => {
    const buffer = await fs.readFile(filePath);

    const pages = [];

    const options = {
        pagerender: async (pageData) => {
            const textContent = await pageData.getTextContent();

            const pageText = textContent.items
                .map(item => item.str)
                .join(" ");

            pages.push({
                pageNumber: pageData.pageNumber,
                text: pageText
            });

            return pageText;
        }
    };

    const data = await pdf(buffer, options);

    return {
        numPages: data.numpages,
        info: data.info,
        fullText: data.text,   // still available if you need it
        pages                  // your array of { pageNumber, text }
    };

};

import {
    processDocument
} from "../services/document.service.js";
import { embedChunks } from "../services/embedding.service.js";
import { searchChunks } from "../services/qdrant.service.js";

export const uploadDocument = async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }



        const chunks = await processDocument(req.file);


        return res.status(200).json({
            message: "Document processed successfully",
            chunks
        });

    } catch (error) {

        // console.error(error);

        return res.status(500).json({
            message: (error.message || "Failed to upload document")
        });
    }
};


export const userQuery = async (req, res) => {
    try {
        const { query } = req.body;
        console.log(query);
        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        const embedding = await embedChunks([{ text: query }]);

        const results = await searchChunks(embedding[0].embedding, query, 10);

        // console.log();
        return res.status(200).json({ results });
    }
    catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }


};
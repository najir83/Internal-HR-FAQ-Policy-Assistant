//  /src/controllers/document.controller.js

import {
    processDocument
} from "../services/document.service.js";
import { generateAnswer } from "../services/generation.service.js";
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
            message: "Document stored successfully",
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
        // console.log(query);
        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        const results = await searchChunks(query, 6);

        if (results.length === 0) {
            return res.json({
                answer: "I don't have enough information to answer this; please contact HR.",
                sufficientContext: false,
                citations: []
            });
        }

        const generated = await generateAnswer(query, results);
        // console.log(generated);
        return res.status(200).json(generated);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            answer: "Something went wrong. Please try again or contact HR.",
            sufficientContext: false,
            citations: [],
            error: "internal_error"
        });
    }


};
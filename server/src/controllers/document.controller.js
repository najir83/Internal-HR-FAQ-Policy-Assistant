import {
    processDocument
} from "../services/document.service.js";

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

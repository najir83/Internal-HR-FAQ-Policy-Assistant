import express from "express";
import multer from "multer";

import {
    uploadDocument
} from "../controllers/document.controller.js";

const documentRouter = express.Router();

const upload = multer({
    dest: "uploads/"
});


documentRouter.post(
    "/upload",
    upload.single("file"),
    uploadDocument
);

export default documentRouter;
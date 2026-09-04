//  /src/routes/document.route.js

import express from "express";
import multer from "multer";

import {
    uploadDocument,
    userQuery
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

documentRouter.post('/chat', userQuery);

export default documentRouter;
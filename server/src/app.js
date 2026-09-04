//  /src/app.js

import express from 'express';
import documentRouter from './routes/document.route.js';
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    return res.status(200).json({ message: "Everyting is working fine" });
});

app.use('/api/document', documentRouter);

export default app;
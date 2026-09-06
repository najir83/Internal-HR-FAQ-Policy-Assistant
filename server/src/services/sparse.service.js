//  /src/services/sparse.service.js
import crypto from "crypto";

function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function hashToken(token, vocabSize = 100000) {
    const hash = crypto.createHash("md5").update(token).digest("hex");
    return parseInt(hash.slice(0, 8), 16) % vocabSize;
}

export function toSparseVector(text) {
    const tokens = tokenize(text);
    const counts = {};

    for (const t of tokens) {
        const idx = hashToken(t);
        counts[idx] = (counts[idx] || 0) + 1;
    }

    return {
        indices: Object.keys(counts).map(Number),
        values: Object.values(counts).map(v => v)
    };
}
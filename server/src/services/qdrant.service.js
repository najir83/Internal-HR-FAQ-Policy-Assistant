import client from "../DB/Qdrant.js";
import { embedChunks } from "./embedding.service.js";
import { toSparseVector } from "./sparse.service.js";
import { randomUUID } from "crypto"
const COLLECTION_NAME = "documents";


export const initQdrant = async () => {

    const collections = await client.getCollections();

    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
        await client.createCollection(COLLECTION_NAME, {
            vectors: {
                dense: { size: 3072, distance: "Cosine" }
            },
            sparse_vectors: {
                sparse: {}   // no size needed, sparse vectors are variable-length
            }
        });
        console.log("Collection created");
    } else {
        console.log("Collection already exists");
    }
};

export const storeChunks = async (chunks) => {

    const points = chunks.map((chunk, index) => ({

        id: randomUUID(),

        vector: {
            dense: chunk.embedding,
            sparse: toSparseVector(chunk.text)
        },

        payload: {
            text: chunk.text,
            type: chunk.type,

            ...chunk.metadata
        }

    }));

    await client.upsert(COLLECTION_NAME, {
        points
    });

    console.log("Chunks stored successfully");
};

export const searchChunks = async (queryText, limit = 10) => {

    const embedding = (await embedChunks([{ text: queryText }]))[0].embedding;

    const result = await client.query(COLLECTION_NAME, {
        prefetch: [
            { query: embedding, using: "dense", limit: 20 },
            { query: toSparseVector(queryText), using: "sparse", limit: 20 }
        ],
        query: { fusion: "rrf" },   // Reciprocal Rank Fusion combines both rankings
        limit,
        with_payload: true
    });

    return result;
    // const filteredResult = result.points.filter(res => res.score > 0.69);
    // for (const result of results) {
    //     if (result.score > 0.69) {
    //         filteredResult.push(result);
    //     }
    // }
    // return filteredResult;
};
//   /src/builders/prompt.builder.js

export function buildRagPrompt(query, chunks) {
  const context = chunks
    .map((c, i) =>
      `[Chunk ${i + 1}] (Source: ${c.payload.fileName} | Section: ${c.payload.section})\n${c.payload.text}`
    )
    .join("\n\n---\n\n");

  return `You are an HR policy assistant. Answer the user's question using ONLY the information in the CONTEXT below. Do not use any outside knowledge, assumptions, or information not explicitly present in the context.

CONTEXT:
${context}

QUESTION:
${query}

RULES:
1. Ground every claim strictly in the CONTEXT above. Never invent, infer beyond what's stated, or guess at numbers, limits, or policy terms.
2. If the CONTEXT contains a table or structured data (rows/columns, tiers, categories), read it precisely — match the exact row and column relevant to the question before answering.
3. If the CONTEXT does not contain enough information to answer confidently, you MUST refuse. Do not partially answer or speculate. When refusing, "answer" MUST be exactly this text, with no changes and no added explanation: "I don't have enough information to answer this; please contact HR." Set "sufficientContext" to false.
4. Every factual claim in your answer must be backed by at least one citation referencing the exact fileName and section it came from.
5. Do not cite a fileName/section unless you actually used it to produce the answer. Use the exact "fileName" and "Section" values shown above each chunk — copy them exactly, do not paraphrase, shorten, or reformat them.
6. Note that "Section" values differ by source file type — they may be a document heading path (e.g. "Benefits Policy > 2. Health coverage tiers"), a page reference (e.g. "Page Number 3"), or a line range (e.g. "Lines 40-65"). Treat whatever value is shown as an opaque label and reproduce it exactly as given, regardless of its format.

Respond ONLY with valid JSON matching this exact schema, no markdown fences, no extra text:

{ 
  "answer": string,              // the answer, or a safe fallback like "I don't have enough information to answer this; please contact HR." if sufficientContext is false
  "sufficientContext": boolean,  // true only if the context fully supports the answer
  "citations": [
    {
      "fileName": string,       // exact fileName from the source chunk, e.g. "benefits-policy.md", "leave-policy.pdf", "faq.txt"
      "section": string,        // exact section value from the source chunk, copied verbatim regardless of format (heading path, page number, or line range)
      "quote": string           // short (<20 words) exact snippet from that chunk supporting the answer
    }
  ]
}`;
}
# qu-004 research: 15 Must-Know AI/LLM Concepts for Data Engineers

## Core idea
Data engineers build the pipelines that feed LLM apps: ingest, clean, chunk, embed, index, serve, evaluate. The 15 terms follow that path. All definitions are vendor-neutral.

## The 15 (definition <= 8 words)
1. Token: text unit a model reads and bills by.
2. Context window: max tokens model sees per request, output included.
3. Prompt: input instructions and data sent to model.
4. Temperature: sampling setting controlling output randomness.
5. Embedding: vector of numbers capturing meaning.
6. Cosine similarity: angle-based closeness of two vectors.
7. Chunking: splitting documents into retrievable pieces.
8. Vector index: structure for fast similarity search (e.g. pgvector HNSW).
9. ANN search: near neighbours, trading some recall for speed.
10. RAG: retrieve relevant data, then generate with it.
11. Fine-tuning: further training a model on your data.
12. Hallucination: fluent output that is false or unsupported.
13. Evals: repeatable tests measuring LLM output quality.
14. Guardrails: checks on inputs and outputs for safety.
15. Tool calling: model returns a structured call; your code runs it.

Dropped: inference (generic), reranking and vector database (no primary source opened; covered by 8-10), agents (broad).

## How the RAG pipeline works (animation order)
1. Documents are split into chunks.
2. Each chunk becomes an embedding (vector).
3. Vectors go into a vector index (exact scan, or approximate such as HNSW/IVFFlat).
4. A user query is embedded the same way.
5. Index returns nearest chunks by cosine distance.
6. Chunks are placed in the prompt, inside the context window.
7. Model generates the answer; evals and guardrails check it.

## Worked example (generic sample data)
`docs(id, text)` row: "Refunds are processed within 5 business days." Chunk, embed, store. Query "how long do refunds take?" embeds near that chunk (small cosine distance) and is retrieved. pgvector: `SELECT * FROM chunks ORDER BY embedding <=> $1 LIMIT 5;` (`<=>` = cosine distance). The "5 days" is sample data only.

## Misconceptions
- Context window is not training data; it is per-request working memory.
- Temperature 0 is not fully deterministic (Anthropic glossary says so).
- RAG reduces, not eliminates, hallucination; quality depends on what is retrieved.
- Approximate indexes can return different results than exact search; measure recall.
- Cosine distance (`<=>`) is 1 minus cosine similarity; do not mix up direction.
- Token != word.

## Interview angle
"Design a RAG ingestion pipeline": chunking strategy, embedding refresh on source change, index choice (HNSW vs IVFFlat: speed/recall/build-time tradeoff), recall monitoring vs exact search, evals, prompt-injection from retrieved content.

## What NOT to claim
- No context sizes, prices, token-per-word ratios (vary by model; Anthropic notes tokenizers differ by model).
- No claim that RAG beats fine-tuning; they are complementary.
- No "best" chunk size or embedding dimension.
- HNSW "logarithmic time" is a paper claim, not a guarantee.
- UNVERIFIED: dedicated primary definitions for "prompt", "vector database" and "reranking"; "prompt" definition is generic. Not used as claims.

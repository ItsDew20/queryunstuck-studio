# qu-004 script: 15 Must-Know AI/LLM Concepts for Data Engineers (reel-list)

**Hook (first 1.5 s):** 15 AI/LLM terms data engineers must know.

**Total:** 27 s (title 2.5 + 3 x 7 + end 3.5). Three dense cheat-sheet cards; items reveal one by one, then the
full card holds so viewers can screenshot. The full list is repeated in the caption.

Grouping: the 15 terms from research.md, grouped by job rather than strict pipeline order so each
card reads as one idea. Numbering runs 1-15 across the three cards.

| scene id | seconds | on-screen title/text | what moves on screen | optional narration |
|---|---|---|---|---|
| s1-title | 2.5 | 15 AI/LLM terms / for data engineers / Three cards. Screenshot them. | Title snaps in; "15" counts up; subtitle fades in | "15 AI terms every data engineer should know." |
| s2-model | 7 | Talking to the model / 1. Token: a chunk of text the model reads / 2. Context window: max tokens per request, output included / 3. Prompt: the instructions and data you send / 4. Temperature: controls randomness; 0 can still vary / 5. Tool calling: model emits a call; app or API runs it | Card header, then items 1-5 reveal ~1.2 s apart; full card holds last ~1 s | "Talking to the model." |
| s3-data | 7 | Finding the right data / 6. Chunking: split docs into retrievable pieces / 7. Embedding: a vector of numbers for meaning / 8. Cosine similarity: how closely two vectors align / 9. Vector index: structure for fast similarity search / 10. ANN search: approximate; trades recall for speed | Same reveal rhythm; items continue numbering from 6 | "Finding the right data." |
| s4-reliable | 7 | Making answers reliable / 11. RAG: retrieve relevant data, then generate / 12. Fine-tuning: further train a model on your own data / 13. Hallucination: output that is false or unsupported / 14. Evals: repeatable tests of output quality / 15. Guardrails: checks on inputs and outputs | Same reveal rhythm; full card holds | "Making answers reliable." |
| s5-end | 3.5 | RAG answers depend on what you retrieve. / Save this for your next interview | Takeaway line types on; save prompt + watermark | "What you retrieve shapes the answer. Save this." |

## Accuracy notes (for fact-checker)
- Token: no tokens-per-word ratio; tokens can be words, subwords, characters or bytes (glossary).
- Context window: prompt plus generated output; no model sizes (OpenAI concepts, Anthropic context windows).
- Prompt and vector index: deliberately generic, modest definitions (researcher marked them weakly sourced).
- Temperature: explicitly says 0 is not fully deterministic (Anthropic glossary).
- Tool calling: model emits a structured call; the app (client tools) or the API provider (server tools) runs it (Anthropic tool-use overview).
- ANN: approximate indexes trade recall for speed (pgvector README, HNSW paper).
- Hallucination: no claim that anything eliminates it.
- End takeaway: RAG quality depends on retrieved data (Anthropic glossary RAG entry).
- No code snippet; code_blocks left empty (pgvector SQL can't run in DuckDB).

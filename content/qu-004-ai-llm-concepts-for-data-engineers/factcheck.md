# qu-004 Fact-check: 15 Must-Know AI/LLM Concepts for Data Engineers

Pass 2 (after loop 1), 2026-10-17, fact-checker. I re-read spec.json and script.md, including all narration. Every URL in `sources[]` was opened in pass 1 (19 sources, including the scikit-learn metrics guide and the "prompt" section of OpenAI concepts). The pass-1 quotes below are reused for lines that did not change. Each line that changed in loop 1 was checked again as a new claim. All on-screen lines are 60 characters or less.

## Loop 1 fixes

| Pass-1 issue | New text | Result |
|---|---|---|
| Item 5 overgeneralised ("your code runs it") | "5. Tool calling: model emits a call; app or API runs it" | Fixed. Covers client tools and server tools |
| Item 12 misleading ("more data") | "12. Fine-tuning: further train a model on your own data" | Fixed |
| Item 13 too narrow ("fluent ... false") | "13. Hallucination: output that is false or unsupported" | Fixed |
| End line overgeneralised ("only as good as your data") | "RAG answers depend on what you retrieve." Narration: "What you retrieve shapes the answer. Save this." | Fixed |
| s1/hook "One screen" false with 3 cards | s1 "Three cards. Screenshot them."; hook "15 AI/LLM terms data engineers must know." | Fixed |
| Optional items 2, 4, 8, 9 | Applied; checked as new claims below | All supported |

## Claims

| # | Scene | On-screen claim | Verdict | Source | Fix |
|---|---|---|---|---|---|
| 1 | s1 | "15 AI/LLM terms / for data engineers" | Supported | Self-referential; s2-s4 list 15 terms | none |
| 2 | s1 | "Three cards. Screenshot them." | Supported | script.md: three ListCards (s2, s3, s4), each with a full-card hold | none |
| 3 | s2 | "1. Token: a chunk of text the model reads" | Supported | OpenAI concepts: "process text in chunks called tokens"; Anthropic glossary: words, subwords, characters or bytes | none |
| 4 | s2 | "2. Context window: max tokens per request, output included" (NEW) | Supported | OpenAI concepts: "the prompt and the generated output combined must be no more than the model's maximum context length"; Anthropic context windows: "Everything in the request counts toward the context window... The output Claude generates for the turn... counts too" | none. Note for copy and narration: do not equate this with the `max_tokens` API parameter, which caps output only. |
| 5 | s2 | "3. Prompt: the instructions and data you send" | Supported | OpenAI concepts: inputs "are also referred to as 'prompts'"; "providing instructions or some examples" | none |
| 6 | s2 | "4. Temperature: controls randomness; 0 can still vary" (NEW) | Supported | Anthropic glossary: "controls the randomness"; "Even with temperature set to 0, the results will not be fully deterministic and identical inputs may produce different outputs across API calls" | none. "can" is correctly hedged. |
| 7 | s2 | "5. Tool calling: model emits a call; app or API runs it" (FIXED) | Supported | Anthropic tool-use overview: "returns a structured call that your application executes (client tools) or that Anthropic executes (server tools)" | none |
| 8 | s3 | "6. Chunking: split docs into retrievable pieces" | Supported | Anthropic contextual retrieval: "Break down the knowledge base... into smaller chunks of text" | none |
| 9 | s3 | "7. Embedding: a vector of numbers for meaning" | Supported | OpenAI embeddings: "a vector (list) of floating point numbers"; distance "measures their relatedness" | none |
| 10 | s3 | "8. Cosine similarity: how closely two vectors align" (NEW) | Supported | scikit-learn metrics 8.8.1: normalised dot product = "the cosine of the angle between the points denoted by the vectors". "Align" describes direction (angle) correctly and ignores magnitude | none |
| 11 | s3 | "9. Vector index: structure for fast similarity search" (NEW) | Supported | pgvector README: exact search by default; "You can add an index to use approximate nearest neighbor search, which trades some recall for speed". HNSW "has better query performance than IVFFlat". HNSW paper: search "boosts the performance... and allows a logarithmic complexity scaling". So speed is the stated reason for the index | none |
| 12 | s3 | "10. ANN search: approximate; trades recall for speed" | Supported | pgvector README: "trades some recall for speed"; HNSW paper: "approximate K-nearest neighbor search" | none |
| 13 | s4 | "11. RAG: retrieve relevant data, then generate" | Supported | Anthropic glossary RAG entry; Lewis et al. 2020 | none |
| 14 | s4 | "12. Fine-tuning: further train a model on your own data" (FIXED) | Supported | Anthropic glossary: "further training a pretrained language model using additional data"; OpenAI model-optimization: provide "the kinds of inputs and outputs you expect in your application" | none |
| 15 | s4 | "13. Hallucination: output that is false or unsupported" (FIXED) | Supported | Anthropic reduce-hallucinations: "factually incorrect or inconsistent with the given context"; Ji et al. survey | none |
| 16 | s4 | "14. Evals: repeatable tests of output quality" | Supported | Anthropic develop-tests: measurable criteria, test cases, "Automate when possible"; OpenAI: evals "measure model output" | none |
| 17 | s4 | "15. Guardrails: checks on inputs and outputs" | Supported | Anthropic mitigate-jailbreaks: input screens and validation, "Screen tool outputs", "Regularly analyze outputs" | none |
| 18 | s5 | "RAG answers depend on what you retrieve." (FIXED) | Supported | Anthropic glossary: "the effectiveness of RAG depends on the quality and relevance of the external knowledge base and the knowledge that is retrieved at runtime" | none |
| 19 | s5 | "Save this for your next interview" | CTA, no claim | n/a | none |
| 20 | headers | "Talking to the model" / "Finding the right data" / "Making answers reliable" | Labels, no claim | n/a | none |
| 21 | narration | "15 AI terms every data engineer should know." / card headers / "What you retrieve shapes the answer. Save this." | Supported (opinion and labels; the last line matches row 18) | as above | none |

No model-specific numbers on screen. Nothing vendor-specific is stated as universal.

## Not on screen (for the copywriter)

These do not block this verdict, but neither option should be picked:
- `hook_options[0]` ("...now get asked about") has no source.
- `hook_options[2]` ("on one screen") contradicts the three-card layout.

## Code results

- `code_blocks[]` is empty. `.venv/bin/python scripts/run_snippet.py content/qu-004-ai-llm-concepts-for-data-engineers --write` exited 0 and printed nothing. There was nothing to execute.

VERDICT: PASS

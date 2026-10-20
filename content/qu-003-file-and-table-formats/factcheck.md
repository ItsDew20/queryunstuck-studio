# qu-003 Fact-check (pass 2): 10 Must-Know File & Table Formats (CSV to Iceberg)

Re-checked 2026-10-17 by fact-checker after scriptwriter loop 1. Re-read spec.json and script.md. Sources are the same as pass 1: every URL in `sources[]` was opened, including the raw Avro, Iceberg and Delta specs on GitHub and the Arrow FAQ.

## Loop 1 fixes

| Item | Pass 1 | Now | Status |
|---|---|---|---|
| s3 Arrow (blocking) | "Arrow: columnar in memory, not storage" | "Arrow: columnar in memory, built for compute". Narration and beat updated | Fixed. Supported by the Arrow FAQ: "in-memory format meant primarily for direct and efficient use for computational purposes" |
| s3 Parquet | "column-oriented file, compressed" | "column-oriented file, built-in compression" (51 chars) | Fixed. Parquet overview: "provides high performance compression and encoding schemes" |
| s2 Avro narration | "Avro, which embeds its schema" | "Avro files, which embed their schema" | Fixed. Avro spec: container file header `avro.schema` "(required)" |
| s1 hook | "10 formats, one screen." | "10 formats, 25 seconds." | Fixed. Scene durations sum to 25 s, which equals `target_duration_sec` |

No other on-screen text changed. Longest line is 51 chars (limit 60).

## Claims

| # | Scene | On-screen claim | Verdict | Source | Fix |
|---|---|---|---|---|---|
| 1 | s1 | "Parquet is a file format." | Supported | parquet.apache.org/docs/overview: "column-oriented data file format" | none |
| 2 | s1 | "Iceberg is not." | Supported | iceberg.apache.org: "The open table format for analytic datasets"; Iceberg spec: "This table format tracks individual data files" | none |
| 3 | s1 | "10 formats, 25 seconds." | Supported | spec.json scenes: 2+6+5+6+3+3 = 25 s; 10 items listed | none |
| 4 | s2 | "Row-based files" (header) | Acceptable | RFC 4180, jsonlines.org, Avro spec (blocks of serialized records) | Plain JSON is only loosely row-based. A common shorthand, acceptable. |
| 5 | s2 | "CSV: plain-text rows, comma-separated" | Supported | RFC 4180: one record per line, fields "separated by commas", `text/csv` | none |
| 6 | s2 | "JSON: text format for structured data" | Supported | RFC 8259: "text-based ... portable representation of structured data" | none |
| 7 | s2 | "JSON Lines: one JSON value per line" | Supported | jsonlines.org: "any JSON value is permitted", `\n` terminator | none |
| 8 | s2 | "Avro: binary rows, schema embedded" | Supported (scoped to files by header) | Avro spec, Object Container Files: `avro.schema` required in header | none |
| 9 | s3 | "Columnar + in-memory" | Supported | Parquet overview, ORC docs, Arrow home | none |
| 10 | s3 | "Parquet: column-oriented file, built-in compression" | Supported | Parquet overview | none |
| 11 | s3 | "ORC: columnar file, created for Hive" | Supported | orc.apache.org/docs: "we created ORC files as part of the initiative to massively speed up Apache Hive" | none |
| 12 | s3 | "Arrow: columnar in memory, built for compute" | Supported | arrow.apache.org: "columnar memory format ... organized for efficient analytic operations"; arrow.apache.org/faq | none |
| 13 | s4 | "Table formats: metadata over data files" | Supported | Iceberg spec; Delta PROTOCOL.md; Hudi overview ("open table format") | none |
| 14 | s4 | "Delta Lake: ACID transaction log" | Supported | Delta PROTOCOL.md: data files + transaction log in `_delta_log`, "maintaining ACID semantics" | none |
| 15 | s4 | "Iceberg: snapshots, schema evolution, time travel" | Supported | Iceberg spec (snapshots, "full schema and partition spec evolution"); iceberg.apache.org ("Time-travel enables reproducible queries") | none |
| 16 | s4 | "Hudi: upserts, deletes, incremental processing" | Supported | hudi.apache.org/docs/overview: "efficient upserts/deletes", "efficient incremental batch pipelines" | none |
| 17 | s5 | "File format: how bytes sit in a file" | Supported (definitional) | Parquet / ORC / Avro specs define the on-file layout | none |
| 18 | s5 | "Table format: which files form the table" | Supported (simplified) | Iceberg spec: "tracks individual data files in a table"; Delta protocol | none |
| 19 | s6 | "Files store data. Tables track files." | Supported (slogan) | Same as rows 17-18 | none |
| 20 | s6 | "Save this for your next interview" | CTA, no claim | n/a | none |

Narration lines (optional voice-over) were also checked. "Parquet and ORC store columns on disk" and "Table formats sit on top of data files like Parquet" are supported by the same sources.

## Code results

`code_blocks` is empty, so there is nothing to execute. `.venv/bin/python scripts/run_snippet.py content/qu-003-file-and-table-formats --write` was re-run: exit code 0, no output. No `verified` flags apply.

## Non-blocking note

- `hook_options[2]` still says "10 formats, one screen." It is not on screen, but the copywriter should not reuse it unless the storyboard really shows all 10 items on one card.

VERDICT: PASS

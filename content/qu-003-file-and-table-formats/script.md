# qu-003 Script: 10 Must-Know File & Table Formats (reel-list)

**Hook:** Parquet is a file format. Iceberg is not. 10 formats, 25 seconds.

Total: 25 s. Single dense cheat-sheet; full list is repeated in the caption. No code blocks.

| scene id | seconds | on-screen title/text | what moves on screen | optional narration |
|---|---|---|---|---|
| s1-hook | 2 | Parquet is a file format.<br>Iceberg is not.<br>10 formats, 25 seconds. | Title snaps in; "is not" pops on Iceberg. | Parquet is a file format. Iceberg is not. Ten formats, twenty-five seconds. |
| s2-row | 6 | Row-based files<br>CSV: plain-text rows, comma-separated<br>JSON: text format for structured data<br>JSON Lines: one JSON value per line<br>Avro: binary rows, schema embedded | ListCard, items 1-4 reveal one by one under the "Row-based files" header. | Row formats store whole records. CSV, JSON, JSON Lines, and Avro files, which embed their schema. |
| s3-columnar | 5 | Columnar + in-memory<br>Parquet: column-oriented file, built-in compression<br>ORC: columnar file, created for Hive<br>Arrow: columnar in memory, built for compute | ListCard continues numbering at 5; items 5-7 reveal; Arrow gets an "in memory" tag. | Parquet and ORC store columns on disk. Arrow is columnar in memory, built for compute. |
| s4-table | 6 | Table formats: metadata over data files<br>Delta Lake: ACID transaction log<br>Iceberg: snapshots, schema evolution, time travel<br>Hudi: upserts, deletes, incremental processing | ListCard continues numbering at 8; items 8-10 reveal above a strip of data-file blocks. | Table formats sit on top of data files like Parquet. Delta, Iceberg, Hudi. |
| s5-diff | 3 | File format: how bytes sit in a file<br>Table format: which files form the table | Two-line comparison; the second line highlights. | File format: bytes in a file. Table format: which files make the table. |
| s6-end | 3 | Files store data. Tables track files.<br>Save this for your next interview | EndCard with takeaway and save prompt. | Files store data. Tables track files. Save this for your next interview. |

## Source mapping
- CSV: RFC 4180. JSON: RFC 8259. JSON Lines: jsonlines.org. Avro: Avro specification (embedded schema, binary).
- Parquet: parquet.apache.org overview (column-oriented, compression). ORC: orc.apache.org docs (columnar, created for Hive).
- Arrow: arrow.apache.org (columnar memory format).
- Delta Lake: delta-intro (ACID) + PROTOCOL.md (data files + _delta_log). Iceberg: iceberg.apache.org + spec (snapshots, schema evolution, time travel, tables over Parquet/Avro/ORC files). Hudi: hudi overview (upserts/deletes, incremental processing).
- Deliberately omitted: benchmarks, superlatives, company usage, engine support, ORC ACID, Iceberg v2/v3, Delta UniForm, Avro+Kafka.

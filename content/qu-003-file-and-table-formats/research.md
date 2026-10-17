# qu-003 Research: 10 Must-Know File & Table Formats

## Core definition
A **file format** defines how records are laid out inside one file. A **table format** is a metadata layer over a set of data files (commonly Parquet) that tracks which files make up the table, so engines get transactions and snapshots. Parquet is a file format. Iceberg is not.

## The 10 (meaning <=8 words | distinguishing fact)
Row-based text
1. **CSV** | Comma-separated plain-text rows | RFC 4180 is Informational, not a standard; optional header, quoting rules. No types in the file.
2. **JSON** | Text format for nested, structured data | Language-independent text (RFC 8259); self-describing keys.
3. **JSON Lines** | One JSON value per line | Newline-delimited, UTF-8, so files are appendable and splittable by line. (The "one more": the common log/event form of JSON.)

Row-based binary
4. **Avro** | Compact binary rows with embedded schema | Container file stores the writer's schema; schema resolution lets a newer reader schema read old data.

Columnar
5. **Parquet** | Open column-oriented file format on disk | Compression and encoding per column; readers fetch only needed columns.
6. **ORC** | Columnar file format born in Hive | Self-describing, type-aware; built-in indexes enable predicate pushdown by stripe.

In-memory
7. **Arrow** | Language-independent columnar format in memory | Memory format, not a storage format; supports zero-copy reads between tools.

Table formats
8. **Delta Lake** | ACID transaction log over Parquet files | `_delta_log` of JSON commits; readers see a consistent snapshot; time travel.
9. **Iceberg** | Open table format for huge analytic tables | Metadata files + snapshots; schema evolution, time travel, hidden partitioning; many engines share one table.
10. **Hudi** | Data lake tables with upserts and deletes | Incremental processing; COPY_ON_WRITE and MERGE_ON_READ table types.

## How it works (animation steps)
1. Show the same 3 rows as CSV (text lines), Avro (rows), Parquet (columns grouped).
2. Bracket 1-4 "row-based", 5-6 "columnar", 7 "in memory".
3. Draw a layer above Parquet files labelled "metadata: which files, which snapshot" = table formats 8-10.
4. Highlight: file format = how bytes are laid out; table format = which files form the table.

## Worked example
`orders`: (1, 'A', 9.5), (2, 'B', 4.0), (3, 'A', 7.0)
- CSV: `order_id,customer,amount` then `1,A,9.5` ...
- JSON Lines: `{"order_id":1,"customer":"A","amount":9.5}` per line.
- Columnar: order_id [1,2,3], customer [A,B,A], amount [9.5,4.0,7.0]. `SUM(amount)` reads only one column.
- Table format: a snapshot lists the data files; a new commit adds/removes files atomically.

## Common misconceptions
- "Iceberg/Delta/Hudi replace Parquet." They sit on top of data files; Iceberg's spec allows Parquet, Avro, ORC.
- "Arrow is a file format to store data." It is an in-memory columnar format.
- "CSV is standardised." RFC 4180 is informational only.
- "Columnar is always better." Depends on workload; avoid the claim.

## Interview angle
Row vs columnar (scan few columns vs write whole records); why Avro for streaming/schema evolution, Parquet for analytics; what a table format adds (ACID, snapshots, schema evolution); file vs table format.

## What NOT to claim
- No "fastest/best/smaller by X%" or benchmarks.
- Feature parity differs by engine and version (time travel, MERGE, concurrency, write support for Hudi/Delta/Iceberg in a given engine). Do not say "all engines support X".
- Do not claim ORC ACID details, Iceberg v2/v3 features, or Delta "UniForm" interoperability (UNVERIFIED, not researched).
- Do not say which companies use which format.
- Avro "used by Kafka" not sourced: omit.

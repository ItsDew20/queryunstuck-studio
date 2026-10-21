# qu-005 Fact-check (loop 3, final): Designing a Clickstream Analytics Pipeline, End to End

Re-checked 2026-10-17 against spec.json (42 scenes, 943 s), script.md and sources[]: Kafka 4.3
intro + design, Spark Structured Streaming getting-started + APIs on DataFrames/Datasets,
Databricks medallion, BigQuery partitioned tables, DuckDB Hive partitioning, DuckDB INSERT.

How I checked for changes: I diffed the current spec.json against the original scripted
spec.json from loop 1. Every difference is one of the loop-1 or loop-2 fixes below, plus the
matching duration tweaks (s01 31->30, s14 7->11, s25 22->20, s26 11->12, s35 9->10;
target_duration_sec 940->943). The only code change is block 3 (`ORDER BY ingest_time`).
sources[] is unchanged. script.md mirrors spec.json for every fixed scene.

## Claim review by chapter (unchanged scenes keep their loop-1 verdicts)

| chapter | claims | verdict | source |
|---|---|---|---|
| Cold open + Intro | s00 framing ("worth knowing cold", every query run); s01 definitions, append-only framed as convention; s02 9 rows / 8 events, 44 s, 17 min 40 s | OK | blocks 0-1 |
| 1. Kafka | order per partition; partitions across brokers; same key -> same partition; one consumer per partition in a group; one offset per partition | OK | Kafka 4.3 intro + design |
| 2. Batch vs streaming | event time = time embedded in data; Spark offsets + checkpoints; freshness question; bucket by event time | OK | Spark getting-started; block 1 |
| 3. Watermarks | watermark = max event time seen - threshold; strict guarantee inside, best effort outside; lateness in event time; event 6 2:40 behind 09:06:40 | OK | Spark APIs guide; block 2 |
| 4. Idempotency | Kafka idempotent producer (producer ID + sequence); DuckDB enforced key + ON CONFLICT; Spark exactly-once = replayable sources + idempotent sinks; dropDuplicates with event_id + event_time / dropDuplicatesWithinWatermark | OK | Kafka design; DuckDB INSERT; Spark getting-started + APIs guide; block 3 |
| 5. Medallion | bronze / silver / gold per Databricks; 4 -> 3 clicks; ROW_NUMBER dedupe; rebuild silver from bronze | OK | Databricks medallion; blocks 4-6 |
| 6. Pruning | pruning needs a qualifying filter on the partition column; BigQuery fewer bytes; DuckDB Hive pushdown; no partition skipped on user_id filter | OK | BigQuery partitioned tables; DuckDB Hive partitioning; block 7 |
| Recap + Outro | six recap lines; silver partitioned by event_date; CTA | OK | as above |

## Loop 1 fixes (confirmed)

| scene | issue | now reads | verdict |
|---|---|---|---|
| s01 | immutability stated as fact | "We treat events as append-only: a click that happened, happened." | OK |
| s12 | streaming offsets stated as universal | "Spark tracks how far each stream has read" | OK |
| s19 | watermark sentence wrong for 2-min case | "...so the watermark was still 09:06:40 minus the threshold." | OK |
| s21 | "will run twice / Retries guarantee it" | "Assume your pipeline runs twice." / "Retries make it likely." | OK |
| s24 | key-based dedupe stated as general warehouse practice | "DuckDB: PRIMARY KEY (event_id)"; "In DuckDB, the cleanest guard is an enforced key." | OK |
| s25 | exactly-once stated as universal | "Spark exactly-once: two ingredients"; "Spark's docs describe how Structured Streaming can ensure end-to-end exactly-once"; "In Spark, it's those two properties together." | OK |
| s26 | dropDuplicates("event_id") with watermark | "With watermark: key on event_id + event_time"; narration names dropDuplicatesWithinWatermark; beat `withWatermark("event_time", ...).dropDuplicates("event_id", "event_time")` | OK (both APIs are on the cited Spark APIs page) |
| s38 | "Nothing skipped" | "Filter only on user_id? No partition skipped" | OK |
| s40 | recap said gold partitioned | "And silver is partitioned by event_date, so queries filtering on date skip the other days." | OK |
| s00 / s14 / block 3 (optional) | soft claim / heuristic as fact / scan-order dependence | "worth knowing cold"; "Takeaway: ask how fresh it needs to be"; `ORDER BY ingest_time` | OK |

## Loop 2 fixes (confirmed)

| scene | issue | now reads (spec.json and script.md) | verdict |
|---|---|---|---|
| s35 | "Partition pruning isn't automatic." contradicted DuckDB ("automatically pushed down") and BigQuery | on-screen "Pruning needs a filter on the partition column." (47) / "Miss it, and no partition is skipped." (37); narration "Partition pruning only kicks in when your query filters on the partition column." | OK (BigQuery: qualifying filter on partitioning column -> skip remaining partitions; DuckDB: filters on partition keys pushed down) |

## Watermark ruling

The script is correct. Spark's guide measures lateness in event time against the latest data
processed: "any data less than 2 hours behind (in terms of event-time) the latest data processed
till then is guaranteed to be aggregated", and data beyond the threshold "may or may not get
aggregated". Event 6 (09:04:00) arrives when the max event time seen is 09:06:40, so it is
2 min 40 s behind. 10-min threshold: guaranteed. 2-min threshold: best effort. The
17 min 40 s wall-clock delay doesn't matter. research.md section 3 was wrong in loop 1
(it measured by wall clock) and is now corrected by the researcher.

## Code results

Run: `.venv/bin/python scripts/run_snippet.py content/qu-005-clickstream-analytics-pipeline-design --write` (DuckDB 1.5.6). All 8 blocks OK and match expected.

| block | scene | result | verified |
|---|---|---|---|
| 0 | s02 | 9 rows in arrival order | true |
| 1 | s11 | event 6 lag 0:17:40; event 3 copy 0:00:45 | true |
| 2 | s18 | event 6: max_seen 09:06:40, behind 0:02:40, guaranteed / best effort (illustration, labelled) | true |
| 3 | s24 | 8 \| 8 with ORDER BY ingest_time; first arrival of event 3 kept; third load still 8 | true |
| 4 | s30 | click 4, page_view 3, purchase 2 | true |
| 5 | s31 | 8 rows | true |
| 6 | s32 | click 3/3, page_view 3/3, purchase 2/2 | true |
| 7 | s37 | 101:1, 102:1 | true; needs_manual_check: true (correct: an in-memory table can't show pruning) |

- No block writes to disk: no COPY, EXPORT, ATTACH, INSTALL or file reads.
- Dialect: DuckDB-specific (strftime, INTERVAL, ON CONFLICT). DuckDB is the stated engine, so the run is a fair test.
- On-screen numbers match the outputs: 9 rows / 8 events, 44 s, 17 min 40 s, 09:06:40, 2 min 40 s, 8 rows, click 4 -> 3, page_view 3, purchase 2.

## Non-blocking notes (downstream)

- Block 7 shows the query result, not pruning. Keep the s37 on-screen caveat, and QA should check the "bytes scanned" bar isn't presented as a measured figure.
- dropDuplicatesWithinWatermark is a newer Spark API. Copy should not imply it exists in old versions.
- s05 "same key, same partition" assumes the partition count is unchanged. Any caveat added later needs a source.
- Captions and descriptions must not reintroduce removed wording ("Retries guarantee it", "exactly-once needs two things", "pruning isn't automatic", "interviewers love").

VERDICT: PASS

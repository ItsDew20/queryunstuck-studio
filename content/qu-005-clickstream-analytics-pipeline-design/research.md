# qu-005 Research: Clickstream analytics pipeline

Docs read 2026-10-17: Kafka 4.3 docs, Spark Structured Streaming 4.2.0, DuckDB 1.5.6, BigQuery and Databricks (unversioned).

## Intro: clickstream data
Each user action is an immutable event row. Shared example, `events` (event_time is when it happened, ingest_time is when the pipeline received it):

(event_id, user_id, event_type, event_time -> ingest_time)
1,101,page_view,09:00:05 -> 09:00:06
2,102,page_view,09:01:10 -> 09:01:11
3,102,click,09:02:00 -> 09:02:01
4,101,click,09:02:30 -> 09:02:31
5,103,page_view,09:03:15 -> 09:03:16
6,101,purchase,09:04:00 -> 09:21:40 (late)
3,102,click,09:02:00 -> 09:02:45 (duplicate retry)
7,103,click,09:05:20 -> 09:05:21
8,102,purchase,09:06:40 -> 09:06:41

## 1. Kafka topics, partitions, consumer groups
A topic is split into partitions spread over brokers. Events with the same key go to the same partition. A consumer of a topic-partition reads events in the order written, so ordering is per partition, not per topic. Within a consumer group each partition is consumed by exactly one consumer at a time; a consumer's position is one offset per partition.
On screen: key by `user_id` so one user's events stay ordered.

## 2. Batch vs streaming
Batch processes bounded data on a schedule; streaming processes unbounded data continuously. Spark Structured Streaming runs micro-batches tracked by source offsets. Conceptual only.

## 3. Late data and watermarks
Event time is the time embedded in the data, not arrival time. Spark: watermark = max event time seen minus late threshold. State for a window is kept until the watermark passes the window end. Guarantee: data less than the threshold late is never dropped (strict); data later may or may not be dropped (best effort).
Example: event 6 (event_time 09:04:00) arrives at 09:21:40, after the max event time seen is 09:06:40 (event 8). It is 2m40s behind in event time, not 17 min; lateness is measured against event time, not wall clock. With a 10 min threshold it is guaranteed to be aggregated; with a 2 min threshold it is best effort. Conceptual; the rule can be shown as DuckDB arithmetic (max(event_time) - interval) but is not engine behaviour.

## 4. Idempotent pipelines
Running a step twice gives the same result as once. Kafka idempotent producer: broker dedupes retries using producer ID plus sequence number. Spark: replayable sources plus idempotent sinks give end-to-end exactly-once. Warehouse equivalent: dedupe on `event_id`. Runnable: DuckDB `INSERT ... ON CONFLICT (event_id) DO NOTHING` (needs PRIMARY KEY/UNIQUE; tested on DuckDB 1.5.6, second insert of event 3 leaves 1 row). Also `ROW_NUMBER() OVER (PARTITION BY event_id ...)` dedupe.

## 5. Medallion architecture
Databricks: bronze = raw, unvalidated data in original format (audit/replay); silver = cleaned, validated, deduplicated, enriched; gold = aggregated, business-aligned for dashboards/BI. Runnable: bronze raw rows, silver dedupe, gold `COUNT(*) GROUP BY event_type, date`. 

## 6. Partition pruning
BigQuery: with a qualifying filter on the partitioning column, it scans matching partitions and skips the rest ("pruning"), reducing bytes processed. DuckDB: filters on Hive partition keys are pushed down into the files. Runnable: write Parquet with `PARTITION_BY (event_date)` via COPY, then `SELECT ... WHERE event_date = ...` and `EXPLAIN`.

## Recap
Kafka (ordered per partition) -> stream with watermarks -> idempotent writes -> bronze/silver/gold -> partitioned gold.

## Misconceptions
- Kafka orders a whole topic (only per partition).
- Watermark drops everything late (best effort backward).
- "Exactly once" means no duplicates anywhere (needs idempotent sinks/replayable sources).
- Partitioning always helps (only when filter uses the partition column).

## Do NOT claim
Throughput/latency numbers, company usage, default retention, that Flink/Spark watermark semantics are identical, or that pruning behaves the same across engines. Iceberg's partitioning page did not yield text via fetch, so Iceberg hidden partitioning is cut. Cut: Flink watermarks, Kafka transactions detail.

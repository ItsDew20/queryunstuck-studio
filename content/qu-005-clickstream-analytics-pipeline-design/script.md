# qu-005 Script: Designing a Clickstream Analytics Pipeline, End to End (longform)

**Hook:** Every click becomes a dashboard number. Here are the 6 design steps in between.

Total: 943 s (~15 min 43 s), 42 scenes, 8 code blocks (DuckDB). Every chapter opens with its own one-line hook and closes with a takeaway so it can be cut into a standalone reel.

## Chapters

- Cold open: 25 s
- Intro: clickstream events: 73 s
- 1. Kafka topics, partitions, consumer groups: 138 s
- 2. Batch vs streaming: 136 s
- 3. Late data and watermarks: 138 s
- 4. Idempotent pipelines: 151 s
- 5. Medallion architecture: 131 s
- 6. Partition pruning: 100 s
- Recap: 39 s
- Outro: 12 s


## Cold open

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s00-cold-open | 25 | Every click becomes a dashboard number<br>6 steps in between<br>Kafka, streaming, watermarks<br>Idempotency, medallion, pruning | Title line lands in the first second; a single click dot travels left to right through six labelled boxes and ends as a number on a dashboard tile. | Every click on a website becomes a number on a dashboard. Between the click and the number are six design decisions worth knowing cold: Kafka partitions, batch versus streaming, late data and watermarks, idempotent writes, bronze, silver and gold, and partition pruning. We'll build the whole pipeline on one nine-row table, and every query you see was actually run. |  |

## Intro: clickstream events

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s01-what-is-clickstream | 30 | Clickstream: one row per user action<br>event_id, user_id, event_type<br>event_time: when it happened<br>ingest_time: when we received it | A page view, a click and a purchase each drop out of a browser icon as a row card; the two timestamp fields highlight one after the other. | A clickstream is the log of what users do: page views, clicks, purchases. Each action becomes one event. We treat events as append-only: a click that happened, happened. So every action is a new row. Two timestamps matter. event_time is when the action happened. ingest_time is when our pipeline received it. Keep those two apart, because half of this video depends on the gap between them. |  |
| s02-events-table | 43 | Our events table: 9 rows, 8 events<br>Event 3 arrives twice (a retry)<br>Event 6 arrives 17 min 40 s late | DataTable of all 9 rows in arrival order; the second copy of event 3 flashes, then event 6 slides to the bottom with its arrival time highlighted. | Here's the table we'll use for the whole video, in the order rows arrived. Three users: 101, 102 and 103. Most events land about a second after they happen. Two rows are trouble. Event 3, a click by user 102, shows up twice, the second copy 44 seconds after the first, like a retry. And event 6, a purchase by user 101, happened at 09:04 but only arrived at 09:21:40. Nine rows, but only eight real events. Every chapter fixes one problem in this table. | 0 |

## 1. Kafka topics, partitions, consumer groups

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s03-kafka-hook | 13 | Kafka doesn't order your topic.<br>It orders each partition. | Hook card; the word 'topic' is struck through and replaced by 'partition'. | Kafka does not keep your whole topic in order. It keeps each partition in order. That one sentence answers a lot of Kafka interview questions. |  |
| s04-kafka-partitions | 31 | Topic: a named stream of events<br>Split into partitions across brokers<br>One partition: read in the order written<br>Across partitions: no order promised | PartitionGrid: a 'clicks' topic splits into three partition lanes on three broker boxes; events drop into lanes and stay in sequence inside each lane. | Our click events land in a Kafka topic, say one called clicks. A topic is split into partitions, and those partitions are spread across the brokers in the cluster. Inside one partition, a consumer reads events in exactly the order they were written. Across partitions there's no such promise. An event in partition zero and an event in partition two have no defined order relative to each other. |  |
| s05-kafka-keys | 34 | Same key, same partition<br>Key = user_id<br>User 101: view, click, purchase in order | Events colour-coded by user_id route into lanes; all of user 101's events stack in one lane in sequence: page_view, click, purchase. | So how do you get the order you actually need? With the key. Events with the same key go to the same partition. If we key by user_id, every event from user 101 lands in the same partition, and a consumer reads page view, then click, then purchase, in the order they were written. Different users can sit on different partitions, and that's fine, because 'what did this user do next' is a per-user question. |  |
| s06-consumer-groups | 30 | Consumer group: consumers sharing a topic<br>Each partition: one consumer in the group<br>Position: one offset per partition | Three consumer boxes in one group each attach to one partition lane; an offset pointer ticks forward on each lane. | Now reading. Consumers subscribe as a consumer group. Within the group, each partition is consumed by exactly one consumer. That's how Kafka splits the work, and it's why per-partition order survives: one partition, one reader in the group. The group's position is small: one offset per partition, which marks how far it has read. Remember that offset. It's what makes replay possible in chapter four. |  |
| s07-kafka-interview | 19 | Q: How do you keep a user's events in order?<br>A: key by user_id<br>Order is per partition, not per topic | Comparison: left 'whole topic ordered' with a red cross, right 'ordered per partition, keyed by user_id' with a tick. | Interview version. 'How do you guarantee a user's events are processed in order?' Key the events by user_id. Same key, same partition. Ordering is per partition, not per topic, and one consumer in the group reads each partition. |  |
| s08-kafka-takeaway | 11 | Takeaway: order lives in the partition<br>Pick the key that matches your question | Callout takeaway card. | Takeaway: order lives in the partition, so pick the key that matches the question you need answered in order. |  |

## 2. Batch vs streaming

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s09-batch-hook | 8 | Batch or streaming?<br>First decide which clock you trust. | Hook card with two clocks: 'event_time' and 'ingest_time'. | Batch or streaming? Before you pick, decide which clock your numbers follow. |  |
| s10-batch-vs-stream | 25 | Batch: process what has landed, then stop<br>Streaming: keep processing as events arrive<br>Same events, different trigger | Comparison: left a bucket of rows processed once and closed; right a conveyor of rows processed continuously. | Batch means: take the events that have already landed, say all of yesterday, process them, and finish. Streaming means the job keeps running and processes events as they arrive. Same events, same business logic. The difference is when the work runs, and how much of the data has shown up when it runs. |  |
| s11-event-time-lag | 41 | Event time: the time inside the data<br>Ingest time: when it reached us<br>Event 6: 17 min 40 s between them | DataTable with event_at, arrived_at and lag columns; the lag column fills in row by row and event 6's 0:17:40 is highlighted. | This is where the clocks matter. Spark's docs define event time as the time embedded in the data itself, not the time it arrived. Look at the lag column. Most events arrive a second after they happen. Event 6, a purchase, took seventeen minutes and forty seconds. A batch job that runs after it has landed simply sees it. A streaming job counting purchases per minute has to decide what to do when a 09:04 purchase shows up at 09:21. | 1 |
| s12-replayable | 23 | Spark tracks how far each stream has read<br>Offsets + checkpoints: a replayable source<br>Restart: pick up from the checkpoint | FlowGraph: Kafka offsets feed a checkpoint box; the job box crashes, restarts, and resumes from the checkpoint marker. | A streaming job also has to survive restarts. Spark Structured Streaming tracks how far it has read with source offsets and checkpoints, so after a failure the source can be replayed from where the job was. Hold on to that. It's half of exactly-once in chapter four. |  |
| s13-batch-interview | 28 | Ask first: how fresh must the numbers be?<br>Let the requirement pick the mode<br>Either way: count by event_time | Callout: a question bubble 'freshness?' points to two cards, batch and streaming; both cards share a footer 'GROUP BY event_time'. | In an interview, don't declare a winner. Ask how fresh the numbers need to be, and let that requirement pick the mode. We won't quote cost or latency figures here, because those depend on your system. What doesn't depend on your system: if you bucket by arrival time instead of event time, a late purchase lands in the wrong minute. |  |
| s14-batch-takeaway | 11 | Takeaway: ask how fresh it needs to be<br>Event time picks the bucket | Callout takeaway card. | Takeaway: ask how fresh the numbers need to be, and let that pick the mode. Event time picks the bucket. |  |

## 3. Late data and watermarks

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s15-wm-hook | 10 | Late data isn't automatically dropped.<br>The watermark decides. | Hook card; a late row approaches a dashed watermark line and pauses. | Late data is not automatically dropped. A watermark decides, and it doesn't use the wall clock. |  |
| s16-wm-why | 21 | When is the 09:00 window finished?<br>A straggler could always show up<br>Threshold: how late can data be? | Timeline: a 09:00-09:10 window box stays open while dots keep trickling in from the right. | Say you count purchases per ten-minute window. When is the 09:00 window finished? A straggler could always show up. A job that never ends can't wait forever, so Spark asks you for a threshold: how late can data be and still be counted? |  |
| s17-wm-rule | 30 | watermark = max event time seen - threshold<br>Less late than threshold: guaranteed<br>Later than that: best effort, may drop | Timeline: a 'max event time' marker moves right; a watermark line trails it by the threshold; rows left of the line turn amber, not red. | Here's the rule from the Spark docs. The watermark is the maximum event time the engine has seen, minus your threshold. Data that is less late than the threshold is guaranteed to be processed. Data later than that may be dropped, or may still be counted. Spark only promises best effort there. So never say 'late data is dropped'. Say 'data beyond the watermark isn't guaranteed'. |  |
| s18-wm-walkthrough | 42 | Illustration in SQL, not Spark itself<br>Event 6 arrives: max seen is 09:06:40<br>Only 2 min 40 s behind in event time<br>10 min threshold: guaranteed<br>2 min threshold: best effort | CodePanel with the query; DataTable fills in arrival order; event 6's 'behind' cell pulses, then its t_10min and t_2min cells light up green and amber. | Let's run the rule on our table as plain SQL. This illustrates the arithmetic; it is not Spark's engine. Go through events in arrival order and track the max event time seen so far. When event 6 finally arrives at 09:21:40, the latest event time seen is 09:06:40, from event 8. Event 6 happened at 09:04. So it's only two minutes forty seconds behind in event time. With a ten-minute threshold, it's inside: guaranteed. With a two-minute threshold, it's outside: best effort. | 2 |
| s19-wm-trap | 26 | Lateness is measured in event time<br>Not wall-clock delay<br>Watermark moves only with newer events | Comparison: left '17 min 40 s delay (wall clock)', right '2 min 40 s behind (event time)'; the right one gets the tick. | That's the trap. Event 6 was delayed seventeen minutes on the wall clock, but the watermark is built from event times. Nothing newer than 09:06:40 had arrived, so the watermark was still 09:06:40 minus the threshold. What counts is how far behind the latest event time a row is, not how long it spent in transit. |  |
| s20-wm-takeaway | 9 | Takeaway: watermark = max event time - threshold<br>Inside: guaranteed. Outside: best effort. | Callout takeaway card. | Takeaway: watermark equals max event time minus threshold. Inside it, guaranteed. Outside it, best effort. |  |

## 4. Idempotent pipelines

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s21-idem-hook | 9 | Assume your pipeline runs twice.<br>Make twice look like once. | Hook card; a 'run' button is pressed twice and the output counter stays the same. | Assume your pipeline runs twice. Retries make it likely. Make twice look exactly like once. |  |
| s22-idem-definition | 24 | Idempotent: run twice = run once<br>Retries and replays are normal<br>Event 3 already arrived twice | RowHighlight on the events table: both copies of event 3 glow, with '44 s apart' between them. | Idempotent means running a step twice gives the same result as running it once. You need it because retries are normal: a network blip, a producer resend, a job replayed from its last checkpoint. Our table already shows it. Event 3, the click by user 102, arrived twice, 44 seconds apart. |  |
| s23-idem-producer | 31 | Kafka idempotent producer<br>Producer ID + sequence number<br>Broker spots the resend and dedupes it | FlowGraph: producer sends message seq 7, times out, resends seq 7; the broker box stamps the second copy 'duplicate' and keeps one. | Kafka handles one source of duplicates for you. With the idempotent producer, each producer has an ID and every message it sends carries a sequence number. If it resends after a timeout, the broker recognises the same producer ID and sequence number and dedupes it. But that only covers producer retries into Kafka. Duplicates can still come from elsewhere, so the sink has to defend itself too. |  |
| s24-idem-on-conflict | 46 | DuckDB: PRIMARY KEY (event_id)<br>INSERT ... ON CONFLICT DO NOTHING<br>Load 9 rows, then retry the load<br>Result: 8 rows, one per event | CodePanel with the CREATE TABLE and both INSERTs; a row counter runs 0 -> 8 on the first load and stays at 8 on the retry. | In DuckDB, the cleanest guard is an enforced key. Give the table a primary key on event_id and insert with ON CONFLICT DO NOTHING. In DuckDB, ON CONFLICT needs a primary key or unique constraint to check against. We load all nine raw rows, then run the exact same load again, like a retried job. The duplicate copy of event 3 is skipped the first time, and the whole retry is skipped the second time. Eight rows, eight unique events. Run it a third time and nothing changes. That's idempotent. | 3 |
| s25-exactly-once | 20 | Spark exactly-once: two ingredients<br>1. Replayable source (offsets, checkpoints)<br>2. Idempotent sink<br>Replay safely, write safely | FlowGraph: source box labelled 'replayable' and sink box labelled 'idempotent' light up; a replay arrow loops back without changing the sink's row count. | Spark's docs describe how Structured Streaming can ensure end-to-end exactly-once: replayable sources, tracked with offsets and checkpoints, plus idempotent sinks. The source lets you redo work after a failure. The sink makes redoing it harmless. In Spark, it's those two properties together. |  |
| s26-stream-dedupe | 12 | Inside the stream: dropDuplicates<br>With watermark: key on event_id + event_time | CodePanel shows withWatermark("event_time", ...).dropDuplicates("event_id", "event_time") next to a watermark line. | You can also dedupe inside the stream. With a watermark, Spark dedupes on event_id plus event time, or with dropDuplicatesWithinWatermark on event_id. |  |
| s27-idem-takeaway | 9 | Takeaway: assume every step runs twice<br>Key on event_id. Make the sink idempotent. | Callout takeaway card. | Takeaway: assume every step runs twice. Key on event_id, and make the sink idempotent. |  |

## 5. Medallion architecture

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s28-medallion-hook | 9 | Your dashboard says 4 clicks.<br>There were 3. | Hook card; a dashboard tile shows 4, which flips to 3. | Your dashboard says four clicks. There were three. Here's the layering that fixes it. |  |
| s29-medallion-layers | 20 | Bronze: raw, unvalidated, as it arrived<br>Silver: cleaned, validated, deduplicated<br>Gold: aggregated for dashboards and BI | FlowGraph: three stacked layers, bronze, silver, gold, fill in from left to right. | The medallion architecture, as Databricks describes it, has three layers. Bronze holds raw, unvalidated data, as it arrived. Silver is cleaned, validated and deduplicated. Gold is aggregated, business-level data for analytics and reporting. Our nine-row events table, duplicate and all, is bronze. |  |
| s30-bronze-count | 18 | Count clicks straight from bronze<br>click: 4 (event 3 counted twice) | CodePanel + DataTable; the click count of 4 is circled and both event 3 rows are traced back to it. | Count straight from bronze and you get four clicks. The retry of event 3 is counted twice. That's the four from the hook. | 4 |
| s31-silver | 33 | ROW_NUMBER() per event_id<br>Keep rn = 1: the first arrival<br>9 rows in, 8 rows out | CodePanel; the two event 3 rows get rn 1 and 2; rn 2 fades out and the table shrinks to 8 rows. | Silver removes the duplicate. ROW_NUMBER, partitioned by event_id and ordered by ingest_time, numbers every copy of an event. Keep row number one, the first arrival, and drop the rest. Nine rows in, eight out. Unlike ON CONFLICT, this is just a query, so it needs no constraint, and you can rerun it from bronze whenever your cleaning rules change. | 5 |
| s32-gold | 25 | GROUP BY event_date, event_type<br>click 3, page_view 3, purchase 2<br>Distinct users with COUNT(DISTINCT) | CodePanel; silver rows collapse into three gold rows; the click tile on the dashboard updates to 3. | Gold is what the dashboard reads. Group silver by event date and event type, and count events and distinct users. Three clicks, three page views, two purchases. Now the dashboard says three, because it reads from deduplicated silver, not raw bronze. | 6 |
| s33-keep-bronze | 20 | Why keep bronze?<br>Rules change: rebuild silver from raw | FlowGraph: a 'fix dedupe rule' patch is applied to the silver step; silver and gold rebuild from the untouched bronze layer. | Why keep bronze at all? Because cleaning rules change. If you find a bug in your dedupe, you fix the query and rebuild silver from bronze. If you had cleaned on the way in, the raw events would be gone. |  |
| s34-medallion-takeaway | 6 | Takeaway: bronze keeps, silver fixes,<br>gold answers. | Callout takeaway card. | Takeaway: bronze keeps, silver fixes, gold answers. |  |

## 6. Partition pruning

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s35-prune-hook | 10 | Pruning needs a filter on the partition column.<br>Miss it, and no partition is skipped. | Hook card; a grid of date partitions where only one tile lights up. | Partition pruning only kicks in when your query filters on the partition column. |  |
| s36-prune-what | 20 | Partition silver by event_date<br>Each day stored in its own partition<br>Lake: event_date=2026-10-19/ folders | PartitionGrid: a month of date tiles; rows drop into the tile for their event_date. | Our silver table grows every day, so we partition it by event_date: each day's rows are stored in their own partition. In BigQuery that's a partitioned table. In a data lake it's often Hive-style folders, one per value, like event_date equals 2026-10-19. |  |
| s37-prune-query | 41 | WHERE event_date = DATE '2026-10-19'<br>Filter on partition column: skip the rest<br>BigQuery: fewer bytes processed<br>DuckDB: filter pushed into Hive partitions | CodePanel with the query; on the PartitionGrid every tile except 2026-10-19 greys out; a 'bytes scanned' bar shrinks. | Now a query that filters on the partition column. BigQuery's docs call this pruning: with a qualifying filter on the partitioning column, it scans only the matching partitions and skips the rest, which reduces the bytes processed. DuckDB does the same with Hive-partitioned files: filters on the partition keys are pushed down, so non-matching partitions are skipped. Here we run the query on an in-memory table, so the result is real, but the skipping only happens on partitioned storage. | 7 |
| s38-prune-trap | 23 | Filter only on user_id? No partition skipped<br>The filter must hit the partition column<br>Partition by what you filter by | Comparison: left 'WHERE user_id = 101' lights up every tile; right 'WHERE event_date = ...' lights up one. | The trap: filter only on user_id and there's no qualifying filter on event_date, so every day's partition still has to be read. Partitioning helps the queries that filter on the partition column. So pick that column from how the table is actually queried. For our dashboard, that's the date. |  |
| s39-prune-takeaway | 6 | Takeaway: partition by what you filter by | Callout takeaway card. | Takeaway: partition by what you filter by. |  |

## Recap

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s40-recap | 39 | Kafka: key by user_id, order per partition<br>Clock: count by event_time<br>Watermark: max event time - threshold<br>Idempotent: replayable source + keyed sink<br>Medallion: bronze, silver, gold<br>Pruning: filter on event_date | ListCard: the six chapter cards stack while the click dot from the cold open retraces the full pipeline from Kafka to the dashboard tile. | Let's recap the whole pipeline. Clicks go into Kafka, keyed by user_id, so each user's events stay ordered within a partition. Whether you run batch or streaming, you count by event time. Late events are handled by a watermark: max event time seen minus a threshold, guaranteed inside, best effort outside. Every write is idempotent: a replayable source plus a sink keyed on event_id. Data flows bronze to silver to gold. And silver is partitioned by event_date, so queries filtering on date skip the other days. |  |

## Outro

| scene id | seconds | on-screen title/text | what moves on screen | narration | code |
|---|---|---|---|---|---|
| s41-cta | 12 | More visual explanations: queryunstuck.in<br>Data & AI Engineering, visualized. | EndCard with the website and tagline; watermark queryunstuck. | That's the clickstream pipeline, end to end, on nine rows. If this helped, you'll find more visual explanations like it at queryunstuck.in. |  |

## Code blocks

All blocks run in an in-memory DuckDB via `scripts/run_snippet.py`; each `setup` creates the shared 9-row `events` table (bronze).

### Block 0

Intro: the shared table in arrival order.

```sql
SELECT event_id, user_id, event_type,
       strftime(event_time, '%H:%M:%S')  AS event_at,
       strftime(ingest_time, '%H:%M:%S') AS arrived_at
FROM events
ORDER BY ingest_time;
```

Expected output:

```
event_id | user_id | event_type | event_at | arrived_at
1 | 101 | page_view | 09:00:05 | 09:00:06
2 | 102 | page_view | 09:01:10 | 09:01:11
3 | 102 | click | 09:02:00 | 09:02:01
4 | 101 | click | 09:02:30 | 09:02:31
3 | 102 | click | 09:02:00 | 09:02:45
5 | 103 | page_view | 09:03:15 | 09:03:16
7 | 103 | click | 09:05:20 | 09:05:21
8 | 102 | purchase | 09:06:40 | 09:06:41
6 | 101 | purchase | 09:04:00 | 09:21:40
```

### Block 1

Ch 2: event time vs ingest time lag.

```sql
SELECT event_id, event_type,
       strftime(event_time, '%H:%M:%S')  AS event_at,
       strftime(ingest_time, '%H:%M:%S') AS arrived_at,
       ingest_time - event_time          AS lag
FROM events
ORDER BY ingest_time;
```

Expected output:

```
event_id | event_type | event_at | arrived_at | lag
1 | page_view | 09:00:05 | 09:00:06 | 0:00:01
2 | page_view | 09:01:10 | 09:01:11 | 0:00:01
3 | click | 09:02:00 | 09:02:01 | 0:00:01
4 | click | 09:02:30 | 09:02:31 | 0:00:01
3 | click | 09:02:00 | 09:02:45 | 0:00:45
5 | page_view | 09:03:15 | 09:03:16 | 0:00:01
7 | click | 09:05:20 | 09:05:21 | 0:00:01
8 | purchase | 09:06:40 | 09:06:41 | 0:00:01
6 | purchase | 09:04:00 | 09:21:40 | 0:17:40
```

### Block 2

Ch 3: watermark arithmetic. ILLUSTRATION of the rule (max event time seen - threshold), not Spark engine behaviour (a simplified row-by-row model).

```sql
-- Illustration of the watermark rule, not Spark itself
WITH seen AS (
  SELECT *, MAX(event_time) OVER (ORDER BY ingest_time) AS max_seen
  FROM events
)
SELECT event_id,
       strftime(event_time, '%H:%M:%S') AS event_at,
       strftime(max_seen, '%H:%M:%S')   AS max_seen_at,
       max_seen - event_time            AS behind,
       CASE WHEN max_seen - event_time < INTERVAL 10 MINUTE
            THEN 'guaranteed' ELSE 'best effort' END AS t_10min,
       CASE WHEN max_seen - event_time < INTERVAL 2 MINUTE
            THEN 'guaranteed' ELSE 'best effort' END AS t_2min
FROM seen
ORDER BY ingest_time;
```

Expected output:

```
event_id | event_at | max_seen_at | behind | t_10min | t_2min
1 | 09:00:05 | 09:00:05 | 0:00:00 | guaranteed | guaranteed
2 | 09:01:10 | 09:01:10 | 0:00:00 | guaranteed | guaranteed
3 | 09:02:00 | 09:02:00 | 0:00:00 | guaranteed | guaranteed
4 | 09:02:30 | 09:02:30 | 0:00:00 | guaranteed | guaranteed
3 | 09:02:00 | 09:02:30 | 0:00:30 | guaranteed | guaranteed
5 | 09:03:15 | 09:03:15 | 0:00:00 | guaranteed | guaranteed
7 | 09:05:20 | 09:05:20 | 0:00:00 | guaranteed | guaranteed
8 | 09:06:40 | 09:06:40 | 0:00:00 | guaranteed | guaranteed
6 | 09:04:00 | 09:06:40 | 0:02:40 | guaranteed | best effort
```

### Block 3

Ch 4: idempotent load. CREATE + both INSERT ... ON CONFLICT statements are in `code` (runner executes multi-statement SQL and returns the last SELECT) so the on-screen panel shows them. Both INSERTs use ORDER BY ingest_time so the first arrival of event 3 is the copy kept.

```sql
CREATE TABLE events_clean (
  event_id INTEGER PRIMARY KEY, user_id INTEGER,
  event_type VARCHAR, event_time TIMESTAMP, ingest_time TIMESTAMP
);
-- load once, then retry the exact same load
INSERT INTO events_clean
SELECT * FROM events ORDER BY ingest_time
ON CONFLICT (event_id) DO NOTHING;
INSERT INTO events_clean
SELECT * FROM events ORDER BY ingest_time
ON CONFLICT (event_id) DO NOTHING;
SELECT COUNT(*)                 AS rows_in_table,
       COUNT(DISTINCT event_id) AS unique_events
FROM events_clean;
```

Expected output:

```
rows_in_table | unique_events
8 | 8
```

### Block 4

Ch 5: counting from bronze (shows the double-counted click).

```sql
-- bronze = events exactly as they arrived
SELECT event_type, COUNT(*) AS bronze_rows
FROM events
GROUP BY event_type
ORDER BY event_type;
```

Expected output:

```
event_type | bronze_rows
click | 4
page_view | 3
purchase | 2
```

### Block 5

Ch 5: silver dedupe with ROW_NUMBER().

```sql
SELECT event_id, user_id, event_type,
       strftime(event_time, '%H:%M:%S') AS event_at
FROM (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY event_id ORDER BY ingest_time
         ) AS rn
  FROM events
)
WHERE rn = 1
ORDER BY event_id;
```

Expected output:

```
event_id | user_id | event_type | event_at
1 | 101 | page_view | 09:00:05
2 | 102 | page_view | 09:01:10
3 | 102 | click | 09:02:00
4 | 101 | click | 09:02:30
5 | 103 | page_view | 09:03:15
6 | 101 | purchase | 09:04:00
7 | 103 | click | 09:05:20
8 | 102 | purchase | 09:06:40
```

### Block 6

Ch 5: gold aggregate from silver (setup builds silver_events with event_date).

```sql
SELECT event_date, event_type,
       COUNT(*)                AS events,
       COUNT(DISTINCT user_id) AS users
FROM silver_events
GROUP BY event_date, event_type
ORDER BY event_date, event_type;
```

Expected output:

```
event_date | event_type | events | users
2026-10-19 | click | 3 | 3
2026-10-19 | page_view | 3 | 3
2026-10-19 | purchase | 2 | 2
```

### Block 7

Ch 6: needs_manual_check. Query shape only: the in-memory table is not partitioned, so pruning itself is not demonstrated; it applies to BigQuery partitioned tables / Hive-partitioned files per the sourced docs. No COPY/PARTITION_BY to avoid writing files.

```sql
-- Conceptual: in BigQuery or Hive-partitioned files, partitioned
-- by event_date, this filter lets the engine skip other days.
SELECT user_id, COUNT(*) AS purchases
FROM silver_events
WHERE event_date = DATE '2026-10-19'   -- partition column
  AND event_type = 'purchase'
GROUP BY user_id
ORDER BY user_id;
```

Expected output:

```
user_id | purchases
101 | 1
102 | 1
```

## Source mapping
- Kafka partitions, keys, per-partition order: kafka.apache.org/43 introduction.
- Consumer groups (one consumer per partition), offsets, idempotent producer (producer ID + sequence number): kafka.apache.org/43 design.
- Event time definition; exactly-once = replayable sources (offsets, checkpoints) + idempotent sinks: Spark Structured Streaming getting started.
- Watermark rule, strict inside / best effort outside, dropDuplicates with watermark: Spark APIs on DataFrames and Datasets.
- Bronze / silver / gold definitions: Databricks medallion docs.
- Partition pruning: BigQuery partitioned tables; DuckDB Hive partitioning filter pushdown.
- ON CONFLICT requires PRIMARY KEY / UNIQUE: DuckDB INSERT docs.
- Design reasoning (not sourced claims, phrased as advice): ask for freshness requirements; keep bronze so silver can be rebuilt; choose partition column from query patterns.
- Deliberately omitted: throughput/latency/cost numbers, company usage, Iceberg hidden partitioning, Flink, Kafka transactions, micro-batch vs continuous modes.

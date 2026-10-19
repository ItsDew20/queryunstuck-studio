# qu-002 Research: How a Spark shuffle works

Docs: Apache Spark 4.2.0 (RDD guide, SQL performance tuning), accessed 2026-10-17. Defaults are as stated there; may differ by version.

## Definition
A shuffle is Spark's mechanism for re-distributing data so it is grouped differently across partitions. It typically copies data across executors and machines, so it is complex and costly.

## How it works (animation beats)
1. Narrow dependency: each output partition depends on one input partition (e.g. filter, map). No data movement, stays in one stage.
2. Wide dependency: an output partition needs data from many input partitions (groupBy, join, repartition). Spark cuts the job into stages at this boundary.
3. Map side: map tasks organize data. Records are kept in memory until they can't fit, then sorted by target partition and written to a single file (per the RDD guide's description).
4. Partitioning: conceptually, each row's target is hash(key) mod numPartitions, so equal keys land in the same reduce partition. (Conceptual; do not show real hash values.)
5. Reduce side: the next stage's tasks read (fetch) their relevant blocks from every map output, over the network.
6. Stage 2 runs on the grouped data (aggregate, join).

## Why expensive
Docs: "involves disk I/O, data serialization, and network I/O." In-memory structures can spill to disk (more I/O, GC). Shuffle files persist on disk (spark.local.dir).

## What triggers it
repartition/coalesce (coalesce per RDD guide list), ByKey operations (groupByKey, reduceByKey, except counting), joins (join, cogroup). In SQL: GROUP BY aggregations, non-broadcast joins, DISTINCT, ORDER BY (global sort needs range partitioning). The SQL ones (DISTINCT, ORDER BY) are not on the fetched pages: UNVERIFIED as a cited claim; check Spark SQL docs/explain output before scripting.

## Mitigations
- Broadcast join: BROADCAST hint (`SELECT /*+ BROADCAST(r) ...`) ; spark.sql.autoBroadcastJoinThreshold default 10485760 (10 MB), -1 disables.
- Filter/project early: advice, UNVERIFIED in docs.
- reduceByKey over groupByKey: combines on map side (docs say reduceByKey creates structures map-side).
- spark.sql.shuffle.partitions: default 200.
- AQE: spark.sql.adaptive.enabled default true. Coalescing post-shuffle partitions (coalescePartitions.enabled default true, advisoryPartitionSizeInBytes 64 MB). Skew join (skewJoin.enabled default true): splits and replicates skewed partitions in sort-merge join. Can convert sort-merge to broadcast join at runtime when a side's runtime stats are small.

## Worked example
orders(order_id, customer_id, amount), 9 rows, 3 input partitions, 3 output partitions.
P0: (1,A,10) (2,B,20) (3,C,5)
P1: (4,A,7) (5,C,12) (6,B,3)
P2: (7,B,9) (8,A,4) (9,C,6)
Query: SELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id.
Each map task partially aggregates, then writes rows by target partition. Illustrative assignment: A->R0, B->R1, C->R2. Reduce results: A=21, B=32, C=23. Actual partitions depend on hash; say "illustrative".

## Hook check: "Your JOIN isn't slow. Your shuffle is."
Defensible for sort-merge/shuffle-hash joins, where both sides are shuffled by join key. Caveats: broadcast join avoids shuffling the large side (the small side is sent to all nodes); join cost can also come from skew, spills, or bad file layout. Scope to "a shuffle join"; rhetoric, not a measurement.

## Misconceptions
- "Shuffle = bad, avoid always": it's required for correctness in wide operations; reduce its size.
- "coalesce never shuffles": RDD guide lists it as shuffle-capable; avoid claiming more.

## Interview angle
Stage boundaries, groupByKey vs reduceByKey, fixing skew, shuffle.partitions.

## Do NOT claim
Exact hash values, shuffle byte/time numbers, file layout across versions, other-version defaults, AQE on everywhere.

## Runnable vs manual
Runnable in DuckDB: the GROUP BY SUM query on the 9-row table (results A=21, B=32, C=23). Manual check needed: PySpark (spark.table(...).join(broadcast(...))), BROADCAST hint SQL, config settings, explain() output showing Exchange.

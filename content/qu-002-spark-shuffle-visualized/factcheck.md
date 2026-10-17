# qu-002 Fact-check: How a Spark Shuffle Works, Visualized (pass 2, after loop 1)

Checked 2026-10-17 against Spark 4.2.0 docs and Spark v4.2.0 source code (all listed in `sources[]`).
I re-read the on-screen text, beats (spec.json) and narration (script.md). Source keys:
- **RDD** = rdd-programming-guide.html#shuffle-operations
- **TUNE** = sql-performance-tuning.html
- **PART** = core/.../Partitioner.scala (HashPartitioner)
- **PHYS** = sql/catalyst/.../physical/partitioning.scala (HashPartitioning)
- **JOINS** = sql/catalyst/.../optimizer/joins.scala (canBroadcastBySize)
- **SBFI** = core/.../storage/ShuffleBlockFetcherIterator.scala

## Loop 1 fixes

| # | Pass 1 issue | New text | Verdict |
|---|---|---|---|
| 1 | s1 hook "Often, it's the shuffle." had no source for how often; `spec.hook` did not match s1 | "Slow JOIN or GROUP BY? / Check the shuffle." (spec.hook matches) | PASS. This is advice, not a claim about how often. TUNE: shuffles happen "for joins or aggregations". |
| 2 | s2 "Rows get copied between executors" had no qualifier | "Usually copied across executors and machines" | PASS. RDD: "This typically involves copying data across executors and machines". "Usually" means the same as "typically", and the rest is almost word for word. |
| 3 | s5 "Each task reads from every map file" | "Each task pulls its blocks from the map outputs" | PASS. RDD: "tasks read the relevant sorted blocks". |
| 4 | s5 "Over the network" | "Often over the network" | PASS. RDD lists network I/O as a cost. SBFI reads local blocks without a remote fetch, so "often" is correct. |
| 5 | s8 "auto < 10 MB" | "auto ≤ 10 MB by default". The beat adds "by estimated size". The narration says "By default, up to 10 megabytes is automatic". | PASS. TUNE: maximum size, default 10485760 (10 MB). JOINS: `sizeInBytes <= threshold` on plan stats. |
| 6 | s9 "regrouped by key, across machines" | "Shuffle = rows regrouped across partitions / usually across machines" | PASS. RDD definition plus "typically". It now agrees with s2. |
| 7 | script.md out of sync | Narration and claim notes are updated | PASS. The narration matches the on-screen text in every scene. |

## Claims (full pass)

| Scene | Claim (on screen / narration) | Verdict | Source | Fix |
|---|---|---|---|---|
| s1 | "Slow JOIN or GROUP BY? / Check the shuffle." | PASS | TUNE (`spark.sql.shuffle.partitions`: shuffling "for joins or aggregations"); RDD ("complex and costly") | none |
| s2 | "Shuffle = regroup data across partitions" | PASS | RDD: "re-distributing data so that it's grouped differently across partitions" | none |
| s2 | "Usually copied across executors and machines" | PASS | RDD: "typically involves copying data across executors and machines" | none |
| s3 | "9 orders, 3 partitions / GROUP BY customer_id / All A rows must meet" | PASS | RDD (values for a key "must be co-located"). The setup data has A, B and C in every partition of 3 rows. | none |
| s4 | "Map side: route rows by key" | PASS | RDD (map tasks organise data); PHYS (equal keys go to the same partition) | none |
| s4 | "target = hash(key) mod N" | PASS (simplified) | PART: `nonNegativeMod(key.hashCode, N)`; PHYS: `Pmod(Murmur3Hash(keys), N)` | none |
| s4 | "Illustrative: A→R0, B→R1, C→R2" | PASS | Labelled illustrative | none |
| s4 beat/narration | sort by target, write one file | PASS | RDD: "sorted based on the target partition and written to a single file" | none |
| s5 | "Reduce side: fetch your blocks" | PASS | RDD | none |
| s5 | "Each task pulls its blocks from the map outputs" | PASS | RDD ("relevant sorted blocks") | none |
| s5 | "Often over the network" | PASS | RDD (network I/O); SBFI (local blocks read locally) | none |
| s5 beat | R0 pulls A rows from P0, P1, P2 | PASS | This matches the example data: A is in all 3 input partitions. | none |
| s6 | "Now each key is in one place" | PASS | PHYS / RDD | none |
| s6 | "A = 21 · B = 32 · C = 23" | PASS | DuckDB run below | none |
| s7 | "disk I/O + serialization + network I/O" | PASS | RDD: "involves disk I/O, data serialization, and network I/O" | none |
| s7 | "Spills add more disk and GC" | PASS | RDD: spill incurs "additional overhead of disk I/O and increased garbage collection" | none |
| s8 | "Small side? Broadcast it (auto ≤ 10 MB by default)" | PASS | TUNE (`autoBroadcastJoinThreshold` 10485760 (10 MB), maximum size, broadcast to all worker nodes); JOINS (inclusive, uses stats) | none |
| s8 | "AQE merges small shuffle partitions" | PASS | TUNE: AQE on by default since 3.2.0; `coalescePartitions.enabled` true, "to avoid too many small tasks" | none |
| s8 | "AQE splits skewed join partitions" | PASS | TUNE: `skewJoin.enabled` true; splits skewed partitions in sort-merge join | Optional: "sort-merge" for precision |
| s9 | "Shuffle = rows regrouped across partitions / usually across machines" | PASS | RDD | none |
| s9 | "Save this for your next interview" | n/a (CTA) | none | none |

I found no new unsupported claims in the beats, the narration or the script.md claim notes.

## Code results

`.venv/bin/python scripts/run_snippet.py content/qu-002-spark-shuffle-visualized --write`

```
[0] sql: OK; matches expected: True
customer_id | total
A | 21
B | 32
C | 23
```

| Block | Lang / dialect | Result | verified |
|---|---|---|---|
| 0 | sql / duckdb | Output matches expected_output exactly | true |

Is DuckDB a fair proxy? Yes for the result: the GROUP BY / SUM / ORDER BY query is portable, and
Spark SQL returns the same rows. DuckDB does not reproduce the shuffle, so I checked the map/reduce
animation against the docs and source code instead. No `needs_manual_check` is needed.

## Required fixes

None.

VERDICT: PASS

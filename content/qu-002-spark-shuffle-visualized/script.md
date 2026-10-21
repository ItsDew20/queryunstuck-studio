# qu-002 Script: How a Spark Shuffle Works, Visualized

Format: reel-animated, 1080x1920, 42 s total. Watermark `queryunstuck`.
Hook: **"Slow JOIN or GROUP BY? Check the shuffle."** This keeps the hook honest: it points at
what to check without claiming how often the shuffle is the cause (broadcast joins skip
shuffling the large side).

| Scene | Sec | On-screen text (lines) | What moves on screen | Narration (optional) |
|---|---|---|---|---|
| s1-hook | 3 | Slow JOIN or GROUP BY? / Check the shuffle. | Grid of rows in 3 partitions starts to shake, a few rows jump between columns. | Slow join or group by? Check the shuffle. |
| s2-define | 5 | Shuffle = regroup data across partitions / Usually copied across executors and machines | Partitions sit inside 2 machine boxes; some rows lift and cross the gap. | A shuffle regroups data across partitions, usually copying rows across executors and machines. |
| s3-setup | 5 | 9 orders, 3 partitions / GROUP BY customer_id / All A rows must meet | P0, P1, P2 hold the 9 orders; A, B, C rows sit in every partition. SQL panel (code_blocks[0]) slides in at the bottom. | Nine orders, three partitions. To group by customer, every A row has to end up in one place. |
| s4-map | 6 | Map side: route rows by key / target = hash(key) mod N / Illustrative: A→R0, B→R1, C→R2 | Each map task tags its rows with a target colour, sorts them by target and stacks them into one file block. Label: "illustrative". | Map tasks send each row by key: hash of the key, mod the partition count. Rows get sorted by target and written to one file. |
| s5-reduce | 6 | Reduce side: fetch your blocks / Each task pulls its blocks from the map outputs / Often over the network | R0 pulls the A rows from P0, P1, P2; R1 pulls B; R2 pulls C. Arrows fan in across machine boxes. | Each reduce task pulls its blocks from the map outputs, often over the network. |
| s6-result | 4 | Now each key is in one place / A = 21 · B = 32 · C = 23 | Rows in each reduce partition collapse into one sum; result table matches the SQL panel. | Now each key is in one place, and the sums are easy. |
| s7-cost | 5 | Why it's expensive: / disk I/O + serialization + network I/O / Spills add more disk and GC | Three cost badges light up on the s5 arrows; a spill icon drops a block to disk. | That's why it's expensive: disk, serialization, network. Spills add more disk and GC. |
| s8-fix | 5 | Small side? Broadcast it (auto ≤ 10 MB by default) / AQE merges small shuffle partitions / AQE splits skewed join partitions | Small table (by estimated size) copies to every executor while the big side stays put; tiny partitions merge; one fat partition splits in two. | Small table? Broadcast it. By default, up to 10 megabytes is automatic. And adaptive query execution merges tiny partitions and splits skewed ones. |
| s9-end | 3 | Shuffle = rows regrouped across partitions / usually across machines / Save this for your next interview | End card, takeaway line, save CTA. | Shuffle: rows regrouped across partitions, usually across machines. Save this for your next interview. |

## Code panel (code_blocks[0], DuckDB-verifiable)

```sql
SELECT customer_id, SUM(amount) AS total
FROM orders
GROUP BY customer_id
ORDER BY customer_id;
```

Expected: A 21, B 32, C 23.

## Claim notes (all in sources[], Spark 4.2.0 docs)
- Definition, map/reduce behaviour, sort by target partition + single file, cost (disk I/O,
  serialization, network I/O, spills/GC): RDD programming guide, shuffle operations.
- Joins and aggregations shuffle (spark.sql.shuffle.partitions): SQL performance tuning.
- Broadcast threshold 10 MB default (inclusive, by estimated size); AQE coalesce and skew-join split (sort-merge join), on by
  default in 4.2.0: SQL performance tuning. Defaults can differ by version.
- hash(key) mod N and the A→R0, B→R1, C→R2 assignment are illustrative only, not real hash values.
- Left out on purpose (UNVERIFIED): DISTINCT/ORDER BY shuffles, coalesce behaviour, map-side
  partial aggregation in Spark SQL, narrow/wide stage-boundary framing.

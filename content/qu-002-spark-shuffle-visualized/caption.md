Slow JOIN or GROUP BY? Check the shuffle.

A shuffle regroups data across partitions. It usually means copying rows across executors and machines.

Example: 9 orders in 3 partitions, then GROUP BY customer_id. Rows for customer A sit in every partition, and all A rows must meet in one place.

Map side: route rows by key
Each map task tags every row with a target partition, roughly hash(key) mod N (simplified, an illustration). Rows are sorted by target partition and written to a single file.

Reduce side: fetch your blocks
Each reduce task pulls its blocks from the map outputs, often over the network. Now each key is in one place, so the sums are easy: A = 21, B = 32, C = 23.

Why it's expensive
Disk I/O + serialization + network I/O. Spills add more disk I/O and GC.

3 ways to reduce the cost
1. Small side of a join? Broadcast it. Spark does this automatically up to 10 MB by default (by estimated size).
2. AQE merges small shuffle partitions.
3. AQE splits skewed join partitions.

Defaults can differ by Spark version. Details here are from the Spark 4.2.0 docs.

Save this for your next interview

#spark #apachespark #dataengineering #bigdata #queryunstuck

# YouTube Short copy: qu-002

## title_options
1. Spark Shuffle Explained Visually #shorts
2. Spark Shuffle: Slow JOIN or GROUP BY? Check This
3. Spark Shuffle Visualized: Map Side to Reduce Side

## description
Spark shuffle explained: how rows are regrouped across partitions for a JOIN or GROUP BY, and why it is costly. #shorts
Map side, reduce side, and 3 ways to cut the cost: broadcast the small side, AQE partition merging, AQE skew splitting.

A shuffle regroups data across partitions, usually copying rows across executors and machines. Map tasks route rows by key (hash(key) mod N is a simplified illustration), and reduce tasks pull their blocks from the map outputs, often over the network. It is expensive because of disk I/O, serialization and network I/O. Defaults can differ by Spark version; details here are from the Spark 4.2.0 docs.

More data engineering visuals: https://queryunstuck.in

Sources
- https://spark.apache.org/docs/latest/rdd-programming-guide.html#shuffle-operations
- https://spark.apache.org/docs/latest/sql-performance-tuning.html
- https://github.com/apache/spark/blob/v4.2.0/core/src/main/scala/org/apache/spark/Partitioner.scala
- https://github.com/apache/spark/blob/v4.2.0/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/plans/physical/partitioning.scala
- https://github.com/apache/spark/blob/v4.2.0/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/optimizer/joins.scala
- https://github.com/apache/spark/blob/v4.2.0/core/src/main/scala/org/apache/spark/storage/ShuffleBlockFetcherIterator.scala

## tags
spark shuffle, apache spark, spark shuffle explained, spark join performance, spark groupBy, spark AQE, broadcast join, data engineering, data engineering interview, spark interview questions, big data, queryunstuck

## category
Education

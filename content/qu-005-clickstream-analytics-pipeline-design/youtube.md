# YouTube longform copy: qu-005

## title_options
1. Clickstream Pipeline Design: 6 Steps from Click to Dashboard
2. Clickstream Analytics Pipeline, Explained End to End (Kafka, Watermarks)
3. Kafka to Gold Table: Design a Clickstream Pipeline Step by Step

## description
Clickstream analytics pipeline design, end to end: follow one click from Kafka to a gold table in six steps.
We use one small events table (9 rows, 8 real events) and fix one problem per chapter: ordering, event time, late data, duplicates, layers and partition pruning. Useful prep for data engineering and system design interviews.

Chapters
0:00 Intro: what is clickstream data?
1:38 Kafka topics, partitions, consumer groups
3:56 Batch vs streaming
6:12 Late data and watermarks
8:30 Idempotent pipelines
11:01 Medallion architecture
13:12 Partition pruning
14:52 Recap

What you will learn
- In Kafka, ordering is per partition, and events with the same key go to the same partition.
- Within a consumer group, each partition is consumed by exactly one consumer.
- Event time is the time embedded in the data, so count by event time.
- In Spark Structured Streaming, a watermark is the max event time seen minus a threshold. Data inside the threshold is guaranteed to be aggregated; later data may or may not be.
- Idempotent writes: Kafka's idempotent producer, an enforced key plus ON CONFLICT in DuckDB, and Spark exactly-once from a replayable source plus an idempotent sink.
- Medallion architecture as described by Databricks: bronze, silver, gold.
- Partition pruning only kicks in when your query filters on the partition column.

Website: https://queryunstuck.in

Sources
- https://kafka.apache.org/43/getting-started/introduction/
- https://kafka.apache.org/43/design/design/
- https://spark.apache.org/docs/latest/streaming/getting-started.html
- https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html
- https://docs.databricks.com/aws/en/lakehouse/medallion
- https://docs.cloud.google.com/bigquery/docs/partitioned-tables
- https://duckdb.org/docs/current/data/partitioning/hive_partitioning.html
- https://duckdb.org/docs/current/sql/statements/insert.html

All sample data is generic and made up. SQL examples run in DuckDB.

## tags
clickstream pipeline, clickstream analytics, data pipeline design, data engineering system design, Kafka partitions, Kafka consumer groups, Spark Structured Streaming, watermarks, idempotent pipeline, medallion architecture, partition pruning, data engineering interview, data engineering, queryunstuck

## category
Education

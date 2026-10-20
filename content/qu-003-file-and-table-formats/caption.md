Parquet is a file format. Iceberg is not. 10 formats, 25 seconds.

10 must-know file and table formats, CSV to Iceberg:

Row-based files
1. CSV: plain-text rows, comma-separated
2. JSON: text format for structured data
3. JSON Lines: one JSON value per line
4. Avro: binary rows, schema embedded (Avro files embed their schema)

Columnar + in-memory
5. Parquet: column-oriented file, built-in compression
6. ORC: columnar file, created for Hive
7. Arrow: columnar in memory, built for compute

Table formats: metadata over data files
8. Delta Lake: ACID transaction log
9. Iceberg: snapshots, schema evolution, time travel
10. Hudi: upserts, deletes, incremental processing

The difference that gets asked in interviews:
- File format: how bytes sit in a file.
- Table format: which files form the table. It is metadata over data files such as Parquet.

Files store data. Tables track files.

Save this for your next interview

#dataengineering #parquet #apacheiceberg #datalake #queryunstuck

# qu-001 Fact-check: SQL Query Execution Order, Visualized

Pass 2 (after loop 1 fixes), 2026-10-17, fact-checker. Re-read spec.json and script.md in full; only s1 line 2, s2 line 2 and the s2 beat changed. Sources unchanged. Sources opened: Microsoft T-SQL SELECT (logical processing order section, doc updated 2026-09-29), PostgreSQL SELECT (current), Snowflake WHERE.

## Claims

| scene | on-screen claim | verdict | source | fix |
|---|---|---|---|---|
| s1 | "You write SELECT first." | PASS | T-SQL syntax; PG synopsis (SELECT clause is written first) | none |
| s1 | "SQL logically processes it after HAVING." | PASS | T-SQL logical processing order (SELECT step after HAVING; physical "might vary"); PG steps 4-5. Now matches `hook` and narration. | none |
| s2 | "FROM/JOIN → WHERE → GROUP BY → HAVING" | PASS | T-SQL steps 1-7 (FROM, ON, JOIN, WHERE, GROUP BY, CUBE/ROLLUP, HAVING); PG steps 2-4 | none (ON folded into FROM/JOIN is acceptable) |
| s2 | "SELECT → DISTINCT → ORDER BY → LIMIT/TOP" | PASS | T-SQL steps 9-12 (SELECT, DISTINCT, ORDER BY, TOP); PG steps 5, 6, 8, 9 (LIMIT). Covers both engine families. | none |
| s2 | "Logical order. The optimizer may reorder physically." | PASS | T-SQL: "The query processor determines the actual physical execution ... the order might vary from this list"; Snowflake: "the optimizer can reorder predicates if it does not impact the results" | none |
| s3 | "1. FROM + JOIN builds the rows" / "7 orders matched to 3 customers" | PASS | PG step 2; DuckDB run: join = 7 rows, 3 distinct customers | none |
| s4 | "2. WHERE drops rows" / "amount >= 20: the 10 and 15 go" | PASS | PG step 3; DuckDB run: dropped (106,10), (107,15); 5 rows remain | none |
| s5 | "3. GROUP BY collapses rows" / "Asha 120 · Ben 50 · Chen 90" | PASS | PG step 4; DuckDB run: Asha 120, Ben 50, Chen 90 | none |
| s6 | "4. HAVING drops whole groups" / "SUM > 50: Ben (50) is out" | PASS | PG step 4 ("eliminates groups"); DuckDB run: Asha 120, Chen 90 remain (50 > 50 is false) | none |
| s7 | "5. SELECT computes and names: total" | PASS | PG step 5; T-SQL step 9 | none |
| s7 | "6. ORDER BY total DESC" / "ORDER BY can use the alias" | PASS | T-SQL: aliases "can be referenced by subsequent clauses such as the ORDER BY clause"; PG: output column name usable in ORDER BY; DuckDB run confirms. Note: in PostgreSQL the alias must stand alone (not inside an expression); the reel only uses the bare alias, so the claim holds. | none (do not extend to `ORDER BY total + 1` in any future cut) |
| s8 | "7. LIMIT 1 keeps the top row" / "Result: Asha \| 120" | PASS (data); syntax note | PG step 9; DuckDB run: final row Asha 120. No tie on totals, so LIMIT 1 is deterministic. | none (s2 now says LIMIT/TOP; s8 describes this query's own LIMIT 1) |
| s9 | "Rows, then groups, then SELECT, then sort." | PASS | Summary of T-SQL / PG logical order; framed as logical by s2 | none |
| s9 | "Save this for your next interview" | n/a (CTA) | - | none |

Advisory from pass 1 resolved: s2 beat now greys out DISTINCT, so the 1-7 walkthrough numbering is consistent. Visual director must keep it greyed in s7-s8 too.

Narration check (not on-screen, but spoken): s1 narration already says "Logically"; s7 narration "Only then can ORDER BY sort by that alias" is acceptable for the logical model, though PostgreSQL also allows output names in GROUP BY and DuckDB allows them in WHERE/HAVING; no "only ORDER BY" claim appears on screen.

## Code results

Runner: `.venv/bin/python scripts/run_snippet.py content/qu-001-sql-execution-order --write`

```
[0] sql: OK; matches expected: True
name | total
Asha | 120
```

Independent DuckDB 1.5.6 checks on the setup data:

| on-screen number | query result | match |
|---|---|---|
| 7 orders matched to 3 customers | count(*) = 7, count(distinct customer_id) = 3 | yes |
| amount >= 20: the 10 and 15 go | rows failing: (106,10), (107,15); 5 kept | yes |
| Asha 120 · Ben 50 · Chen 90 | (Asha,120), (Ben,50), (Chen,90) | yes |
| SUM > 50: Ben (50) is out | after HAVING: (Asha,120), (Chen,90) | yes |
| Result: Asha \| 120 | (Asha,120) | yes |

code_blocks[0]: `verified: true`.

Dialect note: everything in the query except `LIMIT 1` is standard SQL (JOIN ... ON, WHERE, GROUP BY, HAVING, alias in ORDER BY). `LIMIT` is non-standard (PG docs) but runs in PostgreSQL, MySQL, SQLite, DuckDB, Snowflake, BigQuery; it does not run in SQL Server (needs `TOP 1` or `OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY`). The query does not depend on DuckDB-specific leniency (DuckDB accepts SELECT aliases in WHERE, which PG and T-SQL reject; this query does not use that), so DuckDB is a fair proxy for the result. Optional: `FETCH FIRST 1 ROW ONLY` is SQL:2008 and also passes in DuckDB, if a fully standard panel is wanted.

## Loop 1 fixes

| fix | requested | found in spec.json | found in script.md | status |
|---|---|---|---|---|
| s1 on-screen line 2 | "SQL logically processes it after HAVING." | yes | yes | resolved |
| s2 on-screen line 2 | "SELECT → DISTINCT → ORDER BY → LIMIT/TOP" | yes (40 chars) | yes | resolved |
| s2 beat (advisory) | grey out DISTINCT | yes | yes | resolved |

No new claims introduced. Remaining issues: none.

Housekeeping note (not a fact issue): the scriptwriter's loop-1 history entry is timestamped 15:00, earlier than the pass-1 fact-checker entry at 16:00, so history[] is not chronological. Left as-is (owned by the scriptwriter); the orchestrator may want to correct it.

VERDICT: PASS

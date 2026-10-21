# qu-001 Research: SQL logical processing order

## Definition
A SELECT is written in one order but *logically* processed in another. The logical order defines which clauses can "see" which names. It is a conceptual model, not the physical plan.

## Logical order (T-SQL docs, 12 steps; collapsed for the reel)
FROM -> ON -> JOIN -> WHERE -> GROUP BY -> (WITH CUBE/ROLLUP) -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> TOP.
PostgreSQL describes the same shape: FROM, WHERE, GROUP BY/HAVING, SELECT-list output rows, DISTINCT, UNION/INTERSECT/EXCEPT, ORDER BY, LIMIT/OFFSET. Reel version: FROM+JOIN, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT.

## Step by step (animation beats)
1. FROM/JOIN: build the working row set (all source rows, joined).
2. WHERE: drop individual rows. No aggregates allowed here.
3. GROUP BY: collapse surviving rows into groups.
4. HAVING: drop whole groups (can use aggregates).
5. SELECT: compute output expressions and aliases.
6. DISTINCT: remove duplicate output rows.
7. ORDER BY: sort the result (can use SELECT aliases).
8. LIMIT/TOP: keep first N rows.

Window functions: logically run after WHERE, GROUP BY and HAVING and after normal aggregates, so they are allowed only in the SELECT list and ORDER BY (PostgreSQL tutorial). Place them with step 5. QUALIFY (where supported) filters on window results, after HAVING and before/around SELECT output.

## Worked example (verified in DuckDB 1.5.6)
customers(customer_id,name,country): (1,Asha,IN) (2,Ben,US) (3,Chen,US)
orders(order_id,customer_id,amount): (101,1,50) (102,1,70) (103,2,20) (104,2,30) (105,3,90) (106,3,10) (107,2,15)
```sql
SELECT c.name, SUM(o.amount) AS total
FROM orders o JOIN customers c ON o.customer_id = c.customer_id
WHERE o.amount >= 20
GROUP BY c.name
HAVING SUM(o.amount) > 50
ORDER BY total DESC
LIMIT 2;
```
Trace: FROM/JOIN 7 rows; WHERE drops 106 (10) and 107 (15) -> 5 rows; GROUP BY -> Asha 120, Ben 50, Chen 90; HAVING >50 drops Ben; SELECT names total; ORDER BY total DESC; LIMIT 2 -> Asha 120, Chen 90 (LIMIT keeps both, so make the cut visible or use LIMIT 1).
Note: without WHERE, Ben = 65 would survive HAVING; shows WHERE runs before grouping.

## Alias rules (varies by engine, do NOT generalise)
- T-SQL: SELECT is step 9, so aliases can't be used in earlier clauses but can in ORDER BY.
- PostgreSQL: output names usable in ORDER BY and GROUP BY, not WHERE or HAVING. In a name clash, ORDER BY prefers the output column, GROUP BY the input column.
- DuckDB: supports reusable/lateral aliases, including in WHERE, GROUP BY, HAVING (not in JOIN ON). Verified: `SELECT amount*2 AS dbl ... WHERE dbl > 50` runs in DuckDB 1.5.6. So the "can't use alias in WHERE" hook FAILS in DuckDB; the fact-checker must demo the error with an engine-neutral framing or show it as "standard / Postgres / SQL Server".
- Snowflake, BigQuery: UNVERIFIED (docs not retrieved).

## Misconceptions
- "Written order = run order." No.
- "Logical order = physical order." No: the optimizer may reorder (Snowflake docs: optimizer can reorder predicates if results are unchanged; T-SQL docs: physical order "might vary").
- "WHERE and HAVING are the same." WHERE filters rows pre-group; HAVING filters groups.

## Interview angle
"Why can't I use an alias in WHERE?" "WHERE vs HAVING?" "Where do window functions run?" "Does the engine really run in this order?" (answer: logical model; results must match it).

## Do NOT claim
- Alias rules apply to all engines.
- Physical execution follows this order.
- Behaviour of LIMIT without ORDER BY (row order not guaranteed; UNVERIFIED for specific engines).

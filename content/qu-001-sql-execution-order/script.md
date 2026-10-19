# qu-001 Script: SQL Query Execution Order, Visualized (reel-animated)

**Hook:** You write SELECT first. SQL logically processes it after HAVING.
**Total:** 38.5 s, 9 scenes. Code panel (code_blocks[0]) stays on screen bottom; the active clause is highlighted per scene.

Framing rules: this is the **logical** processing order (T-SQL / PostgreSQL docs). The optimizer may run things differently physically (T-SQL "might vary", Snowflake WHERE note). No universal alias-in-WHERE claim.

| scene id | seconds | on-screen title/text | what moves on screen | optional narration |
|---|---|---|---|---|
| s1-hook | 3 | You write SELECT first. / SQL logically processes it after HAVING. | Query in code panel; SELECT line glows, then drops below the HAVING line. | You write SELECT first. Logically, SQL processes it after HAVING. |
| s2-order | 5 | FROM/JOIN → WHERE → GROUP BY → HAVING / SELECT → DISTINCT → ORDER BY → LIMIT/TOP / Logical order. The optimizer may reorder physically. | Timeline of 8 logical steps builds left to right; DISTINCT greyed out (not in this query); caveat line fades in. | This is the logical processing order. The optimizer can run things differently, but results must match this model. |
| s3-from-join | 4.5 | 1. FROM + JOIN builds the rows / 7 orders matched to 3 customers | FROM/JOIN highlighted. Join matcher links each order to its customer; 7-row working table appears. | Step one: FROM and JOIN build the working rows. |
| s4-where | 4.5 | 2. WHERE drops rows / amount >= 20: the 10 and 15 go | WHERE highlighted. Orders 106 (10) and 107 (15) struck through; 5 rows remain. | Step two: WHERE filters individual rows. |
| s5-group-by | 4.5 | 3. GROUP BY collapses rows / Asha 120 · Ben 50 · Chen 90 | GROUP BY highlighted. Rows slide together by name, collapse to 3 group rows with sums. | Step three: GROUP BY collapses rows into one per customer. |
| s6-having | 4.5 | 4. HAVING drops whole groups / SUM > 50: Ben (50) is out | HAVING highlighted. Ben's group row struck through. | Step four: HAVING filters groups, not rows. Ben is exactly fifty, so he's out. |
| s7-select-order | 5 | 5. SELECT computes and names: total / 6. ORDER BY total DESC / ORDER BY can use the alias | SELECT highlighted; header becomes `total`. Then ORDER BY highlighted; rows reorder Asha 120, Chen 90. | SELECT computes the output and names it total. Only then can ORDER BY sort by that alias. |
| s8-limit | 3.5 | 7. LIMIT 1 keeps the top row / Result: Asha \| 120 | LIMIT highlighted. Chen's row struck through; Asha 120 remains. | Last, LIMIT one keeps the top row. |
| s9-end | 4 | Rows, then groups, then SELECT, then sort. / Save this for your next interview | End card, takeaway + save prompt, watermark `queryunstuck`. | Rows, then groups, then SELECT, then sort. Save this for your next interview. |

## Code panel (code_blocks[0], DuckDB-verified by runner)

```sql
SELECT c.name, SUM(o.amount) AS total
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.amount >= 20
GROUP BY c.name
HAVING SUM(o.amount) > 50
ORDER BY total DESC
LIMIT 1;
```

Expected output:
```
name | total
Asha | 120
```

## Data trace (for the visual director)
- customers: (1, Asha, IN) (2, Ben, US) (3, Chen, US)
- orders: (101,1,50) (102,1,70) (103,2,20) (104,2,30) (105,3,90) (106,3,10) (107,2,15)
- JOIN: 7 rows. WHERE: drop 106, 107 → 5 rows. GROUP BY: Asha 120, Ben 50, Chen 90. HAVING > 50: drop Ben. ORDER BY total DESC: Asha 120, Chen 90. LIMIT 1: Asha 120.
- DISTINCT appears in the timeline only (not used in this query).

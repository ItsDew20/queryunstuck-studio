# QA: qu-001 SQL Query Execution Order, Visualized (loop 1 re-check)

Checked: 1080x1920 H.264 + AAC, 38.5 s (container 38.507 s = timeline 38.5 s). Public content-length = local (4,723,206 bytes). Peak -13.7 dBFS (mean -34.4 dB). 11 caption cues, shortest 2.5 s, <=2 lines, text matches spec. Stills in qa/ (g_* = this pass; f_* = first pass), including s7->s8 boundary at 30.9/30.93/30.97/31.0/31.03/31.07/31.1 s.

## Loop 1 fixes (verified)
- s7 result table is now Chen 90 / Asha 120 only; Ben never reappears (g_26.1, g_28.5). SELECT highlights both rows, then a visible ORDER BY sort puts Asha above Chen (g_30.25).
- s7->s8 is a true continuation: table, position and highlight are identical across the boundary, only the title crossfades (g_30.25 vs g_31.1; boundary strip). No blink, no stray glide/swoosh at 31.1 s; cue list for s8 is only thud 31.9 s (Chen strike) and swoosh 32.7 s (collapse to Asha | 120), both match visible actions.
- s2 dimmed DISTINCT / "not in this query" more legible (g_6.5).

## Regression check (all pass)
Fact-check copy exact (s1 "logically", s2 caveat + "LIMIT/TOP", s7 "ORDER BY can use the alias"); DISTINCT greyed; numbers correct (7 orders/3 customers; WHERE strikes 106, 107; Asha 120 / Ben 50 / Chen 90; HAVING strikes Ben; ORDER BY Asha above Chen; LIMIT leaves Asha | 120); code highlight matches clause in every scene; s5->s6 continuation clean; watermark and end card present; thumbnail unchanged and fully drawn; no whoosh on continuation scenes; no stacked cues.

## Remaining issues
| issue | scene | severity | owner | suggested fix |
|---|---|---|---|---|
| "not in this query" still small (~30 px) and dim, though improved | s2-order | minor | visual-director | Raise to >=36 px if revisited |
| Headline wraps mid-keyword ("GROUP / BY") | s2-order | minor | visual-director | Shrink or rebreak |
| Headline wraps with orphan "total" | s7-select-order | minor | visual-director | Rebreak title |
| Titles / customers table reach x~985 (right 140 px zone starts x=940); code panel bottom at y~1650 (bottom-zone edge). Upper/mid placement, low risk | s3, s6, s7 | minor | visual-director | Tighten side margins to 940 px |
| Chip still reads "ORDER BY TOTAL DESC" for ~0.9 s after the title switches to LIMIT | s8-limit | minor | visual-director | Optional: show LIMIT chip from scene start |
| First frame shows only watermark | s1-hook | minor | animator | Start fade at frame 0 or accept |
| s5 beat says rows collapse, but groups table is present from 0.1 s | s5-group-by | minor | visual-director | Add collapse animation or update beat |
| SFX very quiet (mean -34.4 dB, peak -13.7 dBFS) | all | minor | renderer | Raise gain toward -3 dBFS peak |

No blockers.

QA: PASS

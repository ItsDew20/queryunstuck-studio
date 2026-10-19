# QA: qu-001 SQL Query Execution Order, Visualized (music + beat sync pass)

Checked: 1080x1920 H.264 + AAC, 41.0 s (container 41.003 s = timeline 41 s; within 25-45 s). Public content-length = local (4,849,549 bytes). Peak -10.2 dBFS (mean -29.4 dB). Stills in qa/ (h_* = this pass): scene midpoints, boundaries +-0.1 s, 85% of s3-s8, first/last frame, plus a 12-frame strip across the s7->s8 boundary.

## Music + beat sync pass
- Captions (verified by script): 11 cues, shortest 2.5 s, max 2 lines, no overlaps, and every on_screen_text line of every scene appears, in order, inside its scene window (exact text match).
- Music bed: 250 ms RMS scan. Bed-only gaps sit steady at about -33 to -37 dB from 1 s to 36 s; effect peaks reach -22 to -27 dB (about 8-12 dB above the bed), so effects clearly lead. No dip or cut anywhere, including 31-33 s (the earlier 0:32 dip is gone). Short ducking visible around effects (e.g. 9-12 s, 23.5 s, 28.5 s, 34 s). Ending: outro at 37 s then fade -48 dB at 38 s, -57 at 39 s, silence by 40 s; last samples ~0 (clean). Peak -10.2 dBFS, within the -1 dBFS limit.
- Beat sync: timeline output tags nothing off-beat. All cues land on 0.5 s multiples; scene boundaries are on whole seconds (60 BPM beats). Visual step changes match their sounds (s1 steps at 0.5/1.5/2.0 s, s2 one note per step, s3 dings per match, s4 thud at 13.5 s with strike, s5 click, s6 thud at 23.5 s with Ben strike, s7 note and glide at 30.5 s with the sort, s8 thud at 34.0 s with Chen strike and swoosh at 34.5 s with collapse).
- s7->s8 continuation still seamless: table, position and highlight identical across 33.0 s (title crossfade only); no whoosh on s6 or s8.

## Regression (all pass)
Fact-check copy exact (s1 "logically", s2 caveat + "LIMIT/TOP", s7 "ORDER BY can use the alias"); DISTINCT greyed with "not in this query"; numbers correct (7 orders/3 customers; WHERE strikes 106 and 107; Asha 120 / Ben 50 / Chen 90; HAVING strikes Ben; Asha above Chen; LIMIT leaves Asha | 120); Ben never reappears after s6; code highlight matches clause in every scene; watermark everywhere; end card present; no new text in the UI zones.

## Issues
| issue | scene | severity | owner | suggested fix |
|---|---|---|---|---|
| "not in this query" ~30 px and dim | s2-order | minor | visual-director | Raise to >=36 px if revisited |
| Headline wraps mid-keyword ("GROUP / BY") | s2-order | minor | visual-director | Shrink or rebreak |
| Headline wraps with orphan "total" | s7-select-order | minor | visual-director | Rebreak title |
| Titles / customers table reach x~985 (right 140 px zone starts x=940); code panel bottom y~1650 at the bottom-zone edge; upper/mid placement, low risk | s3, s6, s7 | minor | visual-director | Tighten margins to 940 px |
| Chip reads "ORDER BY TOTAL DESC" ~1 s after title switches to LIMIT | s8-limit | minor | visual-director | Show LIMIT chip from scene start |
| s5 beat says rows collapse, but groups table present from the start | s5-group-by | minor | visual-director | Add collapse or update beat |
| First frame shows only the watermark | s1-hook | minor | animator | Start fade at frame 0 or accept |
| Overall mix quiet (mean -29.4 dB, peak -10.2 dBFS); bed is audible but low on phone speakers | all | minor | renderer | Optionally raise master toward -3 dBFS peak |

No blockers.

QA: PASS

# qu-005 QA, loop 2: Designing a Clickstream Analytics Pipeline, End to End (longform, 1920x1080)

Reviewed 2026-10-21 against the corrected render (written 14:03). Local `video/out/qu-005-longform.mp4`: H.264 1920x1080 30 fps + AAC, 943.019 s (timeline 943 s, no stretched scenes), 80,501,306 bytes. Public `https://media.queryunstuck.in/qu-005/longform.mp4` content-length 80,501,306 = local. Public captions.srt = local (byte-identical, 6,493 bytes).
Stills in `qa/`: 42 midpoints (`mid-sNN`), 16 scene-85% stills (every RowHighlight/PartitionGrid/FlowGraph scene, `p85-sNN`), start-state stills for s04/s05/s25/s36 (`start-*`, `start3-*`), +-0.1 s around all 9 chapter boundaries (`bnd-*`), `first`, `last`. All viewed.

## Loop-1 blockers: all fixed
| blocker | result |
|---|---|
| s05: events stacked inside "P1: user 102" at scene start | FIXED. At +1 s and +3.5 s every event already sits in its keyed partition (e1/e4/e6 in P0 user 101, e2/e3/e8 in P1 user 102, e5/e7 in P2 user 103). Caption "Events in arrival order" kept, no wrong placement. |
| s36: events stacked inside "10-17" at scene start | FIXED. Rows start in 10-19 and stay there; 10-17, 10-18, 10-20 are empty neutral labels; only e1-e8 shown. |
| s25: unsupported sink -> source "replay" arrow | FIXED. Now Replayable source -> (read) -> Spark job -> (write) -> Idempotent sink, which matches the Spark docs claim (replayable source + idempotent sink). |

## Regression pass (all passed)
- On-screen text: all 120 on_screen_text lines visible and exact in their scenes (all 42 midpoints read). Title zone now grows instead of overlapping: s00, s04, s05, s40 headers no longer touch the content below (a clear gap everywhere; checked all 42 scenes plus 85% frames); no overlaps or clipping found in any title zone.
- Captions: 70 cues, 120 lines, each on_screen_text line found in order inside its scene window (programmatic, landscape timeline), none > 2 lines, none < 1 s, no overlaps, no cue straddles a scene boundary. Public = local.
- Fact-check wording unchanged: Spark scenes labelled Spark (s12, s25, s26 "SPARK"); DuckDB scenes labelled DuckDB (s24, s37 and now every code panel title "DuckDB SQL"; s18 "Illustration in SQL, not Spark itself"); watermark chapter says guaranteed / best effort, "may drop" and only the negation "isn't automatically dropped" (s15); pruning "needs a filter on the partition column" (s35, s38); no bytes-scanned bar in s37.
- Numbers match factcheck.md: 9 rows / 8 events, 44 s, 17 min 40 s, 09:06:40, 2 min 40 s, 8 rows (s24), click 4 -> 3, page_view 3, purchase 2, gold users 3/3/2. Code panels show verified code (ORDER BY ingest_time) and highlights follow the steps (s02 l3, s11 l2-3, s18 l10-11 then 12-13, s24 l9-11 at mid, s30 l4, s31 l6 then 10, s32 l5, s37 l3-4 then 6-7).
- FlowGraph arrows, all supported: s06 partition -> one consumer per partition; s12 Kafka source -> job -> checkpoint -> restart resumes (the s12 chain is a loop: Spark docs support offsets + checkpoints); s23 producer / resend -> broker dedupes (Kafka design); s25 source -> job -> sink (Spark docs); s29 bronze -> silver -> gold (Databricks); s33 bronze -> silver -> gold plus "fix rule -> patch silver", gold no longer says "rebuilt"; s37 query -> 2026-10-19 read -> result, other days skipped (BigQuery/DuckDB). No other FlowGraphs.
- Landscape: watermark present top right in every still and never overlapped; margins >= 95 px; end card present (s41), last frame is a fade-out; first frame is the background with watermark.
- Audio unchanged: peak -10.5 dBFS (limit -1), mean -32.6 dB. Music bed present for the whole 15:43, 189 five-second RMS windows between -39.2 and -28.6 dB (median -32.7), no dips or cuts, fades at the end. 193 sound cues; whoosh on every new-visual scene, none on callout continuations; only pop/tick micro-sounds off-beat.

## Loop-1 minor issues, re-checked
| loop-1 issue | status |
|---|---|
| Node text overflow in s12 ("Spark streaming job", "Job restarts"), s23 ("Timeout, resends"), s37, s25 | RESOLVED for s12, s23, s25 (text fits with a margin; fits via auto-fit, so the s12 job label is now smaller but still legible ~30 px). s37 node text fits but see new issue below. |
| Edge labels covered by dots | MOSTLY RESOLVED. Labels now drawn above dots with a halo; "seq 7" (s23) and "patch" (s33) are clean. In s12 the dot still sits close to the "o" of "save offsets" (cosmetic). |
| s04 start pile in Partition 0 | RESOLVED (A-F start in own partitions). |
| s33 gold "rebuilt" | RESOLVED (label removed). |
| s00/s04/s05/s40 title/body collisions | RESOLVED (title zone grows). |
| Code panel titles "SQL" | RESOLVED ("DuckDB SQL"). |
| Small text at 1080p (code panels ~15 px, tables 18-22 px) | OPEN, minor (not engine-changed). |
| s34 split title/sub-line, s40 duplicated recap lines, thumbnail is the cold-open frame, off-beat micro-sounds | OPEN, minor, accepted. The thumbnail was regenerated: heading fully drawn and readable small, header gap fixed. |

## Issues

| issue | scene | severity | owner | fix |
|---|---|---|---|---|
| The two edges are only ~85 px long, so the "read" and "write" labels crowd the boxes: "read" starts under the source box border and the "w" of "write" is half hidden by the sink box (`p85-s25.png`, `start-s25.png`). The diagram is also small, with large empty space. Judged minor: the relationship is still clear from the node text, the arrows and the narration, and nothing is wrong or misleading; but it is the weakest frame in the video. | s25 | minor | animator | Narrower nodes or a longer canvas span (x 0.12 / 0.5 / 0.88) so edge labels have room; or place labels above the line with a larger offset. |
| In the vertical chain the Query / 2026-10-19 / Result nodes touch each other; the arrowheads and dots are squeezed between the boxes (almost hidden). Order is still readable. | s37 | minor | animator | Increase the vertical gap between nodes or reduce node height. |
| Dot sits very close to the "o" of "save offsets" and the "o" of "resume from". | s12 | minor | animator | Offset label further from the dot path. |
| Code panels ~15-16 px and dense tables 18-22 px at 1080p; header sub-lines ~28 px. Fine on a laptop, hard on a phone. | s02, s11, s18, s22, s24, s30-s32, s37 | minor | animator | CodePanel font >= 24 px in landscape. |
| s40 recap: title zone repeats lines 1-4 while the Timeline lists all 6 (acceptable, slightly redundant); s34 splits the takeaway sentence across title and sub-line. | s40, s34 | minor | visual-director | Optional tidy-up. |
| Thumbnail is the cold-open frame, not a dedicated YouTube thumbnail with the video title. Heading is readable at small size. | thumbnail | minor | renderer | Optional. |
| Pop/tick micro-sounds at +0.13 to +0.40 s after the whoosh are off-beat (accepted). | various | minor | composer | None needed. |

Blockers: none.

QA: PASS

# QA – qu-002 "How a Spark Shuffle Works, Visualized" (loop 1 re-check)

Checked: video/out/qu-002-reel.mp4, captions.srt, timeline, sfx cues, 31 fresh stills in `qa/` (scene mids, +-0.1 s around every boundary, 85% of s2/s4/s5, first/last frame; named `t_<seconds>.png`, half-scale 540x960).

Technical: H.264 + AAC, 1080x1920; duration 42.005 s vs timeline 42.0 s; no stretched scenes (3/5/5/6/6/4/5/5/3); peak -13.7 dBFS (<= -1 OK); public Content-Length 5,702,741 equals local size.

## Loop 1 fixes (verified)
- Length: 47.5 s -> 42.0 s, inside 25-45 s. Blocker closed.
- Captions: checked programmatically against the timeline: 15 cues, no overlaps, each >= 1 s, <= 2 lines, every cue lies inside one scene window, and the lines per scene equal that scene's `on_screen_text` in order. Blocker closed.
- s2 sound now matches visuals: 2 swooshes (4.67 s, 5.57 s) for the 2 moving rows (B·20 -> P2, C·6 -> P0) plus one snap.
- s4: neutral headers R0/R1/R2, "Illustrative: A→R0, B→R1, C→R2" in subtitle and caption, 6 swooshes at 0.6 s spacing (6 crossing rows), snap at 18.6 s inside the scene.
- s8 items now verbatim from `on_screen_text`; s9 headline shows the two spec lines on separate lines.

## Issues
| Issue | Scene | Severity | Owner | Suggested fix |
|---|---|---|---|---|
| Crossing rows overlap while in flight (e.g. "B·20/A·7", "C·5/B·9" garbled at 16.0 s; "C·12/A·4" still overlapping at 17.95 s). Transient, settles by 18.6 s, leaving only ~0.4 s of settled hold before s5 | s4 | minor | animator | Stagger slots or shorten arc so rows do not share a slot mid-flight |
| Small on-canvas text below ~36 px (partition headers, FlowGraph sublabels, SQL lines ~26-32 px at 1080 wide) | s2-s6 | minor | animator | Raise sizes in a later engine pass; same as qu-003 |
| Bin outlines extend to x = 1006 / y = 1650 (inside right 140 px / at bottom 270 px limit); rows and watermark are clear | s2-s4 | minor | animator | Derive grid width from `safeRight` |
| s5 audio is busy: 6 pops then 9 swooshes at 0.47 s spacing; each maps to a visible dot | s5 | minor | visual-director | Optional |
| Quiet mix (peak -13.7 dBFS) | all | minor | renderer | Optional |
| First frame (0.00 s) shows only the watermark | s1 | minor | animator | Optional |
| s9 headline is 5 lines at large size (readable, inside safe zones) | s9 | minor | visual-director | Optional |

## Passed checks
- Text matches `on_screen_text` for all scenes incl. s5 "Often over the network", s8 "(auto ≤ 10 MB by default)", s9 two lines; no typos.
- Data: s6 A = 21, B = 32, C = 23 matches verified DuckDB result; s4 final grouping A: 10,7,4 / B: 20,3,9 / C: 5,12,6 correct and labelled illustrative; s5 shows one edge per map output to each reduce task, "pulls its blocks", no claim that each task reads every file.
- s7 Callout "Intermediate shuffle files are kept on disk" is supported by the Spark RDD programming guide, Shuffle operations ("Shuffle also generates a large number of intermediate files on disk").
- Code highlight: s3 line 3; s6 lines 1-3 then line 4 (ORDER BY).
- Watermark in all scenes; end card with @queryunstuck, tagline, CTA; brand fonts/colours only; whoosh only on real view changes, none on s7/s9; no stacked sounds.

QA: PASS

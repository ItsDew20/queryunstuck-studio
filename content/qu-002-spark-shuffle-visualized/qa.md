# QA – qu-002 "How a Spark Shuffle Works, Visualized" (music + beat sync re-check)

Checked: video/out/qu-002-reel.mp4, captions.srt, timeline, sfx cues, 30 fresh stills in `qa/` (scene mids, +-0.1 s boundaries, 85% of s2/s4/s5, first/last frame; `t_<seconds>.png`, half-scale 540x960).

Technical: H.264 + AAC 1080x1920; duration 43.008 s vs timeline 43.0 s; length <= 45 s OK (s5-reduce 6 -> 7 s is the only stretch); peak -10.4 dBFS (<= -1 OK); public Content-Length 5,801,214 equals local size.

## Issues
| Issue | Scene | Severity | Owner | Suggested fix |
|---|---|---|---|---|
| ~~Captions dropped 6 lines~~ RESOLVED: captions.srt regenerated with scripts/make_captions.py; re-verified from disk: 15 cues, 24/24 `on_screen_text` lines in order inside their own scene windows (timeline 43.0 s), <= 2 lines, shortest 1.50 s, no overlaps, ends 43.0 s; public file identical to local (diff clean) | s3-s9 | resolved (was blocker) | renderer | none |
| s4 crossing rows overlap while in flight (garbled "B·20/A·7" at 16.0 s, "B·3 / A·4" overlap at 18.1 s); settle by about 18.6 s | s4 | minor | animator | Stagger slots or shorten arc |
| Small on-canvas text below ~36 px (partition headers, FlowGraph sublabels, SQL lines ~26-32 px at 1080 wide) | s2-s6 | minor | animator | Raise sizes in a later engine pass |
| Bin outlines extend to x = 1006 / y = 1650 (inside right 140 px, at bottom 270 px limit); rows and watermark are clear | s2-s4 | minor | animator | Derive grid width from `safeRight` |
| Overall loudness is low: mix mean -31.5 dB, bed about -34 dB RMS, effects peak about -10 dBFS. Audible but quiet on a phone speaker | all | minor | renderer | Optional: raise master gain (headroom to -1 dBFS is ~9 dB) |
| s5 has 9 swooshes at 0.5 s spacing on the beat grid; each maps to a visible dot, busy but not wrong | s5 | minor | visual-director | Optional |
| s9 headline is 5 lines at large size (readable, inside safe zones) | s9 | minor | visual-director | Optional |

## Music + beat sync pass
- Beat sync (timeline): only pop (s1 x2, s5 pops are on-beat), tick (s2, s3, s4, s6) are tagged off-beat. All whoosh, swoosh, snap, note, buzz and outro cues are on-beat (scene starts on 3, 8, 13, 19, 26, 30, 35, 40 s; swooshes at 4.5/5.5, 15.0-18.0, 21.5-25.5; notes at x.5 s). Visual check: s2 moves land at 4.5/5.5 s with snap at 6.5 s; s4 routing at 15-18 s; s5 dots travelling at 21.5-25.5 s; s6 table/highlight steps and s8 list items appear on their note cues.
- Music (wav 43.0 s = video length): bed present from 1 s to the end, no dropouts: 0.5 s RMS of the mix stays between -28 and -37 dB through the whole video. Fade-in over about 1 s, fade-out over about the last 1.5 s ending at silence on the final frame (no abrupt cut).
- Ducking: fitting the bed gain against the standalone track shows steady about -15 to -16 dB and dips of 3-5 dB around effect cues (e.g. 4.5 s, 5.5 s, 40.0 s outro): ducking is present.
- Effects vs bed: bed about -34 dB RMS in the mix; 0.5 s windows containing effects sit about 4-7 dB above it (outro about 14 dB above). Bed is clearly under the effects.
- Peak -10.4 dBFS.

## Passed checks
- Copy: all on-screen text matches `on_screen_text` (s5 "Often over the network", s8 "(auto ≤ 10 MB by default)", s9 two lines, s7 three lines); no typos.
- Data: s6 A = 21, B = 32, C = 23; s4 grouping correct and labelled illustrative (subtitle and header); s5 shows one edge from each map output to each reduce task and does not imply each task reads every file.
- s7 Callout "Intermediate shuffle files are kept on disk" supported by the Spark RDD programming guide (Shuffle operations).
- Code highlight: s3 line 3; s6 lines 1-3 then line 4 (ORDER BY).
- Watermark in all scenes; end card present; brand fonts/colours only; whoosh only on real view changes, none on s7 and s9.

QA: PASS

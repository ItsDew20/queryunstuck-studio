# QA: qu-003 (reel-list, 10 Must-Know File & Table Formats)

Checked: 21 stills in `qa/` (first/last frame, scene midpoints, +-0.1 s around every boundary, 80% of each list scene), thumbnail, captions.srt, ffprobe, volumedetect, sfx cue list, public URL.

## Technical
- Local `video/out/qu-003-reel.mp4`: H.264 1080x1920 + AAC, video 25.000 s, audio 25.003 s; timeline 25 s (750 frames). Matches.
- Public `https://media.queryunstuck.in/qu-003/reel.mp4` content-length 2873325 = local size 2873325. Identical size.
- Audio: max_volume -13.6 dB (<= -1 dBFS OK), mean -36.2 dB (quiet, see issue 7).
- Watermark `queryunstuck` visible top-right on every scene; end card present (22-25 s: closing line, @queryunstuck, tagline, save CTA).
- On-screen text matches spec `on_screen_text` word for word in all 6 scenes; nothing missing or truncated. List numbering reads 1-10 continuously (1-4, 5-7, 8-10). Only difference: the spec colon after the name ("CSV: plain-text rows") renders as a middle dot ("CSV . plain-text rows"), and "N." prefixes are added.
- Nothing in the bottom 270 px (content ends at y~1230). No text in the right 140 px (text ends x<=930).
- Sound cues: whoosh only on new scenes (s2-s5, each a new heading, no continuation scenes); one note per revealed item (4+3+3); tick at s5 card reveal; outro on end card. No stacking except the s1 cluster (issue 6).
- Thumbnail: title fully drawn and legible (hook frame, "Parquet is a file format. Iceberg is not.").

## Issues
| issue | scene | severity | owner | suggested fix |
|---|---|---|---|---|
| Item description text is ~32-34 px (below the ~36 px phone target); bold name/number is larger and fine | s2, s3, s4 | minor | visual-director | Raise description size to >=36 px in ListCard or accept (rows still fit; there is room, content ends y~1270) |
| s5 repeats the title-zone text inside the cards ("File format" / "How bytes sit in a file"); title-zone second line "Table format: which files form the table" is smaller and dimmer (~38 px), reads as secondary | s5 | minor (accepted trade-off) | visual-director | Acceptable; optionally make both title lines equal weight |
| ListCard numbers are part of the item text ("5. Parquet"), separator shown as a dot instead of the spec colon | s2-s4 | minor (accepted trade-off) | visual-director | Acceptable; numbering is continuous and reads correctly |
| Group heading breaks "Columnar + in-/memory" at the hyphen across two lines | s3 | minor | visual-director | Use a non-breaking hyphen or reduce heading size so it wraps as "Columnar + / in-memory" |
| Captions: first cue is 0.667 s (below ~1 s) for a 2-line hook; cues 4 and 5 group items (2+3 appear together while on screen item 3 appears about 1 s later) | captions | minor | renderer | Merge cues 1+2 (0-2.0 s) or lengthen cue 1 to >=1 s; optionally split cue 4 by item reveal. Text matches on-screen copy; all timings within 25 s |
| Right edge of list cards (x=975) and comparison cards (x=990) extend into the right 140 px zone (border only, no text) | s2-s5 | minor | visual-director | Acceptable (background/border only); tighten card width to <=940 if desired |
| Overall loudness is very low (mean -36 dB, peak -13.6 dB); peak limit is met but the sfx may be inaudible on a phone | all | minor | renderer | Optionally normalise so peak is around -3 dBFS |
| s1 cue cluster: pop 0.00, pop 0.33, sparkle 0.63, sparkle 0.83 in 2 s; two near-identical sparkles 0.2 s apart; frame 0 is blank while pop plays | s1 | minor | animator | Drop one sparkle or space them >=0.4 s; align first pop with first visible text |

No blockers.

QA: PASS

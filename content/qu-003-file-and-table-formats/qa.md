# QA: qu-003 (reel-list, 10 Must-Know File & Table Formats), re-render with music + beat sync

Checked: 21 fresh stills in `qa/` (first/last frame, scene midpoints, +-0.1 s at every boundary, 80% of each list scene), thumbnail, captions, ffprobe, audio levels, cue list, public URLs.

## Technical
- Video H.264 1080x1920 30 fps + AAC 48 kHz. Duration 25.472 s vs timeline 25.467 s (within 0.1 s; 15-30 s reel-list OK).
- Public reel.mp4 and thumbnail.png: size and SHA-1 identical to local (new music file, not the old pre-music one). Public captions.srt diff vs local: identical.
- Audio: peak -11.1 dBFS (limit -1). Music bed continuous at about -30 dB (0.25 s RMS windows), effects peak at -16 to -25 dB so the bed sits clearly under them; no dips or cuts; deliberate fade-out over the final ~1 s, silent on the last frame.
- Cues (20): whooshes only on scene starts s2-s5 (all new scenes, none on continuations); notes land on list item reveals (1-4, 5-7, 8-10, numbering continuous); tick on comparison; outro on end card. Only pop/sparkle micro-sounds are off-beat (3.6-5.4 frames); all other cues within 0.5 frame of the beat.

## Captions
Programmatic check: 10 cues, every on_screen_text line present, in order, inside its scene window for all 6 scenes; max 2 lines per cue; min cue 1.833 s (>= 1.0); no overlaps. No regeneration needed.

## Visual
- On-screen text matches spec exactly (no typos). Numbering 1-10 continuous. Brand colours and fonts only. Watermark `queryunstuck` on all frames. End card present with CTA. Content in y 150-1250, clear of bottom UI zone.
- Hook (1.83 s): fully drawn from about 0.9 s, headline is 5 words at about 100 px; readable at phone size, tight but acceptable.
- Comparison (2.73 s): fully visible from about 1.4 s, about 1.3 s hold, large text, readable; redundant title + cards help.
- Thumbnail (frame 45): fully drawn, readable.

## Issues
| issue | scene | severity | owner | fix |
|---|---|---|---|---|
| Heading breaks mid-word at hyphen: "Columnar + in- / memory" | s3-columnar | minor | visual-director | Shorten or use non-breaking hyphen / smaller size next iteration |
| Item subtitles wrap with orphan word (5 Parquet "compression", 7 Arrow "compute", 9 Iceberg "travel", 10 Hudi "processing") | s3, s4 | minor | visual-director | Smaller subtitle size or tighter copy next iteration |
| Comparison title wraps leaving orphan "file" | s5-diff | minor | visual-director | Reduce size or rebalance lines |
| Two sparkles 6 frames apart (0.63 s and 0.83 s) | s1-hook | minor | animator | Drop one sparkle next iteration |
| Hook and comparison are short (1.83 s / 2.73 s) after beat sync | s1, s5 | minor | animator | Acceptable as rendered; consider one more beat if retimed |
| Frame 0 shows only background + watermark (title fades in) | s1-hook | minor | animator | Fine for playback; thumbnail is a separate frame |

No blockers.

QA: PASS

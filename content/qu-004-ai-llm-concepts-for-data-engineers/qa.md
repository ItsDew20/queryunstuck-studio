# qu-004 QA (reel-list, 15 Must-Know AI/LLM Concepts for Data Engineers)

Checked 2026-10-21. Stills in `qa/` (scene midpoints, +-0.1 s boundaries, first/last frame, 85% of each FlowGraph scene, reveal strip, carousel slide 2).

## Verified
- Video: H.264 1080x1920 30 fps + AAC, 28.011 s (timeline 28.0 s, 840 frames), 15-30 s OK. Public reel size 3,114,467 B = local, HTTP 200 video/mp4. Public thumbnail = local size, image/png. Public captions.srt identical to local.
- Copy: every on_screen_text line is visible in its scene. Lines 1-3, 6-8, 11-13 are the three header lines; lines 4-5, 9-10, 14-15 are node label + sublabel. All words match the fact-checked text exactly (no changed word). Title, kicker, end headline and CTA match.
- Visual claims: s2 and s4 have no edges or arrows. s3 shows Chunking -> Embedding -> Vector index -> ANN search; Cosine similarity is an unconnected node at the bottom, not a step before the index. No unsupported order.
- Captions: programmatic check passed. Every line appears in order inside its scene window, max 2 lines, min 1.5 s, no overlaps.
- Carousel: 5 slides 1080x1350 (4:5), legible (body about 40 px+), numbering 1-15 continuous, every list line equals a fact-checked line minus "N. ", cover and takeaway match. Public JPEGs: 200, image/jpeg, sizes equal local (46224, 133141, 139423, 136886, 93449).
- Watermark (small "queryunstuck" top right, new subtle style) present on every reel frame, outside IG UI zones; end card (headline, @queryunstuck, tagline, CTA) present 24-28 s; brand colours and fonts only; thumbnail fully drawn.
- Audio: peak -10.9 dBFS (limit -1). Music present throughout, no dips below about -33 dB RMS, ducks under pops, outro sting at 24 s then clean fade to silence. Cues: whoosh only at the three real scene changes (3, 10, 17 s), no whoosh on continuation scenes, no stacked cues; pops land on the 0.5 s beat grid; only the 0.33 s pop and 0.47 s tick are off-beat (micro-sounds, allowed). s3 swooshes 12/12.5/13 s map to the three edges drawing.

## Issues
| issue | scene | severity | owner | fix |
|---|---|---|---|---|
| Header lines 1-3 (and 6-8, 11-13) are set at about 30 px; node sublabels (monospace) about 24 px. Below the 36 px phone minimum. Full text is also in the caption and carousel. | s2, s3, s4 | minor | visual-director | Raise header lines to >= 36 px (fewer words or two lines) and sublabels to >= 30 px; or drop sublabels to node label only. |
| Majority-text risk (playbook s3): text still outweighs diagram. Three text lines under the title plus sublabels plus labelled boxes; in s2 and s4 the grid has no motion or visual after the reveal, about 20% of the frame bottom is empty. s3 is the best (arrows and moving dots). | s2, s4 (s3 less) | minor | visual-director | Replace the three-line text block with a small icon or mini-diagram per term, or show only name plus at most 4 words in the frame and keep full definitions in the caption/carousel; add subtle motion (pulse on the node being named). |
| Node reveals run ahead of captions: all 5 nodes and the 3 header lines are on screen by about 5.5 s, but captions for items 4-5 start at 7.67 s (s2) and similar in s3/s4. Captions repeat text already visible. | s2, s3, s4 | minor | renderer | Retime captions to node pops (0.5 s grid) or accept as duplicate text; not a blocker. |
| Overall level is very quiet: mean about -30 dB, peak -10.9 dBFS. Headroom is about 10 dB; may be inaudible on phone speakers. | whole | minor | renderer | Raise master gain about +6 to +8 dB (keep peak <= -1 dBFS), keeping music just audible under effects. |
| Frame 0 is empty (watermark only); title text fades in by 0.5 s and is full at 1.5 s. | s1 | minor | animator | Start title at opacity > 0 on frame 0, or leave (thumbnail uses frame 45 and is fine). |
| s4 node tones (red Hallucination, amber Evals, green Guardrails) are colour-coded; acceptable (bad / test / mitigation) but unexplained. | s4 | minor | visual-director | Optional: keep, or neutralise tones for consistency with s2. |

No blockers.

QA: PASS

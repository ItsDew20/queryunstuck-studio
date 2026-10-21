# QueryUnstuck creative playbook

How we keep every piece interesting. Owned by the creative-director, used by the scriptwriter,
visual-director, audience-panel and packaging-designer.

These are **our own craft targets**, not platform facts (platform guidance with sources lives in
`docs/growth-playbook.md`). They start as sensible defaults and get tuned by the analyst's real
retention data; change a number only with evidence in `analytics/weekly-*.md`.

## 1. Pacing limits (checked by `scripts/engagement_stats.py`)
| | reels | longform with voice | longform without voice |
|---|---|---|---|
| first motion | ≤ 0.5 s | ≤ 1 s | ≤ 1 s |
| longest static stretch (render) | ≤ 2.5 s | ≤ 10 s | ≤ 5 s |
| longest gap between events (storyboard) | ≤ 3 s | ≤ 12 s | ≤ 6 s |
| events per minute | ≥ 30 | ≥ 12 | ≥ 20 |
| same component in a row | ≤ 2 | ≤ 2 | ≤ 2 |
| pattern interrupt | every 5-8 s | every 45-60 s | every 30 s |

"Static" means nothing on screen moves. Text the viewer is reading still counts as static: if a
line needs 4 s to read, animate something next to it (highlight, counter, dot, tick).
A deliberate exception (e.g. a 3 s "pause and guess" freeze) must be written in `creative.md`.

## 2. Hooks (first 1.5 s)
- Open on **motion and the question**, never a plain title card. The first frame is also the cover.
- Patterns that are honest and concrete:
  - **Contradiction:** "Kafka doesn't order your topic."
  - **Mistake:** "This GROUP BY drops a row."
  - **Stakes:** "Retries double-count revenue."
  - **Guess:** "Which row survives? 3 seconds."
  - **Number with a payoff:** "6 steps between a click and a dashboard."
- Banned openers: "In this video…", "Today we'll learn…", "Hey guys", a logo sting, or a definition.

## 3. Angles (rotate; never the same angle twice in a row within a format)
myth-bust · debug-this · interview question · guess-the-output · before/after (slow vs fast,
wrong vs right) · race (two approaches side by side) · one-table story (follow one dataset through
everything) · build-it-live · "what happens when…" (failure replay) · N must-know (lists).

## 4. Series (recurring elements build habit)
- **Interview Q in 30 s** (`reel-animated`): a question, a 3-second "guess" freeze, then the answer animated.
- **Debug this** (`reel-animated`): a broken query or pipeline, the bug highlighted, the fix.
- **N Must-Know** (`reel-list` + carousel): the cheat-sheet series.
- **One Table, Whole Pipeline** (`longform`): one small dataset carried through a full system design.
Each series keeps the same opening beat and badge, so returning viewers recognise it within a second.

## 5. Stale patterns to avoid
- Three or more scenes that look alike (same component, same layout, same colours) in a row.
- A scene that holds one frame while the viewer reads; one still grid for 20 s.
- Every piece starting and ending the same way.
- Longform as a slideshow: long silent scenes with text and a music bed. Longform needs a voice,
  or it must be cut much tighter (see the pacing table).
- The obvious explanation everyone has already seen. Find the surprise (creative.md).
- Ending without a payoff. Every piece ends on the one line to remember, and reels may loop back
  to the hook.

## 6. Visual evolution
- Grow the component library by about one visual capability a week (creative-director requests it,
  animator builds it). Candidates: zoom/focus camera moves, counters and timers, a "pause and guess"
  freeze frame, side-by-side race, crossed-out wrong answer, cursor/typing code, split before/after.
- Variety comes from motion, framing, layout and story, never from new colours or fonts (brand tokens only).

## This week
(creative-director updates this section weekly: what feels repetitive, one new format/series to
test, one capability to build next, anything to retire.)
- First review (2026-10-22): qu-005 is static 78% of its 15:43 runtime with no voice (82 still
  stretches over 2 s, the longest 26 s); qu-004 is static about half the time. Priorities: a voice
  for longform, motion during reading time, and a "pause and guess" capability.

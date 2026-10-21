# qu-004 viewer panel

## Final watch

Watched: `video/out/qu-004-reel.mp4` (28.0 s, 1080x1920), sound off first. Evidence in `viewer/`:
contact sheets `sheet-001..003.png` (2 fps), hook frames `hook-0.0/0.5/1.0/1.5/3.0.png`, `full-09.0.png`,
past reels `past-qu-00N-sheet-*.png`, and `compare-first-last.png` (frame 0 and last frame of qu-001..004).

> These scores are predictions from simulated viewers, not data. No analyst "Panel calibration" note
> exists yet (`analytics/` is empty), so they are uncalibrated.

### Stats (`viewer/stats.json`)
| check | value | playbook limit (reels) | |
|---|---|---|---|
| first motion | 0.0 s (but frame 0 is an empty navy grid) | ≤ 0.5 s | pass on paper |
| longest static (render) | 4.2 s @ 0:19.4 (s4); also 3.4 s @ 0:06.2 (s2), 2.8 s @ 0:24.8 (end) | ≤ 2.5 s | FAIL |
| still overall | 47% of runtime (moving 53%) | | |
| longest gap between events | 5 s @ 0:05 (s2) and 0:19 (s4) | ≤ 3 s | FAIL |
| events per minute | 45 | ≥ 30 | pass |
| same component in a row | 3 (FlowGraph x3) | ≤ 2 | FAIL |
| pattern interrupt | none; three 7 s cards with the same layout | every 5-8 s | FAIL |
| words on screen | 158; s2 7.1 words/s, s3 6.1, s4 6.0 | | far above phone reading speed |
| voice | none (0/5 scenes narrated); soft "drift" bed at -11 dB | | muted on IG anyway |

No `creative.md`, so no recorded exception for any of these.

What the reel is, frame by frame: blank navy grid (0.0 s) → "THREE CARDS. SCREENSHOT THEM. / 15 AI/LLM terms /
for data engineers" (0.5-2.9 s) → blank flash → three identical cards ("Talking to the model", "Finding the right
data", "Making answers reliable"), each a header, a 3-line small-text list (items 1-3 / 6-8 / 11-13), and five
boxes appearing one by one in a zig-zag; definitions 4-5 live inside the boxes in small mono text → end card
"RAG answers depend on what you retrieve. @queryunstuck / SAVE THIS FOR YOUR NEXT INTERVIEW" held 4 s.

### Fresher (0 yrs)
- **First 1.5 s:** frame 0 is an empty navy grid with a watermark; by 0.5 s "15 AI/LLM terms for data
  engineers" fades in. **Stops: yes, barely.** "AI terms I'll get asked" is the exact thing I'm anxious
  about, and "screenshot them" promises a cheat sheet. It is a plain title card, though: nothing is
  happening, so I stop for the promise, not because anything grabbed me.
- **Boredom map:**
  - `00:00 s1-title: blank frame, nothing to read for half a second.`
  - `00:03 s1→s2: screen flashes empty again before card 1.`
  - `00:05 s2-model: header lines are small grey text and the five words arrive at 7 words/s; I can't read them before the boxes start popping in.`
  - `00:06 s2-model: definitions 1-3 are in the header, 4-5 are inside the boxes in tiny code font; where am I supposed to look?`
  - `00:06-00:09 s2-model: 3.4 s with nothing moving while I try to read, and the bottom quarter of the screen is empty.`
  - `00:10 s3-data: second card, same layout; "Cosine similarity" floats at the bottom, not connected to anything.`
  - `00:17 s4-reliable: third card in a row that looks the same.`
  - `00:19-00:23 s4-reliable: 4.2 s fully still.`
  - `00:24-00:28 s5-end: same end card I've seen on this account before; I've already decided to save or not.`
- **Hooked moments:** 0:11-0:16 the yellow dots running Chunking → Embedding → Vector index → ANN search; that is
  the only bit that teaches me how pieces connect. 0:18 the red "Hallucination" and green "Guardrails" boxes are
  the only colour change in the reel.
- **After:** finish **yes** (it's 28 s and I want the list). Save **yes** (that's the whole point). Share **no**
  (nothing to send a friend except a glossary). Follow **no** (nothing here I couldn't get from any "AI terms" post).
- **Scores:** hook 6, pacing 4, novelty 3, clarity 5, payoff 5, shareability 5, overall 5.

### Working DE (3-5 yrs)
- **First 1.5 s:** blank, then "15 AI/LLM terms". **Stops: no.** A glossary of terms I already use. Nothing says
  there's a gotcha or something wrong I might be doing.
- **Boredom map:**
  - `00:01 s1-title: "15 terms" = a glossary. Swipe.`
  - (if held by autoplay) `00:05 s2-model: "Token: a chunk of text the model reads". I know.`
  - `00:08 s2-model: the one gotcha ("Temperature: 0 can still vary") is buried in tiny mono text inside a box, never highlighted.`
  - `00:10 s3-data: the diagram is a straight chain I've drawn on whiteboards a dozen times.`
  - `00:17 s4-reliable: boxes with no edges arranged in a zig-zag; it looks like a diagram but says nothing.`
- **Hooked moments:** none at speed. "Context window: output included" and "temperature 0 can still vary" are real
  gotchas, but they are presented as list items, not as the point.
- **After:** finish **no** (gone by 0:02). Save **no**. Share **no**. Follow **no**.
- **Scores:** hook 3, pacing 4, novelty 1, clarity 6, payoff 2, shareability 1, overall 3.

### Switcher (analyst → DE/AI)
- **First 1.5 s:** blank, then the title. **Stops: yes, weakly.** I'm moving into AI work and want this vocabulary.
  But it looks like every other "N terms" post, and I can tell it's going to be a wall of text.
- **Boredom map:**
  - `00:00 s1-title: blank frame.`
  - `00:05 s2-model: 50 words in 7 s. Too much text to read at this speed; I tap to pause or I give up.`
  - `00:07 s2-model: the boxes repeat the header words without adding anything (Token / Context window / Prompt with no definitions under them).`
  - `00:13 s3-data: "Cosine similarity" is item 8 in the list but sits disconnected at the bottom of the chain, below ANN search; the order doesn't match.`
  - `00:17 s4-reliable: third identical card. I save the post here and swipe.`
  - `00:19-00:23 s4-reliable: 4.2 s fully still (I'm already gone).`
- **Hooked moments:** 0:11-0:16 the dots flowing through the retrieval chain; I want the whole reel to be that.
- **After:** finish **no** (saves at ~0:17, leaves). Save **yes** (to read later, which is really a carousel use).
  Share **no**. Follow **maybe/no**.
- **Scores:** hook 5, pacing 4, novelty 3, clarity 4, payoff 5, shareability 3, overall 4.

### Compared with our earlier reels (qu-001, qu-002, qu-003)
No earlier `viewer.md` exists; compared directly against `video/out/qu-00{1,2,3}-reel.mp4`.
- **Same first frame, all four.** Frame 0 of qu-001, qu-002, qu-003 and qu-004 is the same empty navy grid with
  the watermark (`compare-first-last.png`). In the feed, before anything animates, all four look identical and
  empty.
- **Same last frame, all four.** Same EndCard: centred white takeaway, yellow `@queryunstuck`, tagline, and the
  same yellow pill "SAVE THIS FOR YOUR NEXT INTERVIEW".
- **Same skeleton.** Centred bold title with yellow underline → 3-4 sections, each a white header plus a grey
  subtitle line at the top and dark rounded boxes below → end card. qu-003 and qu-004 are back-to-back reel-lists
  with the same beat: title, three grouped lists revealed item by item, end card.
- **Same look.** Navy gradient, faint grid, white/yellow/grey type, dark-navy rounded boxes. Only the content in
  the boxes changes. The motion is the same too: fade or slide in, hold.
- **Weaker hook than before.** qu-001 ("You write SELECT first.") and qu-003 ("Parquet is a file format. Iceberg
  is not.") opened on a contradiction; qu-002 ("Slow JOIN or GROUP BY?") on a question. qu-004 opens on a plain
  title card, which the playbook bans.

Repetition counts as boredom: this fails the "nothing feels like a repeat of our last 3 pieces" bar.

### Top 5 fixes
| fix | where | why it loses viewers | owner |
|---|---|---|---|
| Replace the title card with a moving, concrete hook, and make frame 0 non-empty (it's also the cover). Use a gotcha that's already fact-checked as the contradiction, e.g. "Temperature 0 can still give different answers." or "Your context window counts the output too.", then "+13 more you'll get asked". | s1, 0:00-0:03 | Frame 0 is blank in all four reels; a plain "15 terms" title tells the Working DE it's a glossary, so they swipe at 0:01. Every hook score is below 7. | scriptwriter (lines), visual-director (frame 0 / entry animation) |
| Change the structure from three identical 7 s cards to one request flowing through the stack: prompt → tokens → context window → chunk → embed → vector index → ANN → retrieve → generate → eval/guardrail catches a hallucination. Each term lights up as the request passes it; finish on the full cheat-sheet as a still for the screenshot. | s2-s4 | Three cards that look the same make 0:17 a swipe point. The only hooked moment (0:11-0:16) is the one time something flows; build the whole reel from that. | creative-director |
| One term on screen at a time, big, with its definition directly under it (~1.5 s each); move all 15 definitions into one consistent place; use the empty bottom quarter. | s2-s4 | 6-7 words/s is unreadable on a phone. Definitions 1-3 sit in the header and 4-5 in tiny mono text inside boxes, so the eye doesn't know where to look. | visual-director |
| Kill the still holds: animate during reading (highlight sweep, tick per item, counter "6/15"); no FlowGraph without edges; break the 3x FlowGraph run with a different component; cut the end-card hold to ≤ 2.5 s or loop back to the hook. | 0:06.2 (3.4 s), 0:19.4 (4.2 s), 0:24.8 (2.8 s) | Pacing limits fail (longest static 4.2 s vs 2.5 s; 3 same components in a row vs 2). Edge-less boxes in a zig-zag look like a diagram but mean nothing. | visual-director; animator for a counter/progress capability and a "pause and guess" freeze |
| Give the series its own opening beat and a different end card from the explainer reels (a "N Must-Know" badge plus the counter), and make the cover read as a cheat sheet, not a blank grid. | s1 badge, s5 end card, cover | All four reels share the first frame, the end card and the CTA word for word, so returning viewers can't tell a new post from an old one. | packaging-designer (cover/badge), creative-director (series beat) |

Not a top-5 but noted: the "drift" bed at -11 dB is soft and drumless. That's fine muted, but with sound on
there is no lift at the card changes (composer, after the structure changes).

### Panel scores
| | hook | pacing | novelty | clarity | payoff | shareability | overall | stops at 1.5 s | finishes |
|---|---|---|---|---|---|---|---|---|---|
| Fresher | 6 | 4 | 3 | 5 | 5 | 5 | 5 | yes | yes |
| Working DE | 3 | 4 | 1 | 6 | 2 | 1 | 3 | no | no |
| Switcher | 5 | 4 | 3 | 4 | 5 | 3 | 4 | yes (weak) | no |
| **mean** | **4.7** | **4.0** | **2.3** | **5.0** | **4.0** | **3.0** | **4.0** | 2/3 | 1/3 |

Why it fails: every hook score is below 7, mean overall is 4.0 (needs 7.0), only 1/3 would finish, four pacing
limits fail with no `creative.md` exception, and the first frame, structure and end card repeat qu-001 to qu-003.

VIEWER: FAIL

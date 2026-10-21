# qu-005 audience panel

## Final watch

Watched `video/out/qu-005-longform.mp4` (15:43, 1920x1080) as a YouTube viewer would get it: no
voice, a quiet drone bed (`drift`, 60 BPM, -13 dB, about 12 cues/min) and sound effects. Evidence:
14 contact sheets at fps=1/3 (`viewer/sheet-001..014.png`, 72 s each, all read in order), full
frames at 0.0/0.5/1.0/1.5/3.0 s, every chapter start (1:39, 3:57, 6:13, 8:31, 11:02, 13:13, 14:53)
and two SQL scenes at full resolution (7:35, 10:00).

These scores are predictions from three simulated viewers, not data. There is no
`analytics/weekly-*.md` calibration note yet, so they are uncalibrated.

### Stats (`viewer/stats.json`)
| metric | qu-005 | limit (longform, no voice) | |
|---|---|---|---|
| first motion | 0.0 s (a fade-in to an agenda) | ≤ 1 s | met on paper only |
| longest static stretch | 26.4 s (5:34, s13) | ≤ 5 s | **FAIL, 5x over** |
| static share of runtime | 78% (734.8 s of 943 s, 82 stills over 2 s) | n/a | |
| events per minute | 10.9 | ≥ 20 | **FAIL** |
| same component in a row | 2 | ≤ 2 | ok |
| pattern interrupt | a chapter hook card about every 2:15 | every 30 s | **FAIL** |
| voice track | none (narration is written for all 42 scenes) | n/a | |

Ten longest stills: 26.4 s s13 interview tip (5:34), 22.2 s s05 keys grid (2:33), 21.4 s and 20.0 s
s02 events table (0:56, 1:16), 20.4 s and 19.0 s s11 event-time table (4:30, 4:49), 20.2 s s04
partition grid (2:01), 14.8 s and 13.6 s s01 (0:26, 0:40), 14.0 s s37 (14:08).

### What we actually see
- **0:00-0:25:** an empty blue grid, then a six-item numbered agenda whose dots turn yellow one by
  one for 25 s. The storyboarded "one click dot travels through six boxes and becomes a dashboard
  number" is not in the render. This is a table of contents, not a hook.
- **0:25-1:38:** the intro takes 73 s. One 3-row table where a yellow label swaps between
  `event_time` and `ingest_time`, then the 9-row table that holds for 20 s at a time.
- **Every chapter has the same shape:** big centred hook card (8-13 s), 2-4 explanation scenes,
  an interview Comparison or Callout, then a green "TAKEAWAY" Callout. Six chapters in a row with
  the same shape and the same navy, yellow and green look. By chapter 3 the viewer can predict the next card.
- **Takeaways repeat the line right before them:** s07 ends "Order is per partition, not per
  topic", then s08 holds "Order lives in the partition" for 11 s. s19's footer, then s20, do the
  same. That adds about 50 s of the same idea said twice.
- **Interview questions show the answer up front:** s07's subtitle reads "Q: How do you keep a
  user's events in order? / A: key by user_id" in the same frame as the question. There is
  nothing to guess.
- **Storyboarded motion missing from the render:** s00 (click dot to dashboard), s03 ("topic"
  struck through and replaced by "partition"), s13 (question bubble pointing at batch and
  streaming cards). The render shows a single static Callout for 26 s.
- **What's good, and worth keeping:** the SQL scenes are real and readable at 1080p (7:35 watermark
  arithmetic, 10:00 ON CONFLICT retry), the one-table story (9 rows, 8 events, event 3 twice,
  event 6 late) is a strong spine, and "Your dashboard says 4 clicks. There were 3." (11:01) is the
  best line in the video. It's buried at the 70% mark.
- **Sound:** the drift bed was chosen to sit under a narration that doesn't exist. On its own
  it's a 60 BPM drone with a bell every few seconds. It makes the stills feel even longer.

### Fresher (0 yrs)
- **First 1.5 s:** a blank grid, then "Every click becomes a dashboard number" over a six-item list.
  They stay a few seconds because they clicked a "system design interview" title and the list
  promises Kafka and watermarks. **Stop: yes, weakly.** The list is homework, not a question.
- **Boredom map:**
  - `0:03 s00: the agenda ticks 1→6 for 22 s; I can read it in 4 s and then just wait`
  - `0:26 s01: three rows, one yellow label flips; 15 s with nothing new`
  - `0:56 s02: the 9-row table sits for 20 s, then another 21 s; too dense to read without someone telling me what to look at`
  - `1:16 s02: drop-off. 1:16 into a "pipeline" video and I'm still looking at a table`
  - (if still here) `2:01 s04: six letter boxes A-F in three columns, frozen for 20 s; I don't know what a broker is and nothing says`
  - `2:33 s05: same grid with different labels for 22 s`
- **Hooked moments:** 3:00 s06, where dots flow from partitions to consumers. It's the first thing
  that moves like a system. 1:39 "Kafka doesn't order your topic." is a good line, but it's a static
  card.
- **After:** finish no (gone by about 1:20, at the latest 2:30); save no; share no; follow no.
  Nothing so far made me think I'd come back.
- **Scores:** hook 4, pacing 2, novelty 4, clarity 5, payoff 5, shareability 2, overall 3.

### Working DE (3-5 yrs)
- **First 1.5 s:** an agenda: Kafka partitions, batch or streaming, watermarks, idempotency,
  medallion, pruning. "I've watched this exact list ten times." **Stop: no.** No contradiction,
  stakes or bug in the opening frame.
- **Boredom map:**
  - `0:01 s00: the agenda is the whole pitch; nothing I don't know`
  - `0:25 s01: "Clickstream: one row per user action". Defining clickstream to me. Drop-off.`
  - (if they skip ahead with chapters) `1:39 s03→2:55 s05: per-partition ordering at 20 s a slide; I know this`
  - `3:57 s09-s14: batch vs streaming as two boxes with "Same events, different trigger"; no gotcha`
  - `5:34 s13: one Callout held 26 s; I scrub`
- **Hooked moments:** 7:13-7:55 s18, watermark arithmetic in SQL with a 10-min vs 2-min threshold
  flipping event 6 to "best effort". That's a sharper model than most videos give. 11:01 "Your
  dashboard says 4 clicks. There were 3." is the gotcha they'd have stayed for, if it opened the video.
- **After:** finish no; save no; share no; follow no. The two good moments come after they've left.
- **Scores:** hook 3, pacing 2, novelty 3, clarity 6, payoff 4, shareability 2, overall 3.

### Switcher (analyst → DE)
- **First 1.5 s:** a list of terms they half-know. "Watermarks" and "idempotent" pull them in.
  **Stop: yes,** but only to scan the list.
- **Boredom map:**
  - `0:03 s00: 22 s of the agenda highlighting itself`
  - `0:56-1:38 s02: a table I could read in 5 s holds for 43 s; I want the "why", not a table at rest`
  - `2:01-2:55 s04/s05: Kafka, which is new to me, is the most static part (20 s and 22 s stills). Exactly where I needed help, nothing moves.`
  - `4:30-5:10 s11: lag table with two long stills (19 s, 20 s)`
  - `5:34 s13: 26 s on one interview-tip card. Drop-off; I've been patient for 5 minutes.`
- **Hooked moments:** 1:16 s02's "Event 6: 17 min 40 s late" highlight (a concrete problem in a
  table I understand). 7:13 watermark SQL. 10:00 ON CONFLICT retry ("retry: all skipped"). The SQL
  scenes are their home turf, and they'd save the video for those if they ever reached them.
- **After:** finish no (gone around 5:30); save maybe, for the SQL, but they won't get there;
  share no; follow no.
- **Scores:** hook 5, pacing 3, novelty 5, clarity 6, payoff 6, shareability 3, overall 4.

### Panel scores
| | hook | pacing | novelty | clarity | payoff | share | overall | finish |
|---|---|---|---|---|---|---|---|---|
| Fresher | 4 | 2 | 4 | 5 | 5 | 2 | 3 | no |
| Working DE | 3 | 2 | 3 | 6 | 4 | 2 | 3 | no |
| Switcher | 5 | 3 | 5 | 6 | 6 | 3 | 4 | no |
| **mean** | **4.0** | **2.3** | **4.0** | **5.7** | **5.0** | **2.3** | **3.3** | **0/3** |

### Compared with our last pieces
This is our first longform, so the format itself doesn't repeat qu-002, qu-003 or qu-004. The
visual grammar does: the chapter hook cards are the same centred TitleCard the reels open on,
and the content is a run of DataTable, PartitionGrid and FlowGraph scenes. Inside the video, the
same six-step chapter template repeats six times, and the recap reuses the cold-open agenda. That
internal repetition is the "bland" Dew is reacting to. There is no voice, no human, no changes in
camera or framing, and no pause to guess, so for 15 minutes nothing breaks the rhythm.

### Top 5 fixes
| fix | where | why it loses viewers | owner |
|---|---|---|---|
| Add the voice track from the existing `script.md` narration, then rebalance the bed (louder and with more motion if there's still no voice, ducked under it if there is). | whole video | The narration holds the "why" and the personality ("half of this video depends on the gap between them"). The screen only shows fragments. With no voice, a 15-min video plays as a silent slideshow over a drone. | creative-director (decision), animator (VO track in the render), composer (re-level) |
| Restructure the opening around the stakes: open on the 9-row table and "Your dashboard says 4 clicks. There were 3." Each chapter then fixes one defect in that table. Cut the agenda cold open and squeeze the 73 s intro to about 20 s. | 0:00-1:38, and 11:01 moves to the front | The opening is a table of contents (banned opener pattern), and the best hook in the video sits at 70%. The DE drops at 0:25 and the fresher at 1:16. | creative-director (structure), scriptwriter (lines) |
| Kill the held stills: something new on screen every ≤ 5 s (≤ 10 s with voice): row highlights stepping, counters, a cursor through the SQL. Build the storyboarded motions that are missing (s00 click-to-dashboard dot, s03 strike-through, s13 question bubble). | s13 5:34 (26 s), s05 2:33 (22 s), s02 0:56/1:16 (20/21 s), s11 4:30/4:49, s04 2:01, s01, s37 14:08 | 78% of the runtime is static. The Kafka chapter, the part newcomers most need to see move, is the most static. | visual-director (pacing/motion), animator (strike-through, travelling dot) |
| Turn each interview beat into a "pause and guess": question alone, a 3 s countdown, then the answer. Stop putting "A: …" in the question's subtitle. | s07 3:26, s13 5:33, s19 7:55, s38 14:23 | The answer is shown alongside the question, so there's no tension and no reason to wait. This is the cheapest pattern interrupt we have, and the playbook already asks for it. | scriptwriter (lines), animator (pause-and-guess capability) |
| Cut to about 9-10 min and break the identical chapter template: merge each takeaway into the scene before it when it repeats that scene's line, trim the recap from 39 s to about 12 s, merge s25/s26, and vary the chapter shapes (one race, one failure replay, one debug-this). | s08, s14, s20, s27, s34, s39; s40 recap; the template across all 6 chapters | Six chapters with the same hook → explain → interview → green takeaway shape. By chapter 3 the viewer predicts every card, and about 50 s just repeats the previous line. | creative-director (angle/structure), visual-director (layout variety) |

### Verdict
FAIL on every gate. Hook scores are 4, 3 and 5 (all below 7), mean overall is 3.3 and 0 of 3
personas would finish. Every pacing limit fails: longest still 26.4 s vs 5 s, 10.9 events/min vs
20, and a pattern interrupt about every 2:15 vs 30 s. The facts and the SQL are solid. The problem
is packaging and delivery. As released it's a voiceless 15-minute slideshow that opens with an
agenda and saves its best line for minute 11.

VIEWER: FAIL

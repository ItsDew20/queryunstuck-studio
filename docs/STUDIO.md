# QueryUnstuck Studio: who does what

One page for how a piece goes from an idea to a post that people actually watch. Rules live in
`CLAUDE.md`; agents live in `.claude/agents/`. Dew approves everything by merging the PR.

## The team (17 agents + Dew)
| desk | agent | job | gate it owns |
|---|---|---|---|
| **Ideas** | trend-scout | What people are asking now, with dated sources | |
| | content-strategist | Weekly calendar: topics, formats, series, slots | |
| | community-manager | Reply drafts; viewer questions → topics | |
| **Story** | creative-director | The surprise, angle, hooks, beat map, signature visual; storyboard audit; weekly freshness review | `creative.md` |
| | researcher | Sourced brief | `sources[]` |
| | scriptwriter | Beat-by-beat script, on-screen text, code | |
| | fact-checker | Every claim sourced, every snippet run | `VERDICT: PASS` |
| **Picture & sound** | visual-director | Components, props, pacing | |
| | animator | New components and capabilities | |
| | composer | Original music bed, level, beat sync | |
| | renderer | Video, captions, upload | |
| | qa-reviewer | Frame-by-frame correctness | `QA: PASS` |
| **Audience** | audience-panel | Three simulated viewers: hook, boredom map, would finish/save/share | `VIEWER: PASS` (preview + final) |
| | packaging-designer | Thumbnail + title as one honest promise; reel covers | |
| | copywriter | Captions, YouTube title/description/chapters | |
| **Ship & learn** | publisher | Posts approved pieces on schedule | merged PR |
| | analyst | Real metrics, weekly learnings, panel calibration | |
| | (orchestrator) | Routes work and review comments, opens PRs | |

## The flow
```
trend-scout ─┐
community ───┼─> content-strategist ─> researcher ─> CREATIVE-DIRECTOR (concept)
analyst ─────┘                                          │
        scriptwriter ─> fact-checker ─> visual-director ─> creative-director (audit)
                                                          │
                       AUDIENCE-PANEL (preview, stills) ──┤ FAIL → fixes, max 2 loops
                                                          ▼
                        composer ─> renderer ─> qa-reviewer
                                                          │
                       AUDIENCE-PANEL (final watch) ──────┤ FAIL → fixes, max 2 loops
                                                          ▼
             packaging-designer + copywriter ─> PR ─> Dew merges ─> publisher
                                                          │
                                   analyst + community-manager ─> back to the top
```

## Why two viewer checks
The preview runs on stills and the timeline before rendering, so a boring structure is fixed for
minutes of work, not a 30-minute re-render. The final watch confirms the real video holds attention.

## Tools the studio uses
- `scripts/engagement_stats.py`: pacing numbers (static stretches, event gaps, text load, voice).
- `video/scripts/stills.mjs`: preview frames; `video/scripts/thumbnail.mjs`: thumbnail and cover options.
- `docs/creative-playbook.md`: pacing limits, hooks, angles, series, stale patterns.
- `docs/growth-playbook.md`: sourced platform guidance.

## Honest limits
- The audience panel is a simulation. It catches slow, repetitive and unclear pieces well; it
  cannot predict virality. Real retention (analyst) is what we tune to.
- Nothing ships without Dew's merged PR (CLAUDE.md non-negotiable 2).

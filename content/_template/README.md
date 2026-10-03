# Piece folder layout (created by agents, stage by stage)

| File | Created by | Required from status |
|---|---|---|
| spec.json | content-strategist | idea |
| research.md | researcher | researched |
| script.md | scriptwriter | scripted |
| factcheck.md (ends `VERDICT: PASS`) | fact-checker | fact-checked |
| (scenes[].component set in spec.json) | visual-director | storyboarded |
| render.reel_url / render.longform_url in spec.json | renderer | rendered |
| qa.md (ends `QA: PASS`) | qa-reviewer | qa-passed |
| caption.md | copywriter | copy-ready |
| youtube.md (longform/short, or reels cross-posted as Shorts) | copywriter | copy-ready |

Folder name: `<id>-<slug>`, e.g. `qu-001-sql-execution-order`.

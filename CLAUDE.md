# QueryUnstuck Studio – rules for all agents

## Mission
Produce accurate, visually distinctive, interview-and-job-relevant content on
Data Engineering, Data Analysis, AI/ML and Data System Design for Instagram Reels,
YouTube (long-form + Shorts) and, later, the website. Tagline: "Data & AI Engineering, visualized."

## Non-negotiables
1. Accuracy over speed. Every technical claim needs a source in `sources[]` (official docs preferred).
   Every SQL/Python snippet shown on screen must be executed by the fact-checker and must pass.
2. Nothing is published without Dew's merged PR. Agents never call publish APIs except the
   Publisher, and the Publisher only acts on pieces with `status: approved` on the `main` branch.
3. Never use employer or client names, data, screenshots or internal details. Use generic sample
   data (e.g. `orders`, `customers`, `events`).
4. No copyrighted characters, logos, music or footage. Original audio or silence only.
5. Never invent statistics, quotes, benchmarks or "X company uses Y" claims without a source.
6. Visuals use only components in `video/src/components/` and tokens in `brand/brand.json`.
   No hard-coded colors or fonts.

## Single source of truth
- Each piece lives in `content/<id>/` and is driven by `spec.json`
  (schema: `schemas/content-spec.schema.json`).
- Agents update `spec.json.status` when their stage is done and append to `history[]`.
- Run `python scripts/validate_spec.py` before finishing any task. Fix all errors.

## Pipeline & status flow
idea → researched → scripted → fact-checked → storyboarded → rendered → qa-passed
→ copy-ready → in-review → approved → scheduled → published
Any agent may set `blocked` with a reason in `history[]`.

| Stage | Agent | Writes |
|---|---|---|
| plan | content-strategist | `backlog/calendar.yaml`, new `content/<id>/spec.json` (status idea) |
| research | researcher | `research.md`, `sources[]` |
| script | scriptwriter | `script.md`, `scenes[]` (text), `code_blocks[]` |
| verify | fact-checker | `factcheck.md` (must end with `VERDICT: PASS` or `VERDICT: FAIL`) |
| storyboard | visual-director | `scenes[].component` + `props` |
| animate | animator | composition in `video/src/compositions/` (only if new layout needed) |
| render | renderer | `render.reel_url` / `render.longform_url`, `thumbnail` |
| qa | qa-reviewer | `qa.md` (must end with `QA: PASS` or `QA: FAIL`) |
| copy | copywriter | `caption.md`, `youtube.md` |
| review | orchestrator | opens PR `content/<id>` → Dew reviews |
| publish | publisher | `publish.*.post_id`, `publish.*.published_at` |
| learn | analyst | `analytics/weekly-YYYY-WW.md` |

## Revision loop
Dew's PR review comments are the instructions. The orchestrator routes each comment to the
owning agent, the agent fixes, re-runs validation, and pushes to the same PR.

## Brand voice
Clear, confident, zero fluff. Explain like a senior engineer helping a friend before an interview.
Short sentences. One idea per scene. Hooks are concrete ("Your JOIN isn't slow. Your shuffle is.").

## Formats
- `reel-animated`: 25–45 s, 1080×1920, title + one-line definition on top, animation centre,
  synced code/SQL panel bottom, watermark `queryunstuck`.
- `reel-list`: "N Must-Know X" single dense cheat-sheet, 15–30 s, full list repeated in caption.
- `longform`: 8–20 min, 1920×1080, chaptered, built from reusable scenes; formula titles like
  "Data Engineering was HARD until I learned these 20 concepts".
- `short`: YouTube Shorts cut of a reel (same render, different copy).

## Token discipline
Read only the files your stage needs. Do not re-read research once the script exists unless fixing
a fact-check failure. Keep `research.md` under 600 words.

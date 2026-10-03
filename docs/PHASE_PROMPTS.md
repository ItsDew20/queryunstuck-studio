# Copy-paste prompts for Claude Code (run one phase per session; stop at each checkpoint)

---
## Phase 1 – Video engine
```
Read CLAUDE.md, brand/brand.json and schemas/content-spec.schema.json.
Create a Remotion (TypeScript) project in /video. Requirements:
1. Load Montserrat and JetBrains Mono locally (@remotion/google-fonts). All colours/fonts from brand/brand.json.
2. Build these generic components in video/src/components/, each a pure function of props + frame:
   TitleCard, ListCard, CodePanel (syntax highlight + active-line highlight driven by props),
   DataTable, RowHighlight, JoinMatcher (two tables, animated row matching with match/noMatch colours),
   WindowFrame (sliding window over ordered rows), FlowGraph (nodes/edges with travelling dots),
   PartitionGrid (rows moving between partitions), Comparison (two columns), Timeline, Callout, EndCard.
3. Compositions: FromSpec (1080x1920@30) and FromSpecLandscape (1920x1080@30) that take a spec.json
   as input props and play scenes in order using scene.duration_sec; persistent watermark top-right;
   respect brand.layout zones and safe areas.
4. Document every component's props in video/src/components/README.md.
5. Add a demo spec video/src/demos/demo-sql-order.json using TitleCard, DataTable, RowHighlight,
   CodePanel, EndCard, and an npm script `render:demo`.
6. Validate: `npx tsc --noEmit`, then render the demo to out/demo.mp4 and 5 stills; show me the stills.
Do not build agents or publishing yet.
```
**Checkpoint:** you watch out/demo.mp4 and approve the look (or ask for style changes now – it's cheapest here).

---
## Phase 2 – Content agents
```
Read CLAUDE.md. Using /plan-week, have the content-strategist create 5 idea pieces
(include the existing qu-001). Then, for each piece, run researcher → scriptwriter → fact-checker
via the subagents (stop at fact-checked; do not storyboard). The fact-checker must use
scripts/run_snippet.py --write. Loop failures back to the scriptwriter at most twice.
Run scripts/validate_spec.py at the end and give me a table: id, title, verdict, issues found.
```
**Checkpoint:** read the 5 `script.md` + `factcheck.md`. Note anything wrong and add the lesson to CLAUDE.md.

---
## Phase 3 – Visual agents + media
```
Read CLAUDE.md. Write scripts/upload_media.py (Cloudflare R2 via S3 API using boto3; reads R2_* from
.env; returns public URL; add boto3 to requirements). Then for 3 fact-checked pieces run
visual-director → (animator only if needs_new_component) → renderer → qa-reviewer, looping QA
failures at most twice. Show me QA stills and the render URLs. Validate with scripts/validate_spec.py.
```
**Checkpoint:** 3 reels made with zero manual editing.

---
## Phase 4 – Copy + PR review loop
```
Run the copywriter on the qa-passed pieces, then follow .claude/commands/run-pipeline.md to open
one PR per piece (branch content/<id>). Include the render link, caption, YouTube copy, fact-check
and QA summaries in the PR body. Then wait: I will comment on a PR; when I say "revisions", run
/run-pipeline revisions.
```
**Checkpoint:** you comment on a PR, the fix lands on the same PR, you merge, and the
`approve-on-merge` Action sets status `approved`.

---
## Phase 5 – Publishers
```
Write scripts/publish_instagram.py and scripts/publish_youtube.py exactly as described in
.claude/agents/publisher.md, using env vars from .env.example and the CURRENT official Meta
Instagram content publishing docs (Reels container -> poll status -> media_publish) and YouTube
Data API v3 videos.insert (resumable upload, OAuth refresh token). Both must be idempotent
(skip if post_id exists), honour DRY_RUN, and write results back to spec.json.
Add .github/workflows/publish.yml: cron every 30 min, runs on main, finds pieces with
status approved/scheduled and scheduled_for <= now, runs the publishers, commits results.
Test with DRY_RUN=true and show me the payloads. Do NOT run live.
```
**Checkpoint:** you review dry-run payloads, set `DRY_RUN=false` in GitHub secrets yourself, and watch the first live post.

---
## Phase 6 – Automation + analytics
```
Write scripts/fetch_metrics.py (Instagram media insights + YouTube Analytics/Data API; append to
analytics/metrics.csv). Add GitHub Actions:
- weekly-plan.yml (Mon 09:00 IST): runs Claude Code headless with /plan-week then /run-pipeline,
  using the official anthropics/claude-code-action (check its current inputs in its README) and
  ANTHROPIC_API_KEY.
- pipeline.yml (daily 06:00 IST): /run-pipeline, then /run-pipeline revisions.
- weekly-report.yml (Sun 20:00 IST): /weekly-report, commit the report.
Cap each job's max turns and timeout. Show me the workflows before enabling them.
```
**Checkpoint:** one full unattended week: PRs appear, you only review/merge.

---
## Phase 7 (later) – Website
Concept library pages generated from each published spec (Astro/Next.js static site), newsletter, and interactive SQL playground (DuckDB-WASM).

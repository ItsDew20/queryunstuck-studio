# SETUP – steps Dew performs (in order)

Tick each box. Steps marked (verify) depend on platform rules that may have changed – check the
official docs at that step.

## A. Accounts & handles (Day 1, ~1 hr)
- [ ] A1. Check/claim `@queryunstuck` on Instagram (or closest available). Switch it to a
      **Professional account → Creator** (Settings → Account type and tools).
- [ ] A2. Create a **Facebook Page** for QueryUnstuck and link the Instagram account to it
      (required for API publishing). (verify)
- [ ] A3. Confirm your YouTube channel name/handle matches; set the channel profile/banner from your
      existing brand kit.
- [ ] A4. Decide the website domain later (Phase 7); leave `links` as TBD in `brand/brand.json`.

## B. Repo (Day 1, ~20 min)
- [ ] B1. Create a **private** GitHub repo `queryunstuck-studio`; unzip this folder into it; commit; push.
- [ ] B2. In `brand/brand.json` replace the placeholder hex colours with your exact brand hexes.
- [ ] B3. Settings → Rules → add a ruleset for `main`: require PR + the `validate-content` check, and add **GitHub Actions** to the bypass list (the approve and publish workflows commit status updates to main).
- [ ] B4. Settings → Actions → General → Workflow permissions: "Read and write".
- [ ] B5. Install GitHub CLI locally and run `gh auth login`.

## C. Local machine (MacBook, ~30 min)
- [ ] C1. Install Node.js LTS, Python 3.12, ffmpeg (`brew install node python@3.12 ffmpeg`).
- [ ] C2. `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- [ ] C3. `python scripts/validate_spec.py` → should print `1 piece(s) checked, 0 error(s)`.
- [ ] C4. Install Claude Code, open the repo folder, run `claude`, then `/agents` – confirm the 11
      agents appear – and type `/` to confirm `/run-pipeline`, `/plan-week`, `/weekly-report`.
- [ ] C5. Copy `.env.example` → `.env` and add `ANTHROPIC_API_KEY` (only needed for unattended
      runs; interactive Claude Code uses your login).

## D. Build phases with Claude Code (one at a time – see docs/PHASE_PROMPTS.md)
- [ ] Phase 1 – Remotion video engine + 8 components → checkpoint: test reel renders.
- [ ] Phase 2 – Content agents on 5 pieces → checkpoint: 5 scripts pass fact-check.
- [ ] Phase 3 – Visual agents + media upload → checkpoint: 3 reels end-to-end, no manual edits.
- [ ] Phase 4 – Copy + PR review loop → checkpoint: 1 piece reviewed & revised via PR comments.
- [ ] Phase 5 – Publishers (dry run → live) → checkpoint: first automatic posts.
- [ ] Phase 6 – Scheduled automation + analytics → checkpoint: first weekly report changes the plan.

## E. Credentials needed before Phase 3 / 5
- [ ] E1. **Cloudflare R2** (or S3) bucket with public read for rendered videos → fill `R2_*` in `.env`.
- [ ] E2. **Meta developer app** (developers.facebook.com): add Instagram API product, permissions
      for content publishing (e.g. `instagram_content_publish` / `instagram_business_content_publish`
      depending on login type – verify), generate a **long-lived token**, note your IG user id →
      `IG_USER_ID`, `IG_ACCESS_TOKEN`, `META_GRAPH_VERSION`. Tokens expire – put a calendar reminder.
- [ ] E3. **YouTube**: in your existing Google Cloud project enable YouTube Data API v3, OAuth client
      (Desktop), get a refresh token for the channel → `YT_*`. (verify) Uploads from an unaudited
      API project may be forced to private – apply for the API compliance audit early, or keep
      YouTube uploads as `private` and flip to public manually until approved.
- [ ] E4. Add every `.env` value as a **GitHub Actions secret** (Settings → Secrets → Actions).

## F. Weekly routine once live (~1–2 hrs/week)
1. Monday: `/plan-week` (or the scheduled Action) → glance at the calendar.
2. During the week: `/run-pipeline` produces PRs → review each PR: watch the render, read caption,
   check fact-check table. Comment to request changes; **merge to approve**.
3. Publisher posts approved pieces at their scheduled time.
4. Sunday: `/weekly-report` → read the 3–5 learnings.

## Cost control
- Agents use `model:` per file (opus for strategy/script/fact-check, sonnet for most, haiku for
  render/publish). Downgrade if spend is high.
- Run Phase 2 on 5 pieces and note the token cost per piece before scaling.

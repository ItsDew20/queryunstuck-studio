# QueryUnstuck Studio

Agent-driven content pipeline for QueryUnstuck (Instagram Reels, YouTube, later website).
Pillars: Data Engineering · Data Analysis · AI/ML · Data System Design.

- `SETUP.md` – one-time steps you (Dew) perform.
- `docs/PHASE_PROMPTS.md` – copy-paste prompts for Claude Code, one phase at a time.
- `CLAUDE.md` – rules every agent follows.
- `.claude/agents/` – the 12 specialist agents.
- `schemas/content-spec.schema.json` – the contract every content piece follows.
- `content/<id>/` – one folder per piece. `content/_template/` shows the files.
- `scripts/validate_spec.py` – validates every piece (runs in CI on each PR).

Nothing is published without a merged PR from Dew.

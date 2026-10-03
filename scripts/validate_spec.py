#!/usr/bin/env python3
"""Validate QueryUnstuck content pieces.

Usage:
  python scripts/validate_spec.py                 # all pieces
  python scripts/validate_spec.py content/qu-001-sql-execution-order
Exit code 1 if any error.
"""
import json
import re
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = json.loads((ROOT / "schemas" / "content-spec.schema.json").read_text())
VALIDATOR = Draft202012Validator(SCHEMA)

ORDER = ["idea", "researched", "scripted", "fact-checked", "storyboarded", "rendered",
         "qa-passed", "copy-ready", "in-review", "approved", "scheduled", "published"]

DURATION = {"reel-animated": (20, 60), "reel-list": (10, 45), "short": (10, 60), "longform": (300, 1500)}


def at_least(status: str, stage: str) -> bool:
    if status == "blocked":
        return False
    return ORDER.index(status) >= ORDER.index(stage)


def last_line(path: Path) -> str:
    lines = [l.strip() for l in path.read_text(encoding="utf-8").splitlines() if l.strip()]
    return lines[-1] if lines else ""


def check_piece(folder: Path) -> list[str]:
    errs: list[str] = []
    spec_path = folder / "spec.json"
    if not spec_path.exists():
        return [f"{folder}: missing spec.json"]
    try:
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"{spec_path}: invalid JSON ({e})"]

    for e in sorted(VALIDATOR.iter_errors(spec), key=lambda e: list(e.path)):
        loc = "/".join(str(p) for p in e.path) or "<root>"
        errs.append(f"{spec_path}: {loc}: {e.message}")
    if errs:
        return errs  # structural errors first

    sid, status, fmt = spec["id"], spec["status"], spec["format"]
    expected_name = f"{sid}-{spec['slug']}"
    if folder.name != expected_name:
        errs.append(f"{folder}: folder name should be '{expected_name}'")

    def need(fname: str, stage: str):
        if at_least(status, stage) and not (folder / fname).exists():
            errs.append(f"{folder}: status '{status}' requires {fname}")

    need("research.md", "researched")
    need("script.md", "scripted")
    need("factcheck.md", "fact-checked")
    need("qa.md", "qa-passed")
    need("caption.md", "copy-ready")
    if fmt in ("longform", "short"):
        need("youtube.md", "copy-ready")

    if at_least(status, "researched") and not spec.get("sources"):
        errs.append(f"{spec_path}: status '{status}' requires at least one source")

    if at_least(status, "scripted"):
        scenes = spec.get("scenes") or []
        if not scenes:
            errs.append(f"{spec_path}: scripted pieces need scenes[]")
        else:
            total = sum(s["duration_sec"] for s in scenes)
            lo, hi = DURATION[fmt]
            if not lo <= total <= hi:
                errs.append(f"{spec_path}: total scene duration {total}s outside {lo}-{hi}s for {fmt}")
            n_code = len(spec.get("code_blocks") or [])
            for s in scenes:
                cb = s.get("code_block")
                if cb is not None and cb >= n_code:
                    errs.append(f"{spec_path}: scene {s['id']} references missing code_block {cb}")
            ids = [s["id"] for s in scenes]
            if len(ids) != len(set(ids)):
                errs.append(f"{spec_path}: duplicate scene ids")

    if at_least(status, "fact-checked"):
        fc = folder / "factcheck.md"
        if fc.exists() and last_line(fc) != "VERDICT: PASS":
            errs.append(f"{fc}: last line must be 'VERDICT: PASS' for status '{status}'")
        for i, cb in enumerate(spec.get("code_blocks") or []):
            if cb["lang"] in ("sql", "python") and not cb.get("verified") and not cb.get("needs_manual_check"):
                errs.append(f"{spec_path}: code_blocks[{i}] not verified")

    if at_least(status, "storyboarded"):
        for s in spec.get("scenes") or []:
            if "component" not in s:
                errs.append(f"{spec_path}: scene {s['id']} has no component")

    if at_least(status, "rendered"):
        r = spec.get("render") or {}
        key = "longform_url" if fmt == "longform" else "reel_url"
        if not r.get(key):
            errs.append(f"{spec_path}: status '{status}' requires render.{key}")

    if at_least(status, "qa-passed"):
        qa = folder / "qa.md"
        if qa.exists() and last_line(qa) != "QA: PASS":
            errs.append(f"{qa}: last line must be 'QA: PASS' for status '{status}'")

    if at_least(status, "copy-ready"):
        cap = folder / "caption.md"
        if cap.exists():
            text = cap.read_text(encoding="utf-8")
            if len(text) > 2200:
                errs.append(f"{cap}: {len(text)} chars (Instagram limit 2200)")
            tags = re.findall(r"(?<!\w)#\w+", text)
            if "#queryunstuck" not in [t.lower() for t in tags]:
                errs.append(f"{cap}: missing #queryunstuck")
            if len(tags) > 6:
                errs.append(f"{cap}: {len(tags)} hashtags (max 6)")

    if status == "published":
        pub = spec.get("publish") or {}
        if not any(p.get("post_id") for p in pub.values()):
            errs.append(f"{spec_path}: published but no post_id recorded")

    hist = spec.get("history") or []
    if not hist:
        errs.append(f"{spec_path}: history[] is empty")
    return errs


def main(argv: list[str]) -> int:
    if len(argv) > 1:
        folders = [Path(a).resolve() for a in argv[1:]]
    else:
        folders = sorted(p for p in (ROOT / "content").iterdir()
                         if p.is_dir() and not p.name.startswith("_"))
    all_errs: list[str] = []
    ids: dict[str, Path] = {}
    for f in folders:
        all_errs += check_piece(f)
        sp = f / "spec.json"
        if sp.exists():
            try:
                sid = json.loads(sp.read_text(encoding="utf-8")).get("id")
                if sid in ids:
                    all_errs.append(f"duplicate id {sid}: {ids[sid]} and {f}")
                ids[sid] = f
            except json.JSONDecodeError:
                pass
    for e in all_errs:
        print("ERROR", e)
    print(f"{len(folders)} piece(s) checked, {len(all_errs)} error(s)")
    return 1 if all_errs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))

#!/usr/bin/env python3
"""Execute code_blocks of a piece and report results (used by the fact-checker).

Usage: python scripts/run_snippet.py content/<id>-<slug> [--write]
  SQL    -> runs `setup` then `code` in an in-memory DuckDB, prints the result table.
  Python -> runs setup + code in a subprocess (30 s timeout), prints stdout/stderr.
  --write sets code_blocks[i].verified = True when the run succeeds AND the output matches
          expected_output (whitespace-insensitive), else False.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import duckdb


def norm(s: str) -> str:
    return " ".join((s or "").split())


def run_sql(setup: str, code: str) -> tuple[bool, str]:
    con = duckdb.connect(":memory:")
    try:
        if setup:
            con.execute(setup)
        rel = con.sql(code)
        if rel is None:
            return True, ""
        cols = rel.columns
        rows = rel.fetchall()
        out = [" | ".join(cols)] + [" | ".join("NULL" if v is None else str(v) for v in r) for r in rows]
        return True, "\n".join(out)
    except Exception as e:  # noqa: BLE001
        return False, f"{type(e).__name__}: {e}"
    finally:
        con.close()


def run_py(setup: str, code: str) -> tuple[bool, str]:
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as f:
        f.write((setup or "") + "\n" + code)
        path = f.name
    try:
        p = subprocess.run([sys.executable, path], capture_output=True, text=True, timeout=30)
        return p.returncode == 0, (p.stdout + p.stderr).strip()
    except subprocess.TimeoutExpired:
        return False, "Timeout after 30s"


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    folder = Path(sys.argv[1])
    write = "--write" in sys.argv
    spec_path = folder / "spec.json"
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    failed = 0
    for i, cb in enumerate(spec.get("code_blocks") or []):
        lang = cb["lang"]
        if lang == "sql":
            ok, out = run_sql(cb.get("setup", ""), cb["code"])
        elif lang == "python":
            ok, out = run_py(cb.get("setup", ""), cb["code"])
        else:
            print(f"[{i}] {lang}: not executable here -> needs manual check")
            if write:
                cb["needs_manual_check"] = True
            continue
        matches = ok and ("expected_output" not in cb or norm(out) == norm(cb["expected_output"]))
        print(f"[{i}] {lang}: {'OK' if ok else 'ERROR'}; matches expected: {matches}\n{out}\n")
        if not matches:
            failed += 1
        if write:
            cb["verified"] = bool(matches)
    if write:
        spec_path.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

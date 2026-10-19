#!/usr/bin/env python3
"""Write content/<id>/captions.srt from a spec's on-screen text and its real timeline.

Every on_screen_text line of every scene appears, in order, inside that scene's own time window
(scenes may be beat-aligned or auto-stretched, so times come from the video timeline tool).
Each cue has at most 2 lines and lasts at least MIN_CUE seconds; a scene's window is shared
equally between its cues. If a scene is too short to fit its lines under these rules the script
fails instead of dropping text. The result is re-read and verified before writing.

Usage: python scripts/make_captions.py content/<id>-<slug>
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MIN_CUE = 1.0
MAX_LINES = 2


def ts(sec: float) -> str:
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    folder = Path(sys.argv[1]).resolve()
    spec = json.loads((folder / "spec.json").read_text(encoding="utf-8"))
    tl = json.loads(
        subprocess.check_output(
            ["npm", "run", "-s", "timeline", "--", str(folder / "spec.json"), "--json"], cwd=ROOT / "video", text=True
        )
    )
    by_id = {s["id"]: s for s in tl["scenes"]}
    cues: list[tuple[float, float, list[str]]] = []
    for scene in spec.get("scenes", []):
        lines = [l for l in scene.get("on_screen_text", []) if l.strip()]
        if not lines:
            continue
        t = by_id[scene["id"]]
        start, end = t["start_sec"], t["end_sec"]
        chunks = [lines[i : i + MAX_LINES] for i in range(0, len(lines), MAX_LINES)]
        span = (end - start) / len(chunks)
        if span < MIN_CUE:
            print(f"error: scene {scene['id']} ({end - start:.2f}s) can't show {len(lines)} lines "
                  f"as cues of >= {MIN_CUE}s with <= {MAX_LINES} lines each", file=sys.stderr)
            return 1
        for k, chunk in enumerate(chunks):
            cues.append((start + k * span, start + (k + 1) * span, chunk))

    # Verify before writing: completeness, order, windows, durations, overlaps.
    flat = [l for _, _, c in cues for l in c]
    expected = [l for s in spec.get("scenes", []) for l in s.get("on_screen_text", []) if l.strip()]
    assert flat == expected, "caption text does not match on_screen_text"
    for i, (a, b, c) in enumerate(cues):
        assert b - a >= MIN_CUE - 1e-6 and len(c) <= MAX_LINES
        if i:
            assert a >= cues[i - 1][1] - 1e-6, "overlap"

    out = "\n".join(f"{i}\n{ts(a)} --> {ts(b)}\n" + "\n".join(c) + "\n" for i, (a, b, c) in enumerate(cues, start=1))
    (folder / "captions.srt").write_text(out, encoding="utf-8")
    shortest = min(b - a for a, b, _ in cues)
    print(f"{folder.name}/captions.srt: {len(cues)} cues, {len(flat)}/{len(expected)} lines, shortest {shortest:.2f}s, verified")
    return 0


if __name__ == "__main__":
    sys.exit(main())

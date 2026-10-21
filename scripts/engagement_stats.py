#!/usr/bin/env python3
"""Objective pacing numbers for the audience panel and creative director.

  .venv/bin/python scripts/engagement_stats.py content/<id>-<slug>             # storyboard only
  .venv/bin/python scripts/engagement_stats.py content/<id>-<slug> --video F   # plus a real render

Storyboard mode uses the real timeline: scene lengths and the sound-cue list (every cue marks a
visible action), so "longest gap between events" is known before rendering.
Video mode also decodes the render at 5 fps and measures real on-screen motion: a frame "moves" when
enough pixels change, and runs of non-moving frames are the static stretches a viewer sits through.
Writes content/<id>/viewer/stats.json and prints a summary. Numbers only; judging is the agent's job.
"""
import argparse
import json
import statistics
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FPS = 5
W, H = 192, 108
PIX_DIFF = 14  # 0-255 grey levels: a pixel counts as changed above this
MIN_CHANGED = 6  # changed pixels for the frame to count as moving (a small dot moving counts)
STATIC_REPORT_SEC = 2.0


def timeline(spec_path: Path, landscape: bool) -> dict:
    args = ["npm", "run", "-s", "timeline", "--", str(spec_path), "--json"] + (["--landscape"] if landscape else [])
    return json.loads(subprocess.check_output(args, cwd=ROOT / "video", text=True))


def scene_at(tl: dict, sec: float) -> str:
    for s in tl["scenes"]:
        if s["start_sec"] <= sec < s["end_sec"]:
            return s["id"]
    return tl["scenes"][-1]["id"]


def mmss(sec: float) -> str:
    return f"{int(sec // 60)}:{sec % 60:04.1f}"


def motion(video: Path) -> np.ndarray:
    raw = subprocess.check_output(
        ["ffmpeg", "-loglevel", "error", "-i", str(video), "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"]
    )
    frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W).astype(np.int16)
    changed = (np.abs(np.diff(frames, axis=0)) > PIX_DIFF).sum(axis=(1, 2))
    return changed >= MIN_CHANGED  # moving[i]: between frame i and i+1


def runs(mask: np.ndarray) -> list[tuple[int, int]]:
    out, start = [], None
    for i, m in enumerate(list(mask) + [True]):
        if not m and start is None:
            start = i
        elif m and start is not None:
            out.append((start, i))
            start = None
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("folder", type=Path)
    ap.add_argument("--video", type=Path)
    a = ap.parse_args()
    folder = a.folder.resolve()
    spec = json.loads((folder / "spec.json").read_text(encoding="utf-8"))
    landscape = spec["format"] == "longform"
    tl = timeline(folder / "spec.json", landscape)
    dur = tl["durationInFrames"] / tl["fps"]

    lengths = [s["end_sec"] - s["start_sec"] for s in tl["scenes"]]
    texts = {s["id"]: s.get("on_screen_text", []) for s in spec.get("scenes", [])}
    words = {sid: len(" ".join(t).split()) for sid, t in texts.items()}
    per_scene = []
    for s, ln in zip(tl["scenes"], lengths):
        per_scene.append(
            {
                "id": s["id"],
                "start": round(s["start_sec"], 2),
                "sec": round(ln, 2),
                "component": s.get("component"),
                "words": words.get(s["id"], 0),
                "words_per_sec": round(words.get(s["id"], 0) / ln, 2) if ln else 0,
            }
        )

    # Event gaps from the cue list (each cue = a visible action), including scene starts.
    events = sorted({0.0, dur} | {c["sec"] for c in tl["cues"]} | {s["start_sec"] for s in tl["scenes"]})
    gaps = sorted(((b - a, a) for a, b in zip(events, events[1:])), reverse=True)
    comps = [s.get("component") for s in tl["scenes"]]
    run = best = 1
    for x, y in zip(comps, comps[1:]):
        run = run + 1 if x == y else 1
        best = max(best, run)

    narration = [s for s in spec.get("scenes", []) if s.get("narration")]
    has_voice = bool(spec.get("voice", {}).get("track")) if isinstance(spec.get("voice"), dict) else False
    stats = {
        "id": spec["id"],
        "format": spec["format"],
        "duration_sec": round(dur, 2),
        "scenes": len(lengths),
        "scene_sec": {"mean": round(statistics.mean(lengths), 2), "median": round(statistics.median(lengths), 2), "max": round(max(lengths), 2)},
        "events": len(tl["cues"]),
        "events_per_min": round(len(tl["cues"]) / dur * 60, 1),
        "longest_event_gaps": [{"sec": round(g, 2), "at": mmss(t), "scene": scene_at(tl, t)} for g, t in gaps[:8]],
        "same_component_max_run": best,
        "components_used": sorted({c for c in comps if c}),
        "words_on_screen": sum(words.values()),
        "densest_scenes": sorted(per_scene, key=lambda x: -x["words_per_sec"])[:5],
        "narration_written_scenes": len(narration),
        "voice_track": has_voice,
        "per_scene": per_scene,
    }

    if a.video:
        moving = motion(a.video)
        stat = [((e - s) / FPS, s / FPS) for s, e in runs(moving)]
        long_static = sorted([x for x in stat if x[0] >= STATIC_REPORT_SEC], reverse=True)
        first = next((i / FPS for i, m in enumerate(moving) if m), None)
        stats["video"] = {
            "file": str(a.video),
            "moving_share": round(float(moving.mean()), 3),
            "first_motion_sec": first,
            "static_stretches_over_2s": len(long_static),
            "static_sec_total": round(sum(x[0] for x in long_static), 1),
            "longest_static": [{"sec": round(d, 1), "at": mmss(t), "scene": scene_at(tl, t)} for d, t in long_static[:10]],
        }

    out = folder / "viewer"
    out.mkdir(exist_ok=True)
    (out / "stats.json").write_text(json.dumps(stats, indent=2) + "\n", encoding="utf-8")

    print(f"{spec['id']} {spec['format']} {dur:.1f}s, {len(lengths)} scenes (mean {stats['scene_sec']['mean']}s, max {stats['scene_sec']['max']}s)")
    print(f"events: {stats['events']} ({stats['events_per_min']}/min); longest gaps: " + ", ".join(f"{g['sec']}s @{g['at']} {g['scene']}" for g in stats["longest_event_gaps"][:4]))
    print(f"components: {len(stats['components_used'])} kinds, max same-in-a-row {best}; words on screen {stats['words_on_screen']}")
    print(f"voice: {'yes' if has_voice else 'NONE'} (narration written for {len(narration)}/{len(lengths)} scenes)")
    if a.video:
        v = stats["video"]
        print(f"motion: moving {v['moving_share']:.0%} of the time, first motion at {v['first_motion_sec']}s, "
              f"{v['static_stretches_over_2s']} static stretches >2s totalling {v['static_sec_total']}s")
        for x in v["longest_static"][:5]:
            print(f"  static {x['sec']}s at {x['at']} ({x['scene']})")
    print(f"-> {out / 'stats.json'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

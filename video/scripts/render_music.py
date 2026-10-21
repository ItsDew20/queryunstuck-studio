#!/usr/bin/env python3
"""Render a piece's music track at exactly the video's length, with a resolving ending.

Takes the bed named in spec.music (a seamless loop from public/music/<bed>.wav), tiles it
sample-accurately (whole loops are whole bars, so the beat never shifts), and closes on a
sustained C-major chord that starts on a downbeat and rings out at the video's last frame.
Writes public/music/pieces/<piece-id>.wav (git-ignored, regenerable) and sets spec.music.track.

Usage (from video/):  ../.venv/bin/python scripts/render_music.py ../content/<id>/spec.json
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen_music as gm  # noqa: E402  (same folder: instruments, reverb, SR)

VIDEO = Path(__file__).resolve().parent.parent
MUSIC = VIDEO / "public" / "music"


def timeline(spec_path: Path) -> dict:
    out = subprocess.check_output(["npm", "run", "-s", "timeline", "--", str(spec_path), "--json"], cwd=VIDEO, text=True)
    return json.loads(out)


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path)) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").reshape(-1, w.getnchannels()) / 32768
    return x.astype(np.float64)


def ending(bpm: float, seconds: float, rng: np.random.Generator) -> np.ndarray:
    """A soft C-major resolution (pad + low root + a gentle top note), `seconds` long, stereo."""
    n = int(seconds * gm.SR)
    buf = np.zeros((n, 2))
    for m, g, pan in ((48, 0.05, 0.0), (55, 0.06, -0.3), (60, 0.06, 0.3), (64, 0.05, -0.15), (67, 0.04, 0.15)):
        sig = gm.pad(gm.hz(m), seconds, cutoff=2200)[:n]
        sig *= np.linspace(1, 0, n) ** 1.5  # decays to silence by the last frame
        buf[: len(sig), 0] += sig * g * np.cos((pan + 1) * np.pi / 4)
        buf[: len(sig), 1] += sig * g * np.sin((pan + 1) * np.pi / 4)
    top = gm.felt_piano(gm.hz(72), min(seconds, 4.0), 0.6)[:n] * 0.10
    buf[: len(top), 0] += top
    buf[: len(top), 1] += top
    return gm.circular_reverb(np.vstack([buf, np.zeros((gm.SR, 2))]), 2.0, 0.3, rng)[:n]


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    spec_path = Path(sys.argv[1]).resolve()
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    music = spec.get("music")
    if not music:
        print("spec has no music; nothing to render")
        return 0
    bed = music["bed"]
    manifest = json.loads((MUSIC / "manifest.json").read_text())
    if bed not in manifest:
        print(f"error: unknown bed {bed!r}", file=sys.stderr)
        return 1
    bed_wav = MUSIC / f"{bed}.wav"
    if not bed_wav.exists():
        subprocess.check_call([sys.executable, str(VIDEO / "scripts" / "gen_music.py"), bed])

    tl = timeline(spec_path)
    total = int(round(tl["durationInFrames"] / tl["fps"] * gm.SR))
    loop = read_wav(bed_wav)
    reps = int(np.ceil(total / len(loop))) + 1
    track = np.tile(loop, (reps, 1))[:total].copy()

    # Ending: start on the last downbeat that leaves >= 3 s (or the whole video if shorter).
    bpm = manifest[bed]["bpm"]
    bar = 4 * 60 / bpm * gm.SR
    want = min(total, int(3.0 * gm.SR))
    start = int(np.floor((total - want) / bar) * bar)
    start = max(0, start)
    tail_len = total - start
    fade = int(min(1.5 * gm.SR, tail_len))
    w = np.ones(tail_len)
    w[:fade] = np.cos(np.linspace(0, np.pi / 2, fade)) ** 2  # equal-power-ish fade of the bed
    w[fade:] = 0
    end = ending(bpm, tail_len / gm.SR, np.random.default_rng(909))
    rise = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2
    end[:fade] *= rise[:, None]
    track[start:] = track[start:] * w[:, None] + end * 3.0  # chord brought up to roughly bed loudness

    peak = np.max(np.abs(track))
    if peak > 0.89:
        track *= 0.89 / peak
    out_dir = MUSIC / "pieces"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{spec['id']}.wav"
    pcm = (np.clip(track, -1, 1) * 32767).astype("<i2")
    with wave.open(str(out), "wb") as wv:
        wv.setnchannels(2)
        wv.setsampwidth(2)
        wv.setframerate(gm.SR)
        wv.writeframes(pcm.tobytes())

    rel = f"pieces/{spec['id']}.wav"
    if music.get("track") != rel:
        music["track"] = rel
        spec_path.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{out.relative_to(VIDEO)}  {total / gm.SR:.3f}s ({bed}, {bpm} BPM, ending at {start / gm.SR:.2f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

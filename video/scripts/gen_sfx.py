#!/usr/bin/env python3
"""Synthesise QueryUnstuck's sound effects from scratch (original audio, no samples).

Pure standard library and deterministic (fixed seed), so re-running produces identical files.
Usage: python3 scripts/gen_sfx.py  -> writes public/sfx/<name>-<variant>.wav (48 kHz, 16-bit mono)
       and public/sfx/manifest.json (variant durations)
"""
import math
import random
import struct
import wave
from pathlib import Path

SR = 48_000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
PEAK = 0.7  # ~-3 dBFS; per-sound loudness is set in brand.json audio.mix
rng = random.Random(20261004)


def n(sec: float) -> int:
    return int(SR * sec)


def env_exp(i: int, rate: float) -> float:
    return math.exp(-rate * i / SR)


def sine_sweep(dur: float, f0: float, f1: float, decay: float, curve: float = 1.0) -> list[float]:
    """Sine whose frequency glides f0 -> f1, with exponential decay."""
    out, phase = [], 0.0
    total = n(dur)
    for i in range(total):
        t = (i / total) ** curve
        f = f0 + (f1 - f0) * t
        phase += 2 * math.pi * f / SR
        out.append(math.sin(phase) * env_exp(i, decay))
    return out


def tone(dur: float, freq: float, decay: float, partials=((1, 1.0),)) -> list[float]:
    return [
        sum(a * math.sin(2 * math.pi * freq * k * i / SR) for k, a in partials) * env_exp(i, decay)
        for i in range(n(dur))
    ]


def noise_sweep(dur: float, f0: float, f1: float, q: float, shape) -> list[float]:
    """White noise through a state-variable band-pass whose centre sweeps f0 -> f1."""
    low = band = 0.0
    out = []
    total = n(dur)
    damp = 1.0 / q
    for i in range(total):
        t = i / total
        fc = f0 * (f1 / f0) ** t
        f = 2 * math.sin(math.pi * min(fc, SR / 6) / SR)
        x = rng.uniform(-1, 1)
        high = x - low - damp * band
        band += f * high
        low += f * band
        out.append(band * shape(t))
    return out


def mix(*tracks: list[float]) -> list[float]:
    length = max(len(t) for t in tracks)
    return [sum(t[i] for t in tracks if i < len(t)) for i in range(length)]


def offset(track: list[float], sec: float) -> list[float]:
    return [0.0] * n(sec) + track


def finish(x: list[float]) -> list[float]:
    """Normalise, add 2 ms fade-in and 5 ms fade-out so nothing clicks."""
    peak = max(abs(v) for v in x) or 1.0
    x = [v / peak * PEAK for v in x]
    fi, fo = n(0.002), n(0.005)
    for i in range(min(fi, len(x))):
        x[i] *= i / fi
    for i in range(min(fo, len(x))):
        x[-1 - i] *= i / fo
    return x


def write(name: str, x: list[float]) -> float:
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, v)) * 32767)) for v in x))
    return len(x) / SR


bell = lambda t: math.sin(math.pi * t) ** 2  # noqa: E731
fade = lambda t: 1 - t  # noqa: E731


def scaled(track: list[float], k: float) -> list[float]:
    return [v * k for v in track]


def mallet(freq: float, dur: float = 0.38, decay: float = 11) -> list[float]:
    """Soft marimba-like note: fundamental + a quiet octave + slightly inharmonic partial."""
    return tone(dur, freq, decay, ((1, 1.0), (2, 0.18), (3.9, 0.05)))


def bell_note(freq: float, dur: float, decay: float) -> list[float]:
    return tone(dur, freq, decay, ((1, 1.0), (2.76, 0.12), (5.4, 0.04)))


def sparkle() -> list[float]:
    """A few quick high glints, deterministic."""
    out: list[float] = []
    for k in range(5):
        f = 2400 + rng.uniform(0, 1800)
        out = mix(out or [0.0], offset(scaled(tone(0.12, f, 40), 0.9 - k * 0.12), 0.05 * k))
    return out


def buzz() -> list[float]:
    """Soft 'wrong answer': low odd-harmonic tone with a wobble, short."""
    total = n(0.26)
    return [
        sum(math.sin(2 * math.pi * 150 * h * i / SR) / h for h in (1, 3, 5))
        * (0.75 + 0.25 * math.sin(2 * math.pi * 18 * i / SR))
        * env_exp(i, 9)
        for i in range(total)
    ]


def typekey(f: float, thump: float) -> list[float]:
    return mix(scaled(noise_sweep(0.03, f, f, 2.0, fade), 0.8), scaled(tone(0.04, thump, 90), 0.5))


# Major pentatonic from C5: rising steps always sound consonant, whatever the count.
PENTATONIC = [523.25, 587.33, 659.26, 783.99, 880.0, 1046.5, 1174.66, 1318.51]

# name -> list of variant generators. Files are written as <name>-<i>.wav.
SOUNDS = {
    # scene change: soft, slow airy sweeps (two takes, rotated)
    "whoosh": [
        lambda: noise_sweep(0.8, 220, 1800, 1.4, lambda t: math.sin(math.pi * t**0.8) ** 3),
        lambda: noise_sweep(0.85, 180, 1500, 1.2, lambda t: math.sin(math.pi * t**0.9) ** 3),
    ],
    # element appears: pitch-dropping blip (three takes)
    "pop": [
        lambda: sine_sweep(0.12, 950, 320, 28, curve=0.6),
        lambda: sine_sweep(0.12, 1100, 380, 28, curve=0.6),
        lambda: sine_sweep(0.13, 820, 280, 26, curve=0.6),
    ],
    # row / item reveal: tiny high tick (three takes)
    "tick": [
        lambda f=f: mix(tone(0.035, f, 160), scaled(noise_sweep(0.02, 5000, 5000, 1.5, fade), 0.25))
        for f in (2600, 2900, 2350)
    ],
    # generic step: short click
    "click": [lambda: mix(tone(0.06, 1500, 90, ((1, 1.0), (2, 0.3))), scaled(noise_sweep(0.025, 3000, 3000, 1.2, fade), 0.4))],
    # ordered step i: rising pentatonic mallet (code walkthrough, lists, timelines)
    "note": [lambda f=f: mallet(f) for f in PENTATONIC],
    # scan / probe (JoinMatcher looking for a partner)
    "blip": [lambda: sine_sweep(0.07, 1000, 1450, 45, curve=1.0)],
    # match: two quick rising notes (A5 -> E6)
    "ding": [
        lambda: mix(
            tone(0.45, 880.0, 9, ((1, 1.0), (2, 0.25), (3, 0.08))),
            offset(tone(0.5, 1318.5, 7, ((1, 1.0), (2, 0.2), (3, 0.06))), 0.07),
        )
    ],
    # no-match / dropped row: low muted thud
    "thud": [lambda: mix(sine_sweep(0.3, 170, 65, 14, curve=0.5), scaled(noise_sweep(0.12, 400, 150, 1.0, fade), 0.35))],
    # mistake / gotcha callout: soft buzz
    "buzz": [buzz],
    # rows leaving / things moving: short swoosh
    "swoosh": [lambda: noise_sweep(0.32, 700, 2600, 1.6, bell)],
    # sort / reorder: gentle upward tonal glide
    "glide": [lambda: mix(sine_sweep(0.36, 420, 940, 7, curve=0.8), scaled(noise_sweep(0.3, 900, 2200, 2.0, bell), 0.25))],
    # mechanical slide (window frame, cards sliding in)
    "slide": [lambda: mix(noise_sweep(0.26, 320, 620, 2.2, bell), offset(scaled(tone(0.04, 1700, 120), 0.35), 0.22))],
    # lands / locks into place
    "snap": [lambda: mix(scaled(noise_sweep(0.05, 4200, 4200, 1.3, fade), 0.7), tone(0.06, 1800, 110))],
    # highlight / key idea emphasis
    "sparkle": [sparkle],
    # conclusion / verdict: C6-E6-G6 bell arpeggio
    "chime": [
        lambda: mix(
            bell_note(1046.5, 0.7, 6),
            offset(bell_note(1318.51, 0.7, 6), 0.08),
            offset(bell_note(1567.98, 0.8, 5), 0.16),
        )
    ],
    # code typing (three takes)
    "type": [lambda f=f, t=t: typekey(f, t) for f, t in ((3200, 210), (2700, 180), (3600, 240))],
    # end card: two soft notes (E5 -> B5)
    "outro": [
        lambda: mix(
            tone(0.8, 659.3, 4.5, ((1, 1.0), (2, 0.18), (4, 0.05))),
            offset(tone(0.9, 987.8, 3.5, ((1, 1.0), (2, 0.15), (4, 0.04))), 0.16),
        )
    ],
}

if __name__ == "__main__":
    import json

    for old in OUT.glob("*.wav"):
        old.unlink()
    manifest: dict[str, list[float]] = {}
    for name, variants in SOUNDS.items():
        manifest[name] = [round(write(f"{name}-{i}", finish(make())), 3) for i, make in enumerate(variants)]
        print(f"{name:8s} {len(variants)} variant(s)  {max(manifest[name]):.2f}s")
    # Durations per variant, read by src/lib/sfx.tsx to size audio sequences.
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

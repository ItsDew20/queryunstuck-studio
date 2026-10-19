#!/usr/bin/env python3
"""Synthesise QueryUnstuck's background music beds from scratch (original audio, no samples).

Each bed is an 8-bar loop in C major (so the SFX pentatonic notes always sit in key), rendered
seamlessly loopable: reverb is applied as a circular convolution so the tail wraps to the start.
Deterministic (fixed seeds). Needs numpy.

Usage: python scripts/gen_music.py [mood ...]  -> public/music/<mood>.wav (48 kHz, 16-bit stereo)
       and public/music/manifest.json (bpm, loop length, loudness, phone-speaker share)
"""
import json
import wave
from pathlib import Path

import numpy as np

SR = 48_000
OUT = Path(__file__).resolve().parent.parent / "public" / "music"


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def t_axis(n: int) -> np.ndarray:
    return np.arange(n) / SR


def env(n: int, attack: float, decay: float, sustain: float = 0.0, release: float = 0.0) -> np.ndarray:
    """Attack (s), then exponential decay toward `sustain`, with a linear release over the last part."""
    t = t_axis(n)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    d = sustain + (1 - sustain) * np.exp(-np.maximum(t - attack, 0) / max(decay, 1e-4))
    e = a * d
    if release > 0:
        r = int(release * SR)
        if 0 < r < n:
            e[-r:] *= np.linspace(1, 0, r)
    return e


def lowpass(x: np.ndarray, cutoff: float, slope: float = 2.0) -> np.ndarray:
    """Gentle FFT low-pass (works on mono or stereo, keeps length)."""
    spec = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(x.shape[0], 1 / SR)
    curve = 1 / (1 + (f / cutoff) ** (2 * slope))
    return np.fft.irfft(spec * (curve[:, None] if x.ndim == 2 else curve), n=x.shape[0], axis=0)


def highpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    spec = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(x.shape[0], 1 / SR)
    curve = 1 / (1 + (cutoff / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(spec * (curve[:, None] if x.ndim == 2 else curve), n=x.shape[0], axis=0)


def circular_reverb(x: np.ndarray, seconds: float, wet: float, rng: np.random.Generator) -> np.ndarray:
    """Stereo noise-tail reverb via circular convolution, so the loop stays seamless."""
    n = x.shape[0]
    m = int(seconds * SR)
    out = np.empty_like(x)
    for ch in range(2):
        ir = np.zeros(n)
        tail = rng.standard_normal(m) * np.exp(-np.arange(m) / (m / 6))
        tail = lowpass(tail, 5000)
        ir[:m] = tail / np.sqrt(np.sum(tail**2))
        wet_sig = np.fft.irfft(np.fft.rfft(x[:, ch]) * np.fft.rfft(ir), n=n)
        out[:, ch] = (1 - wet) * x[:, ch] + wet * wet_sig
    return out


class Track:
    def __init__(self, bpm: float, bars: int, seed: int):
        self.bpm = bpm
        self.beat = 60 / bpm
        self.n = int(round(bars * 4 * self.beat * SR))
        self.buf = np.zeros((self.n, 2))
        self.rng = np.random.default_rng(seed)

    def add(self, sig: np.ndarray, at_beats: float, gain: float = 1.0, pan: float = 0.0) -> None:
        """Mix a mono signal at a beat position; wraps around the loop end (seamless)."""
        start = int(round(at_beats * self.beat * SR)) % self.n
        idx = (start + np.arange(len(sig))) % self.n
        left = np.cos((pan + 1) * np.pi / 4)
        right = np.sin((pan + 1) * np.pi / 4)
        np.add.at(self.buf[:, 0], idx, sig * gain * left)
        np.add.at(self.buf[:, 1], idx, sig * gain * right)


# ---------- instruments ----------
def rhodes(f: float, dur: float, vel: float = 1.0) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    body = np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t * 3))  # soft FM bark
    body += 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 2.5)
    tine = 0.12 * np.sin(2 * np.pi * 7.1 * f * t) * np.exp(-t * 18)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.2 * t)
    return (body + tine) * trem * env(n, 0.004, 1.6, 0.0, 0.25) * vel


def pad(f: float, dur: float, cutoff: float = 1400) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.zeros(n)
    for detune in (-0.12, 0.0, 0.11):  # three slightly detuned voices, additive saw (8 harmonics)
        ff = f * 2 ** (detune / 12)
        for k in range(1, 9):
            sig += np.sin(2 * np.pi * ff * k * t + k) / k
    sig /= 6
    return lowpass(sig, cutoff) * env(n, 1.2, 99, 1.0, 1.2)


def pluck(f: float, dur: float, rng: np.random.Generator, bright: float = 0.5) -> np.ndarray:
    """Karplus-Strong string."""
    n = int(dur * SR)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p)
    buf = lowpass(buf, 2000 + 6000 * bright) if p > 32 else buf
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * env(n, 0.002, 99, 1.0, 0.05)


def sine_bass(f: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = t_axis(n)
    return (np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * 2 * f * t)) * env(n, 0.02, 2.5, 0.35, 0.3)


def kick(vel: float = 1.0) -> np.ndarray:
    n = int(0.35 * SR)
    t = t_axis(n)
    freq = 45 + 75 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 9) * vel


def noise_hit(rng: np.random.Generator, dur: float, lo: float, hi: float, decay: float) -> np.ndarray:
    n = int(dur * SR)
    x = rng.standard_normal(n)
    x = highpass(lowpass(x, hi), lo)
    return x * np.exp(-t_axis(n) / decay)


def crackle(n: int, rng: np.random.Generator) -> np.ndarray:
    x = np.zeros(n)
    pops = rng.choice(n, size=int(n / SR * 9), replace=False)
    x[pops] = rng.uniform(-1, 1, len(pops))
    x = lowpass(highpass(x, 1500), 7000)
    hiss = lowpass(rng.standard_normal(n), 6000) * 0.04
    return x + hiss


# ---------- moods ----------
def focus() -> np.ndarray:
    """Lo-fi: electric piano comping, soft bass and drums, light vinyl. 78 BPM, 8 bars."""
    tr = Track(78, 8, seed=101)
    chords = [  # rootless voicings, all diatonic to C major
        (36, [52, 55, 59, 62]),  # Cmaj9
        (33, [55, 60, 64, 67]),  # Am7
        (38, [53, 57, 60, 64]),  # Dm9
        (31, [53, 57, 59, 64]),  # G13
    ]
    swing = 0.08
    for bar in range(8):
        root, voicing = chords[bar % 4]
        b0 = bar * 4
        for k, m in enumerate(voicing):  # slight strum
            tr.add(rhodes(hz(m + 12), 2.6, 0.55), b0 + k * 0.03, 0.30, pan=-0.3 + 0.2 * k)
            tr.add(rhodes(hz(m + 12), 1.6, 0.4), b0 + 2.5 + swing + k * 0.03, 0.22, pan=0.3 - 0.2 * k)
        tr.add(sine_bass(hz(root + 24), 3.8), b0, 0.16)
        tr.add(kick(0.9), b0, 0.26)
        tr.add(kick(0.6), b0 + 2.5 + swing, 0.20)
        for beat in (1, 3):
            tr.add(noise_hit(tr.rng, 0.25, 900, 5000, 0.06), b0 + beat, 0.10, pan=0.1)
        for e in range(8):
            off = swing if e % 2 else 0
            tr.add(noise_hit(tr.rng, 0.06, 6000, 14000, 0.018), b0 + e * 0.5 + off, 0.035 + 0.015 * (e % 2 == 0), pan=0.35)
    tr.buf[:, 0] += crackle(tr.n, tr.rng) * 0.05
    tr.buf[:, 1] += crackle(tr.n, tr.rng) * 0.05
    mix = circular_reverb(tr.buf, 1.6, 0.22, tr.rng)
    return highpass(lowpass(mix, 7000, 1.5), 70)


def upbeat() -> np.ndarray:
    """Bright: plucked 16th arpeggios over a soft pad, four-on-the-floor kick. 100 BPM, 8 bars."""
    tr = Track(100, 8, seed=202)
    chords = [(48, [60, 64, 67, 72]), (43, [59, 62, 67, 71]), (45, [60, 64, 69, 72]), (41, [60, 65, 69, 72])]  # C G Am F
    pattern = [0, 1, 2, 3, 2, 1, 2, 3]
    for bar in range(8):
        root, notes = chords[bar % 4]
        b0 = bar * 4
        for m in notes[:3]:
            tr.add(pad(hz(m - 12), 4 * tr.beat + 0.6), b0, 0.05, pan=-0.2)
        for s in range(16):
            m = notes[pattern[s % 8]] + (12 if s in (7, 15) else 0)
            tr.add(pluck(hz(m), 0.45, tr.rng, 0.45), b0 + s * 0.25, 0.10 * (1.0 if s % 4 == 0 else 0.7), pan=0.25 if s % 2 else -0.25)
        tr.add(pluck(hz(root), 1.2, tr.rng, 0.2), b0, 0.14)
        tr.add(pluck(hz(root), 0.6, tr.rng, 0.2), b0 + 2.5, 0.10)
        for beat in range(4):
            tr.add(kick(0.8), b0 + beat, 0.17)
            tr.add(noise_hit(tr.rng, 0.05, 7000, 15000, 0.015), b0 + beat + 0.5, 0.05, pan=0.3)
        for beat in (1, 3):
            tr.add(noise_hit(tr.rng, 0.2, 1200, 6000, 0.05), b0 + beat, 0.11)
    mix = circular_reverb(tr.buf, 1.3, 0.18, tr.rng)
    return highpass(lowpass(mix, 7500, 1.5), 70)


def calm() -> np.ndarray:
    """Ambient: slow warm pads, sparse piano notes, shimmer; no drums. 66 BPM, 8 bars."""
    tr = Track(66, 8, seed=303)
    chords = [(45, [57, 60, 64, 67]), (41, [57, 60, 64, 65]), (36, [55, 59, 60, 64]), (43, [55, 59, 62, 64])]  # Am7 Fmaj7 Cmaj7 G6
    for i in range(4):
        root, voicing = chords[i]
        b0 = i * 8
        for m in voicing:
            tr.add(pad(hz(m), 8 * tr.beat + 1.5, cutoff=2600), b0, 0.07, pan=tr.rng.uniform(-0.5, 0.5))
        tr.add(sine_bass(hz(root + 12), 8 * tr.beat), b0, 0.07)
        for beat in range(0, 8, 2):  # sparse melody from the chord, an octave up
            m = int(tr.rng.choice(voicing)) + 12
            tr.add(rhodes(hz(m), 3.0, 0.5), b0 + beat + tr.rng.uniform(0, 0.4), 0.18, pan=tr.rng.uniform(-0.6, 0.6))
        shimmer = np.sin(2 * np.pi * hz(voicing[-1] + 24) * t_axis(int(8 * tr.beat * SR))) * env(int(8 * tr.beat * SR), 2.5, 99, 1.0, 2.5)
        tr.add(shimmer, b0, 0.012)
    mix = circular_reverb(tr.buf, 3.0, 0.38, tr.rng)
    return highpass(lowpass(mix, 6500, 1.5), 70)


def felt_piano(f: float, dur: float, vel: float = 1.0) -> np.ndarray:
    """Soft, muted piano: a few decaying partials with a rounded attack."""
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.zeros(n)
    for k, (amp, dec) in enumerate([(1.0, 2.2), (0.35, 1.4), (0.12, 0.9), (0.05, 0.6)], start=1):
        sig += amp * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * dec)
    return lowpass(sig * env(n, 0.012, 99, 1.0, 0.3), 2600) * vel


def mallet(f: float, dur: float, vel: float = 1.0) -> np.ndarray:
    """Marimba-like: fundamental plus a quickly decaying 4th harmonic."""
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5) + 0.3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 16)
    return sig * env(n, 0.002, 99, 1.0, 0.05) * vel


def rain(n: int, rng: np.random.Generator) -> np.ndarray:
    """Soft rain: band-limited noise bed plus sparse droplets (mono)."""
    bed = highpass(lowpass(rng.standard_normal(n), 3500), 400) * 0.25
    drops = np.zeros(n)
    idx = rng.choice(n, size=int(n / SR * 40), replace=False)
    drops[idx] = rng.uniform(0.2, 1.0, len(idx))
    drops = highpass(lowpass(drops, 6000), 1500)
    return bed + drops * 0.6


def study() -> np.ndarray:
    """Felt-piano arpeggios over a faint pad; no drums. 72 BPM, 8 bars."""
    tr = Track(72, 8, seed=404)
    chords = [(48, [60, 64, 67, 71]), (47, [59, 62, 67, 69]), (45, [57, 60, 64, 71]), (41, [57, 60, 65, 67])]  # Cmaj7 G6/B Am9 Fmaj9
    for bar in range(8):
        root, notes = chords[bar % 4]
        b0 = bar * 4
        tr.add(felt_piano(hz(root), 3.5, 0.8), b0, 0.22, pan=-0.15)
        for e, k in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
            tr.add(felt_piano(hz(notes[k] + 12), 1.8, 0.7), b0 + e * 0.5, 0.13, pan=0.25 if e % 2 else -0.05)
        for m in notes[:3]:
            tr.add(pad(hz(m), 4 * tr.beat + 0.8, cutoff=2200), b0, 0.025, pan=0.3)
    mix = circular_reverb(tr.buf, 2.2, 0.3, tr.rng)
    return highpass(lowpass(mix, 7000, 1.5), 70)


def flow() -> np.ndarray:
    """Minimal repeating mallet pattern, soft pulse; steady and unobtrusive. 88 BPM, 8 bars."""
    tr = Track(88, 8, seed=505)
    chords = [(48, [60, 64, 67]), (45, [60, 64, 69]), (41, [60, 65, 69]), (43, [59, 62, 67])]  # C Am F G
    pattern = [0, 2, 1, 2, 0, 2, 1, 2]
    for bar in range(8):
        root, notes = chords[bar % 4]
        b0 = bar * 4
        for e in range(8):
            tr.add(mallet(hz(notes[pattern[e]] + 12), 0.8, 0.8 if e % 4 == 0 else 0.55), b0 + e * 0.5, 0.15, pan=-0.3 if e % 2 else 0.3)
        for m in notes:
            tr.add(pad(hz(m), 4 * tr.beat + 0.6, cutoff=2000), b0, 0.035)
        tr.add(sine_bass(hz(root + 24), 3.6), b0, 0.05)
        tr.add(kick(0.6), b0, 0.05)
    mix = circular_reverb(tr.buf, 1.6, 0.25, tr.rng)
    return highpass(lowpass(mix, 7000, 1.5), 70)


def drift() -> np.ndarray:
    """Ambient drone: sustained fifths, slow chord colours, rare soft bells. 60 BPM, 8 bars."""
    tr = Track(60, 8, seed=606)
    n_bar2 = 8 * tr.beat
    colours = [[60, 67, 64], [60, 67, 69], [60, 67, 65], [60, 67, 62]]  # C5 + E / A / F / D colour tones
    for i, c in enumerate(colours):
        for m in c:
            tr.add(pad(hz(m), n_bar2 + 2.0, cutoff=1800), i * 8, 0.06, pan=tr.rng.uniform(-0.6, 0.6))
        tr.add(pad(hz(48), n_bar2 + 2.0, cutoff=900), i * 8, 0.05)
        bell = int(tr.rng.choice([72, 76, 79]))
        tr.add(felt_piano(hz(bell), 4.0, 0.5), i * 8 + 4 + tr.rng.uniform(0, 1), 0.07, pan=tr.rng.uniform(-0.5, 0.5))
    mix = circular_reverb(tr.buf, 3.5, 0.45, tr.rng)
    return highpass(lowpass(mix, 6000, 1.5), 70)


def night() -> np.ndarray:
    """Slow lo-fi: warm electric piano, brushed snare, round bass. 64 BPM, 8 bars."""
    tr = Track(64, 8, seed=707)
    chords = [(45, [57, 60, 64, 67]), (38, [57, 60, 62, 65]), (43, [55, 59, 62, 65]), (36, [55, 59, 60, 64])]  # Am7 Dm9 G7 Cmaj7
    for bar in range(8):
        root, voicing = chords[bar % 4]
        b0 = bar * 4
        for k, m in enumerate(voicing):
            tr.add(rhodes(hz(m + 12), 3.2, 0.45), b0 + k * 0.04, 0.24, pan=-0.25 + 0.17 * k)
        tr.add(pluck(hz(root + 12), 1.6, tr.rng, 0.15), b0, 0.16)
        tr.add(pluck(hz(root + 19), 0.9, tr.rng, 0.15), b0 + 2.5, 0.10)
        tr.add(kick(0.5), b0, 0.12)
        for beat in (1, 3):
            tr.add(noise_hit(tr.rng, 0.5, 1500, 7000, 0.18), b0 + beat, 0.045, pan=0.2)  # brush swish
    tr.buf[:, 0] += crackle(tr.n, tr.rng) * 0.035
    tr.buf[:, 1] += crackle(tr.n, tr.rng) * 0.035
    mix = circular_reverb(tr.buf, 2.0, 0.28, tr.rng)
    return highpass(lowpass(mix, 6500, 1.5), 70)


def rainy() -> np.ndarray:
    """Soft rain over slow warm pads and sparse piano. 60 BPM, 8 bars."""
    tr = Track(60, 8, seed=808)
    chords = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]]  # Am F C/G G
    for i, c in enumerate(chords):
        for m in c:
            tr.add(pad(hz(m), 8 * tr.beat + 1.5, cutoff=2200), i * 8, 0.06, pan=tr.rng.uniform(-0.4, 0.4))
        for beat in (0, 3, 6):
            tr.add(felt_piano(hz(int(tr.rng.choice(c)) + 12), 3.0, 0.6), i * 8 + beat + tr.rng.uniform(0, 0.3), 0.12, pan=tr.rng.uniform(-0.5, 0.5))
    mix = circular_reverb(tr.buf, 3.0, 0.35, tr.rng)
    r = rain(tr.n, tr.rng)
    mix[:, 0] += r * 0.05
    mix[:, 1] += np.roll(r, SR // 7) * 0.05  # decorrelated right channel
    return highpass(lowpass(mix, 7000, 1.5), 70)


# name -> (generator, bpm, one-line character). bpm/beats are used by the engine's beat grid.
MOODS = {
    "focus": (focus, 78, "lo-fi electric piano, soft swung drums, light vinyl"),
    "upbeat": (upbeat, 100, "bright plucked arpeggios, light four-on-the-floor"),
    "calm": (calm, 66, "warm pads, sparse piano, shimmer; no drums"),
    "study": (study, 72, "felt-piano arpeggios over a faint pad; no drums"),
    "flow": (flow, 88, "minimal repeating mallet pattern, soft pulse"),
    "drift": (drift, 60, "ambient drone, slow chord colours, rare bells; no drums"),
    "night": (night, 64, "slow lo-fi electric piano, brushes, round bass"),
    "rain": (rainy, 60, "soft rain over warm pads and sparse piano; no drums"),
}
TARGET_RMS_DB = -20.0  # loops are stored at a consistent loudness; the mix sets the bed level


def write(name: str, x: np.ndarray) -> dict:
    x = x - x.mean(axis=0)
    rms = np.sqrt(np.mean(x**2))
    x *= 10 ** (TARGET_RMS_DB / 20) / max(rms, 1e-9)
    peak = np.max(np.abs(x))
    if peak > 0.89:  # keep peaks under about -1 dBFS
        x *= 0.89 / peak
    OUT.mkdir(parents=True, exist_ok=True)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    mono = x.mean(axis=1)
    spec = np.abs(np.fft.rfft(mono)) ** 2
    f = np.fft.rfftfreq(len(mono), 1 / SR)
    return {
        "seconds": round(len(x) / SR, 3),
        "rms_db": round(20 * np.log10(np.sqrt(np.mean(x**2))), 1),
        "phone_share": round(float(spec[f >= 200].sum() / spec.sum()), 2),
    }


if __name__ == "__main__":
    import sys

    only = set(sys.argv[1:])
    path = OUT / "manifest.json"
    manifest = json.loads(path.read_text()) if path.exists() else {}
    for name, (make, bpm, character) in MOODS.items():
        if only and name not in only:
            continue
        info = write(name, make())
        manifest[name] = {"bpm": bpm, "beats_per_bar": 4, "character": character, **info}
        print(f"{name:7s} {bpm:3d} BPM {info['seconds']:6.2f}s loop  rms {info['rms_db']} dBFS  phone {int(info['phone_share'] * 100)}%")
    path.write_text(json.dumps(dict(sorted(manifest.items())), indent=2) + "\n")

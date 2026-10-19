#!/usr/bin/env python3
"""Upload a rendered file to Cloudflare R2 and print its public URL.

Usage:
  python scripts/upload_media.py <local_file> --key <id>/<name>   # e.g. qu-001/reel.mp4
  python scripts/upload_media.py <local_file> --key ... --json    # machine-readable result

Credentials come from the environment (GitHub Actions secrets) or, locally, from .env:
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL

The upload overwrites any existing object with the same key, then the public URL is fetched to
confirm it serves the same number of bytes. Exit code 1 on any failure.
"""
import argparse
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE_URL"]
KEY_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*(/[a-z0-9][a-z0-9._-]*)*$")
CONTENT_TYPES = {".mp4": "video/mp4", ".srt": "application/x-subrip", ".vtt": "text/vtt"}


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    dotenv = ROOT / ".env"
    if dotenv.exists():
        for line in dotenv.read_text(encoding="utf-8").splitlines():
            m = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*)", line)
            if m:
                env[m.group(1)] = m.group(2).split("#")[0].strip().strip('"').strip("'")
    # Real environment variables (CI secrets) win over .env.
    env.update({k: v for k, v in os.environ.items() if k.startswith("R2_") and v})
    return env


def content_type(path: Path) -> str:
    return CONTENT_TYPES.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0] or "application/octet-stream"


def public_size(url: str) -> int | None:
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "queryunstuck-upload"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return int(r.headers.get("Content-Length", -1))
    except (urllib.error.URLError, ValueError):
        return None


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file", type=Path)
    ap.add_argument("--key", required=True, help="object key, e.g. qu-001/reel.mp4 (lowercase, no leading slash)")
    ap.add_argument("--json", action="store_true", help="print a JSON result instead of just the URL")
    args = ap.parse_args()

    if not args.file.is_file():
        print(f"error: file not found: {args.file}", file=sys.stderr)
        return 1
    if not KEY_RE.match(args.key):
        print(f"error: invalid key {args.key!r} (use lowercase letters, digits, . _ - and /)", file=sys.stderr)
        return 1

    env = load_env()
    missing = [k for k in REQUIRED if not env.get(k)]
    if missing:
        print(f"error: missing settings: {', '.join(missing)}", file=sys.stderr)
        return 1

    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{env['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        region_name="auto",
        aws_access_key_id=env["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=env["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4", retries={"max_attempts": 3}),
    )
    ctype = content_type(args.file)
    size = args.file.stat().st_size
    try:
        s3.upload_file(
            str(args.file),
            env["R2_BUCKET"],
            args.key,
            ExtraArgs={"ContentType": ctype, "CacheControl": "public, max-age=3600"},
        )
    except (BotoCoreError, ClientError) as e:
        code = e.response.get("Error", {}).get("Code") if isinstance(e, ClientError) else type(e).__name__
        print(f"error: upload failed ({code})", file=sys.stderr)
        return 1

    url = f"{env['R2_PUBLIC_BASE_URL'].rstrip('/')}/{args.key}"
    served = public_size(url)
    if served != size:
        print(f"error: uploaded, but {url} serves {served} bytes (expected {size})", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps({"url": url, "key": args.key, "bytes": size, "content_type": ctype}))
    else:
        print(url)
    return 0


if __name__ == "__main__":
    sys.exit(main())

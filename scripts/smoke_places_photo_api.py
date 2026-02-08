#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import urllib.parse
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Smoke-test /api/places/photo using a known placeId.",
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:3000",
        help="Base URL for the running Next.js app (default: http://localhost:3000)",
    )
    parser.add_argument(
        "--place-id",
        default="ChIJgZDFjQBUKhMRzcTwm8i33s0",
        help="Google placeId to test",
    )
    args = parser.parse_args()

    query = urllib.parse.urlencode({"placeId": args.place_id})
    url = f"{args.base_url.rstrip('/')}/api/places/photo?{query}"
    try:
        with urllib.request.urlopen(url) as response:
            body = response.read().decode("utf-8")
            status = response.status
    except Exception as exc:
        print(f"Smoke test failed: {exc}", file=sys.stderr)
        return 1

    if status != 200:
        print(f"Smoke test failed: expected HTTP 200, got {status}", file=sys.stderr)
        return 1

    try:
        payload = json.loads(body)
    except json.JSONDecodeError as exc:
        print(f"Smoke test failed: invalid JSON: {exc}", file=sys.stderr)
        return 1

    if not isinstance(payload, dict):
        print("Smoke test failed: expected JSON object", file=sys.stderr)
        return 1

    if "url" not in payload or "attributions" not in payload:
        print("Smoke test failed: response missing url/attributions keys", file=sys.stderr)
        return 1

    print("Smoke test passed.")
    print(f"URL present: {bool(payload.get('url'))}")
    print(f"Attribution count: {len(payload.get('attributions', []))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

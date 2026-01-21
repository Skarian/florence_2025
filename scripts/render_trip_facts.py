#!/usr/bin/env python3
"""Render docs/trip_facts.md by substituting {{VARS}} from secrets/values.env.

Prints to stdout only.
"""
from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
FACTS = ROOT / "docs" / "trip_facts.md"
SECRETS = ROOT / "secrets" / "values.env"


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip()
    return env


def main() -> None:
    text = FACTS.read_text()
    env = load_env(SECRETS)

    def repl(match: re.Match[str]) -> str:
        key = match.group(1)
        return env.get(key, match.group(0))

    rendered = re.sub(r"\{\{([A-Z0-9_]+)\}\}", repl, text)
    print(rendered)


if __name__ == "__main__":
    main()

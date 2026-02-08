#!/usr/bin/env python3
from __future__ import annotations

import re
import subprocess
import sys
import unicodedata
from pathlib import Path
import hashlib
import tempfile

ROOT = Path(__file__).resolve().parents[1]
EML_DIR = ROOT / "emails"
MD_DIR = EML_DIR / "md"
EML2MD_BIN = Path("/Users/nskaria/projects/eml2md/target/release/eml2md")


def slugify(stem: str) -> str:
    normalized = unicodedata.normalize("NFKD", stem)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "_", ascii_text.lower()).strip("_")
    return slug or "email"

def file_hash(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(8192), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

def main() -> int:
    if not EML2MD_BIN.exists():
        print(f"eml2md binary not found at {EML2MD_BIN}", file=sys.stderr)
        return 1

    if not EML_DIR.exists():
        print(f"emails directory not found: {EML_DIR}", file=sys.stderr)
        return 1

    MD_DIR.mkdir(exist_ok=True)

    eml_files = sorted(EML_DIR.glob("*.eml"))
    if not eml_files:
        print("No .eml files found in emails/")
        return 0

    md_hashes = {}
    for md in MD_DIR.glob("*.md"):
        md_hashes[file_hash(md)] = md.name

    for eml in eml_files:
        out = MD_DIR / f"{slugify(eml.stem)}.md"
        if out.exists():
            print(f"skip: {out.name}")
            continue
        with tempfile.NamedTemporaryFile(
            dir=MD_DIR, prefix=".tmp_eml2md_", suffix=".md", delete=False
        ) as tmp:
            tmp_path = Path(tmp.name)
        try:
            subprocess.run(
                [str(EML2MD_BIN), "-i", str(eml), "-o", str(tmp_path)],
                check=True,
            )
            tmp_hash = file_hash(tmp_path)
            if tmp_hash in md_hashes:
                print(f"skip duplicate: {eml.name} matches {md_hashes[tmp_hash]}")
                tmp_path.unlink(missing_ok=True)
                continue
            tmp_path.replace(out)
            md_hashes[tmp_hash] = out.name
            print(f"wrote: {out.name}")
        finally:
            if tmp_path.exists():
                tmp_path.unlink()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

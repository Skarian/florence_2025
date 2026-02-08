#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
ROLODEX_DIR = ROOT / "web" / "data" / "rolodex"
CITY_FILES = ("florence.json", "rome.json", "venice.json", "chianti.json")

REQUIRED_FIELDS = {
    "id",
    "name",
    "category",
    "city",
    "description",
    "highlight",
    "address",
    "lat",
    "lon",
    "googleMapsUrl",
    "placeId",
    "tags",
    "dietTags",
    "signatureItems",
    "price",
    "crowdLevel",
    "crowdNote",
    "timeNeeded",
    "walkIntensity",
    "booking",
    "hoursNote",
    "sourceUrl",
}


def validate_google_maps_url(url: str, place_id: str) -> str | None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return "googleMapsUrl must be an http/https URL"
    if "google.com" not in parsed.netloc:
        return "googleMapsUrl must point to google.com"
    query = parse_qs(parsed.query)
    query_place_id = query.get("query_place_id", [])
    if not query_place_id:
        return "googleMapsUrl must include query_place_id"
    if query_place_id[0] != place_id:
        return "googleMapsUrl query_place_id must match placeId"
    return None


def main() -> int:
    errors: list[str] = []
    total = 0

    for filename in CITY_FILES:
        path = ROLODEX_DIR / filename
        if not path.exists():
            errors.append(f"{filename}: file not found")
            continue
        try:
            data = json.loads(path.read_text())
        except json.JSONDecodeError as exc:
            errors.append(f"{filename}: invalid JSON: {exc}")
            continue
        if not isinstance(data, list):
            errors.append(f"{filename}: expected a JSON array")
            continue

        for index, place in enumerate(data, start=1):
            total += 1
            prefix = f"{filename}[{index}]"
            if not isinstance(place, dict):
                errors.append(f"{prefix}: expected object")
                continue

            missing = sorted(REQUIRED_FIELDS - set(place.keys()))
            if missing:
                errors.append(f"{prefix}: missing fields: {', '.join(missing)}")

            if "images" in place:
                errors.append(f"{prefix}: obsolete field 'images' is not allowed")
            if "photo" in place:
                errors.append(f"{prefix}: obsolete field 'photo' is not allowed")

            place_id = place.get("placeId")
            if not isinstance(place_id, str) or not place_id.strip():
                errors.append(f"{prefix}: placeId must be a non-empty string")
                continue

            maps_url = place.get("googleMapsUrl")
            if not isinstance(maps_url, str) or not maps_url.strip():
                errors.append(f"{prefix}: googleMapsUrl must be a non-empty string")
            else:
                url_error = validate_google_maps_url(maps_url, place_id)
                if url_error:
                    errors.append(f"{prefix}: {url_error}")

            booking = place.get("booking")
            if not isinstance(booking, dict):
                errors.append(f"{prefix}: booking must be an object")
            elif "required" not in booking or not isinstance(booking["required"], bool):
                errors.append(f"{prefix}: booking.required must be a boolean")

    if errors:
        print("Rolodex validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"Rolodex validation passed for {total} places.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

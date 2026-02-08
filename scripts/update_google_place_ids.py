#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import time
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus

import urllib.request


DATA_PATH = (
    Path(__file__).resolve().parents[1]
    / "web"
    / "data"
    / "generated"
    / "trip_facts.json"
)
ROLODEX_DIR = Path(__file__).resolve().parents[1] / "web" / "data" / "rolodex"
LEGACY_FIND_PLACE_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
LEGACY_TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_NEW_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"


def google_place_lookup(
    query: str, lat: float, lon: float, api_key: str
) -> dict[str, Any]:
    params = (
        f"input={quote_plus(query)}"
        "&inputtype=textquery"
        "&fields=place_id,name,formatted_address"
        f"&locationbias=point:{lat},{lon}"
        f"&key={quote_plus(api_key)}"
    )
    url = f"{LEGACY_FIND_PLACE_URL}?{params}"
    with urllib.request.urlopen(url) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload


def google_text_search(
    query: str, lat: float, lon: float, api_key: str
) -> dict[str, Any]:
    params = (
        f"query={quote_plus(query)}"
        f"&location={lat},{lon}"
        "&radius=2000"
        f"&key={quote_plus(api_key)}"
    )
    url = f"{LEGACY_TEXT_SEARCH_URL}?{params}"
    with urllib.request.urlopen(url) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload


def google_places_new_search(
    query: str, lat: float | None, lon: float | None, api_key: str
) -> dict[str, Any]:
    body: dict[str, Any] = {"textQuery": query, "maxResultCount": 1}
    if lat is not None and lon is not None:
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": lat, "longitude": lon},
                "radius": 2000.0,
            }
        }
    data = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        PLACES_NEW_SEARCH_URL,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": (
                "places.id,places.displayName,places.formattedAddress,places.location"
            ),
        },
    )
    with urllib.request.urlopen(request) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload


def build_query(name: str, address: str | None) -> str:
    if not address:
        return name
    lower_name = name.lower()
    lower_address = address.lower()
    if lower_name in lower_address:
        return address
    return f"{name} {address}"


def update_location(
    location: dict[str, Any],
    api_key: str,
    errors: Counter[str],
    verbose: bool,
) -> bool:
    name = location.get("name")
    if not name:
        return False
    address = location.get("address")
    query = build_query(name, address)
    lat = location.get("lat")
    lon = location.get("lon")
    has_coords = lat is not None and lon is not None

    try:
        payload = google_places_new_search(
            query,
            lat if has_coords else None,
            lon if has_coords else None,
            api_key,
        )
    except urllib.error.HTTPError as exc:
        try:
            detail = exc.read().decode("utf-8")
        except Exception:
            detail = ""
        errors[f"PLACES_NEW_HTTP_{exc.code}"] += 1
        if verbose:
            print(f"[places-new] HTTP {exc.code}: {detail}")
        return False

    places = payload.get("places", [])
    first_place = places[0] if places else None
    place_id = first_place.get("id") if first_place else None

    if first_place:
        if not has_coords:
            location_value = first_place.get("location") or {}
            latitude = location_value.get("latitude")
            longitude = location_value.get("longitude")
            if latitude is not None and longitude is not None:
                location["lat"] = latitude
                location["lon"] = longitude
                lat = latitude
                lon = longitude
                has_coords = True
        if not address or not str(address).strip():
            formatted_address = first_place.get("formattedAddress")
            if formatted_address:
                location["address"] = formatted_address

    if not place_id and has_coords:
        # Fallback to legacy endpoints if needed (may be disabled on newer projects).
        payload = google_place_lookup(query, lat, lon, api_key)
        status = payload.get("status")
        candidates = payload.get("candidates", [])
        place_id = candidates[0].get("place_id") if candidates else None
        if not place_id:
            if status and status not in ("OK", "ZERO_RESULTS"):
                errors[status] += 1
                if verbose:
                    print(
                        f"[findplace] {status}: {payload.get('error_message', 'no message')}"
                    )
            text_payload = google_text_search(query, lat, lon, api_key)
            text_status = text_payload.get("status")
            results = text_payload.get("results", [])
            place_id = results[0].get("place_id") if results else None
            if not place_id:
                if text_status and text_status not in ("OK", "ZERO_RESULTS"):
                    errors[text_status] += 1
                    if verbose:
                        print(
                            f"[textsearch] {text_status}: {text_payload.get('error_message', 'no message')}"
                        )
                return False

    location["placeId"] = place_id
    location["googleMapsUrl"] = (
        "https://www.google.com/maps/search/?api=1"
        f"&query={quote_plus(query)}"
        f"&query_place_id={quote_plus(place_id)}"
    )
    if "sourceUrl" in location and not str(location.get("sourceUrl", "")).strip():
        location["sourceUrl"] = location["googleMapsUrl"]
    return True


def load_api_key() -> str | None:
    env_path = Path(__file__).resolve().parents[1] / "web" / ".env.local"
    if not env_path.exists():
        return None

    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY":
            return value.strip().strip('"').strip("'")
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    api_key = load_api_key()
    if not api_key:
        print("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.", file=sys.stderr)
        return 1

    if not DATA_PATH.exists():
        print(f"Missing data file: {DATA_PATH}", file=sys.stderr)
        return 1

    data = json.loads(DATA_PATH.read_text())
    updated = 0
    checked = 0
    errors: Counter[str] = Counter()

    def apply_locations(locations: list[dict[str, Any]]):
        nonlocal updated, checked
        for location in locations:
            checked += 1
            if args.limit is not None and checked > args.limit:
                return
            if update_location(location, api_key, errors, args.verbose):
                updated += 1
                time.sleep(0.1)

    for stay in data.get("stays", []):
        if "location" in stay:
            apply_locations([stay["location"]])

    for station in data.get("stations", []):
        if "location" in station:
            apply_locations([station["location"]])

    for event in data.get("events", []):
        if "location" in event:
            apply_locations([event["location"]])

    for loop in data.get("walkingLoops", []):
        apply_locations(loop.get("waypoints", []))

    DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n")
    trip_updated = updated
    trip_checked = checked

    rolodex_updated = 0
    rolodex_checked = 0
    if ROLODEX_DIR.exists():
        for path in sorted(ROLODEX_DIR.glob("*.json")):
            try:
                places = json.loads(path.read_text())
            except json.JSONDecodeError:
                continue
            if not isinstance(places, list):
                continue
            before_updated = updated
            before_checked = checked
            apply_locations(places)
            rolodex_updated += updated - before_updated
            rolodex_checked += checked - before_checked
            path.write_text(json.dumps(places, indent=2, ensure_ascii=True) + "\n")

    total_updated = updated
    total_checked = checked
    print(f"Updated {total_updated}/{total_checked} locations with place IDs.")
    if rolodex_checked:
        print(f"Rolodex: updated {rolodex_updated}/{rolodex_checked} places.")
    if errors:
        print("Errors by status:")
        for status, count in errors.items():
            print(f"  {status}: {count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

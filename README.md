# florence_2025

Trip planning workspace plus a Next.js travel app in `web/`.

## Current web architecture

- Maps: Google Maps JS API only.
- Place photos: runtime Google Places Photos via `/api/places/photo?placeId=...`.
- Required key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (single key used by both client maps and server photo route).

## Rolodex data workflow

1. Curate place entries in `web/data/rolodex/<city>.json`.
2. Ensure each entry has a valid `placeId` and strict listing URL.
3. Run:
   - `python3 scripts/update_google_place_ids.py --verbose`
   - `python3 scripts/validate_rolodex.py`

## Local development

From `web/`:

- `npm run dev`
- `npm run lint`
- `npm run validate:rolodex`

Optional photo API smoke check (with dev server running):

- `npm run smoke:photo-api`

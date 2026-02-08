# Web App

Next.js (pages router) app for trip timeline, maps, rolodex, and members.

## Setup

Create `web/.env.local` with:

    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

This single key is used for:

- Google Maps JS rendering
- `/api/places/photo` runtime Google Places image resolution

## Commands

From `web/`:

    npm run dev
    npm run lint
    npm run validate:rolodex
    npm run smoke:photo-api

`smoke:photo-api` expects the dev server running and checks that `/api/places/photo` returns a valid JSON payload.

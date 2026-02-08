import type { NextApiRequest, NextApiResponse } from "next";

type AuthorAttribution = {
  displayName?: string;
  uri?: string;
};

type CacheEntry = {
  url: string | null;
  attributions: AuthorAttribution[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const cache = new Map<string, CacheEntry>();

async function fetchPlaceDetails(placeId: string, apiKey: string) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "photos",
      },
    },
  );
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as {
    photos?: Array<{
      name?: string;
      authorAttributions?: AuthorAttribution[];
    }>;
  };
}

async function fetchPhotoUrl(photoName: string, apiKey: string) {
  const response = await fetch(
    `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&skipHttpRedirect=true`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
      },
    },
  );
  if (!response.ok) {
    return null;
  }
  const payload = (await response.json()) as { photoUri?: string };
  return payload.photoUri ?? null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const placeId = Array.isArray(req.query.placeId)
    ? req.query.placeId[0]
    : req.query.placeId;

  if (!placeId) {
    res.status(400).json({ url: null, attributions: [] });
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ url: null, attributions: [] });
    return;
  }

  const cacheKey = placeId;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=43200");
    res.status(200).json({
      url: cached.url,
      attributions: cached.attributions,
    });
    return;
  }

  let resolvedPhotoName: string | null = null;
  let attributions: AuthorAttribution[] = [];
  const details = await fetchPlaceDetails(placeId, apiKey);
  const photo = details?.photos?.[0];
  resolvedPhotoName = photo?.name ?? null;
  attributions = photo?.authorAttributions ?? [];

  if (!resolvedPhotoName) {
    const empty = { url: null, attributions: [] };
    cache.set(cacheKey, { ...empty, fetchedAt: Date.now() });
    res.status(200).json(empty);
    return;
  }

  const photoUrl = await fetchPhotoUrl(resolvedPhotoName, apiKey);
  const payload = { url: photoUrl, attributions };
  cache.set(cacheKey, { ...payload, fetchedAt: Date.now() });
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=43200");
  res.status(200).json(payload);
}

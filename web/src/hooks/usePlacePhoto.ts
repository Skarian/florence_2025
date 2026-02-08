import { useEffect, useMemo, useState } from "react";

type AuthorAttribution = {
  displayName?: string;
  uri?: string;
};

type PlacePhotoState = {
  url: string | null;
  attributions: AuthorAttribution[];
};

type UsePlacePhotoResult = PlacePhotoState & {
  isLoading: boolean;
};

type UsePlacePhotoOptions = {
  enabled?: boolean;
};

const cache = new Map<string, PlacePhotoState>();
const inflight = new Map<string, Promise<PlacePhotoState>>();

async function fetchPlacePhoto(placeId: string): Promise<PlacePhotoState> {
  const params = new URLSearchParams();
  params.set("placeId", placeId);
  const response = await fetch(`/api/places/photo?${params.toString()}`);
  if (!response.ok) {
    return { url: null, attributions: [] };
  }
  const payload = (await response.json()) as PlacePhotoState;
  return {
    url: payload.url ?? null,
    attributions: payload.attributions ?? [],
  };
}

export default function usePlacePhoto(
  placeId?: string,
  options: UsePlacePhotoOptions = {},
): UsePlacePhotoResult {
  const enabled = options.enabled ?? true;
  const cacheKey = useMemo(() => {
    if (!placeId) return null;
    return `place:${placeId}`;
  }, [placeId]);
  const [state, setState] = useState<
    PlacePhotoState & { cacheKey: string | null; resolved: boolean }
  >({
    cacheKey: null,
    url: null,
    attributions: [],
    resolved: false,
  });
  const isCurrentKey = state.cacheKey === cacheKey;
  const currentUrl = isCurrentKey ? state.url : null;
  const currentAttributions = isCurrentKey ? state.attributions : [];
  const currentResolved = isCurrentKey ? state.resolved : false;
  const isLoading = Boolean(enabled && placeId && !cache.has(cacheKey ?? "") && !currentResolved);

  useEffect(() => {
    if (!placeId || !enabled || !cacheKey) return;

    let cancelled = false;

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({
        cacheKey,
        url: cached.url,
        attributions: cached.attributions,
        resolved: true,
      });
      return;
    }

    if (inflight.has(cacheKey)) {
      inflight
        .get(cacheKey)!
        .then((result) => {
          if (cancelled) return;
          setState({
            cacheKey,
            url: result.url,
            attributions: result.attributions,
            resolved: true,
          });
        })
        .catch(() => {
          if (cancelled) return;
          setState({
            cacheKey,
            url: null,
            attributions: [],
            resolved: true,
          });
        });
      return;
    }

    const promise = fetchPlacePhoto(placeId)
      .then((result) => {
        cache.set(cacheKey, result);
        return result;
      })
      .finally(() => {
        inflight.delete(cacheKey);
      });
    inflight.set(cacheKey, promise);
    promise
      .then((result) => {
        if (cancelled) return;
        setState({
          cacheKey,
          url: result.url,
          attributions: result.attributions,
          resolved: true,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          cacheKey,
          url: null,
          attributions: [],
          resolved: true,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    placeId,
    enabled,
    cacheKey,
  ]);

  return {
    url: currentUrl,
    attributions: currentAttributions,
    isLoading,
  };
}

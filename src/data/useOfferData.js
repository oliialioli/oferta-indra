import { useEffect, useState } from 'react';
import { buildScreens, devFixtureOffer } from './staticOfferData';

const EMPTY_STATE = { loading: true, error: null, candidate: null, stats: null, screens: null, offerExpiresAt: null };

/**
 * Fetches one offer's dynamic data (candidate + stats) by slug from
 * GET /api/offers/{slug} — the only public, unauthenticated read of a
 * published OfferRecord (see api/src/functions/offersGet.js) — and
 * resolves it into the exact `{ candidate, screens, stats }` shape
 * App.jsx has always rendered, via staticOfferData.js's buildScreens().
 *
 * With no slug and running under `npm run dev`, falls back to a fixed
 * dev fixture so local frontend work doesn't require the API running.
 */
export function useOfferData(slug) {
  const [state, setState] = useState(EMPTY_STATE);

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      if (import.meta.env.DEV) {
        const { candidate, stats, offerExpiresAt } = devFixtureOffer;
        setState({ loading: false, error: null, candidate, stats, screens: buildScreens(candidate), offerExpiresAt });
      } else {
        setState({ loading: false, error: 'not-found', candidate: null, stats: null, screens: null });
      }
      return undefined;
    }

    setState({ ...EMPTY_STATE });
    fetch(`/api/offers/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'not-found' : 'fetch-error');
        return res.json();
      })
      .then(({ candidate, stats, offerExpiresAt }) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          candidate,
          stats,
          screens: buildScreens(candidate),
          offerExpiresAt: offerExpiresAt || null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: err.message === 'not-found' ? 'not-found' : 'fetch-error',
          candidate: null,
          stats: null,
          screens: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}

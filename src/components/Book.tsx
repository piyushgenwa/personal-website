'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { buildFaces, type Face } from './faces';

/**
 * The turning book.
 *
 * Model: faces (one side of a sheet) are paired into sheets — front on the
 * right-hand page, back on the left once the sheet has been turned. `turned`
 * is how many sheets lie on the left. Turning a sheet is a 3D rotation about
 * the spine; everything else is bookkeeping.
 *
 * Wide screens show a two-page spread. Narrow screens use the same machinery
 * with one face per sheet, so a page turns off to the left like a leaf in a
 * portrait book.
 */

const FLIP_MS = 950;
const NARROW = '(max-width: 60rem)';

function subscribeNarrow(cb: () => void) {
  const m = window.matchMedia(NARROW);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
}
const useNarrow = () =>
  useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );

const chunk = (faces: Face[]) => {
  const out: Face[][] = [];
  for (let i = 0; i < faces.length; i += 2) out.push(faces.slice(i, i + 2));
  return out;
};

export function Book() {
  const narrow = useNarrow();
  const [at, setAt] = useState('cover');
  const [animate, setAnimate] = useState(false);
  const [flying, setFlying] = useState<[number, number] | null>(null);
  const flyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The actions inside faces need to call back into the book, and the book
  // needs the faces — a ref breaks the cycle without re-building on each turn.
  const api = useRef({ goTo: (_id: string) => {}, open: () => {} });
  const faces = useMemo(
    () => buildFaces({ goTo: (id) => api.current.goTo(id), open: () => api.current.open() }),
    [],
  );

  const sheets = useMemo(
    () => (narrow ? faces.filter((f) => f.id !== 'endpaper').map((f) => [f]) : chunk(faces)),
    [faces, narrow],
  );
  const last = sheets.length - 1;

  const turnedFor = useCallback(
    (id: string) => {
      const j = sheets.findIndex((s) => s.some((f) => f.id === id));
      if (j < 0) return 0;
      if (narrow) return j;
      return sheets[j][1]?.id === id ? j + 1 : j;
    },
    [sheets, narrow],
  );
  const turned = turnedFor(at);

  const setHash = (id: string) => {
    try {
      history.replaceState(null, '', id === 'cover' ? location.pathname : `#${id}`);
    } catch {}
  };

  const go = useCallback(
    (id: string) => {
      const from = turnedFor(at);
      const to = turnedFor(id);
      if (from !== to) {
        setFlying([Math.min(from, to), Math.max(from, to)]);
        clearTimeout(flyTimer.current);
        flyTimer.current = setTimeout(() => setFlying(null), FLIP_MS + 400);
      }
      setAnimate(true);
      setAt(id);
      setHash(id);
    },
    [at, turnedFor],
  );

  const turnBy = useCallback(
    (d: number) => {
      const t = Math.min(last, Math.max(0, turned + d));
      if (t !== turned) go(sheets[t][0].id);
    },
    [go, last, sheets, turned],
  );

  api.current = { goTo: go, open: () => turnBy(1) };

  // Deep links: /#jar opens the book at that page, without turning to it.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id && faces.some((f) => f.id === id)) setAt(id);
      else if (!id) setAt('cover');
    };
    fromHash();
    const raf = requestAnimationFrame(() => setAnimate(true));
    const onHash = () => fromHash();
    window.addEventListener('hashchange', onHash);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('hashchange', onHash);
    };
  }, [faces]);

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') turnBy(1);
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') turnBy(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turnBy]);

  // Swipe (touch only, so mouse text selection is left alone).
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dy) < Math.abs(dx) * 0.6) turnBy(dx < 0 ? 1 : -1);
  };

  const closed = !narrow && turned === 0;
  const label = closed ? 'Cover' : narrow ? pageLabel(sheets[turned]?.[0]) : spreadLabel(sheets, turned);

  return (
    <div className="book-wrap">
      <div
        className="book"
        data-narrow={narrow || undefined}
        data-closed={closed || undefined}
        data-animate={animate || undefined}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="sheets">
          {sheets.map((s, k) => {
            const isTurned = k < turned;
            const inFlight = flying && k >= flying[0] && k < flying[1];
            // Un-turned sheets stack front-to-back; turned ones back-to-front;
            // anything mid-flight rides above both.
            const z = inFlight ? 100 + k : isTurned ? k : sheets.length - k;
            const rank = inFlight ? (isTurned ? flying![1] - 1 - k : k - flying![0]) : 0;
            return (
              <div
                key={s[0].id}
                className="sheet"
                data-turned={isTurned || undefined}
                style={{ zIndex: z, transitionDelay: animate ? `${rank * 70}ms` : undefined }}
              >
                <div className="face front" data-face={s[0].id} inert={k !== turned}>
                  {s[0].node}
                </div>
                {s[1] && (
                  <div className="face back" data-face={s[1].id} inert={k !== turned - 1}>
                    {s[1].node}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {turned > 0 && (
          <button type="button" className="curl curl-prev" onClick={() => turnBy(-1)} aria-label="Turn back a page" />
        )}
        {turned < last && turned > 0 && (
          <button type="button" className="curl curl-next" onClick={() => turnBy(1)} aria-label="Turn to the next page" />
        )}
      </div>

      <nav className="book-nav" aria-label="Turn the pages">
        <button type="button" className="sc" onClick={() => turnBy(-1)} disabled={turned === 0}>
          ← Back
        </button>
        <span className="sc" aria-live="polite">
          {label}
        </span>
        <button type="button" className="sc" onClick={() => turnBy(1)} disabled={turned === last}>
          {turned === 0 ? 'Open' : 'Turn'} →
        </button>
      </nav>
    </div>
  );
}

function pageLabel(f?: Face) {
  return f ? name(f.id) : '';
}
function spreadLabel(sheets: Face[][], turned: number) {
  const left = sheets[turned - 1]?.[1];
  const right = sheets[turned]?.[0];
  const names = [left, right].filter(Boolean).map((f) => name(f!.id));
  return names.join(' · ');
}
function name(id: string) {
  const map: Record<string, string> = {
    cover: 'Cover',
    endpaper: 'Endpaper',
    title: 'Title',
    contents: 'Contents',
    'unacademy-2': 'Unacademy, continued',
    'iit-bombay': 'IIT Bombay',
  };
  return map[id] ?? id[0].toUpperCase() + id.slice(1);
}

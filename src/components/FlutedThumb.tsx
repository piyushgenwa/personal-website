'use client';

import { FlutedGlass } from '@paper-design/shaders-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Tweens 0→1 whenever `active` flips. The shader takes plain numbers, so
 * clearing the glass has to be driven from JS rather than a CSS transition.
 */
function useGlide(active: boolean, duration = 620) {
  const [t, setT] = useState(active ? 1 : 0);
  const current = useRef(t);
  current.current = t;

  useEffect(() => {
    const to = active ? 1 : 0;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setT(to);
      return;
    }

    const from = current.current;
    if (from === to) return;

    let raf = 0;
    const span = duration * Math.abs(to - from);
    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / span);
      const eased = 1 - (1 - p) ** 3;
      setT(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration]);

  return t;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A project image behind real fluted glass. At rest the work is obscured; as
 * `revealed` goes true the glass clears — same gesture as the hero's wiped band.
 */
export function FlutedThumb({ src, revealed }: { src: string; revealed: boolean }) {
  const t = useGlide(revealed);

  return (
    <FlutedGlass
      className="absolute inset-0 h-full w-full"
      image={src}
      fit="cover"
      // Flute pitch tightens slightly as it clears, so the ribs feel like they
      // are pulling apart rather than just fading.
      size={lerp(0.24, 0.42, t)}
      angle={0}
      shape="lines"
      distortionShape="prism"
      distortion={lerp(0.58, 0.03, t)}
      // Kept low at rest: heavy shadows/highlights wash the image to grey fog
      // instead of reading as coloured light behind ribbed glass.
      shadows={lerp(0.34, 0.08, t)}
      highlights={lerp(0.14, 0.04, t)}
      blur={lerp(0.16, 0, t)}
      edges={0.18}
      grainOverlay={lerp(0.12, 0.04, t)}
      colorBack="#08110f"
      colorShadow="#030c0b"
      colorHighlight="#a8c8c1"
    />
  );
}

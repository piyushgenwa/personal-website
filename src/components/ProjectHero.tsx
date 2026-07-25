'use client';

import { useEffect, useState } from 'react';
import { FlutedThumb } from './FlutedThumb';

/**
 * The project's image, arriving behind glass and clearing on load — the reader
 * has engaged with this project, so the case opens for them.
 */
export function ProjectHero({ src, alt }: { src: string; alt: string }) {
  const [clear, setClear] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setClear(true), 260);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-ink">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      <FlutedThumb src={src} revealed={clear} />
    </div>
  );
}

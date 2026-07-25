'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FlutedThumb } from './FlutedThumb';
import type { Project } from '@/content/projects';

const ACCENT: Record<Project['accent'], string> = {
  sodium: 'var(--color-sodium)',
  flare: 'var(--color-flare)',
  aqua: 'var(--color-aqua)',
};

export function ProjectCard({ project }: { project: Project }) {
  const [engaged, setEngaged] = useState(false);
  const [inView, setInView] = useState(false);
  const [pointerHovers, setPointerHovers] = useState(true);
  const ref = useRef<HTMLElement>(null);

  // Each shader is its own WebGL context, so only spin one up once the card is
  // close to the viewport. Once mounted it stays mounted.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Touch devices never hover, so the glass would stay shut forever. Leave it
  // clear there instead.
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setPointerHovers(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const revealed = engaged || !pointerHovers;

  return (
    <article
      ref={ref}
      className="group relative"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
    >
      <Link
        href={`/work/${project.slug}`}
        className="block focus-visible:outline-offset-6"
        onFocus={() => setEngaged(true)}
        onBlur={() => setEngaged(false)}
      >
        <div
          // Featured spans the full grid, so it needs a shorter ratio or it
          // eats the whole viewport.
          className={`relative overflow-hidden bg-ink ${
            project.featured ? 'aspect-[4/3] sm:aspect-[21/9]' : 'aspect-[4/3]'
          }`}
        >
          {/* Poster underneath so the card is never empty pre-hydration. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumb}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {inView && <FlutedThumb src={project.thumb} revealed={revealed} />}

          {/* Accent rule that grows as the glass clears. */}
          <span
            className="absolute bottom-0 left-0 z-10 h-px w-0 transition-[width] duration-700 ease-[var(--ease-glass)] group-hover:w-full group-focus-within:w-full"
            style={{ background: ACCENT[project.accent] }}
          />
        </div>

        <div className="flex items-baseline justify-between gap-4 pt-4">
          <h3 className="t-display text-[clamp(1.35rem,2.1vw,1.85rem)]">{project.title}</h3>
          <span className="t-data shrink-0">{project.year}</span>
        </div>

        <p className="mt-1.5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-frost-dim">
          {project.tagline}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="t-data" style={{ color: ACCENT[project.accent] }}>
            {project.status}
          </span>
          <span className="h-2.5 w-px bg-frost-faint" aria-hidden="true" />
          <span className="t-data">{project.stack.join(' / ')}</span>
        </div>
      </Link>
    </article>
  );
}

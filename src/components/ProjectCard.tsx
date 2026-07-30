'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SpecimenPlate } from './SpecimenPlate';
import { STATUS_COLOR } from '@/content/status';
import type { Project } from '@/content/projects';

export function ProjectCard({ project }: { project: Project }) {
  const [engaged, setEngaged] = useState(false);
  const [pointerHovers, setPointerHovers] = useState(true);

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
  const live = project.status === 'In progress';

  return (
    <article
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
          <SpecimenPlate project={project} />

          {/* The case. Same CSS pane as the hero — it composites over live DOM,
              so the plate underneath can be type rather than a raster texture.
              Clears on hover/focus: the specimen is what you came to see. */}
          <div
            aria-hidden="true"
            className="glass transition-opacity duration-700 ease-[var(--ease-glass)]"
            style={{ opacity: revealed ? 0 : 1 }}
          />
          <div
            aria-hidden="true"
            className="glass-valleys transition-opacity duration-700 ease-[var(--ease-glass)]"
            style={{ opacity: revealed ? 0 : 1 }}
          />

          {/* Accent rule that grows as the glass clears. */}
          <span
            className="absolute bottom-0 left-0 z-10 h-px w-0 transition-[width] duration-700 ease-[var(--ease-glass)] group-hover:w-full group-focus-within:w-full"
            style={{ background: STATUS_COLOR[project.status] }}
          />
        </div>

        <div className="flex items-baseline justify-between gap-4 pt-4">
          <h3 className="t-display-sm text-[clamp(1.35rem,2.1vw,1.85rem)]">{project.title}</h3>
          <span className="t-data shrink-0">{project.year}</span>
        </div>

        <p className="mt-1.5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-frost-dim">
          {project.tagline}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span
            className="t-data inline-flex items-center gap-1.5"
            style={{ color: STATUS_COLOR[project.status] }}
          >
            {live && (
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-current"
              />
            )}
            {project.status}
          </span>
          <span className="h-2.5 w-px bg-frost-faint" aria-hidden="true" />
          <span className="t-data">{project.stack.join(' / ')}</span>
        </div>
      </Link>
    </article>
  );
}

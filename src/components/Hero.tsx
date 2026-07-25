'use client';

import { Metaballs } from '@paper-design/shaders-react';
import { GlassPane } from './GlassPane';
import { site } from '@/content/site';
import { projects } from '@/content/projects';

/**
 * A vitrine. The metaballs are the specimen; the fluted glass is the case.
 * A band of glass is wiped clear across the middle — that window is the only
 * place the specimen is seen sharply. The type sits on the plate below it, so
 * it never has to fight a moving blob for contrast.
 */
export function Hero() {
  return (
    // --band-top/--band-bot animate here and inherit into the glass, so the
    // window and the scrim can never drift apart.
    <section className="anim-wipe relative isolate flex min-h-svh flex-col overflow-hidden">
      <div className="anim-fade absolute inset-0 -z-10">
        <Metaballs
          className="h-full w-full"
          colorBack="#08110f"
          colors={['#ffa02e', '#ff4d5e', '#35d6c4', '#ffd08a']}
          count={12}
          size={0.56}
          speed={0.4}
          scale={1.05}
          maxPixelCount={1920 * 1080}
        />
      </div>

      <GlassPane banded />
      <div className="hero-scrim" aria-hidden="true" />

      <header className="anim-rise relative z-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-6 pt-7 sm:px-10">
        <span className="t-data text-frost">{site.name}</span>
        <span className="t-data">
          {site.role} · {site.org} · {site.location}
        </span>
      </header>

      <div className="grow" />

      {/* The label plate. */}
      <div className="relative z-10 px-6 pb-12 sm:px-10 sm:pb-14">
        <h1
          className="t-display anim-rise max-w-[26ch] text-[clamp(1.95rem,5.4vw,4.5rem)] [animation-delay:0.55s]"
          style={{ textWrap: 'balance' }}
        >
          {site.headline.map((line, i) => (
            <span key={line} className="block" style={{ animationDelay: `${0.55 + i * 0.09}s` }}>
              {line}
            </span>
          ))}
        </h1>

        <div className="anim-rise mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-5 [animation-delay:0.85s]">
          <p className="t-lede max-w-[46ch] text-pretty">{site.intro}</p>
          <a
            href="#work"
            className="t-data group flex shrink-0 items-center gap-2 text-frost transition-colors hover:text-aqua"
          >
            {projects.length} projects
            <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectHero } from '@/components/ProjectHero';
import { SiteFooter } from '@/components/SiteFooter';
import { getProject, projects } from '@/content/projects';
import { site } from '@/content/site';

/**
 * The project template. Every entry in `projects` renders through this page —
 * to add a case study, add data, not markup.
 */

const ACCENT = {
  sodium: 'var(--color-sodium)',
  flare: 'var(--color-flare)',
  aqua: 'var(--color-aqua)',
} as const;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: `${project.title} — ${site.name}`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  const accent = ACCENT[project.accent];

  return (
    <main>
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
        <nav className="flex items-baseline justify-between gap-6 py-7">
          <Link href="/" className="t-data group text-frost transition-colors hover:text-aqua">
            <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>{' '}
            {site.name}
          </Link>
          <span className="t-data" style={{ color: accent }}>
            {project.status}
          </span>
        </nav>

        <hr className="hairline" />

        <header className="grid gap-x-16 gap-y-8 pt-14 pb-14 lg:grid-cols-[1.35fr_1fr] lg:pt-20">
          <div>
            <h1 className="t-display text-[clamp(2.5rem,7vw,5rem)]">{project.title}</h1>
            <p className="mt-5 max-w-[52ch] text-[clamp(1.0625rem,1.6vw,1.3125rem)] leading-[1.55] text-frost-dim text-pretty">
              {project.summary}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 self-end lg:grid-cols-1">
            <div>
              <dt className="t-data">Year</dt>
              <dd className="mt-1">{project.year}</dd>
            </div>
            <div>
              <dt className="t-data">Role</dt>
              <dd className="mt-1">{project.role}</dd>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <dt className="t-data">Built with</dt>
              <dd className="mt-1">{project.stack.join(', ')}</dd>
            </div>
          </dl>
        </header>
      </div>

      <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
        <ProjectHero src={project.thumb} alt={`${project.title} interface`} />
      </div>

      {project.metrics && project.metrics.length > 0 && (
        <div className="mx-auto max-w-[1240px] px-6 pt-16 sm:px-10">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-8 border-t border-frost-faint/40 pt-8 sm:grid-cols-3">
            {project.metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="t-display text-[clamp(1.75rem,3.4vw,2.75rem)]" style={{ color: accent }}>
                  {metric.value}
                </dt>
                <dd className="t-data mt-2">{metric.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-28">
        <div className="space-y-16">
          {project.blocks.map((block) => (
            <section key={block.heading} className="grid gap-x-16 gap-y-4 lg:grid-cols-[1fr_2.1fr]">
              <h2 className="t-data pt-1.5 lg:sticky lg:top-8 lg:self-start">{block.heading}</h2>
              <div className="max-w-[64ch] space-y-5">
                {block.body.map((para) => (
                  <p key={para} className="text-[clamp(1.0625rem,1.5vw,1.1875rem)] leading-[1.66]">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {project.screenshots && project.screenshots.length > 0 && (
          <div className="mt-16 border-t border-frost-faint/40 pt-8">
            <h2 className="t-data">Sample output</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {project.screenshots.map((shot) => (
                <a
                  key={shot.src}
                  href={shot.src}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden border border-frost-faint/40 transition-opacity hover:opacity-80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot.src} alt={shot.alt} className="aspect-[4/3] w-full object-cover object-top" />
                </a>
              ))}
            </div>
          </div>
        )}

        {project.links && project.links.length > 0 && (
          <div className="mt-16 flex flex-wrap gap-x-7 gap-y-3 border-t border-frost-faint/40 pt-8">
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="t-data text-frost transition-colors hover:text-aqua"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Next project — keeps the reader inside the case rather than bouncing. */}
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
        <Link href={`/work/${next.slug}`} className="group block border-t border-frost-faint/40 py-12">
          <span className="t-data">Next project</span>
          <div className="mt-3 flex items-baseline justify-between gap-6">
            <h2 className="t-display text-[clamp(1.75rem,4.4vw,3rem)] transition-colors group-hover:text-sodium">
              {next.title}
            </h2>
            <span className="t-display shrink-0 text-[clamp(1.5rem,3vw,2rem)] transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </div>
        </Link>
      </div>

      <SiteFooter />
    </main>
  );
}

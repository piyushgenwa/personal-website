import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Leaf } from '@/components/Leaf';
import { person } from '@/content/book';
import { getProject, projects } from '@/content/projects';

/**
 * A plate: one case study on one leaf. Every entry in `projects` renders
 * through this page — to add a case study, add data, not markup.
 */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${person.name}`,
    description: project.summary,
  };
}

export default async function PlatePage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const plateNo = index + 1;
  const next = projects[(index + 1) % projects.length];

  return (
    <main className="desk">
      <Leaf folio={`Plate ${plateNo}`} side={plateNo % 2 === 1 ? 'recto' : 'verso'} head={project.title}>
        <article className="chapter">
          <header className="chapter-head">
            <p className="kicker sc">Plate {plateNo}</p>
            <h1 className="chapter-title">{project.title}</h1>
            <p className="role-blurb" style={{ marginTop: '1rem', fontSize: '1.25rem' }}>
              {project.tagline}
            </p>
          </header>

          <div className="chapter-text">
            <p className="dropcap" style={{ fontSize: '1.15em', lineHeight: 1.55 }}>
              {project.summary}
            </p>

            {project.blocks.map((block) => (
              <section key={block.heading} style={{ marginTop: '2.5rem' }}>
                <h2 className="role-title" style={{ fontStyle: 'italic', fontWeight: 400 }}>
                  {block.heading}
                </h2>
                <div style={{ marginTop: '0.7rem', display: 'grid', gap: '1rem' }}>
                  {block.body.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              </section>
            ))}

            {project.screenshots && project.screenshots.length > 0 && (
              <>
                <span className="fleuron" aria-hidden>
                  ❦
                </span>
                <h2 className="role-title" style={{ fontStyle: 'italic', fontWeight: 400 }}>
                  Sample output
                </h2>
                <div
                  style={{
                    marginTop: '1.25rem',
                    display: 'grid',
                    gap: '1.5rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
                  }}
                >
                  {project.screenshots.map((shot, i) => (
                    <figure key={shot.src} className="plate">
                      <a href={shot.src} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shot.src} alt={shot.alt} loading="lazy" />
                      </a>
                      <figcaption>
                        {plateNo}.{String.fromCharCode(97 + i)} — {shot.alt}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </>
            )}

            {project.links && project.links.length > 0 && (
              <p style={{ marginTop: '2.5rem' }}>
                {project.links.map((link) => (
                  <a key={link.label} className="link" href={link.href} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                ))}
              </p>
            )}
          </div>

          <aside className="chapter-margin" aria-label="In the margin">
            {project.metrics && project.metrics.length > 0 && (
              <div className="margin-figs" style={{ marginBottom: '2rem' }}>
                {project.metrics.map((m) => (
                  <div key={m.label}>
                    <span className="fig-value">{m.value}</span>
                    <span className="fig-label">{m.label}</span>
                  </div>
                ))}
              </div>
            )}
            <dl className="margin-note" style={{ display: 'grid', gap: '0.9rem', marginTop: 0 }}>
              <div>
                <dt className="sc" style={{ color: 'var(--color-ink-soft)' }}>Year</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt className="sc" style={{ color: 'var(--color-ink-soft)' }}>Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt className="sc" style={{ color: 'var(--color-ink-soft)' }}>Status</dt>
                <dd>{project.status}</dd>
              </div>
              <div>
                <dt className="sc" style={{ color: 'var(--color-ink-soft)' }}>Built with</dt>
                <dd>{project.stack.join(', ')}</dd>
              </div>
            </dl>
          </aside>
        </article>

        <hr className="rule" style={{ margin: '3.5rem 0 1.5rem' }} />
        <nav style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/#plates" className="link">
            ← Back to the book
          </Link>
          <Link href={`/work/${next.slug}`} className="link">
            Turn the page: Plate {(index + 1) % projects.length + 1}, {next.title} →
          </Link>
        </nav>
      </Leaf>
    </main>
  );
}

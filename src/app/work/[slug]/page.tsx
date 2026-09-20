import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Backdrop } from '@/components/Backdrop';
import { CameraBody, type Controls } from '@/components/CameraBody';
import { person } from '@/content/book';
import { getProject, projects } from '@/content/projects';
import { frameIndex, roll } from '@/content/roll';

/**
 * A case study, shown on the camera's LCD in playback. The hardware still works:
 * ◀ ▶ step to the neighbouring picture, W goes back to the index, the shutter
 * goes home. Every entry in `projects` renders here — add data, not markup.
 */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: `${project.title} — ${person.name}`, description: project.summary };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const i = frameIndex(slug);
  const frame = roll[i];
  const prev = roll[i - 1];
  const next = roll[i + 1];
  const hrefFor = (id: string) => (getProject(id) ? `/work/${id}` : `/#${id}`);

  const controls: Controls = {
    left: prev ? { href: hrefFor(prev.id) } : undefined,
    right: next ? { href: hrefFor(next.id) } : undefined,
    wide: { href: '/#roll' },
    play: { href: '/#roll' },
    center: { href: '/#roll' },
    menu: { href: '/#roll' },
    shutter: { href: '/' },
  };

  return (
    <main className="stage">
      <Backdrop />
      <CameraBody controls={controls} lcdLabel={`Case study — ${project.title}`}>
        <div className="scr">
          <div className={`scene scene-${frame.scene}`} aria-hidden />
          <div className="photo-scroll" tabIndex={0}>
            <article className="photo-card photo-card--wide glass">
              <p className="eyebrow">Working model · {project.status}</p>
              <h1 className="photo-title">{project.title}</h1>
              <p className="meta">
                {project.year} · {project.role} · {project.stack.join(', ')}
              </p>
              <p className="blurb">{project.tagline}</p>
              <p className="lead">{project.summary}</p>

              {project.metrics && (
                <div className="chips">
                  {project.metrics.map((m) => (
                    <div key={m.label} className="chip">
                      <b>{m.value}</b>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {project.blocks.map((b) => (
                <section key={b.heading} className="case-block">
                  <h2>{b.heading}</h2>
                  {b.body.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </section>
              ))}

              {project.screenshots && (
                <section className="case-block">
                  <h2>Sample output</h2>
                  <div className="prints">
                    {project.screenshots.map((s, n) => (
                      <figure key={s.src} className="print">
                        <a href={s.src} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.src} alt={s.alt} loading="lazy" />
                        </a>
                        <figcaption>
                          {i + 1}.{n + 1} — {s.alt}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              {project.links && (
                <p className="see">
                  {project.links.map((l) => (
                    <a key={l.label} className="gel" href={l.href} target="_blank" rel="noreferrer">
                      {l.label} ↗
                    </a>
                  ))}
                </p>
              )}
            </article>
          </div>
          <span className="stamp mono">{frame.stamp}</span>
          <div className="hud hud-top">
            <span>
              <b className="badge">▶</b> <span className="mono">{`${pad(i + 1)}/${pad(roll.length)}`}</span>
            </span>
            <span className="hud-right">
              <span className="mono">12M</span>
              <span className="battery" aria-hidden>
                <i />
                <i />
                <i />
              </span>
            </span>
          </div>
        </div>
      </CameraBody>
      <p className="stage-hint">
        <a href="/#roll">← Back to the photo roll</a>
      </p>
    </main>
  );
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import { chapters, person } from '@/content/book';
import { projects } from '@/content/projects';
import { Leaf, LeadWord } from './Leaf';

/**
 * Every face of the book, in reading order. A face is one side of one sheet.
 * <Book> pairs them into sheets (front/back), so the order here — and only the
 * order — decides which pages share a spread:
 *
 *   cover | endpaper  ·  i | ii  ·  1 | 2  ·  3 | 4  ·  5 | 6  ·  7
 */
export interface Face {
  id: string;
  node: ReactNode;
}

const dim = { color: 'var(--color-ink-soft)' } as const;

/** A link that turns the book instead of jumping the page. */
function GoLink({
  to,
  goTo,
  className,
  children,
}: {
  to: string;
  goTo: (id: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        goTo(to);
      }}
    >
      {children}
    </a>
  );
}

export function buildFaces({
  goTo,
  open,
}: {
  goTo: (id: string) => void;
  open: () => void;
}): Face[] {
  // Each role is its own page. The first role of a chapter carries the chapter
  // heading; later ones say "continued".
  const rolePages = chapters.flatMap((c, ci) =>
    c.roles.map((r, ri) => ({ c, r, ci, ri, id: ri === 0 ? c.id : `${c.id}-${ri + 1}` })),
  );

  const faces: Face[] = [];

  faces.push({
    id: 'cover',
    node: (
      <div className="cover" aria-label="Cover">
        <p className="foil sc" style={{ fontSize: '1rem' }}>
          Curriculum vitae &nbsp;·&nbsp; MMXXVI
        </p>
        <div>
          <h1 className="cover-name foil">{person.name}</h1>
          <span className="foil cover-fleuron" aria-hidden>
            ❦
          </span>
          <p className="foil" style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>
            A résumé in four chapters
          </p>
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', gap: '1.4rem' }}>
          <p className="foil sc" style={{ fontSize: '1rem' }}>
            {person.title}
          </p>
          <button type="button" className="cover-open foil sc" onClick={open}>
            Open the book <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    ),
  });

  faces.push({
    id: 'endpaper',
    node: (
      <div className="endpaper" aria-hidden>
        <div className="bookplate">
          <p className="sc">Ex libris</p>
          <p className="bookplate-name">{person.name}</p>
        </div>
      </div>
    ),
  });

  faces.push({
    id: 'title',
    node: (
      <Leaf bound folio="i" side="recto" head="Title">
        <div className="title-page">
          <p className="kicker sc">A résumé in four chapters</p>
          <div>
            <h2 className="title-name">{person.name}</h2>
            <span className="fleuron" aria-hidden>
              ❦
            </span>
            <p style={{ ...dim, fontStyle: 'italic', fontSize: '1.15rem' }}>{person.title}</p>
          </div>
          <p className="sc" style={dim}>
            {person.city} &nbsp;·&nbsp; Edition of 2026
          </p>
        </div>
      </Leaf>
    ),
  });

  // Folios: contents is ii; chapter pages run 1…n; then plates, colophon.
  const platesFolio = rolePages.length + 1;
  const colophonFolio = rolePages.length + 2;
  const folioOf = (id: string) => String(rolePages.findIndex((p) => p.id === id) + 1);

  faces.push({
    id: 'contents',
    node: (
      <Leaf bound folio="ii" side="verso" head="Contents">
        <p className="kicker sc">Contents</p>
        <h2 className="folio-title">Four years of product, latest first.</h2>
        <p style={{ ...dim, marginTop: '0.9rem', maxWidth: '42ch', fontStyle: 'italic' }}>
          From payments at scale to agents in production — one chapter to a workplace.
        </p>
        <hr className="rule" style={{ margin: '1.3rem 0 1.1rem' }} />
        <ol style={{ display: 'grid', gap: '0.8rem' }}>
          {chapters.map((c) => (
            <li key={c.id}>
              <GoLink to={c.id} goTo={goTo} className="toc-row">
                <span className="toc-name">
                  <span className="toc-numeral sc">{c.numeral}</span>
                  {c.title}
                </span>
                <span className="leader" aria-hidden />
                <span className="num">{folioOf(c.id)}</span>
              </GoLink>
              <p className="toc-sub">
                {c.roles.map((r) => r.title).join(' · ')} · {c.span}
              </p>
            </li>
          ))}
          <li>
            <GoLink to="plates" goTo={goTo} className="toc-row">
              <span className="toc-name">
                <span className="toc-numeral sc">—</span>Plates
              </span>
              <span className="leader" aria-hidden />
              <span className="num">{platesFolio}</span>
            </GoLink>
            <p className="toc-sub">Working models</p>
          </li>
          <li>
            <GoLink to="colophon" goTo={goTo} className="toc-row">
              <span className="toc-name">
                <span className="toc-numeral sc">—</span>Colophon
              </span>
              <span className="leader" aria-hidden />
              <span className="num">{colophonFolio}</span>
            </GoLink>
            <p className="toc-sub">How to reach me</p>
          </li>
        </ol>
      </Leaf>
    ),
  });

  rolePages.forEach(({ c, r, ri, id }, i) => {
    const folio = i + 1;
    faces.push({
      id,
      node: (
        <Leaf bound folio={String(folio)} side={folio % 2 ? 'recto' : 'verso'} head={c.title}>
          <article className="chapter">
            <header className="chapter-head">
              <p className="kicker sc">
                Chapter {c.numeral}
                {ri > 0 && ', continued'}
              </p>
              {ri === 0 ? (
                <h2 className="chapter-title">{c.title}</h2>
              ) : (
                <p className="chapter-cont">{c.title}</p>
              )}
            </header>

            <section className="role">
              <div className="role-head">
                <h3 className="role-title">{r.title}</h3>
                <p className="role-meta">
                  {r.place} · {r.dates}
                </p>
              </div>
              {r.blurb && <p className="role-blurb">{r.blurb}</p>}
              <ul className="entries">
                {r.bullets.map((b) => (
                  <li key={b}>
                    <LeadWord text={b} />
                  </li>
                ))}
              </ul>
            </section>

            {(r.figures || (ri === 0 && c.plates)) && (
              <aside className="chapter-margin" aria-label="In the margin">
                {r.figures && (
                  <div className="margin-figs">
                    {r.figures.map((f) => (
                      <div key={f.label}>
                        <span className="fig-value">{f.value}</span>
                        <span className="fig-label">{f.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {ri === 0 && c.plates && (
                  <p className="margin-note">
                    <span className="sc">See the plates</span>
                    {c.plates.map((slug) => {
                      const p = projects.find((x) => x.slug === slug);
                      if (!p) return null;
                      return (
                        <Link key={slug} href={`/work/${slug}`} className="link">
                          Plate {projects.indexOf(p) + 1} — {p.title}
                        </Link>
                      );
                    })}
                  </p>
                )}
              </aside>
            )}
          </article>
        </Leaf>
      ),
    });
  });

  faces.push({
    id: 'plates',
    node: (
      <Leaf bound folio={String(platesFolio)} side={platesFolio % 2 ? 'recto' : 'verso'} head="Plates">
        <p className="kicker sc">Plates</p>
        <h2 className="folio-title">Working models</h2>
        <p style={{ ...dim, marginTop: '0.9rem', maxWidth: '42ch', fontStyle: 'italic' }}>
          Things built to find out whether an idea holds. Each has a page of its own.
        </p>
        <hr className="rule" style={{ margin: '1.3rem 0 1.1rem' }} />
        <ol style={{ display: 'grid', gap: '1.3rem' }}>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <Link href={`/work/${p.slug}`} className="toc-row">
                <span className="toc-name">
                  <span className="toc-numeral sc">{i + 1}</span>
                  {p.title}
                </span>
                <span className="leader" aria-hidden />
                <span className="num">{p.year}</span>
              </Link>
              <p className="toc-sub">{p.tagline}</p>
            </li>
          ))}
        </ol>
      </Leaf>
    ),
  });

  faces.push({
    id: 'colophon',
    node: (
      <Leaf bound folio={String(colophonFolio)} side={colophonFolio % 2 ? 'recto' : 'verso'} head="Colophon">
        <p className="kicker sc">Colophon</p>
        <h2 className="folio-title">Correspondence</h2>
        <dl style={{ marginTop: '1.6rem', display: 'grid', gap: '1rem' }}>
          <div>
            <dt className="sc" style={dim}>Write</dt>
            <dd style={{ fontSize: '1.2rem' }}>
              <a className="link" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="sc" style={dim}>Elsewhere</dt>
            <dd style={{ fontSize: '1.2rem' }}>
              <a className="link" href={person.linkedin.href} target="_blank" rel="noreferrer">
                {person.linkedin.label}
              </a>
            </dd>
          </div>
          <div>
            <dt className="sc" style={dim}>The short edition</dt>
            <dd style={{ fontSize: '1.2rem' }}>
              <a className="link" href={person.resume} download>
                This book, on one page (PDF)
              </a>
            </dd>
          </div>
        </dl>
        <hr className="rule" style={{ margin: '2rem 0 1.2rem' }} />
        <p style={{ ...dim, fontSize: '0.92rem', fontStyle: 'italic', maxWidth: '42ch' }}>
          Set in Newsreader. Written in {person.city}. Every figure in these pages is taken from the résumé it is
          bound from.
        </p>
      </Leaf>
    ),
  });

  return faces;
}

import Link from 'next/link';
import { Leaf, LeadWord } from '@/components/Leaf';
import { chapters, person } from '@/content/book';
import { projects } from '@/content/projects';

/**
 * Page order is the book's order. Front matter is numbered in roman numerals,
 * chapters take arabic folios from 1, and the plates and colophon follow on.
 */
const sideOf = (n: number) => (n % 2 === 1 ? 'recto' : 'verso') as 'recto' | 'verso';

const dim = { color: 'var(--color-ink-soft)' } as const;

export default function Home() {
  const platesFolio = chapters.length + 1;
  const colophonFolio = chapters.length + 2;

  return (
    <main className="desk">
      {/* ───────── Cover ───────── */}
      <section id="top" className="cover" aria-label="Cover">
        <p className="foil sc" style={{ fontSize: '1.05rem' }}>
          Curriculum vitae &nbsp;·&nbsp; MMXXVI
        </p>

        <div>
          <h1 className="cover-name foil">{person.name}</h1>
          <span
            className="foil"
            style={{ display: 'block', margin: '1.4rem 0', letterSpacing: '0.6em', paddingLeft: '0.6em' }}
            aria-hidden
          >
            ❦
          </span>
          <p className="foil" style={{ fontSize: '1.25rem', fontStyle: 'italic' }}>
            A résumé in four chapters
          </p>
        </div>

        <div style={{ display: 'grid', justifyItems: 'center', gap: '1.6rem' }}>
          <p className="foil sc" style={{ fontSize: '1rem', maxWidth: '24ch' }}>
            {person.title}
          </p>
          <a href="#contents" className="cover-open foil sc">
            Open the book <span aria-hidden>↓</span>
          </a>
        </div>
      </section>

      {/* ───────── Contents (front matter, folio ii) ───────── */}
      <Leaf id="contents" folio="ii" side="verso" head="Contents">
        <p className="kicker sc">Contents</p>
        <h2 className="folio-title" style={{ maxWidth: '16ch' }}>
          Four years of product, latest first.
        </h2>
        <p style={{ ...dim, marginTop: '1.1rem', maxWidth: '46ch', fontStyle: 'italic' }}>
          From payments at scale to agents in production — set down in order, one chapter to a workplace.
        </p>

        <hr className="rule" style={{ margin: '2.5rem 0 1.75rem' }} />

        <ol style={{ display: 'grid', gap: '1.35rem' }}>
          {chapters.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="toc-row">
                <span className="toc-name">
                  <span className="toc-numeral sc">{c.numeral}</span>
                  {c.title}
                </span>
                <span className="leader" aria-hidden />
                <span className="num">{i + 1}</span>
              </a>
              <p className="toc-sub">
                {c.roles.map((r) => r.title).join(' · ')} · {c.span}
              </p>
            </li>
          ))}
          <li>
            <a href="#plates" className="toc-row">
              <span className="toc-name">
                <span className="toc-numeral sc">—</span>Plates
              </span>
              <span className="leader" aria-hidden />
              <span className="num">{platesFolio}</span>
            </a>
            <p className="toc-sub">Working models</p>
          </li>
          <li>
            <a href="#colophon" className="toc-row">
              <span className="toc-name">
                <span className="toc-numeral sc">—</span>Colophon
              </span>
              <span className="leader" aria-hidden />
              <span className="num">{colophonFolio}</span>
            </a>
            <p className="toc-sub">How to reach me</p>
          </li>
        </ol>
      </Leaf>

      {/* ───────── Chapters ───────── */}
      {chapters.map((c, i) => {
        const folio = i + 1;
        return (
          <Leaf key={c.id} id={c.id} folio={String(folio)} side={sideOf(folio)} head={c.title}>
            <article className="chapter">
              <header className="chapter-head">
                <p className="kicker sc">Chapter {c.numeral}</p>
                <h2 className="chapter-title">{c.title}</h2>
              </header>

              <div className="chapter-text">
                {c.roles.map((r, ri) => (
                  <div key={r.title + r.dates}>
                    {ri > 0 && (
                      <span className="fleuron" aria-hidden>
                        ❦
                      </span>
                    )}
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
                  </div>
                ))}
              </div>

              <aside className="chapter-margin" aria-label="In the margin">
                <div className="margin-figs">
                  {c.figures.map((f) => (
                    <div key={f.label}>
                      <span className="fig-value">{f.value}</span>
                      <span className="fig-label">{f.label}</span>
                    </div>
                  ))}
                </div>
                {c.plates && (
                  <p className="margin-note">
                    <span className="sc">See the plates</span>
                    {c.plates.map((slug) => {
                      const p = projects.find((x) => x.slug === slug);
                      if (!p) return null;
                      const n = projects.indexOf(p) + 1;
                      return (
                        <Link key={slug} href={`/work/${slug}`} className="link">
                          Plate {n} — {p.title}
                        </Link>
                      );
                    })}
                  </p>
                )}
              </aside>
            </article>
          </Leaf>
        );
      })}

      {/* ───────── Plates ───────── */}
      <Leaf id="plates" folio={String(platesFolio)} side={sideOf(platesFolio)} head="Plates">
        <p className="kicker sc">Plates</p>
        <h2 className="folio-title">Working models</h2>
        <p style={{ ...dim, marginTop: '1.1rem', maxWidth: '46ch', fontStyle: 'italic' }}>
          Things built to find out whether an idea holds. Each has a page of its own.
        </p>

        <hr className="rule" style={{ margin: '2.5rem 0 1.75rem' }} />

        <ol style={{ display: 'grid', gap: '1.6rem' }}>
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

      {/* ───────── Colophon ───────── */}
      <Leaf id="colophon" folio={String(colophonFolio)} side={sideOf(colophonFolio)} head="Colophon">
        <p className="kicker sc">Colophon</p>
        <h2 className="folio-title">Correspondence</h2>

        <dl style={{ marginTop: '2rem', display: 'grid', gap: '1.1rem', maxWidth: '34rem' }}>
          <div>
            <dt className="sc" style={dim}>Write</dt>
            <dd style={{ fontSize: '1.35rem' }}>
              <a className="link" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="sc" style={dim}>Elsewhere</dt>
            <dd style={{ fontSize: '1.35rem' }}>
              <a className="link" href={person.linkedin.href} target="_blank" rel="noreferrer">
                {person.linkedin.label}
              </a>
            </dd>
          </div>
          <div>
            <dt className="sc" style={dim}>The short edition</dt>
            <dd style={{ fontSize: '1.35rem' }}>
              <a className="link" href={person.resume} download>
                This book, on one page (PDF)
              </a>
            </dd>
          </div>
        </dl>

        <hr className="rule" style={{ margin: '2.75rem 0 1.5rem' }} />
        <p style={{ ...dim, fontSize: '0.95rem', fontStyle: 'italic', maxWidth: '46ch' }}>
          Set in Newsreader. Written in {person.city}. Every figure in these pages is taken from the résumé it is
          bound from.
        </p>
      </Leaf>
    </main>
  );
}

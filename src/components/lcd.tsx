import Link from 'next/link';
import type { ReactNode, RefObject } from 'react';
import { person } from '@/content/book';
import { roll, type Frame } from '@/content/roll';

/** The things drawn on the LCD. All presentational; <Camera> owns the state. */

const pad = (n: number) => String(n).padStart(2, '0');

function Battery() {
  return (
    <span className="battery" aria-label="Battery full" role="img">
      <i />
      <i />
      <i />
    </span>
  );
}

function TopBar({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="hud hud-top">
      <span>{left}</span>
      <span className="hud-right">
        {right}
        <Battery />
      </span>
    </div>
  );
}

function BottomBar({ children }: { children: ReactNode }) {
  return <div className="hud hud-bot">{children}</div>;
}

/* ───────────────────────── Shooting mode ───────────────────────── */

export function ShootScreen({ zoom, disp, locked }: { zoom: number; disp: boolean; locked: boolean }) {
  return (
    <div className="scr">
      {/* The camera is pointed at its owner. Zooming pushes into the frame. */}
      <div
        className="scene scene-vf has-photo"
        style={{ backgroundImage: `url(${person.viewfinder})`, transform: `scale(${1 + zoom * 0.14})` }}
        role="img"
        aria-label={person.viewfinderAlt}
      />
      <div className="vf-scrim" aria-hidden />

      {/* Autofocus, hunting and then locking onto the face. */}
      <div className="af" data-locked={locked || undefined} aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="subject">
        <h1 className="subject-name">{person.name}</h1>
        <p className="subject-role">{person.title}</p>
      </div>

      {disp && (
        <>
          <TopBar
            left={
              <>
                <b className="badge">AUTO</b> <span className="mono">12M</span>
              </>
            }
            right={<span className="mono">{roll.length}</span>}
          />
          <BottomBar>
            <span className="zoombar" aria-label={`Zoom ${zoom} of 4`}>
              <em>W</em>
              <span>
                {[0, 1, 2, 3, 4].map((n) => (
                  <i key={n} data-on={n <= zoom || undefined} />
                ))}
              </span>
              <em>T</em>
            </span>
            <span className="hint">Press the shutter ●</span>
            <span className="mono">2026 · 09</span>
          </BottomBar>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── Photo index ───────────────────────── */

export function IndexScreen({
  sel,
  disp,
  onPick,
}: {
  sel: number;
  disp: boolean;
  onPick: (i: number) => void;
}) {
  return (
    <div className="scr scr-index">
      <div className="index-grid">
        {roll.map((f, i) => (
          <button
            key={f.id}
            type="button"
            className={`tile scene-${f.scene}${f.photo ? ' has-photo' : ''}`}
            style={f.photo ? { backgroundImage: `url(${f.photo})` } : undefined}
            data-sel={i === sel || undefined}
            aria-current={i === sel || undefined}
            onClick={() => onPick(i)}
          >
            <span className="tile-num mono">{pad(i + 1)}</span>
            <span className="tile-label">
              <b>{f.label}</b>
              <small>{f.kind === 'role' ? f.sub : f.kind === 'project' ? f.project.year : 'Contact'}</small>
            </span>
          </button>
        ))}
      </div>
      {disp && (
        <>
          <TopBar
            left={
              <>
                <b className="badge">▶</b> Index
              </>
            }
            right={
              <span className="mono">
                {pad(sel + 1)}/{pad(roll.length)}
              </span>
            }
          />
          <BottomBar>
            <span>◀▶▲▼ Select</span>
            <span>● View</span>
            <span>MENU</span>
          </BottomBar>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── One picture ───────────────────────── */

function Chips({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="chips">
      {items.map((m) => (
        <div key={m.label} className="chip">
          <b>{m.value}</b>
          <span>{m.label}</span>
        </div>
      ))}
    </div>
  );
}

function FrameBody({ frame, onJump }: { frame: Frame; onJump: (id: string) => void }) {
  if (frame.kind === 'role') {
    const { chapter, role, ri } = frame;
    return (
      <>
        <header className="ph">
          <p className="eyebrow">
            {chapter.title}
            {ri > 0 && ' · continued'}
          </p>
          <h2 className="photo-title">{role.title}</h2>
          <p className="meta">
            {role.place} · {role.dates}
          </p>
          {role.blurb && <p className="blurb">{role.blurb}</p>}
        </header>
        <div className="pm">
          <ul className="orbs">
            {role.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <aside className="ps" aria-label="Highlights">
          {role.figures && <Chips items={role.figures} />}
          {ri === 0 && chapter.plates && (
            <p className="see">
              {chapter.plates.map((slug) => {
                const f = roll.find((x) => x.id === slug);
                return f ? (
                  <button key={slug} type="button" className="gel" onClick={() => onJump(slug)}>
                    See: {f.label} →
                  </button>
                ) : null;
              })}
            </p>
          )}
        </aside>
      </>
    );
  }

  if (frame.kind === 'project') {
    const p = frame.project;
    return (
      <>
        <header className="ph">
          <p className="eyebrow">Working model · {p.status}</p>
          <h2 className="photo-title">{p.title}</h2>
          <p className="meta">
            {p.year} · {p.role}
          </p>
          <p className="blurb">{p.tagline}</p>
        </header>
        <div className="pm">
          <p className="lead">{p.summary}</p>
          <p className="meta" style={{ marginTop: '0.9rem' }}>
            Built with {p.stack.join(', ')}
          </p>
        </div>
        <aside className="ps" aria-label="Highlights">
          {p.metrics && <Chips items={p.metrics} />}
          <p className="see">
            <Link href={`/work/${p.slug}`} className="gel">
              Read the case study →
            </Link>
          </p>
        </aside>
      </>
    );
  }

  return (
    <>
      <p className="eyebrow">Contact</p>
      <h2 className="photo-title">Say hello</h2>
      <p className="meta">{person.city}</p>
      <ul className="contact">
        <li>
          <span>Write</span>
          <a href={`mailto:${person.email}`}>{person.email}</a>
        </li>
        <li>
          <span>Elsewhere</span>
          <a href={person.linkedin.href} target="_blank" rel="noreferrer">
            {person.linkedin.label}
          </a>
        </li>
        <li>
          <span>The short edition</span>
          <a href={person.resume} download>
            Résumé, one page (PDF)
          </a>
        </li>
      </ul>
    </>
  );
}

export function PhotoScreen({
  frame,
  index,
  disp,
  dir,
  scrollRef,
  onJump,
}: {
  frame: Frame;
  index: number;
  disp: boolean;
  dir: 1 | -1;
  scrollRef: RefObject<HTMLDivElement | null>;
  onJump: (id: string) => void;
}) {
  return (
    <div className="scr" key={frame.id} data-dir={dir}>
      <div
        className={`scene scene-${frame.scene}${frame.photo ? ' has-photo' : ''}`}
        style={frame.photo ? { backgroundImage: `url(${frame.photo})` } : undefined}
        aria-hidden
      />
      <div className="photo-scroll" ref={scrollRef} tabIndex={0}>
        <article className={`photo-card glass${frame.kind === 'contact' ? '' : ' photo-card--split'}`}>
          <FrameBody frame={frame} onJump={onJump} />
        </article>
      </div>
      <span className="stamp mono" aria-label={`Photo date ${frame.stamp}`}>
        {frame.stamp}
      </span>
      {disp && (
        <>
          <TopBar
            left={
              <>
                <b className="badge">▶</b> <span className="mono">{`${pad(index + 1)}/${pad(roll.length)}`}</span>
              </>
            }
            right={<span className="mono">12M</span>}
          />
          <BottomBar>
            <span className="mono">101-{String(index + 1).padStart(4, '0')}</span>
            <span>◀ ▶ Next</span>
            <span>▲▼ Scroll · W Index</span>
          </BottomBar>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── MENU ───────────────────────── */

export interface MenuItem {
  label: string;
  run: () => void;
}

export function MenuOverlay({ items, sel, onPick }: { items: MenuItem[]; sel: number; onPick: (i: number) => void }) {
  return (
    <div className="menu-ov" role="menu" aria-label="Menu">
      <p className="menu-head">
        <b className="badge">MENU</b>
      </p>
      <ul>
        {items.map((m, i) => (
          <li key={m.label}>
            <button type="button" role="menuitem" data-sel={i === sel || undefined} onClick={() => onPick(i)}>
              {m.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

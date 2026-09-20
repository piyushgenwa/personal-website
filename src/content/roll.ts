import { chapters, type Chapter, type Role } from './book';
import { projects, type Project } from './projects';

/**
 * The photo roll: every "picture" the camera can show, in shooting order.
 * Roles come from the résumé (book.ts), projects from projects.ts, and the last
 * frame is the contact card. Add to either source and the roll follows.
 */

export type Scene = 'sky' | 'meadow' | 'ocean' | 'dusk' | 'lagoon' | 'orchard' | 'glacier' | 'bloom';

const SCENES: Scene[] = ['sky', 'meadow', 'ocean', 'dusk', 'lagoon', 'orchard', 'glacier', 'bloom'];

interface Base {
  id: string;
  scene: Scene;
  /** The orange date imprint burned into the corner, as a 2000s camera would. */
  stamp: string;
  label: string;
  sub: string;
}

export type Frame =
  | (Base & { kind: 'role'; chapter: Chapter; role: Role; ri: number })
  | (Base & { kind: 'project'; project: Project })
  | (Base & { kind: 'contact' });

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

/** "Feb 2026 – Present" → "'26 02" */
function stampOf(dates: string) {
  const [mon, year] = dates.split(' ');
  return `’${year.slice(2)} ${MONTHS[mon] ?? '--'}`;
}

export const roll: Frame[] = [
  ...chapters.flatMap((c) =>
    c.roles.map((role, ri): Frame => ({
      id: ri === 0 ? c.id : `${c.id}-${ri + 1}`,
      kind: 'role',
      scene: 'sky',
      stamp: stampOf(role.dates),
      label: c.title,
      sub: role.title,
      chapter: c,
      role,
      ri,
    })),
  ),
  ...projects.map((p): Frame => ({
    id: p.slug,
    kind: 'project',
    scene: 'sky',
    stamp: `’${p.year.slice(2)}`,
    label: p.title,
    sub: p.tagline,
    project: p,
  })),
  { id: 'contact', kind: 'contact', scene: 'sky', stamp: '’26', label: 'Say hello', sub: 'Contact' } as Frame,
].map((f, i): Frame => ({ ...f, scene: SCENES[i % SCENES.length] }));

export const frameIndex = (id: string) => roll.findIndex((f) => f.id === id);

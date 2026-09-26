import { chapters, type Chapter, type Figure, type FolderItem, type Role } from './book';
import { getProject, projects, type Project } from './projects';

/**
 * The photo roll: everything the camera can show, arranged the way a camera's
 * playback arranges it — some pictures loose on the main menu, some in folders.
 *
 *   folders     one per job (book.ts): what its `folder` lists — a picture of the
 *               work, links out to live sites — or, without one, a picture per
 *               impact number (`figures`) then the projects built there (`plates`)
 *   loose       every project no job claims — the personal projects — then any
 *               chapter marked `single` (a single picture, not a folder), then
 *               the contact card
 *
 * Add to book.ts or projects.ts and the roll follows.
 */

export type Scene = 'sky' | 'meadow' | 'ocean' | 'dusk' | 'lagoon' | 'orchard' | 'glacier' | 'bloom';

/** Real photographs, by frame or folder id. Anything without one gets a painted scene. */
const PHOTOS: Record<string, string> = {
  sourcy: '/photos/sourcy.jpg', // Supertree Grove, Singapore
  jar: '/photos/jar.jpg', // Rocketeer of the Month
  unacademy: '/photos/unacademy.jpg', // sunset from the office roof
  flores: '/projects/flores-tile.jpg', // the bouquet, cropped out of the page
};

const SCENES: Scene[] = ['sky', 'meadow', 'ocean', 'dusk', 'lagoon', 'orchard', 'glacier', 'bloom'];

interface Base {
  id: string;
  scene: Scene;
  /** The orange date imprint burned into the corner, as a 2000s camera would. */
  stamp: string;
  /** A real photograph to use instead of the painted `scene`. Path under /public. */
  photo?: string;
  label: string;
  sub: string;
}

/** A work picture's story, with anything it left out filled in from its role. */
export interface Work {
  title: string;
  blurb?: string;
  bullets: string[];
  figures?: Figure[];
}

/** A picture: opens on the photo screen, and ◀ ▶ step between them. */
export type Frame =
  | (Base & { kind: 'role'; chapter: Chapter; role: Role; ri: number })
  | (Base & { kind: 'figure'; chapter: Chapter; role: Role; figure: Figure })
  | (Base & { kind: 'work'; chapter: Chapter; role: Role; work: Work })
  | (Base & { kind: 'project'; project: Project })
  | (Base & { kind: 'contact' });

/** A tile that opens a live site instead of a picture. */
export type Link = Base & { kind: 'link'; href: string };

export type Folder = Base & {
  kind: 'folder';
  chapter: Chapter;
  /** Everything on the folder's index, in order. */
  items: (Frame | Link)[];
  /** Just its pictures. */
  frames: Frame[];
};

/** Anything on an index screen: a picture, a link, or a folder. */
export type Entry = Frame | Link | Folder;

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};

/** "Feb 2026 – Present" → "'26 02" */
function stampOf(dates: string) {
  const [mon, year] = dates.split(' ');
  return `’${year.slice(2)} ${MONTHS[mon] ?? '--'}`;
}

/** An entry before it has been given its scene and photo. Distributes over the union. */
type Undressed<T> = T extends unknown ? Omit<T, 'scene' | 'photo'> : never;

// Scenes and photos are dealt out in the order things appear, so neighbours differ.
let dealt = 0;
function dress<T extends Entry>(e: Undressed<T>, photo?: string): T {
  return { ...e, scene: SCENES[dealt++ % SCENES.length], photo: photo ?? PHOTOS[e.id] } as T;
}

const projectFrame = (p: Project) =>
  dress<Frame>({ id: p.slug, kind: 'project', stamp: `’${p.year.slice(2)}`, label: p.title, sub: p.tagline, project: p });

const claimed = new Set(chapters.flatMap((c) => c.plates ?? []));

/** A folder's contents as book.ts spells them out. */
function listed(c: Chapter, items: FolderItem[]): (Frame | Link)[] {
  return items.map((it) => {
    if (it.kind === 'link') {
      return dress<Link>({ id: it.id, kind: 'link', stamp: '', label: it.label, sub: it.sub, href: it.href }, it.photo);
    }
    const role = c.roles[it.role ?? 0];
    const work: Work = {
      title: it.title,
      blurb: it.blurb ?? role.blurb,
      bullets: it.bullets ?? role.bullets,
      figures: it.figures ?? role.figures,
    };
    return dress<Frame>(
      { id: it.id, kind: 'work', stamp: stampOf(role.dates), label: it.label, sub: it.sub, chapter: c, role, work },
      it.photo,
    );
  });
}

/** A folder's contents derived from the job: its impact numbers, then its projects. */
function derived(c: Chapter): Frame[] {
  const figures = c.roles.flatMap((role) => (role.figures ?? []).map((figure) => ({ role, figure })));
  return [
    ...figures.map(({ role, figure }, n) =>
      dress<Frame>({
        id: `${c.id}-${n + 1}`,
        kind: 'figure',
        stamp: stampOf(role.dates),
        label: figure.value,
        sub: figure.label,
        chapter: c,
        role,
        figure,
      }),
    ),
    ...(c.plates ?? []).flatMap((slug) => {
      const p = getProject(slug);
      return p ? [projectFrame(p)] : [];
    }),
  ];
}

export const folders: Folder[] = chapters
  .filter((c) => !c.single)
  .map((c) => {
    const items = c.folder ? listed(c, c.folder) : derived(c);
    const latest = c.roles[0];
    return dress<Folder>({
      id: c.id,
      kind: 'folder',
      stamp: stampOf(latest.dates),
      label: c.title,
      sub: latest.title,
      chapter: c,
      items,
      frames: items.filter((e): e is Frame => e.kind !== 'link'),
    });
  });

/** What sits on the main menu, in order. */
export const menu: Entry[] = [
  ...folders,
  ...projects.filter((p) => !claimed.has(p.slug)).map(projectFrame),
  ...chapters
    .filter((c) => c.single)
    .flatMap((c) =>
      c.roles.map((role, ri) =>
        dress<Frame>({
          id: ri === 0 ? c.id : `${c.id}-${ri + 1}`,
          kind: 'role',
          stamp: stampOf(role.dates),
          label: c.title,
          sub: role.title,
          chapter: c,
          role,
          ri,
        }),
      ),
    ),
  dress<Frame>({ id: 'contact', kind: 'contact', stamp: '’26', label: 'Say hello', sub: 'Contact' }),
];

/** The pictures on the main menu — what ◀ ▶ steps through outside a folder. */
const loose = menu.filter((e): e is Frame => e.kind !== 'folder' && e.kind !== 'link');

/** Every picture, wherever it lives. */
export const roll: Frame[] = [...folders.flatMap((f) => f.frames), ...loose];

export const getFolder = (id: string) => folders.find((f) => f.id === id);

/**
 * Where a picture lives: its folder (or null for the main menu), the pictures
 * it sits among, and its place in them. ◀ ▶ never leave a folder.
 */
export function locate(id: string): { folder: Folder | null; frames: Frame[]; index: number } | null {
  for (const folder of folders) {
    const index = folder.frames.findIndex((f) => f.id === id);
    if (index >= 0) return { folder, frames: folder.frames, index };
  }
  const index = loose.findIndex((f) => f.id === id);
  return index >= 0 ? { folder: null, frames: loose, index } : null;
}

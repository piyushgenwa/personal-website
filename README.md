# Personal website

Project showcase built with Next.js 16 (App Router), React 19, Tailwind v4, and
[Paper Design shaders](https://github.com/paper-design/shaders).

```bash
npm run dev        # http://localhost:3000
npm run build      # production build (statically prerenders every project page)
npm run typecheck
npm run thumbs     # regenerate placeholder project thumbnails
```

> **Toolchain note:** `typescript` is pinned to `5.x` on purpose. `typescript@7`
> (the native port) has a different package layout that Next 16's TypeScript
> detection can't resolve — `next build` fails with
> `The "id" argument must be of type string. Received undefined`. Don't bump it
> to 7 until Next supports it.

## Design direction — "vitrine"

The metaballs are a living specimen; the fluted glass is the display case.
Everything sits behind glass until you engage with it. In the hero a band of
glass is **wiped clear** across the middle, and that window is the only place
the specimen is seen sharply — the type sits on the plate below, so it never
competes with a moving blob for contrast. Project cards repeat the gesture:
the glass clears on hover to reveal the work.

Palette is cold industrial glass with warm organic light behind it (sodium
lamps through a glass-block wall). Tokens live in `src/app/globals.css`:

| Token       | Value     | Role                          |
| ----------- | --------- | ----------------------------- |
| `ink`       | `#08110f` | Base — cold green-black       |
| `panel`     | `#0f1e1f` | Raised surface                |
| `frost`     | `#d3ded9` | Primary text (cool bone)      |
| `sodium`    | `#ffa02e` | Primary accent                |
| `flare`     | `#ff4d5e` | Secondary accent              |
| `aqua`      | `#35d6c4` | Interactive / links           |

Type: **Bricolage Grotesque** (display) · **Instrument Sans** (body) ·
**IBM Plex Mono** (data, labels, anything scanned rather than read). The three
roles are `.t-display`, body default, and `.t-data`.

`--flute` is the flute pitch and doubles as the page grid — structural rules
and the glass ribbing share it. It narrows to `21px` under 640px.

## Adding a project

Add an entry to `projects` in `src/content/projects.ts`. That's it — it appears
on the index and gets a page at `/work/<slug>` through the shared template at
`src/app/work/[slug]/page.tsx`. No new components.

```ts
{
  slug: 'my-project',
  title: 'My Project',
  tagline: 'one lowercase line, no period',
  year: '2026',
  role: 'Design and build',
  status: 'Shipped',            // Shipped | In progress | Archived | Experiment
  stack: ['TypeScript', 'Postgres'],
  thumb: '/projects/my-project.png',
  accent: 'sodium',             // sodium | flare | aqua
  featured: true,               // spans the full grid — use for one, not all
  summary: 'Two or three sentences.',
  metrics: [{ value: '9 min', label: 'median review' }],  // optional
  blocks: [{ heading: 'The problem', body: ['…'] }],
}
```

Your name, headline, intro, and links live in `src/content/site.ts`.

### Thumbnails

`thumb` **must be a raster image** (PNG/JPG). The `FlutedGlass` shader samples
it as a WebGL texture, and an SVG data URI is not reliably usable as one.

The committed thumbnails are generated placeholders — drop real screenshots at
the same paths to replace them, or edit `scripts/gen-thumbs.mjs` and run
`npm run thumbs`.

## The one thing to know about the shaders

**`FlutedGlass` is an image filter, not an overlay.** It takes
`image?: HTMLImageElement | string` and refracts *that texture*. It cannot
refract live DOM or an animating WebGL canvas beneath it.

So the site uses two different implementations of the same look:

- **`GlassPane`** (`src/components/GlassPane.tsx`) — fluted glass in CSS, for
  use over *live* content. Specular flute lighting via `repeating-linear-gradient`
  plus two depths of `backdrop-filter` blur (valleys blur more than ridges,
  which is true of real fluted glass). This is what sits over the hero's
  metaballs and over the footer.
- **`FlutedThumb`** (`src/components/FlutedThumb.tsx`) — the real
  `FlutedGlass` shader, used where there *is* an image: project thumbnails and
  the project page hero. Shader params are plain numbers, so the clear/obscure
  transition is tweened in JS (`useGlide`) rather than by CSS.

If you want true shader refraction in the hero, the metaballs would need to be
rendered to a texture first and fed in as an image — not wired up here.

## Performance and accessibility notes

- Each shader is its own WebGL context, so `ProjectCard` only mounts one once
  the card is within `300px` of the viewport, and keeps a plain `<img>` poster
  underneath so nothing flashes empty.
- Cards clear on hover *and* focus. On touch (`(hover: hover)` fails) the glass
  stays clear, since it would otherwise never open.
- `prefers-reduced-motion` skips the hero wipe, the scroll reveals, and the
  card tween.

# Personal website — genwa·shot

A résumé shot on a 2000s compact camera, in Frutiger Aero. Next.js 16 (App Router),
React 19, Tailwind v4 (reset only). Everything visual is CSS — no images, no WebGL.

```bash
npm run dev        # http://localhost:3000
npm run build      # statically prerenders every page
npm run typecheck
```

## The camera

The home page is a working camera with three screens, like the real thing:

| Screen   | What it is                                          | Controls |
| -------- | --------------------------------------------------- | -------- |
| **shoot**  | Viewfinder — your name as the subject, AF brackets that lock green | Shutter / `●` takes the picture → index. `T`/`W` zoom the view |
| **index**  | The photo roll, 3×3 thumbnails                      | Arrows move, `●` / `T` opens |
| **photo**  | One role / project / the contact card, with the orange date stamp | `◀ ▶` next picture, `▲ ▼` scroll, `W` back to index |

Shutter from anywhere but the viewfinder returns to it (a real camera's half-press
does the same). **MENU** opens the list (photo roll, résumé PDF, email, LinkedIn);
**DISP** hides the on-screen info. Keyboard mirrors the hardware: arrows, `Enter` = ●,
`Space` = shutter, `M`, `D`, `W`, `T`, `P`, `Esc`. Swipe works on touch.
`/#roll` and `/#<id>` (e.g. `/#jar`) deep-link to a screen. `prefers-reduced-motion`
removes the bubbles' drift and the slides.

## Structure

- `src/content/book.ts` — the résumé itself (roles, bullets, figures, contact).
  Edit this when the résumé changes. `figures` must also appear in that role's bullets.
- `src/content/projects.ts` — case studies at `/work/<slug>`. Entries marked
  `draft: true` are placeholder copy from the original scaffold and never render.
- `src/content/roll.ts` — the photo roll: roles + projects + the contact card,
  in shooting order, each assigned a landscape "scene" and an orange date stamp.
  Add a role or project and the roll follows.
- `src/components/CameraBody.tsx` — shell, LCD bezel and controls. Each control is a
  button (`onClick`) or a link (`href`), so the same body drives the interactive
  home page and the plain case-study pages.
- `src/components/Camera.tsx` — the state machine. `lcd.tsx` — what's drawn on the LCD.
- `src/components/Backdrop.tsx` — sky, hill, bubbles.
- `src/app/camera.css` — the body as a physical object. `globals.css` — tokens, wallpaper,
  and everything drawn *on* the LCD.

## Design

Frutiger Aero: bright sky and green hill, glossy aqua glass, glass-bead bullets,
bubbles. The camera is brushed silver with a blue-gel `●` button. The LCD is dark
glass with a reflection and faint scanlines. HUD numerals and the date stamp use
Share Tech Mono; UI text is Open Sans (a free stand-in for Frutiger). The
"genwa·shot" name is deliberately not a real camera brand.

Glass = a bright top half over a deeper bottom half, a hard white edge, and
`backdrop-filter`. Landscapes on the LCD are layered CSS gradients.

The body is meant to read as a real object, so two rules hold throughout
`camera.css`:

1. **The metal is lit by the scene it sits in.** Sky above, grass below — so every
   horizontal surface runs cool white along its top edge and picks up a warm green
   bounce along its bottom one. A `--curve` overlay darkens both sides so the body
   reads as a slab that turns away from you, not a flat card.
2. **Nothing is flat.** Every part is either raised (`--raised`: bright top edge,
   dark underside, cast shadow) or recessed (`--sunken`: dark top edge, bright
   bottom edge). Buttons actually travel on `:active`.

The top plate is a real surface — `rotateX(64deg)` on `.deck`, with the shutter and
power button on it. Anything printed there is pre-stretched by `--deck-squash`
(1/cos 64° ≈ 2.28) so it prints true once foreshortened. Parts with no function —
screws, strap lug, microphone, speaker — are `<span aria-hidden>` and never focusable.

> **Toolchain note:** `typescript` is pinned to `5.x` on purpose — `typescript@7`
> has a different package layout that Next 16 can't resolve yet.

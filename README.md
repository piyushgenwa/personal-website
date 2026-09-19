# Personal website — the book

A résumé set as a book. Next.js 16 (App Router), React 19, Tailwind v4. No client
JS, no shaders, no images beyond the case-study screenshots.

```bash
npm run dev        # http://localhost:3000
npm run build      # statically prerenders every page
npm run typecheck
```

## Structure

The home page is a book on a desk: **cover → contents (ii) → one chapter per
workplace (1–4) → plates (5) → colophon (6)**. It follows the résumé's order, latest first.

- `src/content/book.ts` — the résumé itself. Every fact and number on the site
  lives here; edit it when the résumé changes. `figures` are the numbers pulled
  into the margin, and must also appear in that entry's bullets.
- `src/content/projects.ts` — the *plates*: case studies at `/work/<slug>`.
  Entries marked `draft: true` are placeholder copy from the original scaffold
  and are never rendered.
- `src/components/Leaf.tsx` — one page (running head, folio, gutter side).
  Odd folios are recto, even are verso; the head alternates like a printed book.
- `public/Piyush_Resume_26.pdf` — linked from the colophon as "the short edition".

## Design

One typeface (**Newsreader**, with its optical-size axis), one accent (rubric red
— the colour printers used for headings), warm paper on a darker desk. Tokens are
in `src/app/globals.css`.

- Paper is an inline SVG noise texture plus a gutter shadow that flips per page,
  and a stacked box-shadow for the fore-edge.
- The first word of each entry is set in small caps so a page scans like a résumé.
- Numbers go in the margin column (below the text on narrow screens).
- Screenshots are "tipped-in plates": mounted on a card, captioned `1.a`, `1.b`.
- `@media print` drops the cover and desk and puts one leaf per printed page.

> **Toolchain note:** `typescript` is pinned to `5.x` on purpose — `typescript@7`
> has a different package layout that Next 16 can't resolve yet.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { person } from '@/content/book';

/**
 * One page of the book. Odd folios are recto (gutter on the left), even are
 * verso, and the running head alternates the way a printed book's does:
 * author on the left-hand page, chapter on the right.
 *
 * `bound` is a page inside the turning <Book>: it fills its face, scrolls
 * internally if the text is long, and leaves shadows to the book.
 */
export function Leaf({
  id,
  folio,
  side,
  head,
  bound = false,
  children,
}: {
  id?: string;
  /** Printed at the foot — "ii", "3". */
  folio: string;
  side: 'recto' | 'verso';
  /** Running head for the recto page; the verso page always carries the author. */
  head: string;
  bound?: boolean;
  children: ReactNode;
}) {
  const author = bound ? <span>{person.name}</span> : <Link href="/#top">{person.name}</Link>;
  return (
    <section id={bound ? undefined : id} className={bound ? 'leaf leaf--bound' : 'leaf'} data-side={side}>
      <header className="leaf-head sc">
        {side === 'verso' ? (
          <>
            {author}
            <span aria-hidden />
          </>
        ) : (
          <>
            <span aria-hidden />
            <span>{head}</span>
          </>
        )}
      </header>
      <div className="leaf-body">{children}</div>
      <footer className="leaf-folio">{folio}</footer>
    </section>
  );
}

/** The first word of an entry, set in small caps so a page scans like a résumé. */
export function LeadWord({ text }: { text: string }) {
  const i = text.indexOf(' ');
  if (i < 0) return <>{text}</>;
  return (
    <>
      <span className="sc">{text.slice(0, i)}</span>
      {text.slice(i)}
    </>
  );
}

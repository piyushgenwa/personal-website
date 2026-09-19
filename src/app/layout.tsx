import type { Metadata } from 'next';
import { Newsreader } from 'next/font/google';
import { person } from '@/content/book';
import './globals.css';
import './book.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${person.name} — ${person.title}`,
  description:
    'A résumé set as a book: product management across agentic AI, consumer fintech and payments at scale.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={newsreader.variable}>
      <body>{children}</body>
    </html>
  );
}

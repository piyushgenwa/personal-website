import type { Metadata } from 'next';
import { Open_Sans, Share_Tech_Mono } from 'next/font/google';
import { person } from '@/content/book';
import './globals.css';
import './camera.css';

// Open Sans is the closest free cousin of Frutiger, the face of every Aero UI.
const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

// LCD numerals and the orange date stamp.
const shareTech = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-share-tech',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${person.name} — ${person.title}`,
  description:
    'A résumé shot on a 2000s compact camera: product management across agentic AI, consumer fintech and payments at scale.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${shareTech.variable}`}>
      <body>{children}</body>
    </html>
  );
}

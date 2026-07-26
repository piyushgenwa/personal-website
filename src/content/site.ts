/**
 * Everything the site says about you lives here. Edit this file, not the
 * components.
 */

export const site = {
  name: 'Piyush Genwa',
  // Shown in the hero's clear band, split so the line break is deliberate.
  headline: ['Product Manager at the intersection of', 'Empathy and Taste'],
  role: 'Product engineer',
  org: 'Sourcy',
  location: 'Surat, IN',
  email: 'piyushgenwa@gmail.com',

  intro:
    'I build the tools that sit between a spreadsheet and a shipment — quoting, spec review, supplier data. The work is making messy inputs legible, then making the legible version fast.',

  about: [
    'I work on sourcing systems at Sourcy, where the hard part is rarely the algorithm. It is that a buyer has 400 line items in a spreadsheet, three of the columns mean the same thing, and the supplier replied in a PDF.',
    'So I spend most of my time on the seams: parsing, reconciliation, and interfaces that let someone correct a machine quickly instead of trusting it blindly. I like problems where the data is real and slightly broken.',
  ],

  links: [
    { label: 'GitHub', href: 'https://github.com/piyushgenwa-srcy' },
    { label: 'Email', href: 'mailto:piyushgenwa@gmail.com' },
    { label: 'LinkedIn', href: '#' },
  ],
} as const;

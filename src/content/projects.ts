/**
 * Project registry. Add an entry here and it appears on the index and gets its
 * own page at /work/<slug> via the shared template — no new components needed.
 *
 * `thumb` must be a raster image (PNG/JPG) because the FlutedGlass shader
 * samples it as a WebGL texture. Regenerate the placeholders with
 * `node scripts/gen-thumbs.mjs`, or drop real screenshots at the same paths.
 */

export type Accent = 'sodium' | 'flare' | 'aqua';

export interface ProjectBlock {
  /** Section label, e.g. "The problem". Reads as prose, not a numbered step. */
  heading: string;
  body: string[];
}

export interface Project {
  slug: string;
  title: string;
  /** One line, lowercase, no period — sits under the title on the card. */
  tagline: string;
  year: string;
  role: string;
  status: 'Shipped' | 'In progress' | 'Archived' | 'Experiment';
  stack: string[];
  thumb: string;
  accent: Accent;
  /** Two or three sentences for the project page's opening. */
  summary: string;
  /** Optional hard numbers. Omit rather than inventing. */
  metrics?: { value: string; label: string }[];
  blocks: ProjectBlock[];
  links?: { label: string; href: string }[];
  /** Pulls the card to double width in the grid. Use for one or two, not all. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: 'trend-pulse',
    title: 'Trend Pulse',
    tagline: 'a standing pipeline that finds what a market is about to buy',
    year: '2026',
    role: 'Design and build',
    status: 'In progress',
    stack: ['TypeScript', 'Claude Agent SDK', 'Next.js', 'Postgres'],
    thumb: '/projects/trend-pulse.png',
    accent: 'sodium',
    featured: true,
    summary:
      'A weekly pipeline that pulls live trending-product signals across six data providers for a given category and market, clusters them into named trends, and publishes a branded report — then folds the result into a cross-linked knowledge base that answers questions across every report ever run.',
    metrics: [
      { value: '6', label: 'signal providers per run' },
      { value: '98', label: 'trends tracked across 3 reports' },
      { value: '2', label: 'markets and categories launched with' },
    ],
    blocks: [
      {
        heading: 'The problem',
        body: [
          'Knowing what is about to trend in, say, water bottles in the Philippines means reading through search data, marketplace bestseller lists, and social signals by hand, every week, per market. Nobody was doing this consistently because it does not scale as a manual habit.',
          'A one-off report is also throwaway — the moment the next one runs, the last one is forgotten, so "have we seen this trend before, under a different name" has no answer.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'The pipeline runs as a set of cooperating agents: one collector per provider (Ensemble Data, SerpAPI, Oxylabs, Jungle Scout, SellerApp, TMAPI) fetches raw signals in parallel, a synthesizer dedupes and clusters them into scored, ranked trend categories with evidence products, and a report builder writes the copy and publishes it.',
          'Every finished report is then ingested into a markdown knowledge base — one file per trend, category, market, and brand, cross-linked wiki-style — so a recurring trend under a new name gets a new sighting appended to its existing file rather than a duplicate. A chat layer sits on top so teammates can ask "what\'s trending in Mexico" without reading raw JSON.',
        ],
      },
      {
        heading: 'Status',
        body: [
          'Running for beauty, water bottles, supplements, and men\'s hair loss across a handful of markets. The open question is provider coverage — some categories have thin signal from two or three of the six sources, and the synthesizer needs to say so explicitly rather than ranking on whatever data happened to show up.',
        ],
      },
    ],
  },
  {
    slug: 'ledger',
    title: 'Ledger',
    tagline: 'quote reconciliation for buyers who live in spreadsheets',
    year: '2025',
    role: 'Design and build',
    status: 'Shipped',
    stack: ['TypeScript', 'Next.js', 'Postgres', 'DuckDB'],
    thumb: '/projects/ledger.png',
    accent: 'sodium',
    featured: true,
    summary:
      'Buyers were comparing supplier quotes by hand in Excel, one tab per supplier. Ledger ingests the quotes however they arrive and lines them up against the original request so the differences are the only thing on screen.',
    metrics: [
      { value: '400+', label: 'line items per sheet' },
      { value: '9 min', label: 'median review, from 2 hrs' },
      { value: '6', label: 'input formats accepted' },
    ],
    blocks: [
      {
        heading: 'The problem',
        body: [
          'A sourcing request goes out as a structured sheet and comes back as whatever the supplier felt like sending: a rewritten spreadsheet, a PDF, sometimes a photo of a printout. Buyers were rebuilding a comparison table by hand for every deal.',
          'The naive fix is a strict upload template. Suppliers ignore templates, so that just moves the manual work onto the person chasing them.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Accept anything, then make correction cheap. Every ingested cell keeps a pointer back to where it came from, so when the parser guesses wrong the buyer sees the original next to the guess and fixes it in one keystroke.',
          'Comparison runs in DuckDB in the browser. Once the quotes are aligned, re-pivoting 400 rows across eight suppliers is instant, which is what makes the tool feel like a spreadsheet rather than a form.',
        ],
      },
      {
        heading: 'What I would change',
        body: [
          'Confidence scores were surfaced too early. Buyers either trusted them completely or ignored them entirely, and neither is useful. Showing the source excerpt instead moved the needle far more than showing a number.',
        ],
      },
    ],
  },
  {
    slug: 'spec-diff',
    title: 'Spec Diff',
    tagline: 'catches the revision nobody mentioned',
    year: '2025',
    role: 'Build',
    status: 'Shipped',
    stack: ['Python', 'pdfplumber', 'Postgres'],
    thumb: '/projects/spec-diff.png',
    accent: 'flare',
    summary:
      'Product specs get revised in place and re-sent without a changelog. Spec Diff compares any two revisions of a spec document and reports what actually moved — dimensions, tolerances, materials — ignoring reflowed layout.',
    metrics: [
      { value: '12k', label: 'documents indexed' },
      { value: '31', label: 'silent revisions caught in month one' },
    ],
    blocks: [
      {
        heading: 'The problem',
        body: [
          'A supplier sends revision C. Nothing in the filename or the email says which of the 40 fields changed from revision B. Someone finds out at the sampling stage, which is the expensive place to find out.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Text diffing was useless — regenerated PDFs reflow constantly, so every line looks changed. Instead the extractor pulls specs into a normalised field map with units resolved, then diffs the maps. A tolerance written as "±0.5mm" and "+/- 0.5 mm" has to compare equal or the output is noise.',
          'The report leads with the fields that carry cost or tooling implications, because that is the question the reader actually has.',
        ],
      },
    ],
  },
  {
    slug: 'freight',
    title: 'Freight Napkin',
    tagline: 'landed cost while the buyer is still on the call',
    year: '2024',
    role: 'Design and build',
    status: 'Shipped',
    stack: ['TypeScript', 'Remix', 'Redis'],
    thumb: '/projects/freight.png',
    accent: 'sodium',
    summary:
      'A landed-cost estimator built for speed of answer over precision. Unit price is the easy part; duty, freight mode and carton maths are where the margin actually goes, and buyers needed a number in seconds, not a quote request.',
    blocks: [
      {
        heading: 'The problem',
        body: [
          'Getting a real freight quote takes a day. Buyers were making go/no-go calls on unit price alone and getting surprised by landed cost later.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Deliberately an estimate, and it says so. The interface shows the assumption stack — carton fill, mode, duty rate — with every input editable inline, so a buyer can see which guess is carrying the answer and tighten just that one.',
          'Being visibly approximate turned out to be the feature. A tool that admits a ±15% band gets used for screening; one that presents a false exact number gets distrusted after the first miss.',
        ],
      },
    ],
  },
  {
    slug: 'atlas',
    title: 'Supplier Atlas',
    tagline: 'one supplier record instead of nine',
    year: '2024',
    role: 'Build',
    status: 'In progress',
    stack: ['Python', 'Postgres', 'pgvector'],
    thumb: '/projects/atlas.png',
    accent: 'aqua',
    summary:
      'The same factory existed nine times across our systems under nine spellings. Atlas resolves supplier identity across sources and keeps a single record with its history intact, so "have we worked with them before" has an answer.',
    metrics: [
      { value: '9→1', label: 'records per real supplier' },
      { value: '2.3k', label: 'entities resolved' },
    ],
    blocks: [
      {
        heading: 'The problem',
        body: [
          'Supplier names are entered by humans in a hurry, transliterated inconsistently, and change when a company restructures. Exact matching finds nothing; fuzzy matching alone merges two genuinely different factories in the same industrial park, which is worse than doing nothing.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Blocking on strong signals first — registration numbers, addresses, contact domains — then embeddings for the remainder, then a human queue for anything under the threshold. Merges are reversible and audited, because an unreviewable merge in a system of record is a liability.',
        ],
      },
      {
        heading: 'Status',
        body: [
          'Running against production data with the review queue staffed. The open question is decay: records go stale and I do not yet have a good signal for when a resolved identity should be re-examined.',
        ],
      },
    ],
  },
  {
    slug: 'quota',
    title: 'Quota',
    tagline: 'a scheduler that explains its own decisions',
    year: '2023',
    role: 'Build',
    status: 'Archived',
    stack: ['Go', 'Postgres'],
    thumb: '/projects/quota.png',
    accent: 'aqua',
    summary:
      'An allocation service that split incoming orders across factories under capacity and lead-time constraints, and — the part that mattered — wrote down why each order landed where it did.',
    blocks: [
      {
        heading: 'The problem',
        body: [
          'The original allocator was correct and completely opaque. When an order went to a slower factory, nobody could reconstruct the reason, so operators stopped trusting it and started overriding by hand.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Every allocation emits the binding constraint alongside the decision: which capacity ceiling or lead-time floor forced it. Override rates dropped once operators could see that the scheduler already knew what they were about to tell it.',
        ],
      },
      {
        heading: 'Why archived',
        body: [
          'Superseded when order volume outgrew the assumption that allocation could run synchronously. The explanation format survived into its replacement, which I think was the actual contribution.',
        ],
      },
    ],
  },
  {
    slug: 'moodboard',
    title: 'Swatch',
    tagline: 'colour matching that accounts for the screen',
    year: '2023',
    role: 'Side project',
    status: 'Experiment',
    stack: ['TypeScript', 'WebGL', 'colour science'],
    thumb: '/projects/moodboard.png',
    accent: 'flare',
    summary:
      'A weekend experiment in matching physical fabric swatches to on-screen colour, and a lesson in how much of perceived colour is the viewing environment rather than the pigment.',
    blocks: [
      {
        heading: 'The idea',
        body: [
          'Buyers approve colour on uncalibrated laptops in mixed lighting, then get samples that look wrong. I wanted to know how far software could close that gap.',
        ],
      },
      {
        heading: 'What I learned',
        body: [
          'Not very far, without a reference. Matching in a perceptually uniform space (Oklab) beat sRGB comfortably, but the dominant error term is ambient light and display profile, not the maths. Shipping a paper reference card with the sample would outperform anything I could do in the browser.',
          'Kept as an experiment because the honest conclusion was that this is not a software problem.',
        ],
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

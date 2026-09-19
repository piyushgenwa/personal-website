/**
 * The résumé, as a book. Every fact here comes from Piyush_Resume_26.pdf —
 * edit this file, not the components. Order is the order of the pages.
 *
 * `figures` are the numbers pulled out into the margin (marginalia). Only put a
 * number there if it also appears in the entry's own bullets.
 */

export interface Role {
  title: string;
  place: string;
  dates: string;
  /** The italic line under the role on the résumé. */
  blurb?: string;
  bullets: string[];
}

export interface Chapter {
  id: string;
  numeral: string;
  /** Title of the chapter — the organisation. */
  title: string;
  /** One line for the contents page. */
  span: string;
  roles: Role[];
  figures: { value: string; label: string }[];
  /** Plates (project slugs) this chapter points to. */
  plates?: string[];
}

export const person = {
  name: 'Piyush Genwa',
  title: 'Product Manager, AI',
  city: 'Bengaluru, Karnataka',
  email: 'piyushgenwa@gmail.com',
  linkedin: { label: 'linkedin.com/in/piyushgenwa', href: 'https://linkedin.com/in/piyushgenwa' },
  resume: '/Piyush_Resume_26.pdf',
} as const;

export const chapters: Chapter[] = [
  {
    id: 'sourcy',
    numeral: 'I',
    title: 'Sourcy',
    span: '2026 – present',
    roles: [
      {
        title: 'Product Manager, AI',
        place: 'Singapore (Remote)',
        dates: 'Feb 2026 – Present',
        blurb: 'Agentic sourcing platform for founders building D2C brands developing highly custom products',
        bullets: [
          'Led development of the orchestration layer of Sourcy’s customer-facing agentic product (200 conversations/day), reducing human involvement and reducing per-request TAT by >70%.',
          'Built the evaluation framework (50+ golden traces, LLM-as-judge rubric) used to gate skill changes and product updates for the orchestration layer responsible for decision making across 7 agents.',
          'Developed an 18+ workflow internal conversational agent for the growth team, facilitating BAU automation.',
          'Built a multi-agent pipeline that pulls live signals from 6 e-commerce/social data providers, clusters them into ranked product trends, and auto-publishes branded reports to a live URL, replacing a manual research workflow across 4+ market/category launches.',
          'Designed a self-updating, cross-linked knowledge base (98+ trend files) with a chat interface so non-technical teammates can query trend history in natural language.',
        ],
      },
    ],
    figures: [
      { value: '>70%', label: 'less turnaround per request' },
      { value: '50+', label: 'golden traces gating every change' },
      { value: '98+', label: 'trend files in the knowledge base' },
    ],
    plates: ['trend-pulse', 'growth-secretary'],
  },
  {
    id: 'jar',
    numeral: 'II',
    title: 'Jar',
    span: '2024 – 2025',
    roles: [
      {
        title: 'Product Manager',
        place: 'Bengaluru',
        dates: 'Aug 2024 – Dec 2025',
        blurb: 'Leading GenAI initiatives & working on activation charter to help users get onboarded and familiarised with Jar',
        bullets: [
          'Managing product feature planning and agile execution for a team of 6 Product Managers and 18 Engineers.',
          'Spearheaded app localisation, improving process efficiency by 12x by implementing in-house AI solutions.',
          'Led the product roadmap for IPL to boost engagement and activation, leading to a 5% GMV uptick.',
          'Improved week-zero retention by 2.1% and engagement by 1.7% by cleaning up the home feed for new users.',
          'Reduced W0 cancellations by 0.2% and mandate updates by 1.07% by introducing goal-based savings.',
          'Achieved a 0.2% uptick in setups and reduced cancellations by 0.3% by adding a contextual entry point for DS.',
        ],
      },
    ],
    figures: [
      { value: '12×', label: 'localisation efficiency, with in-house AI' },
      { value: '6 + 18', label: 'product managers and engineers led' },
      { value: '5%', label: 'GMV uptick from the IPL roadmap' },
    ],
  },
  {
    id: 'unacademy',
    numeral: 'III',
    title: 'Unacademy',
    span: '2022 – 2024',
    roles: [
      {
        title: 'Product Manager',
        place: 'Bengaluru',
        dates: 'Mar 2024 – Aug 2024',
        blurb: 'Led activation, retention and conversion charters for Unacademy’s online learning product',
        bullets: [
          'Revamped the plan selection experience, achieving a 12% improvement in organic conversion.',
          'Led the integration of the Google Play billing system into Unacademy’s existing payments infrastructure, to prevent the app’s de-listing from the Play Store under a change in payments policy.',
          'Achieved ~INR 20 million in annual savings in PG costs by establishing UPI as the primary payment mode.',
          'Improved signup-to-engagement conversion by 11% by revamping the free-classes consumption experience.',
          'Enhanced app performance by 57% by reducing load times on the most-visited pages (~150K daily visits).',
          'Increased content consumption from the Educator profile by 18% through improved information architecture and content ordering.',
        ],
      },
      {
        title: 'Associate Product Manager',
        place: 'Bengaluru',
        dates: 'Jun 2022 – Mar 2024',
        blurb: 'Part of the Growth & Payments POD, overseeing flows and infra for INR 500+ million monthly GMV',
        bullets: [
          'Introduced Unacademy Store to sell individual entities from the subscription product at a lower price. Scaled Store revenue from zero to INR 320 million by working with cross-functional teams.',
          'Increased conversion through the Daily Scholarship Test by 120% by reducing result generation time to zero.',
          'Cut monthly costs by INR 20 million by limiting credit usage on the Unacademy platform.',
          'Improved learner referral conversion by 18% by recommending coupon codes to users in the checkout flow.',
          'Hiked revenue contribution of loans by 67% and reduced approval time by 90% by integrating Bajaj Finserv.',
        ],
      },
    ],
    figures: [
      { value: '₹0 → ₹320M', label: 'revenue from Unacademy Store' },
      { value: '120%', label: 'conversion lift, Daily Scholarship Test' },
      { value: '57%', label: 'faster on ~150K daily visits' },
    ],
  },
  {
    id: 'iit-bombay',
    numeral: 'IV',
    title: 'IIT Bombay',
    span: '2018 – 2022',
    roles: [
      {
        title: 'BTech, Electrical Engineering',
        place: 'Mumbai',
        dates: 'Jul 2018 – May 2022',
        bullets: [
          'Served as Operations head at E-Cell, part of a 20-member team of India’s largest university entrepreneurship body.',
          'Introduced the first edition of Entre-MUN, a 2-day MUN conference with 4 committees and 60+ participants.',
          'Revamped the Virtual Stock Market competition in association with BSE, with 10k+ participants.',
          'Ideated and executed ACT, E-Cell’s social initiative that prevented 100 kg+ of CO₂ emissions.',
        ],
      },
    ],
    figures: [
      { value: '10k+', label: 'participants, Virtual Stock Market' },
      { value: '100 kg+', label: 'of CO₂ emissions prevented by ACT' },
    ],
  },
];

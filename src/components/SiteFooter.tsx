import { GlassPane } from './GlassPane';
import { site } from '@/content/site';

/** Bookends the hero: the same glass, but nothing behind it has been wiped. */
export function SiteFooter() {
  return (
    <footer className="relative isolate mt-8 overflow-hidden border-t border-frost-faint/40">
      {/* Static warm glow — no shader here, the hero already owns that budget. */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(75% 130% at 18% 108%, #ffa02e55 0%, #ff4d5e26 34%, transparent 68%), radial-gradient(60% 120% at 88% 112%, #35d6c43d 0%, transparent 62%), var(--color-ink)',
        }}
      />
      <GlassPane />

      <div className="relative z-10 mx-auto max-w-[1240px] px-6 py-24 sm:px-10 sm:py-32">
        <span className="t-data">Contact</span>
        <hr className="hairline mt-4 mb-10" />

        <a
          href={`mailto:${site.email}`}
          className="t-display group inline-block text-[clamp(1.75rem,5.2vw,4rem)] transition-colors hover:text-sodium"
        >
          {site.email}
          <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-2">
            →
          </span>
        </a>

        <div className="mt-16 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-6">
          <nav className="flex flex-wrap gap-x-7 gap-y-2">
            {site.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="t-data text-frost transition-colors hover:text-aqua"
                {...(link.href.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <span className="t-data">
            © {new Date().getFullYear()} {site.name}
          </span>
        </div>
      </div>
    </footer>
  );
}

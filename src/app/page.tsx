import { Hero } from '@/components/Hero';
import { ProjectCard } from '@/components/ProjectCard';
import { Reveal } from '@/components/Reveal';
import { Section } from '@/components/Section';
import { SiteFooter } from '@/components/SiteFooter';
import { projects } from '@/content/projects';
import { site } from '@/content/site';

export default function Home() {
  return (
    <main>
      <Hero />

      <Section id="work" label="Selected work" title={`${projects.length} projects`}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2">
          {projects.map((project, i) => (
            // The span has to live on the grid child, which is Reveal.
            <Reveal
              key={project.slug}
              delay={(i % 2) * 90}
              className={project.featured ? 'sm:col-span-2' : ''}
            >
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section label="About" title={site.location}>
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <div className="max-w-[62ch] space-y-6">
              {site.about.map((para) => (
                <p key={para} className="text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-[1.62]">
                  {para}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <dl className="space-y-5 lg:w-56">
              <div>
                <dt className="t-data">Currently</dt>
                <dd className="mt-1">
                  {site.role}, {site.org}
                </dd>
              </div>
              <div>
                <dt className="t-data">Works on</dt>
                <dd className="mt-1">Internal tools, data plumbing, interfaces for correction</dd>
              </div>
              <div>
                <dt className="t-data">Reach me</dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${site.email}`}
                    className="underline decoration-frost-faint decoration-1 underline-offset-4 transition-colors hover:text-aqua hover:decoration-aqua"
                  >
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Section>

      <SiteFooter />
    </main>
  );
}

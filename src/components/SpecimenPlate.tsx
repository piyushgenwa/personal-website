import type { Project } from '@/content/projects';

/**
 * What sits behind the glass on a project card.
 *
 * Previously every card showed a generated gradient blob: eight projects, eight
 * interchangeable images, none of which said anything about the work. The
 * vitrine only means something if there is a specimen in it.
 *
 * So the plate shows, in order of preference:
 *   1. a real screenshot of the thing, if one exists;
 *   2. its hardest number, if the project has measured one;
 *   3. its tagline set large, which is the best copy on the card anyway.
 *
 * Rendered as DOM rather than a WebGL texture so the CSS `.glass` pane can
 * composite over it — the same pane the hero uses. That also drops nine live
 * shader contexts from the index page.
 */
export function SpecimenPlate({ project }: { project: Project }) {
  const shot = project.screenshots?.[0];
  const headline = project.metrics?.[0];

  if (shot) {
    return (
      <div className="absolute inset-0 bg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shot.src}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-panel p-6 sm:p-8">
      {/* Corner ticks. The plate is a measured surface, not a canvas. */}
      <span
        aria-hidden="true"
        className="absolute top-3 left-3 h-3 w-3 border-t border-l border-frost-faint/50"
      />
      <span
        aria-hidden="true"
        className="absolute right-3 bottom-3 h-3 w-3 border-r border-b border-frost-faint/50"
      />

      <span className="t-data">{project.role}</span>

      {headline ? (
        <div>
          <div
            className="t-display text-[clamp(2.75rem,7vw,5rem)] text-frost"
            style={{ fontVariationSettings: "'wdth' 90" }}
          >
            {headline.value}
          </div>
          <div className="t-data mt-2 max-w-[34ch]">{headline.label}</div>
        </div>
      ) : (
        <p className="t-display-sm max-w-[16ch] text-[clamp(1.25rem,2.6vw,1.9rem)] text-frost/85">
          {project.tagline}
        </p>
      )}

      <span className="t-data">{project.stack[0]}</span>
    </div>
  );
}

/**
 * Fluted glass rendered in CSS, for use over *live* content.
 *
 * Paper's FlutedGlass shader is an image filter — it samples an
 * HTMLImageElement — so it can't refract an animating WebGL canvas beneath it.
 * This pane composites against whatever is actually behind it: specular flute
 * lighting, plus a second blur masked to the valleys for depth.
 *
 * For refracting a still image, use FlutedThumb (the real shader) instead.
 */
export function GlassPane({
  banded = false,
  className = '',
}: {
  /** Cuts the wiped-clear band, driven by --band-top / --band-bot. */
  banded?: boolean;
  className?: string;
}) {
  const band = banded ? ' glass-banded' : '';
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <div className={`glass-valleys${band}`} />
      <div className={`glass${band}`} />
    </div>
  );
}

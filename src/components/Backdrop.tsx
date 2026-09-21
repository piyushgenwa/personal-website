/**
 * The wallpaper: one photographed hillside, with a scatter of glossy bubbles
 * floating over it. The hill is a background image on `.aero`; the bubbles are
 * the only things drawn here.
 */

// x%, y%, size rem, float delay s — hand-placed so the composition is deliberate.
const BUBBLES: [number, number, number, number][] = [
  [6, 72, 5.5, 0],
  [12, 30, 2.4, 1.4],
  [21, 86, 3.2, 3.1],
  [33, 14, 1.6, 0.7],
  [47, 92, 2, 2.2],
  [62, 8, 3.6, 4],
  [74, 80, 6.5, 1.1],
  [84, 26, 2.8, 2.7],
  [92, 58, 4.2, 0.4],
  [95, 90, 1.8, 3.6],
];

export function Backdrop() {
  return (
    <div className="aero" aria-hidden>
      {BUBBLES.map(([x, y, s, d], i) => (
        <span
          key={i}
          className="bubble"
          style={{ left: `${x}%`, top: `${y}%`, width: `${s}rem`, height: `${s}rem`, animationDelay: `${d}s` }}
        />
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';

/**
 * The camera itself: a body with a top deck, a recessed back panel, a sunken
 * LCD and moulded controls. It knows nothing about the site — the LCD is
 * `children`, and every control is either a button (`onClick`) or a link
 * (`href`), so the same body drives the interactive home page and the plain
 * case-study pages.
 *
 * Anything with no function is a `<span aria-hidden>`: screws, the strap lug,
 * the microphone, the speaker. They are there to make the object read as a
 * real one, and they are never focusable.
 */

export interface Ctl {
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}
export type ControlName =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'center'
  | 'menu'
  | 'play'
  | 'disp'
  | 'wide'
  | 'tele'
  | 'shutter';
export type Controls = Partial<Record<ControlName, Ctl>>;

function Key({
  ctl,
  label,
  className,
  children,
}: {
  ctl?: Ctl;
  label: string;
  className: string;
  children?: ReactNode;
}) {
  if (ctl?.href && !ctl.disabled) {
    return (
      <Link href={ctl.href} className={className} aria-label={label} title={label}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      disabled={!ctl?.onClick || ctl.disabled}
      onClick={ctl?.onClick}
    >
      {children}
    </button>
  );
}

/**
 * Turns the body a few degrees toward the pointer, so the light on it moves as
 * you look at it. Writes four custom properties and nothing else: two angles
 * for the body, and the raw -1..1 position, which the glass reflection and the
 * back-panel specular translate against (see `camera.css`, §8).
 *
 * Only transforms are animated, and only on a real pointer. Touch and
 * `prefers-reduced-motion` never start it, so the properties stay at zero.
 */
function useTilt(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const MAX = 5; // degrees
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const tick = () => {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      el.style.setProperty('--tilt-y', `${(cx * MAX).toFixed(2)}deg`);
      el.style.setProperty('--tilt-x', `${(-cy * MAX).toFixed(2)}deg`);
      el.style.setProperty('--tilt-px', cx.toFixed(3));
      el.style.setProperty('--tilt-py', cy.toFixed(3));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      wake();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      wake();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

export function CameraBody({
  children,
  controls,
  flash = false,
  lcdLabel = 'Camera screen',
}: {
  children: ReactNode;
  controls: Controls;
  flash?: boolean;
  lcdLabel?: string;
}) {
  const body = useRef<HTMLDivElement>(null);
  useTilt(body);

  return (
    <div className="cam" ref={body}>
      {/* The top plate, laid back in perspective. The shutter lives here, as it does
          on the real thing — the ● on the back does the same job face-on. */}
      <div className="deck">
        <span className="deck-brand" aria-hidden>
          genwa·shot
        </span>
        <span className="mic" aria-hidden />
        <span className="power" aria-hidden />
        <Key ctl={controls.shutter} label="Shutter" className="shutter" />
      </div>

      {/* A sliver of the top chamfer, where the deck folds into the back. */}
      <span className="chamfer" aria-hidden />
      <span className="lug" aria-hidden />

      <div className="shell">
        <div className="cam-face">
          <div className="lcd-well">
            <div className="lcd-bezel">
              <div className="lcd" role="region" aria-label={lcdLabel}>
                {children}
                <div className="lcd-glare" aria-hidden />
                <div className="flash" data-on={flash || undefined} aria-hidden />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-top">
              <div className="silk" aria-hidden>
                <span>12.1 MEGA PIXELS</span>
                <span>OPTICAL STEADYSHOT</span>
              </div>
              <div className="thumb" aria-hidden>
                <span className="led" />
              </div>
            </div>

            <div className="zoom" role="group" aria-label="Zoom">
              <Key ctl={controls.wide} label="Wide — back to the index" className="zoom-btn zoom-w">
                W
              </Key>
              <span className="zoom-pivot" aria-hidden />
              <Key ctl={controls.tele} label="Tele — open the picture" className="zoom-btn zoom-t">
                T
              </Key>
            </div>

            <div className="dpad" role="group" aria-label="Control wheel">
              <span className="dpad-ring" aria-hidden />
              <Key ctl={controls.up} label="Up" className="dkey dkey-up">
                <b aria-hidden>▲</b>
              </Key>
              <Key ctl={controls.right} label="Right — next picture" className="dkey dkey-right">
                <b aria-hidden>▶</b>
              </Key>
              <Key ctl={controls.down} label="Down" className="dkey dkey-down">
                <b aria-hidden>▼</b>
              </Key>
              <Key ctl={controls.left} label="Left — previous picture" className="dkey dkey-left">
                <b aria-hidden>◀</b>
              </Key>
              <Key ctl={controls.center} label="Select" className="dcenter">
                <span aria-hidden>●</span>
              </Key>
            </div>

            <div className="pills">
              <Key ctl={controls.menu} label="Menu" className="pill">
                MENU
              </Key>
              <Key ctl={controls.play} label="Playback — photo index" className="pill">
                ▶
              </Key>
              <Key ctl={controls.disp} label="Display — show or hide the on-screen info" className="pill">
                DISP
              </Key>
            </div>

            <span className="speaker" aria-hidden />
          </div>
        </div>

        <span className="screw screw-l" aria-hidden />
        <span className="screw screw-r" aria-hidden />
      </div>
    </div>
  );
}

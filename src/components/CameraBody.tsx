'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The camera itself: silver shell, LCD bezel and the rear controls. It knows
 * nothing about the site — the LCD is `children`, and every control is either
 * a button (`onClick`) or a link (`href`), so the same body drives the
 * interactive home page and the plain case-study pages.
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
  return (
    <div className="cam">
      {/* Raised bits on the top plate. */}
      <div className="cam-top" aria-hidden={false}>
        <span className="power-led" aria-hidden />
        <span className="mode-dial" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <Key ctl={controls.shutter} label="Shutter" className="shutter" />
      </div>

      <div className="cam-face">
        <div className="lcd-bezel">
          <div className="lcd" role="region" aria-label={lcdLabel}>
            {children}
            <div className="lcd-glare" aria-hidden />
            <div className="flash" data-on={flash || undefined} aria-hidden />
          </div>
        </div>

        <div className="panel">
          <div className="panel-top">
            <div className="brand" aria-hidden>
              <span className="brand-name">genwa·shot</span>
              <span className="brand-spec">12.1 MEGA PIXELS</span>
            </div>
            <div className="grill" aria-hidden />
          </div>

          <div className="zoom" role="group" aria-label="Zoom">
            <Key ctl={controls.wide} label="Wide — back to the index" className="zoom-btn">
              W
            </Key>
            <span className="zoom-mid" aria-hidden />
            <Key ctl={controls.tele} label="Tele — open the picture" className="zoom-btn">
              T
            </Key>
          </div>

          <div className="dpad" role="group" aria-label="Control wheel">
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
        </div>
      </div>
    </div>
  );
}

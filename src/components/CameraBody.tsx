'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The camera: a photograph of the real hardware, with the live screen laid
 * over its LCD and invisible hit areas over its buttons.
 *
 * Because the body is pixels rather than markup, every position in
 * `camera.css` is a percentage of the photo's own 869 × 527 frame — so the
 * screen and the buttons stay registered to the hardware at any size.
 *
 * It knows nothing about the site: the LCD is `children`, and every control is
 * either a button (`onClick`) or a link (`href`), so the same body drives the
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

function Key({ ctl, label, className }: { ctl?: Ctl; label: string; className: string }) {
  if (ctl?.href && !ctl.disabled) {
    return <Link href={ctl.href} className={className} aria-label={label} title={label} />;
  }
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      disabled={!ctl?.onClick || ctl.disabled}
      onClick={ctl?.onClick}
    />
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="cam-photo" src="/camera/cybershot.jpg" alt="" draggable={false} />

      <div className="lcd" role="region" aria-label={lcdLabel}>
        {children}
        <div className="lcd-glare" aria-hidden />
        <div className="flash" data-on={flash || undefined} aria-hidden />
      </div>

      {/* The zoom rocker, top right. */}
      <Key ctl={controls.wide} label="Wide — back to the index" className="hit hit-w" />
      <Key ctl={controls.tele} label="Tele — open the picture" className="hit hit-t" />

      {/* The mode dial returns the camera to shooting, and fires the shutter there. */}
      <Key ctl={controls.shutter} label="Shooting mode — and the shutter" className="hit hit-dial" />

      <Key ctl={controls.play} label="Playback — photo index" className="hit hit-play" />

      {/* The four-way wheel and its centre. */}
      <Key ctl={controls.up} label="Up" className="hit hit-up" />
      <Key ctl={controls.right} label="Right — next picture" className="hit hit-right" />
      <Key ctl={controls.down} label="Down" className="hit hit-down" />
      <Key ctl={controls.left} label="Left — previous picture" className="hit hit-left" />
      <Key ctl={controls.center} label="Select" className="hit hit-ok" />

      <Key ctl={controls.menu} label="Menu" className="hit hit-menu" />
      <Key ctl={controls.disp} label="Display — show or hide the on-screen info" className="hit hit-disp" />
    </div>
  );
}

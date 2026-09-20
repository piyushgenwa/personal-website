'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { person } from '@/content/book';
import { frameIndex, roll } from '@/content/roll';
import { CameraBody, type ControlName, type Controls } from './CameraBody';
import { IndexScreen, MenuOverlay, PhotoScreen, ShootScreen, type MenuItem } from './lcd';

/**
 * The working camera. Three screens, like the real thing:
 *
 *   shoot  → viewfinder. Shutter (or ●) takes "the picture" and lands on…
 *   index  → the photo roll as thumbnails. ● / T opens one.
 *   photo  → one picture. ◀ ▶ step through the roll, ▲ ▼ scroll, W goes back to the index.
 *
 * Shutter from anywhere but the viewfinder returns to the viewfinder — a real
 * camera's half-press does the same. MENU opens the list; DISP hides the HUD.
 */

type Screen = 'shoot' | 'index' | 'photo';
const COLS = 3;
const FLASH_MS = 520;

export function Camera() {
  const [screen, setScreen] = useState<Screen>('shoot');
  const [sel, setSel] = useState(0);
  const [menu, setMenu] = useState(false);
  const [menuSel, setMenuSel] = useState(0);
  const [disp, setDisp] = useState(true);
  const [zoom, setZoom] = useState(0);
  const [flash, setFlash] = useState(false);
  const [locked, setLocked] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const busy = useRef(false);

  const setHash = (h: string) => {
    try {
      history.replaceState(null, '', h ? `#${h}` : location.pathname);
    } catch {}
  };

  const toShoot = useCallback(() => {
    setScreen('shoot');
    setHash('');
  }, []);
  const toIndex = useCallback(() => {
    setScreen('index');
    setHash('roll');
  }, []);
  const toPhoto = useCallback((i: number, d: 1 | -1 = 1) => {
    const n = Math.min(roll.length - 1, Math.max(0, i));
    setDir(d);
    setSel(n);
    setScreen('photo');
    setHash(roll[n].id);
  }, []);

  const capture = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setFlash(true);
    setTimeout(() => {
      setSel(0);
      toIndex();
    }, 170);
    setTimeout(() => {
      setFlash(false);
      busy.current = false;
    }, FLASH_MS);
  }, [toIndex]);

  // Autofocus: the brackets go white → green shortly after the viewfinder appears.
  useEffect(() => {
    if (screen !== 'shoot') return;
    setLocked(false);
    const t = setTimeout(() => setLocked(true), 900);
    return () => clearTimeout(t);
  }, [screen]);

  // A picture always opens scrolled to the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [sel, screen]);

  const items: MenuItem[] = useMemo(
    () => [
      { label: 'Photo roll', run: toIndex },
      { label: 'Résumé (PDF)', run: () => window.open(person.resume, '_blank') },
      { label: 'Email me', run: () => (location.href = `mailto:${person.email}`) },
      { label: 'LinkedIn', run: () => window.open(person.linkedin.href, '_blank', 'noreferrer') },
      { label: 'Shooting mode', run: toShoot },
    ],
    [toIndex, toShoot],
  );

  const press = (k: ControlName) => {
    if (k === 'disp') return setDisp((d) => !d);

    if (menu) {
      if (k === 'up') setMenuSel((s) => (s + items.length - 1) % items.length);
      else if (k === 'down') setMenuSel((s) => (s + 1) % items.length);
      else if (k === 'center' || k === 'tele' || k === 'right') {
        setMenu(false);
        items[menuSel].run();
      } else setMenu(false);
      return;
    }

    if (k === 'menu') {
      setMenu(true);
      setMenuSel(0);
      return;
    }
    if (k === 'play') return toIndex();
    if (k === 'shutter') return screen === 'shoot' ? capture() : toShoot();

    if (screen === 'shoot') {
      if (k === 'center') capture();
      else if (k === 'tele') setZoom((z) => Math.min(4, z + 1));
      else if (k === 'wide') setZoom((z) => Math.max(0, z - 1));
    } else if (screen === 'index') {
      if (k === 'left') setSel((s) => Math.max(0, s - 1));
      else if (k === 'right') setSel((s) => Math.min(roll.length - 1, s + 1));
      else if (k === 'up') setSel((s) => (s - COLS >= 0 ? s - COLS : s));
      else if (k === 'down') setSel((s) => (s + COLS < roll.length ? s + COLS : s));
      else if (k === 'center' || k === 'tele') toPhoto(sel);
    } else {
      if (k === 'left') toPhoto(sel - 1, -1);
      else if (k === 'right') toPhoto(sel + 1, 1);
      else if (k === 'up') scrollRef.current?.scrollBy({ top: -110, behavior: 'smooth' });
      else if (k === 'down') scrollRef.current?.scrollBy({ top: 110, behavior: 'smooth' });
      else if (k === 'wide' || k === 'center') toIndex();
    }
  };

  // Deep links: /#roll opens the index, /#jar opens that picture.
  useEffect(() => {
    const fromHash = () => {
      setMenu(false);
      const h = decodeURIComponent(location.hash.slice(1));
      if (!h) return setScreen('shoot');
      if (h === 'roll') return setScreen('index');
      const i = frameIndex(h);
      if (i >= 0) {
        setSel(i);
        setScreen('photo');
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  // Keyboard mirrors the hardware. Handler reads the latest `press` via a ref.
  const pressRef = useRef(press);
  pressRef.current = press;
  useEffect(() => {
    const map: Record<string, ControlName> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      m: 'menu',
      d: 'disp',
      w: 'wide',
      t: 'tele',
      p: 'play',
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      const onControl = el && el !== document.body && /^(BUTTON|A|INPUT|TEXTAREA)$/.test(el.tagName);
      let k: ControlName | undefined = map[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (e.key === 'Enter' && !onControl) k = 'center';
      if (e.key === ' ' && !onControl) k = 'shutter';
      if (e.key === 'Escape') k = menu ? 'menu' : screen === 'photo' ? 'wide' : 'shutter';
      if (!k) return;
      if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
      pressRef.current(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu, screen]);

  // Swipe through pictures on touch screens.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || screen !== 'photo') return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dy) < Math.abs(dx) * 0.6) press(dx < 0 ? 'right' : 'left');
  };

  const controls: Controls = Object.fromEntries(
    (
      ['up', 'down', 'left', 'right', 'center', 'menu', 'play', 'disp', 'wide', 'tele', 'shutter'] as ControlName[]
    ).map((k) => [k, { onClick: () => press(k) }]),
  );

  return (
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp} style={{ display: 'contents' }}>
      <CameraBody controls={controls} flash={flash} lcdLabel={`Camera screen — ${screen}`}>
        {screen === 'shoot' && <ShootScreen zoom={zoom} disp={disp} locked={locked} />}
        {screen === 'index' && <IndexScreen sel={sel} disp={disp} onPick={(i) => toPhoto(i)} />}
        {screen === 'photo' && (
          <PhotoScreen
            frame={roll[sel]}
            index={sel}
            disp={disp}
            dir={dir}
            scrollRef={scrollRef}
            onJump={(id) => toPhoto(frameIndex(id))}
          />
        )}
        {menu && (
          <MenuOverlay
            items={items}
            sel={menuSel}
            onPick={(i) => {
              setMenu(false);
              items[i].run();
            }}
          />
        )}
      </CameraBody>
      <p className="stage-hint keys">
        <kbd>← → ↑ ↓</kbd> move <kbd>Enter</kbd> ● <kbd>Space</kbd> shutter <kbd>M</kbd> menu <kbd>D</kbd> display
      </p>
    </div>
  );
}

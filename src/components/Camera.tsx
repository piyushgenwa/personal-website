'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { person } from '@/content/book';
import { getFolder, locate, menu, roll } from '@/content/roll';
import { CameraBody, type ControlName, type Controls } from './CameraBody';
import { IndexScreen, MenuOverlay, PhotoScreen, ShootScreen, type MenuItem } from './lcd';

/**
 * The working camera. Three screens, like the real thing:
 *
 *   shoot  → viewfinder. Shutter (or ●) takes "the picture" and lands on…
 *   index  → the main menu: folders, one per job, and loose pictures. ● / T
 *            opens a folder (its own index) or a picture. W backs out of a folder.
 *   photo  → one picture. ◀ ▶ step through the pictures around it — within its
 *            folder, never out of it. ▲ ▼ scroll, W goes back to the index it came from.
 *
 * Shutter from anywhere but the viewfinder returns to the viewfinder — a real
 * camera's half-press does the same. MENU opens the list; DISP hides the HUD.
 */

type Screen = 'shoot' | 'index' | 'photo';
const COLS = 3;
const FLASH_MS = 520;

export function Camera() {
  const [screen, setScreen] = useState<Screen>('shoot');
  /** The folder being browsed, or null for the main menu. */
  const [folder, setFolder] = useState<string | null>(null);
  /** The cursor on the index. */
  const [sel, setSel] = useState(0);
  /** The picture open on the photo screen. */
  const [shot, setShot] = useState(roll[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSel, setMenuSel] = useState(0);
  const [disp, setDisp] = useState(true);
  const [zoom, setZoom] = useState(0);
  const [flash, setFlash] = useState(false);
  const [locked, setLocked] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const busy = useRef(false);

  const items = (folder && getFolder(folder)?.frames) || menu;
  const here = locate(shot);

  const setHash = (h: string) => {
    try {
      history.replaceState(null, '', h ? `#${h}` : location.pathname);
    } catch {}
  };

  const toShoot = useCallback(() => {
    setScreen('shoot');
    setHash('');
  }, []);

  /** An index: the main menu, or a folder's. `at` places the cursor. */
  const toIndex = useCallback((f: string | null, at = 0) => {
    setFolder(f);
    setSel(at);
    setScreen('index');
    setHash(f ?? 'roll');
  }, []);

  const toPhoto = useCallback((id: string, d: 1 | -1 = 1) => {
    const where = locate(id);
    if (!where) return;
    setFolder(where.folder?.id ?? null);
    // Coming back out lands the cursor on this picture.
    setSel((where.folder ? where.folder.frames : menu).findIndex((e) => e.id === id));
    setShot(id);
    setDir(d);
    setScreen('photo');
    setHash(id);
  }, []);

  /** Back out of a folder, to its tile on the main menu. */
  const leaveFolder = () => {
    if (folder) toIndex(null, menu.findIndex((e) => e.id === folder));
  };

  const open = (i: number) => {
    const e = items[i];
    if (!e) return;
    if (e.kind === 'folder') toIndex(e.id, 0);
    else toPhoto(e.id);
  };

  const step = (d: 1 | -1) => {
    const next = here?.frames[here.index + d];
    if (next) toPhoto(next.id, d);
  };

  const capture = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setFlash(true);
    setTimeout(() => toIndex(null, 0), 170);
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
  }, [shot, screen]);

  const menuItems: MenuItem[] = useMemo(
    () => [
      { label: 'Photo roll', run: () => toIndex(null, 0) },
      { label: 'Résumé (PDF)', run: () => window.open(person.resume, '_blank') },
      { label: 'Email me', run: () => (location.href = `mailto:${person.email}`) },
      { label: 'LinkedIn', run: () => window.open(person.linkedin.href, '_blank', 'noreferrer') },
      { label: 'Shooting mode', run: toShoot },
    ],
    [toIndex, toShoot],
  );

  const press = (k: ControlName) => {
    if (k === 'disp') return setDisp((d) => !d);

    if (menuOpen) {
      if (k === 'up') setMenuSel((s) => (s + menuItems.length - 1) % menuItems.length);
      else if (k === 'down') setMenuSel((s) => (s + 1) % menuItems.length);
      else if (k === 'center' || k === 'tele' || k === 'right') {
        setMenuOpen(false);
        menuItems[menuSel].run();
      } else setMenuOpen(false);
      return;
    }

    if (k === 'menu') {
      setMenuOpen(true);
      setMenuSel(0);
      return;
    }
    if (k === 'play') return toIndex(null, 0);
    if (k === 'shutter') return screen === 'shoot' ? capture() : toShoot();

    if (screen === 'shoot') {
      if (k === 'center') capture();
      else if (k === 'tele') setZoom((z) => Math.min(4, z + 1));
      else if (k === 'wide') setZoom((z) => Math.max(0, z - 1));
    } else if (screen === 'index') {
      if (k === 'left') setSel((s) => Math.max(0, s - 1));
      else if (k === 'right') setSel((s) => Math.min(items.length - 1, s + 1));
      else if (k === 'up') setSel((s) => (s - COLS >= 0 ? s - COLS : s));
      else if (k === 'down') setSel((s) => (s + COLS < items.length ? s + COLS : s));
      else if (k === 'center' || k === 'tele') open(sel);
      else if (k === 'wide') leaveFolder();
    } else {
      if (k === 'left') step(-1);
      else if (k === 'right') step(1);
      else if (k === 'up') scrollRef.current?.scrollBy({ top: -110, behavior: 'smooth' });
      else if (k === 'down') scrollRef.current?.scrollBy({ top: 110, behavior: 'smooth' });
      else if (k === 'wide' || k === 'center') toIndex(folder, sel);
    }
  };

  // Deep links: /#roll opens the main menu, /#sourcy that folder, /#sourcy-1 or
  // /#flores that picture.
  useEffect(() => {
    const fromHash = () => {
      setMenuOpen(false);
      const h = decodeURIComponent(location.hash.slice(1));
      if (!h) return setScreen('shoot');
      if (h === 'roll') return toIndex(null, 0);
      if (getFolder(h)) return toIndex(h, 0);
      if (locate(h)) toPhoto(h);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [toIndex, toPhoto]);

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
      if (e.key === 'Escape') {
        k = menuOpen ? 'menu' : screen === 'photo' || (screen === 'index' && folder) ? 'wide' : 'shutter';
      }
      if (!k) return;
      if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
      pressRef.current(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, screen, folder]);

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

  const title = (folder && getFolder(folder)?.label) || 'Index';

  return (
    <div onPointerDown={onPointerDown} onPointerUp={onPointerUp} style={{ display: 'contents' }}>
      <CameraBody controls={controls} flash={flash} lcdLabel={`Camera screen — ${screen}`}>
        {screen === 'shoot' && <ShootScreen zoom={zoom} disp={disp} locked={locked} />}
        {screen === 'index' && (
          <IndexScreen title={title} items={items} sel={sel} disp={disp} inFolder={!!folder} onPick={open} />
        )}
        {screen === 'photo' && here && (
          <PhotoScreen
            frame={here.frames[here.index]}
            index={here.index}
            total={here.frames.length}
            disp={disp}
            dir={dir}
            scrollRef={scrollRef}
            onJump={(id) => toPhoto(id)}
          />
        )}
        {menuOpen && (
          <MenuOverlay
            items={menuItems}
            sel={menuSel}
            onPick={(i) => {
              setMenuOpen(false);
              menuItems[i].run();
            }}
          />
        )}
      </CameraBody>
      <p className="stage-hint keys">
        <kbd>← → ↑ ↓</kbd> move <kbd>Enter</kbd> ● <kbd>W</kbd> back <kbd>Space</kbd> shutter <kbd>M</kbd> menu{' '}
        <kbd>D</kbd> display
      </p>
    </div>
  );
}

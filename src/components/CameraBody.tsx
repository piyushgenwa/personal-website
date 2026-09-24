'use client';

import { Environment, Html, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, createPortal as createScenePortal, useThree, type ThreeEvent } from '@react-three/fiber';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';

/**
 * The camera: a 3D model of the hardware, with the live screen laid onto its
 * LCD and its real buttons wired up as controls.
 *
 * It knows nothing about the site: the LCD is `children`, and every control is
 * either a button (`onClick`) or a link (`href`), so the same body drives the
 * interactive home page and the plain case-study pages.
 *
 * Every coordinate below is in the model's own frame (the parent of its meshes):
 * the back of the camera is the +Y face, +Z is up, and -X is the viewer's right.
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

const MODEL = '/models/digicam.glb';

/** CSS size of the LCD's long side. The short side follows the model's screen. */
const LCD_PX = 640;

/**
 * On a portrait screen the camera is held upright: turned a quarter clockwise,
 * so the buttons sit under the LCD. The wheel turns with it, so each of its
 * directions means whichever way it now points on screen.
 */
const UPRIGHT: Partial<Record<ControlName, ControlName>> = {
  up: 'right',
  right: 'down',
  down: 'left',
  left: 'up',
};

/* ───────────────────────── Button zones ───────────────────────── */

type Disc = { name: ControlName; x: number; z: number; r: number };

/** Round buttons on the back, as (x, z) centres on the +Y face. */
const BACK: Disc[] = [
  { name: 'shutter', x: -1.117, z: 0.189, r: 0.1 },
  { name: 'disp', x: -1.358, z: 0.189, r: 0.1 },
  { name: 'play', x: -1.117, z: -0.624, r: 0.1 },
  { name: 'menu', x: -1.358, z: -0.624, r: 0.1 },
];

/** The four-way wheel: a centre button inside four sectors. */
const WHEEL = { x: -1.247, z: -0.212, r: 0.3, core: 0.11 };

/** On the top plate, as (x, y) centres on the +Z face. */
const TOP = {
  dial: { x: -1.333, y: 0.322, r: 0.21 },
  // The shutter sits inside the zoom lever: press the middle, or rock the ring.
  shutter: { x: -0.885, y: 0.096, r: 0.22, core: 0.09 },
};

const LABELS: Record<ControlName, string> = {
  up: 'Up',
  down: 'Down',
  left: 'Left — previous picture',
  right: 'Right — next picture',
  center: 'Select',
  menu: 'Menu',
  play: 'Playback — photo index',
  disp: 'Display — show or hide the on-screen info',
  wide: 'Wide — back to the index',
  tele: 'Tele — open the picture',
  shutter: 'Shooting mode — and the shutter',
};

/** Which control a point on the model (in model space) lands on, if any. */
function zoneAt(p: THREE.Vector3): ControlName | null {
  if (p.y > 0.28) {
    for (const b of BACK) if (Math.hypot(p.x - b.x, p.z - b.z) < b.r) return b.name;

    const dx = p.x - WHEEL.x;
    const dz = p.z - WHEEL.z;
    const d = Math.hypot(dx, dz);
    if (d < WHEEL.core) return 'center';
    if (d < WHEEL.r) {
      // Viewer's right is -X.
      if (Math.abs(dz) > Math.abs(dx)) return dz > 0 ? 'up' : 'down';
      return dx < 0 ? 'right' : 'left';
    }
  }

  if (p.z > 0.93) {
    const { dial, shutter } = TOP;
    if (Math.hypot(p.x - dial.x, p.y - dial.y) < dial.r) return 'shutter';
    const d = Math.hypot(p.x - shutter.x, p.y - shutter.y);
    if (d < shutter.core) return 'shutter';
    // The lever: W to the viewer's left (+X), T to the right.
    if (d < shutter.r) return p.x > shutter.x ? 'wide' : 'tele';
  }

  return null;
}

/* ───────────────────────── The model ───────────────────────── */

function Model({
  portrait,
  onHost,
  onPress,
  onReady,
  pressed,
  calibrate,
}: {
  portrait: boolean;
  onHost: (el: HTMLDivElement | null) => void;
  /** Called with the physical control pressed, before any turning. */
  onPress: (k: ControlName) => void;
  onReady: () => void;
  pressed: ControlName | null;
  calibrate: boolean;
}) {
  const { scene } = useGLTF(MODEL);

  const screen = useMemo(() => {
    const display = scene.getObjectByName('screen_display') as THREE.Mesh;
    display.visible = false;

    // The display lies flat on the +Y face.
    const geo = display.geometry;
    if (!geo.boundingBox) geo.computeBoundingBox();
    const box = geo.boundingBox!;
    const width = box.max.x - box.min.x;
    const height = box.max.z - box.min.z;
    const center = box.getCenter(new THREE.Vector3());
    // Just proud of the bezel (`screen`, up to y≈0.370) so neither z-fights.
    center.y = 0.371;

    // The panel's corners are rounded: along its bottom edge the outline pulls
    // in from the sides by the corner radius.
    const pos = geo.attributes.position;
    let edgeMax = box.min.x;
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getZ(i) - box.min.z) < 1e-4) edgeMax = Math.max(edgeMax, pos.getX(i));
    }
    const radius = box.max.x - edgeMax;

    // Map the DOM plane (X right, Y up, Z out) onto the back face. Held level,
    // the page's right is the camera's -X and its up is +Z. Held upright, the
    // camera's top points right on screen, so the page's right is +Z and its up +X.
    const basis = (x: THREE.Vector3, y: THREE.Vector3) =>
      new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, new THREE.Vector3(0, 1, 0)));
    const level = basis(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1));
    const upright = basis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));

    return {
      frame: display.parent!,
      center,
      level,
      upright,
      pxShort: Math.round((LCD_PX * height) / width),
      pxRadius: Math.round((LCD_PX * radius) / width),
      // drei maps CSS px to world units at distanceFactor / 400.
      distanceFactor: (width * 400) / LCD_PX,
    };
  }, [scene]);

  const local = (e: ThreeEvent<PointerEvent | MouseEvent>) => screen.frame.worldToLocal(e.point.clone());

  const [hovered, setHovered] = useState<ControlName | null>(null);
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
  }, [hovered]);
  useEffect(() => () => void (document.body.style.cursor = ''), []);

  // A press is a pointer going down and up on the same control without moving
  // far — on pointerup rather than click, which touch screens don't reliably
  // deliver to the canvas.
  const down = useRef<{ k: ControlName; x: number; y: number } | null>(null);

  // Two frames after mounting, the model and the LCD have been drawn.
  useEffect(() => {
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(onReady)));
    return () => cancelAnimationFrame(id);
  }, [onReady]);

  return (
    // The model's back faces -Z; turn it toward the viewer.
    <group rotation={[0, Math.PI, 0]}>
      <primitive
        object={scene}
        // Events arrive once per mesh the ray passes through, nearest first;
        // only the nearest is the surface under the pointer.
        onPointerDown={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const k = zoneAt(local(e));
          down.current = k ? { k, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY } : null;
        }}
        onPointerUp={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const d = down.current;
          down.current = null;
          // A drag that happened to end on a button isn't a press.
          if (!d || Math.hypot(e.nativeEvent.clientX - d.x, e.nativeEvent.clientY - d.y) > 10) return;
          if (zoneAt(local(e)) === d.k) onPress(d.k);
        }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(zoneAt(local(e)));
        }}
        onPointerOut={() => setHovered(null)}
      />

      {createScenePortal(
        <>
          <Html
            transform
            position={screen.center}
            rotation={portrait ? screen.upright : screen.level}
            distanceFactor={screen.distanceFactor}
          >
            <div
              ref={onHost}
              className="lcd"
              style={{
                width: portrait ? screen.pxShort : LCD_PX,
                height: portrait ? LCD_PX : screen.pxShort,
                borderRadius: screen.pxRadius,
              }}
            />
          </Html>
          <Dabs hovered={hovered} pressed={pressed} calibrate={calibrate} />
        </>,
        screen.frame,
      )}
    </group>
  );
}

/* ───────────────────────── Button feedback ───────────────────────── */

/** Radius of a back button's face (the labelled cap, inside its rim). */
const FACE_R = 0.082;
/** Height of the button faces on the back, just proud so the dab never z-fights. */
const FACE_Y = 0.356;
/** A direction press lands on its icon on the wheel's ring; the centre is FUNC/SET. */
const WHEEL_REACH = 0.165;
const WHEEL_DAB = 0.05;
const WHEEL_CAP = 0.085;

/** Where each control's dab sits on the back face, as (x, z, radius). */
const DABS: [ControlName, number, number, number][] = [
  ...BACK.map((b): [ControlName, number, number, number] => [b.name, b.x, b.z, FACE_R]),
  ['center', WHEEL.x, WHEEL.z, WHEEL_CAP],
  ['up', WHEEL.x, WHEEL.z + WHEEL_REACH, WHEEL_DAB],
  ['down', WHEEL.x, WHEEL.z - WHEEL_REACH, WHEEL_DAB],
  // Viewer's right is -X.
  ['right', WHEEL.x - WHEEL_REACH, WHEEL.z, WHEEL_DAB],
  ['left', WHEEL.x + WHEEL_REACH, WHEEL.z, WHEEL_DAB],
];

/** A soft round spot: solid in the middle, feathered to nothing at the edge. */
function useSpot() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.6, '#fff');
    g.addColorStop(1, '#000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

/**
 * The button faces are part of the model, so hover and press are shown as a
 * soft dark spot on the button's face: faint on hover, deeper on press. With
 * `?cal` in the URL every spot is drawn, for lining them up with the hardware.
 */
function Dabs({
  hovered,
  pressed,
  calibrate,
}: {
  hovered: ControlName | null;
  pressed: ControlName | null;
  calibrate: boolean;
}) {
  const spot = useSpot();

  return (
    <>
      {DABS.map(([name, x, z, r]) => {
        const opacity = pressed === name ? 0.55 : hovered === name ? 0.3 : calibrate ? 0.5 : 0;
        if (!opacity) return null;
        return (
          // Planes are drawn facing +Z; tipping -90° about X faces them out of
          // the back (+Y). The pointer passes straight through to the button.
          <mesh
            key={name}
            position={[x, FACE_Y, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            renderOrder={2}
            raycast={() => null}
          >
            <planeGeometry args={[2 * r, 2 * r]} />
            <meshBasicMaterial
              color={calibrate && pressed !== name && hovered !== name ? '#ff0000' : '#0a1e37'}
              alphaMap={spot}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </>
  );
}

/* ───────────────────────── The body ───────────────────────── */

const usable = (ctl: Ctl | undefined): ctl is Ctl => !!ctl && !ctl.disabled && !!(ctl.href || ctl.onClick);

const ORDER: ControlName[] = ['shutter', 'wide', 'tele', 'play', 'up', 'right', 'down', 'left', 'center', 'menu', 'disp'];

/** How long the greeting takes to write itself, plus a beat to read it. */
const GREET_MS = 1900;

/** The greeting is for arriving at the site, not for every page after it. */
let greeted = false;

/** The body's centre, which it turns about when held upright. */
const PIVOT_Y = 1.14;

/**
 * Where the lens sits. The canvas keeps a fixed aspect (.cam), so one framing
 * per orientation fits at any size: the body is 3.2 × 2.1 units, and at these
 * distances it fills ~92% of the frame's limiting side.
 */
function Framing({ portrait }: { portrait: boolean }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { update?: () => void } | null;
  useEffect(() => {
    camera.position.set(0, PIVOT_Y, portrait ? 6.8 : 4.6);
    controls?.update?.();
  }, [camera, controls, portrait]);
  return null;
}

/** Portrait follows the window, like a phone held upright. */
function usePortrait() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const sync = () => setPortrait(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return portrait;
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
  const router = useRouter();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [pressed, setPressed] = useState<ControlName | null>(null);
  const [calibrate, setCalibrate] = useState(false);

  useEffect(() => {
    setCalibrate(new URLSearchParams(location.search).has('cal'));
  }, []);

  // The camera appears only once it has been drawn, and — on the first visit —
  // not before the greeting has finished writing itself.
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const [greet] = useState(() => !greeted);
  const [written, setWritten] = useState(!greet);
  useEffect(() => {
    if (!greet) return;
    const id = setTimeout(() => setWritten(true), GREET_MS);
    return () => clearTimeout(id);
  }, [greet]);
  const shown = ready && written;
  useEffect(() => {
    if (shown) greeted = true;
  }, [shown]);

  const portrait = usePortrait();

  const run = (k: ControlName) => {
    const ctl = controls[k];
    if (!usable(ctl)) return false;
    if (ctl.href) router.push(ctl.href);
    else ctl.onClick?.();
    return true;
  };

  /** A button on the model. Held upright, the wheel means what it points at. */
  const pressHardware = (k: ControlName) => {
    if (!run((portrait && UPRIGHT[k]) || k)) return;
    setPressed(k);
    setTimeout(() => setPressed((p) => (p === k ? null : p)), 140);
  };

  return (
    <div className="cam" data-ready={shown || undefined} data-portrait={portrait || undefined}>
      {greet && (
        <p className="hello" data-gone={shown || undefined}>
          <span>hello there</span>
        </p>
      )}

      <div className="cam-body">
        <Canvas camera={{ position: [0, PIVOT_Y, 4.6], fov: 30 }} dpr={[1, 2]}>
          <Framing portrait={portrait} />
          <Suspense fallback={null}>
            {/* Held upright: a quarter turn clockwise about the body's centre. */}
            <group position={[0, PIVOT_Y, 0]} rotation={[0, 0, portrait ? -Math.PI / 2 : 0]}>
              <group position={[0, -PIVOT_Y, 0]}>
                <Model
                  portrait={portrait}
                  onHost={setHost}
                  onPress={pressHardware}
                  onReady={onReady}
                  pressed={pressed}
                  calibrate={calibrate}
                />
              </group>
            </group>

            {/* The body is white metal, so its colour is whatever it reflects.
                A mid-grey surround reads as silver; bright strips against a dark
                floor give it the contrast that reads as polished. The camera
                faces the viewer, so the strips at +Z are the ones that land on
                the visible face. */}
            <Environment resolution={512}>
              <color attach="background" args={['#5c6562']} />
              {/* Studio softbox overhead. */}
              <Lightformer intensity={4} position={[0, 6, 2]} scale={[10, 4, 1]} />
              {/* Tall strips behind the viewer, off-axis so they skate across the face. */}
              <Lightformer intensity={5} position={[-3, 1, 6]} scale={[0.6, 8, 1]} />
              <Lightformer intensity={2.5} position={[4, 1, 6]} scale={[1.2, 8, 1]} />
              {/* Rim strips that catch the side edges. */}
              <Lightformer intensity={3} position={[-6, 1, 0]} scale={[0.8, 6, 1]} />
              <Lightformer intensity={3} position={[6, 1, 0]} scale={[0.8, 6, 1]} />
              {/* Dark floor: the horizon line that stops the metal reading as grey paint. */}
              <Lightformer color="#0b0f0e" intensity={1} position={[0, -5, 0]} scale={[20, 20, 1]} />
            </Environment>
          </Suspense>

          {/* A little turn to show it's an object, never enough to lose the screen. */}
          <OrbitControls
            makeDefault
            target={[0, PIVOT_Y, 0]}
            enablePan={false}
            enableZoom={false}
            minAzimuthAngle={-0.5}
            maxAzimuthAngle={0.5}
            minPolarAngle={Math.PI / 2 - 0.4}
            maxPolarAngle={Math.PI / 2 + 0.25}
          />
        </Canvas>
      </div>

      {/* The LCD is rendered here, in the page's own React tree, and portalled
          onto the 3D screen — so links and context work as normal. */}
      {host &&
        createPortal(
          <div role="region" aria-label={lcdLabel} style={{ display: 'contents' }}>
            {children}
            <div className="lcd-glare" aria-hidden />
            <div className="flash" data-on={flash || undefined} aria-hidden />
          </div>,
          host,
        )}

      {/* The hardware, for keyboards and screen readers. */}
      <div className="cam-keys">
        {ORDER.map((k) => (
          <button
            key={k}
            type="button"
            aria-label={LABELS[k]}
            disabled={!usable(controls[k])}
            onClick={() => run(k)}
          />
        ))}
      </div>
    </div>
  );
}

useGLTF.preload(MODEL);

'use client';

import { Environment, Html, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, createPortal as createScenePortal, type ThreeEvent } from '@react-three/fiber';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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

/** CSS width the LCD lays out at. Height follows the model's screen. */
const LCD_PX = 640;

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
  onHost,
  onPress,
  pressed,
  calibrate,
}: {
  onHost: (el: HTMLDivElement | null) => void;
  onPress: (k: ControlName) => void;
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

    // Map the DOM plane (X right, Y up, Z out) onto the back face.
    const rotation = new THREE.Euler().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 1, 0),
      ),
    );

    return {
      frame: display.parent!,
      center,
      rotation,
      pxHeight: Math.round((LCD_PX * height) / width),
      // drei maps CSS px to world units at distanceFactor / 400.
      distanceFactor: (width * 400) / LCD_PX,
    };
  }, [scene]);

  const local = (e: ThreeEvent<PointerEvent | MouseEvent>) => screen.frame.worldToLocal(e.point.clone());

  const hovering = useRef(false);
  const setCursor = (on: boolean) => {
    if (on === hovering.current) return;
    hovering.current = on;
    document.body.style.cursor = on ? 'pointer' : '';
  };
  useEffect(() => () => void (document.body.style.cursor = ''), []);

  return (
    // The model's back faces -Z; turn it toward the viewer.
    <group rotation={[0, Math.PI, 0]}>
      <primitive
        object={scene}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          // A drag that happened to end on a button isn't a press.
          if (e.delta > 4) return;
          const k = zoneAt(local(e));
          if (k) {
            e.stopPropagation();
            onPress(k);
          }
        }}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => setCursor(zoneAt(local(e)) !== null)}
        onPointerOut={() => setCursor(false)}
      />

      {createScenePortal(
        <>
          <Html
            transform
            position={screen.center}
            rotation={screen.rotation}
            distanceFactor={screen.distanceFactor}
          >
            <div
              ref={onHost}
              className="lcd"
              style={{ width: LCD_PX, height: screen.pxHeight }}
            />
          </Html>
          <Zones pressed={pressed} calibrate={calibrate} />
        </>,
        screen.frame,
      )}
    </group>
  );
}

type Vec3 = [number, number, number];
type Mark = { name: ControlName; pos: Vec3; rot: Vec3; r: number; r0?: number; theta?: [number, number] };

/**
 * The button faces are part of the model, so a press is shown as a brief dark
 * dab over the button. With `?cal` in the URL every zone is drawn, for lining
 * them up with the hardware.
 */
function Zones({ pressed, calibrate }: { pressed: ControlName | null; calibrate: boolean }) {
  const marks = useMemo(() => {
    const out: Mark[] = [];
    // Rings are drawn in their XY plane; tipping +90° about X lays them on the
    // back face with the ring's +Y pointing up the camera (+Z).
    const back: Vec3 = [Math.PI / 2, 0, 0];
    const top: Vec3 = [0, 0, 0];

    for (const b of BACK) out.push({ name: b.name, pos: [b.x, 0.375, b.z], rot: back, r: b.r });
    out.push({ name: 'center', pos: [WHEEL.x, 0.375, WHEEL.z], rot: back, r: WHEEL.core });
    // Sectors, as angle ranges in the disc's own plane (which is viewed mirrored in X).
    const q = Math.PI / 4;
    const sectors: [ControlName, number][] = [
      ['up', Math.PI / 2],
      ['left', 0],
      ['down', -Math.PI / 2],
      ['right', Math.PI],
    ];
    for (const [name, a] of sectors) {
      out.push({ name, pos: [WHEEL.x, 0.375, WHEEL.z], rot: back, r: WHEEL.r, r0: WHEEL.core, theta: [a - q, 2 * q] });
    }

    const z = 1.13;
    out.push({ name: 'shutter', pos: [TOP.dial.x, TOP.dial.y, z], rot: top, r: TOP.dial.r });
    out.push({ name: 'shutter', pos: [TOP.shutter.x, TOP.shutter.y, z], rot: top, r: TOP.shutter.core });
    const lever = { pos: [TOP.shutter.x, TOP.shutter.y, z] as Vec3, rot: top, r: TOP.shutter.r, r0: TOP.shutter.core };
    out.push({ name: 'wide', ...lever, theta: [-Math.PI / 2, Math.PI] });
    out.push({ name: 'tele', ...lever, theta: [Math.PI / 2, Math.PI] });
    return out;
  }, []);

  return (
    <>
      {marks.map((d, i) => {
        const on = pressed === d.name;
        if (!on && !calibrate) return null;
        return (
          <mesh key={i} position={d.pos} rotation={d.rot} renderOrder={2}>
            <ringGeometry args={[d.r0 ?? 0, d.r, 40, 1, d.theta?.[0] ?? 0, d.theta?.[1] ?? Math.PI * 2]} />
            <meshBasicMaterial
              color={on ? '#0a1e37' : '#ff0000'}
              transparent
              opacity={on ? 0.3 : 0.35}
              depthWrite={false}
              side={THREE.DoubleSide}
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

  const press = (k: ControlName) => {
    const ctl = controls[k];
    if (!usable(ctl)) return;
    setPressed(k);
    setTimeout(() => setPressed((p) => (p === k ? null : p)), 140);
    if (ctl.href) router.push(ctl.href);
    else ctl.onClick?.();
  };

  return (
    <div className="cam cam-3d">
      {/* The canvas keeps a fixed aspect (.cam), so one framing fits at any
          size: the body is 3.2 × 2.1 units, centred at y 1.14, and at this
          distance and fov its height fills ~92% of the frame. */}
      <Canvas camera={{ position: [0, 1.14, 4.6], fov: 30 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Model onHost={setHost} onPress={press} pressed={pressed} calibrate={calibrate} />

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
          target={[0, 1.14, 0]}
          enablePan={false}
          enableZoom={false}
          minAzimuthAngle={-0.5}
          maxAzimuthAngle={0.5}
          minPolarAngle={Math.PI / 2 - 0.4}
          maxPolarAngle={Math.PI / 2 + 0.25}
        />
      </Canvas>

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
            onClick={() => press(k)}
          />
        ))}
      </div>
    </div>
  );
}

useGLTF.preload(MODEL);

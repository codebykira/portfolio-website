"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture, Bounds, Center, OrbitControls } from "@react-three/drei";
import { SRGBColorSpace } from "three";
import type { Group, Mesh, MeshStandardMaterial, Object3D, Texture } from "three";

/**
 * The 3D cat, decimated from ~2M polys to ~80k so it runs in a browser.
 *
 * Two kinds of motion, for two reasons:
 *  - Breathing and sway are root transforms; the model needs nothing for them.
 *  - The ear flick rotates real bones. The blink is a *texture swap*, because
 *    this mesh has the eyes painted into the atlas and has no eyeball geometry,
 *    so there is nothing for a shape key to close.
 *
 * Both are drawn from an exponential distribution rather than a timer — a
 * metronomic blink reads worse than no blink at all.
 */
const MODEL = "/cat.glb";
const BLINK_MAP = "/cat-blink.jpg";

const BREATHE_PERIOD = 3.7;
const BREATHE_DEPTH = 0.012;
const SWAY_PERIOD = 11.3;
const SWAY_DEPTH = 0.02;

const BLINK_MEAN = 5.5;
const BLINK_CLOSE = 0.08;
const BLINK_HOLD = 0.05;
const BLINK_OPEN = 0.11;

const FLICK_MEAN = 7;
const FLICK_OUT = 0.06;
const FLICK_BACK = 0.16;
const FLICK_ANGLE = 0.5;

/** Exponential gap, clamped so it is never jarringly quick or absent. */
function nextGap(mean: number, low: number, high: number) {
  const u = Math.max(Math.random(), 1e-6);
  return Math.min(Math.max(-mean * Math.log(u), low), high);
}

function Cat({ petCount }: { petCount: number }) {
  const { scene } = useGLTF(MODEL);
  const blinkMap = useTexture(BLINK_MAP);
  const group = useRef<Group>(null);

  // The skinned mesh's material, plus the texture it started with, so the
  // blink can swap back to exactly what glTF supplied.
  const swap = useMemo(() => {
    let material: MeshStandardMaterial | null = null;
    let openMap: Texture | null = null;
    scene.traverse((node: Object3D) => {
      const mesh = node as Mesh;
      if (!material && mesh.isMesh) {
        const mat = mesh.material as MeshStandardMaterial;
        if (mat?.map) {
          material = mat;
          openMap = mat.map;
        }
      }
    });
    return { material, openMap };
  }, [scene]);

  const ears = useMemo(() => {
    return (["ear_L", "ear_R"] as const)
      .map((name) => scene.getObjectByName(name))
      .filter((bone): bone is Object3D => Boolean(bone))
      .map((bone) => ({ bone, restX: bone.rotation.x }));
  }, [scene]);

  useEffect(() => {
    // glTF textures are not flipped; match the map we are replacing.
    blinkMap.flipY = false;
    blinkMap.colorSpace = SRGBColorSpace;
    blinkMap.needsUpdate = true;
  }, [blinkMap]);

  const state = useRef({
    nextBlink: -1,
    blinkAt: -1,
    doubleQueued: false,
    closed: false,
    nextFlick: -1,
    flickAt: -1,
    flickIndex: 0,
    petAt: -1,
    seenPet: 0,
  });

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    const s = state.current;
    if (s.nextBlink < 0) s.nextBlink = t + nextGap(BLINK_MEAN, 1.5, 14);
    if (s.nextFlick < 0) s.nextFlick = t + nextGap(FLICK_MEAN, 3, 18);

    // Breathing and a slow weight shift. The periods do not divide evenly, so
    // the pair never lands back in phase.
    const breathe = 1 + BREATHE_DEPTH * Math.sin((t * 2 * Math.PI) / BREATHE_PERIOD);
    g.scale.set(1, breathe, 1);
    g.rotation.z = SWAY_DEPTH * Math.sin((t * 2 * Math.PI) / SWAY_PERIOD);

    // Petting: a squash that settles, and a blink in acknowledgement.
    if (petCount !== s.seenPet) {
      s.seenPet = petCount;
      s.petAt = t;
      s.blinkAt = t;
      s.doubleQueued = false;
    }
    const sincePet = t - s.petAt;
    if (s.petAt >= 0 && sincePet < 0.32) {
      const k = Math.sin((sincePet / 0.32) * Math.PI);
      g.position.y = k * 0.06;
      g.scale.set(1 + k * 0.03, breathe - k * 0.04, 1 + k * 0.03);
    } else {
      g.position.y = 0;
    }

    // Blink — swap the atlas for the eyes-closed bake.
    const mat = swap.material as MeshStandardMaterial | null;
    if (mat && swap.openMap) {
      if (s.blinkAt < 0 && t >= s.nextBlink) {
        s.blinkAt = t;
        s.doubleQueued = Math.random() < 0.25;
      }
      if (s.blinkAt >= 0) {
        const dt = t - s.blinkAt;
        const shut = dt >= BLINK_CLOSE && dt < BLINK_CLOSE + BLINK_HOLD + BLINK_OPEN * 0.5;
        if (shut !== s.closed) {
          s.closed = shut;
          mat.map = shut ? blinkMap : swap.openMap;
          mat.needsUpdate = true;
        }
        if (dt >= BLINK_CLOSE + BLINK_HOLD + BLINK_OPEN) {
          s.blinkAt = -1;
          s.nextBlink = s.doubleQueued ? t + 0.16 : t + nextGap(BLINK_MEAN, 1.5, 14);
          s.doubleQueued = false;
        }
      }
    }

    // Ear flick — one ear at a time, a quick out and a slower settle.
    if (ears.length) {
      if (s.flickAt < 0 && t >= s.nextFlick) {
        s.flickAt = t;
        s.flickIndex = Math.floor(Math.random() * ears.length);
      }
      if (s.flickAt >= 0) {
        const dt = t - s.flickAt;
        let amount = 0;
        if (dt < FLICK_OUT) {
          amount = dt / FLICK_OUT;
        } else if (dt < FLICK_OUT + FLICK_BACK) {
          amount = 1 - (dt - FLICK_OUT) / FLICK_BACK;
        } else {
          s.flickAt = -1;
          s.nextFlick = t + nextGap(FLICK_MEAN, 3, 18);
        }
        const target = ears[s.flickIndex];
        if (target) target.bone.rotation.x = target.restX - amount * FLICK_ANGLE;
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}
useGLTF.preload(MODEL);

export default function CatViewer() {
  const [petCount, setPetCount] = useState(0);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#15151c]">
      <Canvas dpr={[1, 2]} camera={{ position: [2.2, 1.4, 3.2], fov: 40 }}>
        {/* Kept soft: this cat has a white chest and paws that clip to pure
            white under a strong key. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} />
        <directionalLight position={[-4, 2, -3]} intensity={0.3} />
        <hemisphereLight args={["#cfd6ff", "#2a2a33", 0.45]} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.15}>
            <Center onClick={() => setPetCount((n) => n + 1)}>
              <Cat petCount={petCount} />
            </Center>
          </Bounds>
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.9}
          minDistance={1.5}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}

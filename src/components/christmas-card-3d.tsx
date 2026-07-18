"use client";

import { Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Bounds, Center } from "@react-three/drei";
import type { Group } from "three";

/**
 * Renders the /public/card.glb Christmas card inside a project showcase slot.
 * - Bounds auto-fits the camera so we don't need to know the model's scale.
 * - Center keeps the (static) model centred; the Spin wrapper rotates around it
 *   so there's no re-centring jitter.
 * - pointer-events are disabled by the parent so clicks fall through to the
 *   card's link.
 */
function Model() {
  const { scene } = useGLTF("/card.glb");
  return <primitive object={scene} />;
}
useGLTF.preload("/card.glb");

function Spin({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });
  return <group ref={ref}>{children}</group>;
}

export default function ChristmasCard3D() {
  return (
    <div className="h-full w-full pointer-events-none">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 40 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} />
        <directionalLight position={[-5, -3, -4]} intensity={0.35} />
        <Suspense fallback={null}>
          <Bounds fit margin={1.2}>
            <Spin>
              <Center>
                <Model />
              </Center>
            </Spin>
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  );
}

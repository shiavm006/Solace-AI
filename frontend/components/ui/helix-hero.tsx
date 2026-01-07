"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import * as THREE from "three";
import BlurEffect from "react-progressive-blur";

interface HelixRingsProps {
  levelsUp?: number;
  levelsDown?: number;
  stepY?: number;
  rotationStep?: number;
}

const HelixRings: React.FC<HelixRingsProps> = ({
  levelsUp = 10,
  levelsDown = 10,
  stepY = 0.85,
  rotationStep = Math.PI / 16,
}) => {
  const groupRef = useRef<THREE.Group>(new THREE.Group());

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const ringGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.35;
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    const depth = 10;
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 64,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -depth / 2);

    return geometry;
  }, []);

  const elements = [];
  for (let i = -levelsDown; i <= levelsUp; i++) {
    elements.push({
      id: `helix-ring-${i}`,
      y: i * stepY,
      rotation: i * rotationStep,
    });
  }

  return (
    <group
      ref={newGroup => {
        if (newGroup) {
          groupRef.current = newGroup;
        }
      }}
      scale={1}
      position={[5, 0, 0]}
      rotation={[0, 0, 0]}
    >
      {elements.map((el) => (
        <mesh
          key={el.id}
          geometry={ringGeometry}
          position={[0, el.y, 0]}
          rotation={[0, Math.PI / 2 + el.rotation, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#38bdf8"
            metalness={0.7}
            roughness={0.5}
            clearcoat={0.1}
            clearcoatRoughness={0.15}
            reflectivity={0.2}
            iridescence={0.96}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[100, 400]}
          />
        </mesh>
      ))}
    </group>
  );
};

const Scene: React.FC = () => {
  return (
    <Canvas
      className="h-full w-full"
      orthographic
      shadows
      camera={{
        zoom: 70,
        position: [0, 0, 7],
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true }}
    >
      {/* Pure black background to match surrounding sections */}
      <color attach="background" args={["#000000"]} />

      <hemisphereLight color="#111111" groundColor="#000000" intensity={1.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={2}
        castShadow
        color="#38bdf8"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <HelixRings />

      <EffectComposer multisampling={8}>
        <Bloom
          kernelSize={3}
          luminanceThreshold={0}
          luminanceSmoothing={0.4}
          intensity={0.7}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={0.5}
        />
      </EffectComposer>
      {/* <Perf position="top-left" /> */}
    </Canvas>
  );
};

interface HeroProps {
  title: string;
  description: string;
}

export const Hero: React.FC<HeroProps> = ({ title, description }) => {
  return (
    <section className="relative h-screen w-screen font-sans tracking-tight text-slate-100 bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      <div className="absolute bottom-6 left-6 md:bottom-16 md:left-16 z-20 max-w-xl">
        <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-3">
          {title}
        </h2>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light tracking-tight whitespace-pre-line">
          {description}
        </p>
      </div>

      {/* Soft blur overlays to blend with the black background */}
      <BlurEffect
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 md:h-1/3 bg-gradient-to-t from-black via-black/60 to-transparent"
        position="bottom"
        intensity={40}
      />
      <BlurEffect
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black via-black/60 to-transparent"
        position="top"
        intensity={30}
      />
    </section>
  );
};



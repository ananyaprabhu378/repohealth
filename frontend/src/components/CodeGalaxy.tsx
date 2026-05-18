"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

const GalaxyParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particles representing codebase modules in a spiral galaxy shape
  const [positions, colors] = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color1 = new THREE.Color("#00F0FF"); // Cyan
    const color2 = new THREE.Color("#9D00FF"); // Purple
    const color3 = new THREE.Color("#EF4444"); // Red (risky nodes)

    for (let i = 0; i < count; i++) {
      // Spiral math
      const i3 = i * 3;
      const radius = Math.random() * 25;
      const spinAngle = radius * 1.5;
      const branchAngle = ((i % 3) * 2 * Math.PI) / 3;

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color distribution (Core is hot cyan/red, outer branches are purple)
      let mixedColor = color1.clone();
      if (radius < 5) {
        mixedColor.lerp(color3, Math.random()); // Red hotspot core
      } else {
        mixedColor.lerp(color2, radius / 25); // Fade to purple on outer edges
      }

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default function CodeGalaxy() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#05050A]">
      <Canvas camera={{ position: [0, 15, 30], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <Stars radius={150} depth={50} count={3000} factor={3} saturation={0.5} fade speed={1.5} />
        <GalaxyParticles />
      </Canvas>
    </div>
  );
}

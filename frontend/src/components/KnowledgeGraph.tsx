"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

interface GraphProps {
  nodes?: Array<{ id: string; type: string; complexity?: number; churn?: number }>;
  edges?: Array<{ source: string; target: string; type: string; weight?: number }>;
  onNodeClick?: (node: any) => void;
}

const NodeCloud = ({ nodes = [], edges = [] , onNodeClick}: GraphProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Position nodes inside a 3D sphere layout
  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    
    return nodes.map((node, i) => {
      // Golden spiral distribution for high performance and visually amazing cluster layout
      const phi = Math.acos(-1 + (2 * i) / nodes.length);
      const theta = Math.sqrt(nodes.length * Math.PI) * phi;
      const radius = 15;

      const position = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      // Color mapping: red for hot files, cyan for standard, purple for modules
      let color = "#00F0FF";
      if (node.complexity && node.complexity > 5) {
        color = "#EF4444";
      } else if (node.type === "module") {
        color = "#9D00FF";
      }

      const size = Math.min(1.2, Math.max(0.2, (node.complexity || 1) * 0.15));

      return {
        ...node,
        position,
        color,
        size
      };
    });
  }, [nodes]);

  // Map nodes by id for quick lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    positionedNodes.forEach(n => map.set(n.id, n.position));
    return map;
  }, [positionedNodes]);

  // Animate the whole cloud
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Draw Nodes */}
      {positionedNodes.map((node, i) => (
        <mesh 
          key={i} 
          position={node.position}
          onClick={(e) => {
            e.stopPropagation();
            if (onNodeClick) onNodeClick(node);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "auto";
          }}
        >
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.9} />
        </mesh>
      ))}

      {/* Draw Edges */}
      {edges.map((edge, idx) => {
        const start = nodeMap.get(edge.source);
        const end = nodeMap.get(edge.target);

        if (!start || !end) return null;

        const points = [start, end];
        
        return (
          <line key={idx}>
            <bufferGeometry
              attach="geometry"
              {...new THREE.BufferGeometry().setFromPoints(points)}
            />
            <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
          </line>
        );
      })}
    </group>
  );
};

export default function KnowledgeGraph({ nodes = [], edges = [], onNodeClick }: GraphProps) {
  // If no nodes, generate fallback dummy nodes so the Canvas never looks empty
  const fallbackData = useMemo(() => {
    if (nodes.length > 0) return { nodes, edges };
    
    const dummyNodes = [];
    const dummyEdges = [];
    for (let i = 0; i < 60; i++) {
      dummyNodes.push({
        id: `node-${i}`,
        type: i % 10 === 0 ? "module" : "file",
        complexity: Math.random() * 8
      });
      if (i > 0 && i % 3 === 0) {
        dummyEdges.push({
          source: `node-${i}`,
          target: `node-${i-1}`,
          type: "co-changed"
        });
      }
    }
    return { nodes: dummyNodes, edges: dummyEdges };
  }, [nodes, edges]);

  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
      <color attach="background" args={["#030712"]} />
      <ambientLight intensity={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <NodeCloud nodes={fallbackData.nodes} edges={fallbackData.edges} onNodeClick={onNodeClick} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

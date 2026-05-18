"use client";

import { useEffect, useRef } from "react";

interface RepositoryDnaProps {
  healthScore: number;
  isPlaying?: boolean;
}

export default function RepositoryDna({ healthScore, isPlaying = false }: RepositoryDnaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Adjust for padding
        canvas.width = parent.clientWidth - 24 || 280;
        canvas.height = parent.clientHeight - 40 || 220;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Draw grid or background glow under DNA
      ctx.strokeStyle = "rgba(0, 240, 255, 0.02)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Sine wave drawing parameters
      const centerY = height / 2;
      const maxAmplitude = Math.min(width * 0.22, 40);
      const frequency = 0.035; // wave spacing
      const steps = 22; // number of base pairs
      const speed = isPlaying ? 0.045 : 0.015;
      rotation += speed;

      // Jitter based on instability (lower health = higher mutation jitter)
      const healthFactor = healthScore / 100;
      const instability = 1 - healthFactor;
      const mutationAmplitude = instability * 10; // max pixels of chaotic drift

      const basePairs = [];

      for (let i = 0; i < steps; i++) {
        const x = (width / (steps - 1)) * i;
        const angle = i * 0.45 + rotation;

        // Base sine values
        let yOffset = Math.sin(angle) * maxAmplitude;
        let z = Math.cos(angle); // simulated depth [-1, 1]

        // Symmetrical offsets for matching strand
        let yOffset2 = -yOffset;
        let z2 = -z;

        // Introduce mutation/jitter based on instability
        if (instability > 0.05) {
          const jitter1 = Math.sin(angle * 2.8 + rotation * 2.5) * mutationAmplitude;
          const jitter2 = Math.cos(angle * 1.7 + rotation * 3.1) * mutationAmplitude;
          yOffset += jitter1;
          yOffset2 += jitter2;
        }

        const y1 = centerY + yOffset;
        const y2 = centerY + yOffset2;

        basePairs.push({
          x,
          y1,
          z1: z,
          y2,
          z2,
        });
      }

      // Draw base pair rungs first (so they sit behind/between nodes)
      basePairs.forEach((pair) => {
        // Average z depth to calculate color alpha and glow
        const avgZ = (pair.z1 + pair.z2) / 2;
        const alpha = 0.1 + (avgZ + 1) * 0.25; // [0.10, 0.60]

        // Color shifts to red/orange if health is low, otherwise nice cyan/purple
        let rungColor = `rgba(0, 240, 255, ${alpha})`;
        if (healthScore < 60) {
          rungColor = `rgba(239, 68, 68, ${alpha * 0.8})`; // red
        } else if (healthScore < 85) {
          rungColor = `rgba(234, 179, 8, ${alpha * 0.8})`; // yellow
        } else {
          // Gradient blend alpha
          rungColor = `rgba(157, 0, 255, ${alpha * 0.75})`;
        }

        ctx.strokeStyle = rungColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(pair.x, pair.y1);
        ctx.lineTo(pair.x, pair.y2);
        ctx.stroke();

        // Draw dynamic little central code-like connection bits (e.g. data dots)
        if (Math.abs(pair.y1 - pair.y2) > 8) {
          const midY = (pair.y1 + pair.y2) / 2;
          ctx.fillStyle = healthScore < 70 ? "#EF4444" : "#00F0FF";
          ctx.beginPath();
          ctx.arc(pair.x, midY, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Strand 1 Nodes
      basePairs.forEach((pair) => {
        // Scale size and brightness by Z depth (simulating 3D)
        const size = 2.5 + (pair.z1 + 1) * 2; // size [2.5, 6.5]
        const opacity = 0.25 + (pair.z1 + 1) * 0.35; // [0.25, 0.95]

        // Determine node color (healthy cyan, degraded yellow, severe red)
        let color = `rgba(0, 240, 255, ${opacity})`;
        if (healthScore < 60) {
          color = `rgba(239, 68, 68, ${opacity})`;
        } else if (healthScore < 85) {
          color = `rgba(234, 179, 8, ${opacity})`;
        }

        // Draw shadow/glow on closer nodes
        if (pair.z1 > 0.45) {
          ctx.shadowColor = healthScore < 70 ? "#EF4444" : "#00F0FF";
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pair.x, pair.y1, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw Strand 2 Nodes
      basePairs.forEach((pair) => {
        const size = 2.5 + (pair.z2 + 1) * 2;
        const opacity = 0.25 + (pair.z2 + 1) * 0.35;

        let color = `rgba(157, 0, 255, ${opacity})`; // Purple default
        if (healthScore < 60) {
          color = `rgba(239, 68, 68, ${opacity})`;
        } else if (healthScore < 85) {
          color = `rgba(249, 115, 22, ${opacity})`; // Orange warning
        }

        if (pair.z2 > 0.45) {
          ctx.shadowColor = healthScore < 70 ? "#EF4444" : "#9D00FF";
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pair.x, pair.y2, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;

      // Draw telemetry labels or simple metrics text at bottom
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "8px monospace";
      ctx.fillText(`DNA SEQUENCE INDEX: ${healthScore}BP/S`, 6, height - 6);
      ctx.fillText(`MUTATION COEFFICIENT: ${instability.toFixed(3)}`, width - 135, height - 6);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [healthScore, isPlaying]);

  return (
    <div className="w-full h-full min-h-[180px] relative overflow-hidden rounded-xl bg-black/40 border border-white/5 p-4 flex items-center justify-center">
      <div className="absolute top-2.5 left-3 font-mono text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5 z-10">
        <span className={`w-1.5 h-1.5 rounded-full ${healthScore > 85 ? "bg-aether-primary" : healthScore > 60 ? "bg-yellow-500" : "bg-red-500"} animate-pulse`}></span>
        Helix DNA Engine
      </div>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

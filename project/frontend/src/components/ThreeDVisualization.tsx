'use client';

import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/utils/cn';

interface NodeData {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  type: 'threat' | 'blockchain' | 'wallet' | 'contract';
  label: string;
  intensity: number;
}

interface EdgeData {
  source: number;
  target: number;
  strength: number;
}

const NODE_COLORS = {
  threat: '#ef4444',
  blockchain: '#06b6d4',
  wallet: '#22c55e',
  contract: '#a855f7',
};

function generateNetworkData(): { nodes: NodeData[]; edges: EdgeData[] } {
  const nodes: NodeData[] = [];
  const edges: EdgeData[] = [];
  const types: NodeData['type'][] = ['threat', 'blockchain', 'wallet', 'contract'];
  const threatLabels = ['DDoS', 'Malware', 'Phishing', 'Ransomware', 'Zero-Day', 'SQLi', 'DNS Spoof', 'Brute Force'];
  const chainLabels = ['Ethereum', 'Polygon', 'Arbitrum', 'Solana', 'BNB Chain', 'Avalanche'];
  const walletLabels = ['0x7F3e...9aB2', '0x1A2b...3cD4', '0xE5f6...7gH8'];
  const contractLabels = ['Uniswap V3', 'Aave V3', 'Curve', 'Compound', 'Lido'];

  for (let i = 0; i < 30; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 3 + Math.random() * 2;
    const labelMap: Record<NodeData['type'], string[]> = {
      threat: threatLabels,
      blockchain: chainLabels,
      wallet: walletLabels,
      contract: contractLabels,
    };
    const labels = labelMap[type];
    const id = `${type}-${i}`;

    nodes.push({
      id,
      position: [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      ] as [number, number, number],
      color: NODE_COLORS[type],
      size: type === 'threat' ? 0.25 + Math.random() * 0.15 : 0.2 + Math.random() * 0.1,
      type,
      label: labels[i % labels.length],
      intensity: type === 'threat' ? 0.5 + Math.random() * 0.5 : 0.2 + Math.random() * 0.3,
    });
  }

  // Create edges between nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < 0.1) {
        const dx = nodes[i].position[0] - nodes[j].position[0];
        const dy = nodes[i].position[1] - nodes[j].position[1];
        const dz = nodes[i].position[2] - nodes[j].position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 3) {
          edges.push({
            source: i,
            target: j,
            strength: 1 - dist / 3,
          });
        }
      }
    }
  }

  return { nodes, edges };
}

function NetworkNode({ node, isHovered, onHover, onClick }: {
  node: NodeData;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2 + node.intensity * Math.PI) * 0.15 + 1;
      const targetScale = hovered || isHovered ? 1.8 : 1;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale * pulse * 0.8, 0.05));
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={node.position}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(node.id); }}
        onPointerOut={() => { setHovered(false); onHover(null); }}
        onClick={() => onClick(node.id)}
      >
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshPhysicalMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered || isHovered ? 0.8 : 0.3}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glow */}
      <sprite position={[node.position[0], node.position[1], node.position[2]]}>
        <spriteMaterial
          transparent
          opacity={0.15}
          color={node.color}
        />
      </sprite>

      {/* Label */}
      {(hovered || isHovered) && (
        <Html position={[node.position[0], node.position[1] + 0.5, node.position[2]]} center>
          <div className="px-2 py-1 rounded-lg bg-surface-dark/90 border border-white/10 text-[10px] text-white whitespace-nowrap backdrop-blur-sm">
            {node.label}
            <span className="block text-[8px] text-white/40">{node.type}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function NetworkEdge({ start, end, strength }: { start: [number, number, number]; end: [number, number, number]; strength: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const points = useMemo(() => {
    const mid: [number, number, number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2,
    ];
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(mid[0], mid[1], mid[2]),
      new THREE.Vector3(...end)
    );
    return curve.getPoints(20);
  }, [start, end]);

  return (
    <mesh ref={ref}>
      <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 20, 0.015 * strength, 8, false]} />
      <meshBasicMaterial
        color="#06b6d4"
        transparent
        opacity={0.15 * strength}
      />
    </mesh>
  );
}

function ParticleSystem() {
  const count = 500;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.01;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.005) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#06b6d4"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function Scene({ nodes, edges, hoveredNode, onHover, onClick }: {
  nodes: NodeData[];
  edges: EdgeData[];
  hoveredNode: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(6, 4, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#a855f7" />

      <ParticleSystem />

      {edges.map((edge, idx) => (
        <NetworkEdge
          key={idx}
          start={nodes[edge.source].position}
          end={nodes[edge.target].position}
          strength={edge.strength}
        />
      ))}

      {nodes.map((node) => (
        <NetworkNode
          key={node.id}
          node={node}
          isHovered={hoveredNode === node.id}
          onHover={onHover}
          onClick={onClick}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={1.5}
        maxPolarAngle={Math.PI / 2}
        minDistance={4}
        maxDistance={15}
      />
    </>
  );
}

function Fallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-secondary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-white/30">Loading 3D visualization...</p>
      </div>
    </div>
  );
}

export default function ThreeDVisualization() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [data] = useState(generateNetworkData);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const nodeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.nodes.forEach(n => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [data]);

  if (!hasWebGL) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">3D Network Visualization</h3>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center text-white/30">
            <p className="text-sm">WebGL is not available</p>
            <p className="text-xs mt-1">Please use a browser with WebGL support</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">3D Network Visualization</h3>
          <span className="text-[10px] text-white/30">{data.nodes.length} nodes</span>
        </div>

        <div className="flex items-center gap-3">
          {Object.entries(nodeCounts).map(([type, count]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: NODE_COLORS[type as keyof typeof NODE_COLORS] }}
              />
              <span className="text-[10px] text-white/40 capitalize">{type}: {count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative" style={{ height: 500 }}>
        <Suspense fallback={<Fallback />}>
          <Canvas
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <Scene
              nodes={data.nodes}
              edges={data.edges}
              hoveredNode={hoveredNode}
              onHover={setHoveredNode}
              onClick={setSelectedNode}
            />
          </Canvas>
        </Suspense>

        {/* Overlay Legend */}
        <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-surface-dark/80 backdrop-blur-sm px-3 py-2">
          <div className="text-[10px] text-white/30 flex items-center gap-3">
            <span>🖱 Drag to rotate</span>
            <span>🔄 Scroll to zoom</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

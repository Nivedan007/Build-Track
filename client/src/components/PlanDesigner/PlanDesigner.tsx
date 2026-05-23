"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";
import Wall from "./Wall";
import * as THREE from "three";
import { api } from "@/lib/api";

type WallDef = {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotationY: number;
  color?: string;
};

function snap(v: number, grid: number) {
  return Math.round(v / grid) * grid;
}

function wrapAngle(angle: number) {
  const normalized = ((angle + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  return normalized - Math.PI;
}

function isAxisAlignedRotation(worldQuaternion: THREE.Quaternion, tolerance = 0.02) {
  const euler = new THREE.Euler().setFromQuaternion(worldQuaternion, "YXZ");
  const xAligned = Math.abs(wrapAngle(euler.x)) < tolerance;
  const zAligned = Math.abs(wrapAngle(euler.z)) < tolerance;
  return xAligned && zAligned;
}

function isBoxLikeMesh(mesh: THREE.Mesh) {
  const type = (mesh.geometry as THREE.BufferGeometry | undefined)?.type ?? "";
  return /Box(Geometry|BufferGeometry)$/i.test(type) || /RoundedBox/i.test(type);
}

export default function PlanDesigner() {
  const [walls, setWalls] = useState<WallDef[]>([]);
  const [depth, setDepth] = useState<number>(0.2);
  const [height, setHeight] = useState<number>(3);
  const [snapSize, setSnapSize] = useState<number>(0.5);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPt, setStartPt] = useState<[number, number] | null>(null);
  const [previewPt, setPreviewPt] = useState<[number, number] | null>(null);
  const planeRef = useRef<THREE.Mesh>(null!);
  const [importedObjects, setImportedObjects] = useState<THREE.Object3D[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storageKey = "plan-designer:design";

  function handlePointerDown(e: any) {
    e.stopPropagation();
    const p = e.point as THREE.Vector3;
    const x = snap(p.x, snapSize);
    const z = snap(p.z, snapSize);
    if (!isDrawing) {
      setStartPt([x, z]);
      setPreviewPt([x, z]);
      setIsDrawing(true);
    } else if (startPt) {
      const [sx, sz] = startPt;
      const dx = x - sx;
      const dz = z - sz;
      const length = Math.sqrt(dx * dx + dz * dz) || 0.01;
      const midX = (sx + x) / 2;
      const midZ = (sz + z) / 2;
      const rotationY = Math.atan2(dz, dx);
      const id = Date.now().toString();
      setWalls((ws) => [
        ...ws,
        { id, x: midX, z: midZ, width: length, depth, height, rotationY, color: "#8aa4ff" },
      ]);
      setIsDrawing(false);
      setStartPt(null);
      setPreviewPt(null);
    }
  }

  useEffect(() => {
    // support loading via ?load=<id>
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("load");
      if (id) {
        (async () => {
          const response = await api.get(`/designs/${id}`);
          if (response && response.data && Array.isArray(response.data.data?.walls)) {
            setWalls(response.data.data.walls);
            // remove param from URL
            params.delete("load");
            const url = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, "", url);
          }
        })();
      }
    } catch (err) {
      // ignore
    }
  }, []);

  function handlePointerMove(e: any) {
    if (!isDrawing) return;
    e.stopPropagation();
    const p = e.point as THREE.Vector3;
    const x = snap(p.x, snapSize);
    const z = snap(p.z, snapSize);
    setPreviewPt([x, z]);
  }

  function cancelDraw() {
    setIsDrawing(false);
    setStartPt(null);
    setPreviewPt(null);
  }

  function removeLast() {
    setWalls((ws) => ws.slice(0, -1));
  }

  async function exportGLTF() {
    const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    walls.forEach((w) => {
      const geo = new THREE.BoxGeometry(w.width, w.height, w.depth);
      const mat = new THREE.MeshStandardMaterial({ color: w.color || "#8aa4ff" });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(w.x, w.height / 2, w.z);
      m.rotation.set(0, w.rotationY, 0);
      group.add(m);
    });

    const result = await exporter.parseAsync(group, { binary: true });
    const output = result instanceof ArrayBuffer
      ? new Blob([result], { type: "application/octet-stream" })
      : new Blob([JSON.stringify(result)], { type: "model/gltf+json" });
    const url = URL.createObjectURL(output);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan.glb";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportOBJ() {
    const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");
    const exporter = new OBJExporter();
    const group = new THREE.Group();
    walls.forEach((w) => {
      const geo = new THREE.BoxGeometry(w.width, w.height, w.depth);
      const mat = new THREE.MeshStandardMaterial({ color: w.color || "#8aa4ff" });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(w.x, w.height / 2, w.z);
      m.rotation.set(0, w.rotationY, 0);
      group.add(m);
    });
    const text = exporter.parse(group);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plan.obj";
    a.click();
    URL.revokeObjectURL(url);
  }

  function triggerImport() {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const name = f.name.toLowerCase();
    if (name.endsWith(".obj")) {
      const text = await f.text();
      const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
      const loader = new OBJLoader();
      const obj = loader.parse(text);
      setImportedObjects((arr) => [...arr, obj]);
    } else if (name.endsWith(".gltf") || name.endsWith(".glb")) {
      const arrayBuffer = await f.arrayBuffer();
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const loader = new GLTFLoader();
      loader.parse(arrayBuffer as ArrayBuffer, "", (gltf) => {
        setImportedObjects((arr) => [...arr, gltf.scene]);
      });
    } else {
      alert("Unsupported file type. Use .obj or .gltf/.glb");
    }
  }

  function saveDesign() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ walls }));
      alert("Design saved locally");
    } catch (err) {
      console.error(err);
      alert("Failed to save design");
    }
  }

  function loadDesign() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        alert("No saved design found");
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.walls)) {
        setWalls(parsed.walls);
        alert("Design loaded");
      } else {
        alert("Saved data invalid");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load design");
    }
  }

  async function saveDesignToServer() {
    try {
      const name = window.prompt("Name for design:", "New Design") || "New Design";
      const payload = { name, data: { walls } };
      const response = await api.post("/designs", payload);
      alert(`Saved design: ${response.data.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save to server");
    }
  }

  async function loadDesignFromServer() {
    try {
      const id = window.prompt("Enter design id to load:");
      if (!id) return;
      const response = await api.get(`/designs/${id}`);
      if (response && response.data && Array.isArray(response.data.data?.walls)) {
        setWalls(response.data.data.walls);
        alert("Design loaded from server");
      } else {
        alert("Design data invalid");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load from server");
    }
  }

  function convertImportedObject(obj: THREE.Object3D) {
    // Traverse meshes and collect box-like candidates
    const candidates: WallDef[] = [];
    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (!isBoxLikeMesh(child)) return;

      const mesh = child as THREE.Mesh;
      const bbox = new THREE.Box3().setFromObject(mesh);
      const size = new THREE.Vector3();
      bbox.getSize(size);

      // world transform
      mesh.updateWorldMatrix(true, false);
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const worldQuat = new THREE.Quaternion();
      mesh.getWorldQuaternion(worldQuat);

      if (!isAxisAlignedRotation(worldQuat, 0.05)) {
        return;
      }

      const worldScale = new THREE.Vector3();
      mesh.getWorldScale(worldScale);
      const horizX = Math.abs(size.x * worldScale.x);
      const horizZ = Math.abs(size.z * worldScale.z);
      const width = Math.max(horizX, horizZ);
      const depthVal = Math.min(horizX, horizZ) || 0.01;
      const heightVal = Math.abs(size.y * worldScale.y) || 1;

      // Require thinness ratio to be wall-like
      if (depthVal / Math.max(0.0001, width) > 0.25) return; // too thick to be a wall

      const euler = new THREE.Euler().setFromQuaternion(worldQuat, "YXZ");

      const wall: WallDef = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        x: worldPos.x,
        z: worldPos.z,
        width: Math.max(0.01, width),
        depth: Math.max(0.01, depthVal),
        height: Math.max(0.01, heightVal),
        rotationY: euler.y,
        color: (mesh.material && (mesh.material as any).color) ? `#${(mesh.material as any).color.getHexString()}` : "#8aa4ff",
      };
      candidates.push(wall);
    });

    if (candidates.length === 0) {
      alert("No box-like candidates found in the imported object.");
      return;
    }

    // Ask user confirmation before converting
    const confirmMsg = `Convert ${candidates.length} imported box-like objects into walls?`;
    if (!window.confirm(confirmMsg)) return;

    // snap positions to grid and merge
    const snapped = candidates.map((w) => ({ ...w, x: snap(w.x, snapSize), z: snap(w.z, snapSize), width: Math.round(w.width * 100) / 100 }));
    setWalls((arr) => [...arr, ...snapped]);
  }

  function convertAllImported() {
    importedObjects.forEach((obj) => convertImportedObject(obj));
    // remove all imported objects after conversion
    setImportedObjects([]);
  }

  return (
    <div className="flex h-full">
      <aside className="w-80 p-4 bg-white/90 border-r">
        <h3 className="text-lg font-semibold mb-3">Plan Designer</h3>
        <div className="mb-2">
          <label className="block text-sm">Wall Thickness (m)</label>
          <input className="w-full mb-1 p-1 border" type="number" step="0.05" value={depth} onChange={(e) => setDepth(parseFloat(e.target.value || "0"))} />
          <label className="block text-sm">Wall Height (m)</label>
          <input className="w-full mb-1 p-1 border" type="number" step="0.1" value={height} onChange={(e) => setHeight(parseFloat(e.target.value || "0"))} />
          <label className="block text-sm">Snap Grid (m)</label>
          <input className="w-full mb-2 p-1 border" type="number" step="0.1" value={snapSize} onChange={(e) => setSnapSize(parseFloat(e.target.value || "0.1"))} />
        </div>

        <div className="space-y-2">
          <button className={`w-full p-2 rounded ${isDrawing ? "bg-red-600 text-white" : "bg-green-600 text-white"}`} onClick={() => { if (isDrawing) cancelDraw(); else { setIsDrawing(true); } }}>
            {isDrawing ? "Cancel Drawing" : "Start Drawing"}
          </button>
          <button className="w-full p-2 bg-slate-200" onClick={removeLast}>Undo Last</button>
          <button className="w-full p-2 bg-slate-200" onClick={() => setWalls([])}>Clear All</button>
            <button className="w-full p-2 bg-indigo-600 text-white" onClick={exportGLTF}>Export GLTF</button>
            <button className="w-full p-2 bg-indigo-600 text-white" onClick={exportOBJ}>Export OBJ</button>
            <button className="w-full p-2 bg-amber-500 text-white" onClick={triggerImport}>Import (.obj/.gltf)</button>
            <input ref={fileInputRef} type="file" accept=".obj,.gltf,.glb" onChange={handleImportFile} className="hidden" />
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Elements</h4>
          <ul className="mt-2 space-y-1 text-sm max-h-48 overflow-auto">
            {walls.map((w) => (
              <li key={w.id} className="flex items-center justify-between">
                <span>Wall {w.id.slice(-4)}</span>
                <span className="text-xs text-slate-500">{w.width.toFixed(2)} m</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h4 className="font-medium">Imported Objects</h4>
          <ul className="mt-2 space-y-1 text-sm max-h-48 overflow-auto">
            {importedObjects.map((obj, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span>{obj.name || `Imported ${idx + 1}`}</span>
                <div className="space-x-2">
                  <button className="text-xs px-2 py-1 bg-emerald-500 text-white rounded" onClick={() => { convertImportedObject(obj); setImportedObjects((arr) => arr.filter((o) => o !== obj)); }}>Convert</button>
                </div>
              </li>
            ))}
          </ul>
          {importedObjects.length > 0 && (
            <div className="mt-2">
              <button className="w-full p-2 bg-amber-600 text-white" onClick={convertAllImported}>Convert All Imported</button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Design Storage</h4>
          <div className="mt-2 space-y-2">
            <button className="w-full p-2 bg-sky-600 text-white" onClick={saveDesign}>Save Design (local)</button>
            <button className="w-full p-2 bg-slate-200" onClick={loadDesign}>Load Design (local)</button>
            <button className="w-full p-2 bg-emerald-600 text-white" onClick={saveDesignToServer}>Save Design (server)</button>
            <button className="w-full p-2 bg-amber-500 text-white" onClick={loadDesignFromServer}>Load Design (server)</button>
            <a className="block text-center text-sm text-blue-600 underline" href="/designs">Open Designs List</a>
          </div>
        </div>
      </aside>

      <main className="flex-1 relative">
        <Canvas camera={{ position: [6, 6, 6], fov: 50 }} onPointerMissed={() => { /* ignore */ }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Grid args={[40, 40]} cellSize={snapSize} sectionSize={5} sectionColor="#888" fadeDistance={30} />
          <OrbitControls enableDamping />

          {/* invisible plane to capture drawing pointer events */}
          <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}>
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {walls.map((w) => (
            <Wall key={w.id} width={w.width} depth={w.depth} height={w.height} position={[w.x, w.height / 2, w.z]} color={w.color} rotationY={w.rotationY} />
          ))}

          {/* imported objects (read-only) */}
          {importedObjects.map((obj, idx) => (
            <primitive key={idx} object={obj} />
          ))}

          {/* preview while drawing */}
          {isDrawing && startPt && previewPt && (() => {
            const [sx, sz] = startPt;
            const [ex, ez] = previewPt;
            const dx = ex - sx;
            const dz = ez - sz;
            const length = Math.sqrt(dx * dx + dz * dz) || 0.01;
            const midX = (sx + ex) / 2;
            const midZ = (sz + ez) / 2;
            const rotationY = Math.atan2(dz, dx);
            return (
              <>
                <mesh position={[midX, 0.02, midZ]} rotation={[0, rotationY, 0]}>
                  <boxGeometry args={[length, 0.04, depth]} />
                  <meshStandardMaterial color="#ff8a65" transparent opacity={0.8} />
                </mesh>
                <Html position={[midX, 0.5, midZ]} center>
                  <div className="p-1 bg-white/90 text-xs rounded border">{length.toFixed(2)} m</div>
                </Html>
              </>
            );
          })()}
        </Canvas>
      </main>
    </div>
  );
}

"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Html, Line, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
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

type OpeningKind = "door" | "window";

type OpeningDef = {
  id: string;
  wallId: string;
  kind: OpeningKind;
  offset: number;
  width: number;
  height: number;
  sillHeight: number;
};

type CameraMode = "perspective" | "orthographic";
type ViewPreset = "free" | "iso" | "top" | "front" | "right" | "left";

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

function getWallDirection(wall: WallDef) {
  return new THREE.Vector3(Math.cos(wall.rotationY), 0, Math.sin(wall.rotationY));
}

function getWallEndpoints(wall: WallDef) {
  const direction = getWallDirection(wall).normalize();
  const halfLength = wall.width / 2;
  const start = new THREE.Vector3(wall.x, 0, wall.z).addScaledVector(direction, -halfLength);
  const end = new THREE.Vector3(wall.x, 0, wall.z).addScaledVector(direction, halfLength);
  return { start, end };
}

function getWallOffsetFromWorldPoint(wall: WallDef, point: THREE.Vector3) {
  const direction = getWallDirection(wall).normalize();
  const fromCenter = new THREE.Vector3(point.x - wall.x, 0, point.z - wall.z);
  return THREE.MathUtils.clamp(fromCenter.dot(direction), -wall.width / 2, wall.width / 2);
}

function getPointFromWallOffset(wall: WallDef, offset: number) {
  const direction = getWallDirection(wall).normalize();
  const center = new THREE.Vector3(wall.x, 0, wall.z);
  return center.addScaledVector(direction, offset);
}

function getNearestWallEndpoint(point: THREE.Vector3, walls: WallDef[], ignoreWallId?: string, threshold = 0.6) {
  let best: { point: THREE.Vector3; distance: number; wallId: string } | null = null;

  walls.forEach((wall) => {
    if (ignoreWallId && wall.id === ignoreWallId) return;
    const { start, end } = getWallEndpoints(wall);
    [start, end].forEach((candidate) => {
      const distance = candidate.distanceTo(point);
      if (distance <= threshold && (!best || distance < best.distance)) {
        best = { point: candidate.clone(), distance, wallId: wall.id };
      }
    });
  });

  return best;
}

function snapPointToEndpoint(point: THREE.Vector3, walls: WallDef[], ignoreWallId?: string, threshold = 0.6) {
  const nearest = getNearestWallEndpoint(point, walls, ignoreWallId, threshold);
  return nearest ? nearest.point : point;
}

function viewPresetToCamera(preset: ViewPreset, cameraMode: CameraMode) {
  const orthographic = cameraMode === "orthographic";

  switch (preset) {
    case "top":
      return orthographic
        ? { position: [0, 22, 0] as [number, number, number], up: [0, 0, -1] as [number, number, number], target: [0, 0, 0] as [number, number, number], zoom: 24 }
        : { position: [0, 18, 0.01] as [number, number, number], target: [0, 0, 0] as [number, number, number] };
    case "front":
      return orthographic
        ? { position: [0, 4, 22] as [number, number, number], up: [0, 1, 0] as [number, number, number], target: [0, 4, 0] as [number, number, number], zoom: 24 }
        : { position: [0, 4, 18] as [number, number, number], target: [0, 4, 0] as [number, number, number] };
    case "right":
      return orthographic
        ? { position: [22, 4, 0] as [number, number, number], up: [0, 1, 0] as [number, number, number], target: [0, 4, 0] as [number, number, number], zoom: 24 }
        : { position: [18, 4, 0.01] as [number, number, number], target: [0, 4, 0] as [number, number, number] };
    case "left":
      return orthographic
        ? { position: [-22, 4, 0] as [number, number, number], up: [0, 1, 0] as [number, number, number], target: [0, 4, 0] as [number, number, number], zoom: 24 }
        : { position: [-18, 4, 0.01] as [number, number, number], target: [0, 4, 0] as [number, number, number] };
    case "iso":
      return orthographic
        ? { position: [18, 18, 18] as [number, number, number], up: [0, 1, 0] as [number, number, number], target: [0, 3, 0] as [number, number, number], zoom: 14 }
        : { position: [14, 14, 14] as [number, number, number], target: [0, 3, 0] as [number, number, number] };
    case "free":
    default:
      return orthographic
        ? { position: [14, 14, 14] as [number, number, number], up: [0, 1, 0] as [number, number, number], target: [0, 3, 0] as [number, number, number], zoom: 16 }
        : { position: [6, 6, 6] as [number, number, number], target: [0, 3, 0] as [number, number, number] };
  }
}

export default function PlanDesigner() {
  const [walls, setWalls] = useState<WallDef[]>([]);
  const [openings, setOpenings] = useState<OpeningDef[]>([]);
  const [depth, setDepth] = useState<number>(0.2);
  const [height, setHeight] = useState<number>(3);
  const [snapSize, setSnapSize] = useState<number>(0.5);
  const [doorWidth, setDoorWidth] = useState<number>(0.9);
  const [doorHeight, setDoorHeight] = useState<number>(2.1);
  const [windowWidth, setWindowWidth] = useState<number>(1.2);
  const [windowHeight, setWindowHeight] = useState<number>(1.2);
  const [windowSillHeight, setWindowSillHeight] = useState<number>(1.0);
  const [mode, setMode] = useState<"draw" | "select" | "door" | "window">("draw");
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPt, setStartPt] = useState<[number, number] | null>(null);
  const [previewPt, setPreviewPt] = useState<[number, number] | null>(null);
  const [isDraggingWall, setIsDraggingWall] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>("orthographic");
  const [viewPreset, setViewPreset] = useState<ViewPreset>("iso");
  const planeRef = useRef<THREE.Mesh>(null!);
  const controlsRef = useRef<any>(null);
  const perspectiveCameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const orthographicCameraRef = useRef<THREE.OrthographicCamera>(null!);
  const [importedObjects, setImportedObjects] = useState<THREE.Object3D[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storageKey = "plan-designer:design";

  const selectedWall = selectedWallId ? walls.find((wall) => wall.id === selectedWallId) ?? null : null;
  const selectedOpening = selectedOpeningId ? openings.find((opening) => opening.id === selectedOpeningId) ?? null : null;

  function buildSceneSnapshot() {
    return {
      walls,
      openings,
      camera: {
        mode: cameraMode,
        preset: viewPreset,
      },
    };
  }

  function loadSceneSnapshot(snapshot: any) {
    if (Array.isArray(snapshot?.walls)) {
      setWalls(snapshot.walls);
    }
    if (Array.isArray(snapshot?.openings)) {
      setOpenings(snapshot.openings);
    } else {
      setOpenings([]);
    }
    if (snapshot?.camera?.mode === "perspective" || snapshot?.camera?.mode === "orthographic") {
      setCameraMode(snapshot.camera.mode);
    }
    if (snapshot?.camera?.preset) {
      setViewPreset(snapshot.camera.preset);
    }
  }

  function updateSelectedWall(nextWall: Partial<WallDef>) {
    if (!selectedWallId) return;
    setWalls((current) => current.map((wall) => (wall.id === selectedWallId ? { ...wall, ...nextWall } : wall)));
  }

  function placeOpeningOnWall(wall: WallDef, point: THREE.Vector3) {
    const offset = getWallOffsetFromWorldPoint(wall, point);
    const config = mode === "door"
      ? { kind: "door" as const, width: doorWidth, height: doorHeight, sillHeight: 0 }
      : { kind: "window" as const, width: windowWidth, height: windowHeight, sillHeight: windowSillHeight };

    const boundedOffset = THREE.MathUtils.clamp(offset, -wall.width / 2 + config.width / 2, wall.width / 2 - config.width / 2);
    const opening: OpeningDef = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      wallId: wall.id,
      kind: config.kind,
      offset: boundedOffset,
      width: config.width,
      height: config.height,
      sillHeight: config.sillHeight,
    };

    setOpenings((current) => [...current, opening]);
    setSelectedOpeningId(opening.id);
    setSelectedWallId(wall.id);
  }

  function duplicateSelectedWall() {
    if (!selectedWall) return;
    const clone: WallDef = {
      ...selectedWall,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: snap(selectedWall.x + snapSize * 2, snapSize),
      z: snap(selectedWall.z + snapSize * 2, snapSize),
    };
    const clonedOpenings = openings
      .filter((opening) => opening.wallId === selectedWall.id)
      .map((opening) => ({
        ...opening,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${opening.id.slice(-3)}`,
        wallId: clone.id,
      }));

    setWalls((current) => [...current, clone]);
    setOpenings((current) => [...current, ...clonedOpenings]);
    setSelectedWallId(clone.id);
    setSelectedOpeningId(null);
  }

  function deleteSelectedWall() {
    if (!selectedWallId) return;
    setWalls((current) => current.filter((wall) => wall.id !== selectedWallId));
    setOpenings((current) => current.filter((opening) => opening.wallId !== selectedWallId));
    setSelectedWallId(null);
    setSelectedOpeningId(null);
  }

  function deleteSelectedOpening() {
    if (!selectedOpeningId) return;
    setOpenings((current) => current.filter((opening) => opening.id !== selectedOpeningId));
    setSelectedOpeningId(null);
  }

  function rotateSelectedWall() {
    if (!selectedWall) return;
    updateSelectedWall({ rotationY: wrapAngle(selectedWall.rotationY + Math.PI / 2) });
  }

  function handlePointerDown(e: any) {
    e.stopPropagation();
    const p = e.point as THREE.Vector3;
    const snappedPoint = snapPointToEndpoint(new THREE.Vector3(snap(p.x, snapSize), 0, snap(p.z, snapSize)), walls, selectedWallId ?? undefined, snapSize * 1.25);
    const x = snappedPoint.x;
    const z = snappedPoint.z;

    if (mode === "door" || mode === "window") {
      return;
    }

    if (mode === "select") {
      if (selectedWall) {
        setIsDraggingWall(true);
        updateSelectedWall({ x, z });
      } else {
        setSelectedWallId(null);
        setSelectedOpeningId(null);
      }
      return;
    }

    if (!isDrawing) {
      setStartPt([x, z]);
      setPreviewPt([x, z]);
      setIsDrawing(true);
    } else if (startPt) {
      const [sx, sz] = startPt;
      const startSnap = snapPointToEndpoint(new THREE.Vector3(sx, 0, sz), walls, undefined, snapSize * 1.25);
      const endSnap = snapPointToEndpoint(new THREE.Vector3(x, 0, z), walls, undefined, snapSize * 1.25);
      const snappedLength = startSnap.distanceTo(endSnap) || Math.sqrt((x - sx) * (x - sx) + (z - sz) * (z - sz)) || 0.01;
      const midX = (startSnap.x + endSnap.x) / 2;
      const midZ = (startSnap.z + endSnap.z) / 2;
      const rotationY = Math.atan2(endSnap.z - startSnap.z, endSnap.x - startSnap.x);
      const id = Date.now().toString();
      setWalls((ws) => [
        ...ws,
        { id, x: midX, z: midZ, width: snappedLength, depth, height, rotationY, color: "#8aa4ff" },
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
          if (response && response.data) {
            loadSceneSnapshot(response.data.data);
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

  useEffect(() => {
    const view = viewPresetToCamera(viewPreset, cameraMode);
    const activeCamera = cameraMode === "orthographic" ? orthographicCameraRef.current : perspectiveCameraRef.current;
    if (!activeCamera || !controlsRef.current) {
      return;
    }

    if ("position" in view && Array.isArray(view.position)) {
      activeCamera.position.set(view.position[0], view.position[1], view.position[2]);
    }

    if (cameraMode === "orthographic" && "zoom" in view) {
      activeCamera.zoom = view.zoom;
      if ("up" in view) {
        activeCamera.up.set(view.up[0], view.up[1], view.up[2]);
      }
    }

    if ("target" in view) {
      controlsRef.current.target.set(view.target[0], view.target[1], view.target[2]);
    }

    activeCamera.lookAt(controlsRef.current.target);
    activeCamera.updateProjectionMatrix();
    controlsRef.current.update();
  }, [cameraMode, viewPreset]);

  useEffect(() => {
    if (mode !== "draw") {
      cancelDraw();
    }
    if (mode !== "select") {
      setIsDraggingWall(false);
    }
    if (mode !== "door" && mode !== "window") {
      setSelectedOpeningId(null);
    }
  }, [mode]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        cancelDraw();
        setIsDraggingWall(false);
        if (mode === "select") {
          setSelectedWallId(null);
          setSelectedOpeningId(null);
        }
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedWallId) {
        deleteSelectedWall();
      } else if ((event.key === "Delete" || event.key === "Backspace") && selectedOpeningId) {
        deleteSelectedOpening();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelectedWall();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r") {
        event.preventDefault();
        rotateSelectedWall();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedWall, selectedWallId, selectedOpeningId, mode, snapSize, walls, openings]);

  function handlePointerMove(e: any) {
    e.stopPropagation();
    const p = e.point as THREE.Vector3;
    const snappedPoint = snapPointToEndpoint(new THREE.Vector3(snap(p.x, snapSize), 0, snap(p.z, snapSize)), walls, selectedWallId ?? undefined, snapSize * 1.25);
    const x = snappedPoint.x;
    const z = snappedPoint.z;

    if (mode === "select" && isDraggingWall && selectedWallId) {
      updateSelectedWall({ x, z });
      return;
    }

    if (mode === "draw" && isDrawing && startPt) {
      setPreviewPt([x, z]);
      return;
    }

    if (!isDrawing) return;
    setPreviewPt([x, z]);
  }

  function handlePointerUp() {
    setIsDraggingWall(false);
  }

  function cancelDraw() {
    setIsDrawing(false);
    setStartPt(null);
    setPreviewPt(null);
  }

  function removeLast() {
    if (selectedOpeningId) {
      deleteSelectedOpening();
      return;
    }
    if (selectedWallId) {
      deleteSelectedWall();
      return;
    }
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
    openings.forEach((opening) => {
      const wall = walls.find((candidate) => candidate.id === opening.wallId);
      if (!wall) return;
      const center = getPointFromWallOffset(wall, opening.offset);
      const heightOffset = opening.kind === "door" ? opening.height / 2 : opening.sillHeight + opening.height / 2;
      const geo = new THREE.BoxGeometry(opening.width, opening.height, Math.max(0.08, wall.depth + 0.02));
      const mat = new THREE.MeshStandardMaterial({ color: opening.kind === "door" ? "#a16207" : "#0284c7" });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(center.x, heightOffset, center.z);
      mesh.rotation.set(0, wall.rotationY, 0);
      group.add(mesh);
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
    openings.forEach((opening) => {
      const wall = walls.find((candidate) => candidate.id === opening.wallId);
      if (!wall) return;
      const center = getPointFromWallOffset(wall, opening.offset);
      const heightOffset = opening.kind === "door" ? opening.height / 2 : opening.sillHeight + opening.height / 2;
      const geo = new THREE.BoxGeometry(opening.width, opening.height, Math.max(0.08, wall.depth + 0.02));
      const mat = new THREE.MeshStandardMaterial({ color: opening.kind === "door" ? "#a16207" : "#0284c7" });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(center.x, heightOffset, center.z);
      mesh.rotation.set(0, wall.rotationY, 0);
      group.add(mesh);
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
      localStorage.setItem(storageKey, JSON.stringify(buildSceneSnapshot()));
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
        loadSceneSnapshot(parsed);
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
      const payload = { name, data: buildSceneSnapshot() };
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
        loadSceneSnapshot(response.data.data);
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

  function handleWallClick(wall: WallDef, point: THREE.Vector3) {
    if (mode === "door" || mode === "window") {
      placeOpeningOnWall(wall, point);
      return;
    }

    setSelectedWallId(wall.id);
    setSelectedOpeningId(null);

    if (mode === "select") {
      setIsDraggingWall(true);
    }
  }

  function renderOpening(wall: WallDef, opening: OpeningDef) {
    const center = getPointFromWallOffset(wall, opening.offset);
    const heightOffset = opening.kind === "door" ? opening.height / 2 : opening.sillHeight + opening.height / 2;
    const color = opening.kind === "door" ? "#a16207" : "#0284c7";

    return (
      <mesh
        key={opening.id}
        position={[center.x, heightOffset, center.z]}
        rotation={[0, wall.rotationY, 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          setSelectedOpeningId(opening.id);
          setSelectedWallId(wall.id);
        }}
      >
        <boxGeometry args={[opening.width, opening.height, Math.max(0.08, wall.depth + 0.02)]} />
        <meshStandardMaterial color={color} transparent opacity={opening.kind === "window" ? 0.65 : 0.9} />
      </mesh>
    );
  }

  function renderWallDimensions(wall: WallDef, highlighted = false) {
    const { start, end } = getWallEndpoints(wall);
    const labelHeight = wall.height + 0.35;

    return (
      <group>
        <Line points={[[start.x, labelHeight, start.z], [end.x, labelHeight, end.z]]} color={highlighted ? "#f59e0b" : "#22c55e"} lineWidth={2} />
        <Html position={[(start.x + end.x) / 2, labelHeight + 0.05, (start.z + end.z) / 2]} center>
          <div className={`rounded border px-2 py-1 text-[11px] shadow ${highlighted ? "border-amber-500 bg-amber-50 text-amber-900" : "border-emerald-300 bg-white/90 text-emerald-700"}`}>
            {wall.width.toFixed(2)} m
          </div>
        </Html>
      </group>
    );
  }

  function renderMeasurementPreview() {
    if (!isDrawing || !startPt || !previewPt) {
      return null;
    }

    const [sx, sz] = startPt;
    const [ex, ez] = previewPt;
    const length = Math.sqrt((ex - sx) * (ex - sx) + (ez - sz) * (ez - sz)) || 0.01;
    const midX = (sx + ex) / 2;
    const midZ = (sz + ez) / 2;
    const labelHeight = height + 0.35;

    return (
      <group>
        <Line points={[[sx, labelHeight, sz], [ex, labelHeight, ez]]} color="#f97316" lineWidth={2} />
        <Html position={[midX, labelHeight + 0.05, midZ]} center>
          <div className="rounded border border-orange-300 bg-orange-50 px-2 py-1 text-[11px] font-medium text-orange-800 shadow">
            {length.toFixed(2)} m
          </div>
        </Html>
      </group>
    );
  }

  function renderPreviewWall() {
    if (!isDrawing || !startPt || !previewPt) {
      return null;
    }

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
          <div className="rounded border bg-white/90 p-1 text-xs shadow">{length.toFixed(2)} m</div>
        </Html>
      </>
    );
  }

  return (
    <div className="flex h-full bg-slate-100">
      <aside className="w-80 p-4 bg-white/90 border-r overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">Plan Designer</h3>
        <p className="mb-4 text-sm text-slate-500">
          Draw walls, then switch to select mode to move, rotate, duplicate, or delete them.
        </p>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button className={`rounded px-3 py-2 text-sm font-medium ${mode === "draw" ? "bg-slate-950 text-white" : "bg-slate-200"}`} onClick={() => setMode("draw")}>
            Draw Mode
          </button>
          <button className={`rounded px-3 py-2 text-sm font-medium ${mode === "select" ? "bg-sky-600 text-white" : "bg-slate-200"}`} onClick={() => setMode("select")}>
            Select Mode
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button className={`rounded px-3 py-2 text-sm font-medium ${mode === "door" ? "bg-amber-600 text-white" : "bg-slate-200"}`} onClick={() => setMode("door")}>
            Place Door
          </button>
          <button className={`rounded px-3 py-2 text-sm font-medium ${mode === "window" ? "bg-cyan-600 text-white" : "bg-slate-200"}`} onClick={() => setMode("window")}>
            Place Window
          </button>
        </div>

        <div className="mb-3 rounded-xl border bg-slate-50 p-3">
          <div className="mb-2 text-sm font-medium text-slate-700">Viewport</div>
          <div className="grid grid-cols-2 gap-2">
            <button className={`rounded px-3 py-2 text-xs font-medium ${cameraMode === "orthographic" ? "bg-indigo-600 text-white" : "bg-slate-200"}`} onClick={() => setCameraMode("orthographic")}>
              Orthographic
            </button>
            <button className={`rounded px-3 py-2 text-xs font-medium ${cameraMode === "perspective" ? "bg-indigo-600 text-white" : "bg-slate-200"}`} onClick={() => setCameraMode("perspective")}>
              Perspective
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["free", "iso", "top", "front", "right", "left"] as ViewPreset[]).map((preset) => (
              <button key={preset} className={`rounded px-2 py-2 text-xs font-medium capitalize ${viewPreset === preset ? "bg-slate-950 text-white" : "bg-slate-200"}`} onClick={() => setViewPreset(preset)}>
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 rounded-xl border bg-slate-50 p-3">
          <div className="mb-2 text-sm font-medium text-slate-700">Door / Window Size</div>
          <label className="block text-xs text-slate-500">Door width</label>
          <input className="mb-2 w-full border p-1 text-sm" type="number" step="0.05" value={doorWidth} onChange={(e) => setDoorWidth(parseFloat(e.target.value || "0.9"))} />
          <label className="block text-xs text-slate-500">Door height</label>
          <input className="mb-2 w-full border p-1 text-sm" type="number" step="0.05" value={doorHeight} onChange={(e) => setDoorHeight(parseFloat(e.target.value || "2.1"))} />
          <label className="block text-xs text-slate-500">Window width</label>
          <input className="mb-2 w-full border p-1 text-sm" type="number" step="0.05" value={windowWidth} onChange={(e) => setWindowWidth(parseFloat(e.target.value || "1.2"))} />
          <label className="block text-xs text-slate-500">Window height</label>
          <input className="mb-2 w-full border p-1 text-sm" type="number" step="0.05" value={windowHeight} onChange={(e) => setWindowHeight(parseFloat(e.target.value || "1.2"))} />
          <label className="block text-xs text-slate-500">Window sill height</label>
          <input className="w-full border p-1 text-sm" type="number" step="0.05" value={windowSillHeight} onChange={(e) => setWindowSillHeight(parseFloat(e.target.value || "1.0"))} />
        </div>

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
          <button className="w-full p-2 bg-slate-800 text-white disabled:opacity-40" onClick={duplicateSelectedWall} disabled={!selectedWall}>Duplicate Selected</button>
          <button className="w-full p-2 bg-slate-800 text-white disabled:opacity-40" onClick={rotateSelectedWall} disabled={!selectedWall}>Rotate Selected 90°</button>
          <button className="w-full p-2 bg-red-600 text-white disabled:opacity-40" onClick={deleteSelectedWall} disabled={!selectedWall}>Delete Selected</button>
          <button className="w-full p-2 bg-indigo-600 text-white" onClick={exportGLTF}>Export GLTF</button>
          <button className="w-full p-2 bg-indigo-600 text-white" onClick={exportOBJ}>Export OBJ</button>
          <button className="w-full p-2 bg-amber-500 text-white" onClick={triggerImport}>Import (.obj/.gltf)</button>
          <input ref={fileInputRef} type="file" accept=".obj,.gltf,.glb" onChange={handleImportFile} className="hidden" />
        </div>

        {selectedWall && (
          <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm">
            <h4 className="font-medium">Selected Wall</h4>
            <div className="mt-2 space-y-1 text-slate-600">
              <div>Width: {selectedWall.width.toFixed(2)} m</div>
              <div>Depth: {selectedWall.depth.toFixed(2)} m</div>
              <div>Height: {selectedWall.height.toFixed(2)} m</div>
              <div>Rotation: {THREE.MathUtils.radToDeg(selectedWall.rotationY).toFixed(0)}°</div>
            </div>
          </div>
        )}

        {selectedOpening && (
          <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm">
            <h4 className="font-medium capitalize">Selected {selectedOpening.kind}</h4>
            <div className="mt-2 space-y-1 text-slate-600">
              <div>Width: {selectedOpening.width.toFixed(2)} m</div>
              <div>Height: {selectedOpening.height.toFixed(2)} m</div>
              <div>Offset: {selectedOpening.offset.toFixed(2)} m</div>
            </div>
            <button className="mt-3 w-full rounded bg-red-600 px-3 py-2 text-white" onClick={deleteSelectedOpening}>Delete Opening</button>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-medium">Elements</h4>
          <ul className="mt-2 space-y-1 text-sm max-h-48 overflow-auto">
            {walls.map((w) => (
              <li key={w.id} className={`flex items-center justify-between rounded px-2 py-1 ${selectedWallId === w.id ? "bg-sky-100" : ""}`} onClick={() => setSelectedWallId(w.id)}>
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
        <Canvas camera={{ position: [6, 6, 6], fov: 50 }} onPointerMissed={() => { setSelectedWallId(null); setSelectedOpeningId(null); }}>
          {cameraMode === "orthographic" ? (
            <OrthographicCamera ref={orthographicCameraRef} makeDefault position={[14, 14, 14]} zoom={16} near={0.1} far={1000} />
          ) : (
            <PerspectiveCamera ref={perspectiveCameraRef} makeDefault position={[6, 6, 6]} fov={50} near={0.1} far={1000} />
          )}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Grid args={[40, 40]} cellSize={snapSize} sectionSize={5} sectionColor="#888" fadeDistance={30} />
          <OrbitControls ref={controlsRef} enableDamping enablePan enableZoom enableRotate={viewPreset !== "top"} />

          {/* invisible plane to capture drawing pointer events */}
          <mesh ref={planeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {walls.map((w) => (
            <group key={w.id}>
              <Wall
                width={w.width}
                depth={w.depth}
                height={w.height}
                position={[w.x, w.height / 2, w.z]}
                color={w.color}
                rotationY={w.rotationY}
                selected={selectedWallId === w.id}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  handleWallClick(w, event.point as THREE.Vector3);
                }}
              />
              {renderWallDimensions(w, selectedWallId === w.id)}
              {openings.filter((opening) => opening.wallId === w.id).map((opening) => renderOpening(w, opening))}
            </group>
          ))}

          {/* imported objects (read-only) */}
          {importedObjects.map((obj, idx) => (
            <primitive key={idx} object={obj} />
          ))}

          {renderMeasurementPreview()}
          {renderPreviewWall()}
        </Canvas>
      </main>
    </div>
  );
}

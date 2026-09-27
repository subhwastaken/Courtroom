"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AgentTurn } from "@/lib/types";
import { Camera, RefreshCw, Eye, Sparkles, Volume2, Maximize2 } from "lucide-react";

interface ChatDev3DCourtroomProps {
  activeTurnIndex: number;
  turns: AgentTurn[];
}

export function ChatDev3DCourtroom({ activeTurnIndex, turns }: ChatDev3DCourtroomProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeTurnRef = useRef(activeTurnIndex);
  activeTurnRef.current = activeTurnIndex;

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const [activeSpeakerText, setActiveSpeakerText] = useState<string>("");
  const [activeSpeakerRole, setActiveSpeakerRole] = useState<string>("");

  useEffect(() => {
    if (activeTurnIndex > 0 && turns[activeTurnIndex - 1]) {
      setActiveSpeakerText(turns[activeTurnIndex - 1].content);
      setActiveSpeakerRole(turns[activeTurnIndex - 1].role);
    } else {
      setActiveSpeakerText("");
      setActiveSpeakerRole("");
    }
  }, [activeTurnIndex, turns]);

  const resetCamera = (preset: "iso" | "judge" | "advocate" | "skeptic" = "iso") => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (preset === "iso") {
      cam.position.set(0, 11, 14);
      ctrl.target.set(0, 1.2, 0);
    } else if (preset === "judge") {
      cam.position.set(0, 5, 2);
      ctrl.target.set(0, 2.2, -2.5);
    } else if (preset === "advocate") {
      cam.position.set(-2, 4.5, 4.5);
      ctrl.target.set(-4, 1.8, 0.5);
    } else if (preset === "skeptic") {
      cam.position.set(2, 4.5, 4.5);
      ctrl.target.set(4, 1.8, 0.5);
    }
    ctrl.update();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c111c);
    scene.fog = new THREE.FogExp2(0x0c111c, 0.025);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // CAMERA (Classic 45-degree Isometric Perspective)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 11.5, 14.5);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera from dipping under floor
    controls.minDistance = 4;
    controls.maxDistance = 25;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // LIGHTING: Cozy Office Ambience
    const ambientLight = new THREE.AmbientLight(0xfdf3e7, 1.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    sunLight.position.set(8, 14, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    scene.add(sunLight);

    // Dynamic Turn Spotlights
    const advocateSpot = new THREE.SpotLight(0x10b981, 0, 18, Math.PI / 4, 0.3);
    advocateSpot.position.set(-4, 7, 1);
    advocateSpot.target.position.set(-4, 1.5, 0.5);
    scene.add(advocateSpot);
    scene.add(advocateSpot.target);

    const skepticSpot = new THREE.SpotLight(0xf43f5e, 0, 18, Math.PI / 4, 0.3);
    skepticSpot.position.set(4, 7, 1);
    skepticSpot.target.position.set(4, 1.5, 0.5);
    scene.add(skepticSpot);
    scene.add(skepticSpot.target);

    const judgeSpot = new THREE.SpotLight(0xfbbf24, 0, 18, Math.PI / 4, 0.3);
    judgeSpot.position.set(0, 8, -2);
    judgeSpot.target.position.set(0, 2.2, -2.5);
    scene.add(judgeSpot);
    scene.add(judgeSpot.target);

    // TEXTURE LOADER
    const textureLoader = new THREE.TextureLoader();

    // Helper: Canvas-generated Pixel-Wood Plank Floor Texture
    const createWoodTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      // Base wood tone matching ChatDev screenshot
      ctx.fillStyle = "#c89a65";
      ctx.fillRect(0, 0, 512, 512);

      // Plank seams
      ctx.strokeStyle = "#a97d4c";
      ctx.lineWidth = 3;
      const plankHeight = 32;
      for (let y = 0; y < 512; y += plankHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();

        // Staggered vertical plank joints
        const offset = (y / plankHeight) % 2 === 0 ? 0 : 64;
        for (let x = offset; x < 512; x += 128) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + plankHeight);
          ctx.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Helper: Canvas-generated ChatDev Center Rug Texture
    const createRugTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 340;
      const ctx = canvas.getContext("2d")!;
      // Rug border
      ctx.fillStyle = "#6b4f35";
      ctx.fillRect(0, 0, 512, 340);
      ctx.fillStyle = "#b48b62";
      ctx.fillRect(16, 16, 480, 308);
      ctx.fillStyle = "#8a6542";
      ctx.fillRect(28, 28, 456, 284);

      // Diamond weave pattern
      ctx.strokeStyle = "#9c734e";
      ctx.lineWidth = 2;
      for (let i = 0; i < 512; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, 28);
        ctx.lineTo(i + 140, 312);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i, 312);
        ctx.lineTo(i + 140, 28);
        ctx.stroke();
      }

      // Text "CHATDEV"
      ctx.fillStyle = "#2a3648";
      ctx.font = "bold 52px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CHATDEV", 256, 215);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Helper: Rocket Poster Texture (Matching ChatDev wall poster)
    const createRocketPosterTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 380;
      const ctx = canvas.getContext("2d")!;
      // Space sky background
      const grad = ctx.createLinearGradient(0, 0, 0, 380);
      grad.addColorStop(0, "#0284c7");
      grad.addColorStop(1, "#38bdf8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 380);

      // Outer poster frame
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 244, 368);

      // Yellow twinkling stars
      ctx.fillStyle = "#fef08a";
      const stars = [
        [40, 60], [200, 70], [60, 200], [210, 220], [80, 110], [180, 140], [130, 40]
      ];
      stars.forEach(([x, y]) => {
        ctx.fillRect(x - 3, y - 3, 6, 6);
        ctx.fillRect(x - 6, y - 1, 12, 2);
        ctx.fillRect(x - 1, y - 6, 2, 12);
      });

      // Rocket Body (White fuselage ascending diagonally)
      ctx.save();
      ctx.translate(128, 190);
      ctx.rotate(-Math.PI / 4);

      // Exhaust flame
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-15, 60);
      ctx.lineTo(0, 110);
      ctx.lineTo(15, 60);
      ctx.fill();

      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.moveTo(-8, 60);
      ctx.lineTo(0, 95);
      ctx.lineTo(8, 60);
      ctx.fill();

      // Rocket fins (Red)
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(-25, 45);
      ctx.lineTo(-40, 60);
      ctx.lineTo(-15, 60);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(25, 45);
      ctx.lineTo(40, 60);
      ctx.lineTo(15, 60);
      ctx.fill();

      // Rocket capsule (White)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nosecone (Red)
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(-24, -20);
      ctx.quadraticCurveTo(0, -75, 0, -75);
      ctx.quadraticCurveTo(0, -75, 24, -20);
      ctx.fill();

      // Porthole (Cyan with reflection)
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(0, -10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#bae6fd";
      ctx.beginPath();
      ctx.arc(-3, -13, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Helper: Clock Face Texture
    const createClockFaceTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(128, 128, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 10;
      ctx.stroke();

      // Hour ticks
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 6;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const x1 = 128 + Math.cos(angle) * 95;
        const y1 = 128 + Math.sin(angle) * 95;
        const x2 = 128 + Math.cos(angle) * 110;
        const y2 = 128 + Math.sin(angle) * 110;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Hands at 10:10
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      // Hour hand pointing to 10
      ctx.beginPath();
      ctx.moveTo(128, 128);
      ctx.lineTo(75, 75);
      ctx.stroke();
      // Minute hand pointing to 2
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(128, 128);
      ctx.lineTo(185, 65);
      ctx.stroke();

      // Center pin
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(128, 128, 8, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Helper: Framed Portrait Texture
    const createPortraitTexture = (isGold = true) => {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 180;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = isGold ? "#f59e0b" : "#b45309";
      ctx.fillRect(0, 0, 160, 180);
      ctx.fillStyle = "#78350f";
      ctx.fillRect(12, 12, 136, 156);
      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(80, 75, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#92400e";
      ctx.beginPath();
      ctx.arc(80, 155, 45, Math.PI, 0, false);
      ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Helper: Wooden Louvre Door Texture
    const createLouvreTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 320;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#78350f";
      ctx.fillRect(0, 0, 160, 320);
      ctx.fillStyle = "#92400e";
      ctx.fillRect(10, 10, 140, 300);
      ctx.fillStyle = "#5c2b09";
      for (let y = 20; y < 300; y += 12) {
        ctx.fillRect(18, y, 124, 7);
      }
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(135, 160, 6, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Helper: Blackboard / Menu Texture
    const createBlackboardTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 260;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#78350f";
      ctx.fillRect(0, 0, 200, 260);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(10, 10, 180, 240);

      // Chalk text
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 16px monospace";
      ctx.fillText("COURTROOM", 20, 40);
      ctx.font = "12px monospace";
      ctx.fillText("• Advocate Arg", 20, 75);
      ctx.fillText("• Skeptic Rebut", 20, 105);
      ctx.fillText("• Chief Justice", 20, 135);
      ctx.fillText("• Qdrant Vector", 20, 165);

      // Pinned colored notes
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(30, 195, 36, 36);
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(80, 195, 36, 36);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // ROOM GEOMETRY: Floor, Back Wall, Left Wall
    const roomGroup = new THREE.Group();

    // 1. Wood Floor
    const floorGeo = new THREE.BoxGeometry(16, 0.4, 13);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createWoodTexture(),
      roughness: 0.7,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Subtle Footprint Trails across floor
    const createFootprintTrails = () => {
      const points = [
        [-5.0, -4.5], [-4.7, -3.8], [-4.2, -3.0], [-3.6, -2.2], [-2.8, -1.5],
        [1.5, -1.8], [2.2, -1.4], [2.8, -0.8], [3.4, 0.2],
        [-1.0, 1.2], [-0.4, 1.8], [0.2, 2.4], [0.8, 3.0]
      ];
      points.forEach(([x, z], idx) => {
        const footprintGeo = new THREE.PlaneGeometry(0.12, 0.22);
        const footprintMat = new THREE.MeshBasicMaterial({
          color: 0x5a3d24,
          transparent: true,
          opacity: 0.45,
        });
        const fp = new THREE.Mesh(footprintGeo, footprintMat);
        fp.rotation.x = -Math.PI / 2;
        fp.rotation.z = idx % 2 === 0 ? 0.3 : -0.2;
        fp.position.set(x + (idx % 2 === 0 ? 0.08 : -0.08), 0.015, z);
        roomGroup.add(fp);
      });
    };
    createFootprintTrails();

    // 2. ChatDev Center Rug
    const rugGeo = new THREE.PlaneGeometry(6.4, 4.2);
    const rugMat = new THREE.MeshStandardMaterial({
      map: createRugTexture(),
      roughness: 0.9,
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.02, -1.8);
    rug.receiveShadow = true;
    roomGroup.add(rug);

    // 3. Back Wall (Blue Panel with White Trim)
    const backWallGeo = new THREE.BoxGeometry(16, 5.5, 0.4);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0x6e8fae, // Light blue office wall from screenshot
      roughness: 0.8,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 2.75, -6.5);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Wainscoting baseboard trim
    const baseboardGeo = new THREE.BoxGeometry(16, 0.6, 0.45);
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x48647e });
    const baseboard = new THREE.Mesh(baseboardGeo, baseboardMat);
    baseboard.position.set(0, 0.3, -6.48);
    roomGroup.add(baseboard);

    // Top crown moulding
    const crownMoulding = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.3, 0.48),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9 })
    );
    crownMoulding.position.set(0, 5.35, -6.48);
    roomGroup.add(crownMoulding);

    // 4. Left Wall (Blue Panel)
    const leftWallGeo = new THREE.BoxGeometry(0.4, 5.5, 13);
    const leftWall = new THREE.Mesh(leftWallGeo, backWallMat);
    leftWall.position.set(-8, 2.75, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    const leftBaseboard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 13), baseboardMat);
    leftBaseboard.position.set(-7.98, 0.3, 0);
    roomGroup.add(leftBaseboard);

    // WALL DECORATIONS
    // 1. Wooden Louvre Shutter Door on Left Back Wall
    const louvreDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 3.6),
      new THREE.MeshStandardMaterial({ map: createLouvreTexture() })
    );
    louvreDoor.position.set(-5.6, 2.2, -6.28);
    roomGroup.add(louvreDoor);

    // 2. Blackboard Menu / Deliberation Agenda
    const blackboard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 2.0),
      new THREE.MeshStandardMaterial({ map: createBlackboardTexture() })
    );
    blackboard.position.set(-3.6, 3.4, -6.28);
    roomGroup.add(blackboard);

    // 3. Central Window with White Crossbars and Green Curtains
    const windowFrameGeo = new THREE.BoxGeometry(2.6, 3.2, 0.1);
    const windowFrame = new THREE.Mesh(
      windowFrameGeo,
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    windowFrame.position.set(0, 3.8, -6.28);
    roomGroup.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 2.8),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd })
    );
    windowGlass.position.set(0, 3.8, -6.22);
    roomGroup.add(windowGlass);

    // Green Draped Curtains
    const curtainGeo = new THREE.BoxGeometry(0.65, 3.1, 0.15);
    const curtainMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    const leftCurtain = new THREE.Mesh(curtainGeo, curtainMat);
    leftCurtain.position.set(-1.15, 3.8, -6.18);
    const rightCurtain = new THREE.Mesh(curtainGeo, curtainMat);
    rightCurtain.position.set(1.15, 3.8, -6.18);
    roomGroup.add(leftCurtain);
    roomGroup.add(rightCurtain);

    // 4. Wall Clock (White face with black hands at 10:10)
    const clockGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 24);
    const wallClock = new THREE.Mesh(
      clockGeo,
      new THREE.MeshStandardMaterial({ map: createClockFaceTexture() })
    );
    wallClock.rotation.x = Math.PI / 2;
    wallClock.position.set(2.4, 4.3, -6.28);
    roomGroup.add(wallClock);

    // 5. Rocket Poster
    const posterGeo = new THREE.PlaneGeometry(1.5, 2.2);
    const poster = new THREE.Mesh(
      posterGeo,
      new THREE.MeshStandardMaterial({ map: createRocketPosterTexture() })
    );
    poster.position.set(4.6, 3.8, -6.28);
    roomGroup.add(poster);

    // 6. Two Smaller Framed Portraits
    const portrait1 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 1.1),
      new THREE.MeshStandardMaterial({ map: createPortraitTexture(true) })
    );
    portrait1.position.set(6.4, 4.4, -6.28);
    roomGroup.add(portrait1);

    const portrait2 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 1.1),
      new THREE.MeshStandardMaterial({ map: createPortraitTexture(false) })
    );
    portrait2.position.set(6.4, 3.1, -6.28);
    roomGroup.add(portrait2);

    // 7. Water Cooler (Top Left Corner)
    const coolerBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 1.5, 0.75),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    coolerBase.position.set(-7.1, 0.75, -5.5);
    coolerBase.castShadow = true;
    roomGroup.add(coolerBase);

    // Taps
    const redTap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    redTap.position.set(-6.7, 1.05, -5.3);
    roomGroup.add(redTap);
    const blueTap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
    blueTap.position.set(-6.7, 1.05, -5.5);
    roomGroup.add(blueTap);

    const coolerBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.75, 16),
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
      })
    );
    coolerBottle.position.set(-7.1, 1.85, -5.5);
    roomGroup.add(coolerBottle);

    // 8. Potted Plants & Two White Flower Planters
    // Potted palm tree
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0x9a3412 }));
    pot.position.set(-7.1, 0.3, -4.2);
    roomGroup.add(pot);
    const plantBush = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 }));
    plantBush.scale.set(0.9, 1.5, 0.9);
    plantBush.position.set(-7.1, 0.9, -4.2);
    roomGroup.add(plantBush);

    // Two White Flower Planters (matching screenshot top-left)
    for (let p = 0; p < 2; p++) {
      const zOffset = -2.8 + p * 1.5;
      const planter = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.45, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
      );
      planter.position.set(-7.1, 0.22, zOffset);
      roomGroup.add(planter);

      const hedge = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 })
      );
      hedge.scale.set(0.75, 0.8, 1.3);
      hedge.position.set(-7.1, 0.55, zOffset);
      roomGroup.add(hedge);

      // Sprinkled flower blooms (purple and cyan)
      for (let f = 0; f < 5; f++) {
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 6, 6),
          new THREE.MeshBasicMaterial({ color: f % 2 === 0 ? 0x818cf8 : 0xc084fc })
        );
        flower.position.set(-6.85, 0.72 + (f % 2) * 0.05, zOffset - 0.4 + f * 0.2);
        roomGroup.add(flower);
      }
    }

    scene.add(roomGroup);

    // 3D FURNITURE & DESKS
    // 1. Center Executive Semicircular Desk (CEO / Chief Justice)
    const execDeskGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.9, 24, 1, false, 0, Math.PI);
    const execDeskMat = new THREE.MeshStandardMaterial({
      color: 0x5a6d88,
      roughness: 0.5,
    });
    const execDesk = new THREE.Mesh(execDeskGeo, execDeskMat);
    execDesk.rotation.y = -Math.PI / 2;
    execDesk.position.set(0, 0.45, -1.8);
    execDesk.castShadow = true;
    execDesk.receiveShadow = true;
    scene.add(execDesk);

    // Inner desk top rim
    const execInner = new THREE.Mesh(
      new THREE.CylinderGeometry(1.45, 1.45, 0.05, 24, 1, false, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
    );
    execInner.rotation.y = -Math.PI / 2;
    execInner.position.set(0, 0.92, -1.8);
    scene.add(execInner);

    // Monitor on Executive Desk
    const ceoMonitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.55, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    ceoMonitor.position.set(0, 1.2, -1.8);
    scene.add(ceoMonitor);

    const ceoScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.76, 0.48),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    ceoScreen.position.set(0, 1.2, -1.75);
    scene.add(ceoScreen);

    // Keyboard & Mouse
    const execKeyboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.02, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    execKeyboard.position.set(0, 0.94, -1.45);
    scene.add(execKeyboard);

    // 2. Top-Right Conference Table
    const confTable = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.85, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xb48252, roughness: 0.6 })
    );
    confTable.position.set(4.8, 0.42, -2.4);
    confTable.castShadow = true;
    confTable.receiveShadow = true;
    scene.add(confTable);

    // Conference Chairs around table
    const createChair = (x: number, z: number, rotY = 0) => {
      const chairGroup = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: 0x5c3d2e }));
      seat.position.y = 0.45;
      chairGroup.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.08), new THREE.MeshStandardMaterial({ color: 0x5c3d2e }));
      back.position.set(0, 0.72, -0.22);
      chairGroup.add(back);
      // 4 legs
      for (let lx of [-0.2, 0.2]) {
        for (let lz of [-0.2, 0.2]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6), new THREE.MeshStandardMaterial({ color: 0x2e1c14 }));
          leg.position.set(lx, 0.225, lz);
          chairGroup.add(leg);
        }
      }
      chairGroup.position.set(x, 0, z);
      chairGroup.rotation.y = rotY;
      scene.add(chairGroup);
    };

    createChair(3.6, -1.2, 0);
    createChair(4.8, -1.2, 0);
    createChair(6.0, -1.2, 0);
    createChair(4.8, -3.6, Math.PI);

    // Blueprints and coffee mugs on Conference Table
    const blueprint = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    blueprint.rotation.x = -Math.PI / 2;
    blueprint.position.set(4.2, 0.86, -2.4);
    scene.add(blueprint);

    const confMug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    confMug.position.set(5.5, 0.92, -2.2);
    scene.add(confMug);

    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.3, 10), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    vase.position.set(4.8, 1.0, -2.5);
    scene.add(vase);
    const vaseFlower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0x60a5fa }));
    vaseFlower.position.set(4.8, 1.2, -2.5);
    scene.add(vaseFlower);

    // 3. Bottom-Right Round Discussion Table (Skeptic)
    const skepticTable = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 0.85, 24),
      new THREE.MeshStandardMaterial({ color: 0x855835, roughness: 0.6 })
    );
    skepticTable.position.set(4.8, 0.42, 2.2);
    skepticTable.castShadow = true;
    skepticTable.receiveShadow = true;
    scene.add(skepticTable);

    createChair(4.8, 3.4, Math.PI);
    createChair(3.4, 2.2, Math.PI / 2);
    createChair(6.2, 2.2, -Math.PI / 2);

    // Curved Widescreen Monitor & Laptop on Skeptic Table
    const curvedMonitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.45, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    curvedMonitor.position.set(5.1, 1.15, 2.0);
    curvedMonitor.rotation.y = -0.3;
    scene.add(curvedMonitor);

    const skepticScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    skepticScreen.position.set(5.08, 1.15, 2.04);
    skepticScreen.rotation.y = -0.3;
    scene.add(skepticScreen);

    // Laptop
    const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.35), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    laptopBase.position.set(4.3, 0.88, 2.4);
    scene.add(laptopBase);
    const laptopLid = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.02), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    laptopLid.position.set(4.3, 1.04, 2.22);
    laptopLid.rotation.x = 0.2;
    scene.add(laptopLid);

    // 4. Bottom-Left Lounge Booth (Advocate / Designing Area)
    const sofaSeat = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.45, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    sofaSeat.position.set(-4.6, 0.23, 1.6);
    scene.add(sofaSeat);

    const sofaBack = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.8, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x5c2b09, roughness: 0.7 })
    );
    sofaBack.position.set(-4.6, 0.7, 2.1);
    scene.add(sofaBack);

    // Coffee table
    const coffeeTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    coffeeTable.scale.set(1.4, 1, 0.9);
    coffeeTable.position.set(-4.6, 0.2, 0.2);
    scene.add(coffeeTable);

    // Teapot & Cup
    const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    teapot.position.set(-4.6, 0.48, 0.2);
    scene.add(teapot);

    // 5. Bottom Row Coding Workstations (Center bottom)
    for (let i = -1; i <= 1; i++) {
      const codeDesk = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x9c744c, roughness: 0.7 })
      );
      codeDesk.position.set(i * 1.65, 0.4, 4.4);
      codeDesk.castShadow = true;
      scene.add(codeDesk);

      // Retro CRT Monitor
      const crt = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.45, 0.35),
        new THREE.MeshStandardMaterial({ color: 0xd4d4d8 })
      );
      crt.position.set(i * 1.65, 1.05, 4.3);
      scene.add(crt);

      const crtScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.48, 0.38),
        new THREE.MeshBasicMaterial({ color: 0x0284c7 })
      );
      crtScreen.position.set(i * 1.65, 1.05, 4.48);
      scene.add(crtScreen);

      // Keyboard
      const kb = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.02, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xe4e4e7 })
      );
      kb.position.set(i * 1.65, 0.82, 4.65);
      scene.add(kb);

      // Chair
      createChair(i * 1.65, 5.2, Math.PI);
    }

    // WOODEN SIGNPOST LABELS: [Designing], [Coding], [Testing], [Documenting]
    const createSignpost = (text: string, x: number, y: number, z: number, highlightColor: number) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c4028 })
      );
      post.position.set(x, y - 0.7, z);
      scene.add(post);

      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 90;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#3d2b1f";
      ctx.fillRect(0, 0, 256, 90);
      ctx.strokeStyle = "#9c744c";
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 248, 82);

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 45);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.42, 0.05),
        new THREE.MeshBasicMaterial({ map: tex })
      );
      board.position.set(x, y, z);
      scene.add(board);
    };

    createSignpost("Designing", -6.0, 2.1, 0.2, 0x10b981);
    createSignpost("Coding", 0, 2.1, 5.6, 0x38bdf8);
    createSignpost("Testing", 6.2, 2.1, 3.2, 0xf43f5e);
    createSignpost("Documenting", 6.4, 2.1, -1.0, 0xfbbf24);

    // Illuminated Courtroom Role Badges above Chamber Stations
    const createRoleBadge = (title: string, x: number, y: number, z: number, color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 70;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 300, 70);
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, 292, 62);
      ctx.fillStyle = color;
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(title, 150, 35);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      badge.position.set(x, y, z);
      badge.scale.set(1.5, 0.38, 1);
      scene.add(badge);
    };

    createRoleBadge("ADVOCATE", -4.5, 3.2, 0.5, "#10b981");
    createRoleBadge("CHIEF JUSTICE", 0, 3.6, -2.7, "#fbbf24");
    createRoleBadge("SKEPTIC", 4.8, 3.2, 2.2, "#f43f5e");

    // PIXEL ART CHARACTERS (Billboard Sprites with Shadows)
    const createPixelCharacter = (
      texturePath: string,
      x: number,
      y: number,
      z: number,
      scale = 2.0
    ) => {
      // Append cache buster to ensure transparent PNG update is immediately re-fetched
      const map = textureLoader.load(`${texturePath}?v=3`);
      map.magFilter = THREE.NearestFilter;
      map.minFilter = THREE.NearestFilter;

      const spriteMat = new THREE.SpriteMaterial({
        map: map,
        transparent: true,
        alphaTest: 0.15,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(x, y, z);
      sprite.scale.set(scale, scale * 1.15, 1);
      scene.add(sprite);

      // Floor Shadow Disk
      const shadowGeo = new THREE.CircleGeometry(0.45 * (scale / 2), 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(x, 0.03, z + 0.1);
      scene.add(shadow);

      return { sprite, shadow };
    };

    // 1. Advocate (Counselor from ChatDev, standing at the left table)
    const advocateChar = createPixelCharacter(
      "/chatdev/figures/counselor.png",
      -4.5,
      1.75,
      0.5,
      2.1
    );

    // 2. Chief Justice (CEO from ChatDev, sitting behind center executive desk)
    const judgeChar = createPixelCharacter(
      "/chatdev/figures/ceo.png",
      0,
      2.15,
      -2.7,
      2.3
    );

    // 3. Skeptic (Code Reviewer from ChatDev, sitting at the testing table)
    const skepticChar = createPixelCharacter(
      "/chatdev/figures/reviewer.png",
      4.5,
      1.75,
      0.5,
      2.1
    );

    // Additional Office Workers from ChatDev around the room
    const designerWorker = createPixelCharacter(
      "/chatdev/figures/designer.png",
      -5.5,
      1.4,
      -1.5,
      1.6
    );
    const programmerWorker = createPixelCharacter(
      "/chatdev/figures/programmer.png",
      0,
      1.4,
      3.4,
      1.6
    );
    const testerWorker = createPixelCharacter(
      "/chatdev/figures/tester.png",
      5.6,
      1.4,
      -1.2,
      1.6
    );

    // 3D FLOATING DIRECTION ARROWS (left.png & right.png)
    const leftArrowMap = textureLoader.load("/chatdev/figures/left.png");
    leftArrowMap.magFilter = THREE.NearestFilter;
    const leftArrowMat = new THREE.SpriteMaterial({
      map: leftArrowMap,
      transparent: true,
      opacity: 0,
    });
    const leftArrow = new THREE.Sprite(leftArrowMat);
    leftArrow.position.set(1.5, 2.5, 0.5);
    leftArrow.scale.set(1.2, 1.2, 1);
    scene.add(leftArrow);

    const rightArrowMap = textureLoader.load("/chatdev/figures/right.png");
    rightArrowMap.magFilter = THREE.NearestFilter;
    const rightArrowMat = new THREE.SpriteMaterial({
      map: rightArrowMap,
      transparent: true,
      opacity: 0,
    });
    const rightArrow = new THREE.Sprite(rightArrowMat);
    rightArrow.position.set(-1.5, 2.5, 0.5);
    rightArrow.scale.set(1.2, 1.2, 1);
    scene.add(rightArrow);

    // Rebuttal Laser Connecting Advocate & Skeptic
    const laserGeo = new THREE.CylinderGeometry(0.03, 0.03, 9, 8);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0,
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.rotation.z = Math.PI / 2;
    laser.position.set(0, 1.6, 0.5);
    scene.add(laser);

    // RESIZE LISTENER
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      controls.update();

      const turn = activeTurnRef.current;

      // Character Breathing & Turn-Based Speaking Animations
      if (turn === 1) {
        // Advocate actively speaking & gesticulating
        advocateChar.sprite.position.y = 1.75 + Math.abs(Math.sin(time * 7)) * 0.14;
        advocateChar.sprite.scale.set(2.2 + Math.sin(time * 7) * 0.08, 2.45, 1);
        judgeChar.sprite.position.y = 2.15 + Math.sin(time * 2.5 + 1) * 0.03;
        skepticChar.sprite.position.y = 1.75 + Math.sin(time * 2.5 + 2) * 0.03;
      } else if (turn === 2) {
        // Skeptic actively rebutting & leaning forward
        skepticChar.sprite.position.y = 1.75 + Math.abs(Math.sin(time * 7)) * 0.14;
        skepticChar.sprite.scale.set(2.2 + Math.sin(time * 7) * 0.08, 2.45, 1);
        advocateChar.sprite.position.y = 1.75 + Math.sin(time * 2.5) * 0.03;
        judgeChar.sprite.position.y = 2.15 + Math.sin(time * 2.5 + 1) * 0.03;
      } else if (turn >= 3) {
        // Chief Justice delivering authoritative verdict
        judgeChar.sprite.position.y = 2.15 + Math.abs(Math.sin(time * 5)) * 0.12;
        judgeChar.sprite.scale.set(2.4 + Math.sin(time * 5) * 0.08, 2.7, 1);
        advocateChar.sprite.position.y = 1.75 + Math.sin(time * 2) * 0.02;
        skepticChar.sprite.position.y = 1.75 + Math.sin(time * 2) * 0.02;
      } else {
        // Idle ambient breathing
        advocateChar.sprite.position.y = 1.75 + Math.sin(time * 2.5) * 0.04;
        advocateChar.sprite.scale.set(2.1, 2.4, 1);
        judgeChar.sprite.position.y = 2.15 + Math.sin(time * 2.5 + 1) * 0.04;
        judgeChar.sprite.scale.set(2.3, 2.65, 1);
        skepticChar.sprite.position.y = 1.75 + Math.sin(time * 2.5 + 2) * 0.04;
        skepticChar.sprite.scale.set(2.1, 2.4, 1);
      }

      // Other office workers ambient typing and movement
      programmerWorker.sprite.position.y = 1.4 + Math.sin(time * 3 + 1) * 0.02;
      designerWorker.sprite.position.y = 1.4 + Math.sin(time * 2.8) * 0.02;
      testerWorker.sprite.position.y = 1.4 + Math.sin(time * 3.2) * 0.02;

      // Dynamic Spotlights & Arrows
      if (turn === 1) {
        // Advocate Speaking
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 5.0, 0.1);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 0.2, 0.1);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 0.3, 0.1);

        rightArrow.material.opacity = THREE.MathUtils.lerp(rightArrow.material.opacity, 1, 0.1);
        leftArrow.material.opacity = THREE.MathUtils.lerp(leftArrow.material.opacity, 0, 0.1);
        rightArrow.position.y = 2.3 + Math.sin(time * 5) * 0.1;

        laserMat.opacity = 0;
      } else if (turn === 2) {
        // Skeptic Speaking / Rebutting
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 1.0, 0.1);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 5.0, 0.1);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 0.3, 0.1);

        rightArrow.material.opacity = THREE.MathUtils.lerp(rightArrow.material.opacity, 0, 0.1);
        leftArrow.material.opacity = THREE.MathUtils.lerp(leftArrow.material.opacity, 1, 0.1);
        leftArrow.position.y = 2.3 + Math.sin(time * 5) * 0.1;

        laserMat.opacity = THREE.MathUtils.lerp(laserMat.opacity, 0.85, 0.1);
      } else if (turn >= 3) {
        // Chief Justice Ruling
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 0.6, 0.1);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 0.6, 0.1);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 7.0, 0.1);

        rightArrow.material.opacity = 0;
        leftArrow.material.opacity = 0;
        laserMat.opacity = 0;
      } else {
        // Idle
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 1.2, 0.1);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 1.2, 0.1);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 1.8, 0.1);
        rightArrow.material.opacity = 0;
        leftArrow.material.opacity = 0;
        laserMat.opacity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-2xl overflow-hidden border border-[#2d3442] bg-[#0c111c] shadow-2xl select-none group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Speech Bubble Overlay in Scene */}
      {activeSpeakerText && (
        <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-20 animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
          <div
            className={`rounded-xl border p-4 backdrop-blur-xl shadow-2xl font-mono text-xs leading-relaxed ${
              activeSpeakerRole === "advocate"
                ? "bg-[#0b1b17]/95 border-emerald-500/70 text-emerald-200"
                : activeSpeakerRole === "skeptic"
                ? "bg-[#1f0f14]/95 border-rose-500/70 text-rose-200"
                : "bg-[#1f190a]/95 border-amber-500/80 text-amber-200"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 uppercase tracking-widest text-[10px] font-bold">
              <span>{activeSpeakerRole} (Deliberating in 3D Office)</span>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            </div>
            <p className="font-sans line-clamp-4 text-xs sm:text-sm text-slate-100">
              "{activeSpeakerText}"
            </p>
          </div>
        </div>
      )}

      {/* Top Camera Preset Buttons */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#121622]/90 border border-slate-700/60 p-1 rounded-lg font-mono text-[10px] text-slate-300 backdrop-blur z-20">
        <span className="text-amber-400 font-bold px-1.5 flex items-center gap-1">
          <Camera className="w-3 h-3" />
          Cam:
        </span>
        <button
          onClick={() => resetCamera("iso")}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white transition-all"
        >
          Isometric
        </button>
        <button
          onClick={() => resetCamera("judge")}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition-all"
        >
          Chief Justice
        </button>
        <button
          onClick={() => resetCamera("advocate")}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-all"
        >
          Advocate
        </button>
        <button
          onClick={() => resetCamera("skeptic")}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 transition-all"
        >
          Skeptic
        </button>
      </div>

      {/* Bottom Hint Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 bg-[#121622]/90 border border-slate-700/60 px-3 py-1.5 rounded-lg font-mono text-[10px] text-slate-300 pointer-events-auto backdrop-blur">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Three.js 3D ChatDev Office Chamber • Drag to Orbit / Scroll to Zoom</span>
        </div>

        <button
          onClick={() => resetCamera("iso")}
          className="pointer-events-auto flex items-center gap-1 bg-[#121622]/90 border border-slate-700/60 px-2.5 py-1.5 rounded-lg font-mono text-[10px] text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all"
          title="Reset Camera View"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset View</span>
        </button>
      </div>
    </div>
  );
}

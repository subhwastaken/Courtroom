"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AgentTurn } from "@/lib/types";
import { Camera, RefreshCw, Eye, Sparkles, Scale, Volume2 } from "lucide-react";

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

  const resetCamera = (preset: "court" | "judge" | "advocate" | "skeptic" = "court") => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (preset === "court") {
      cam.position.set(0, 7.5, 9.5);
      ctrl.target.set(0, 1.8, -0.5);
    } else if (preset === "judge") {
      cam.position.set(0, 4.2, 1.5);
      ctrl.target.set(0, 2.4, -3.2);
    } else if (preset === "advocate") {
      cam.position.set(-1.8, 3.8, 3.8);
      ctrl.target.set(-4.2, 1.8, 0.4);
    } else if (preset === "skeptic") {
      cam.position.set(1.8, 3.8, 3.8);
      ctrl.target.set(4.2, 1.8, 0.4);
    }
    ctrl.update();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0806); // Dark mahogany court ambiance
    scene.fog = new THREE.FogExp2(0x0c0806, 0.028);

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 7.5, 9.5);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // Don't clip below floor
    controls.minDistance = 3.5;
    controls.maxDistance = 22;
    controls.target.set(0, 1.8, -0.5);
    controlsRef.current = controls;

    // 5. LIGHTING (Atmospheric Judicial Courtroom Lighting)
    const ambientLight = new THREE.AmbientLight(0xffecd6, 0.55);
    scene.add(ambientLight);

    // Warm courtroom overhead chandelier light
    const chandelierLight = new THREE.PointLight(0xffdfa9, 2.4, 26, 1.2);
    chandelierLight.position.set(0, 8.5, 0);
    chandelierLight.castShadow = true;
    chandelierLight.shadow.mapSize.width = 1024;
    chandelierLight.shadow.mapSize.height = 1024;
    scene.add(chandelierLight);

    // Window sunbeam / moonlight through arched windows
    const windowLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    windowLight.position.set(-12, 11, 4);
    windowLight.target.position.set(0, 1, 0);
    windowLight.castShadow = true;
    windowLight.shadow.mapSize.width = 1024;
    windowLight.shadow.mapSize.height = 1024;
    scene.add(windowLight);
    scene.add(windowLight.target);

    // DYNAMIC COUNSEL SPOTLIGHTS
    // Advocate Spotlight (Emerald Green)
    const advocateSpot = new THREE.SpotLight(0x10b981, 0.4, 20, Math.PI / 4.5, 0.35);
    advocateSpot.position.set(-4.2, 7.5, 1.5);
    advocateSpot.target.position.set(-4.2, 1.5, 0.4);
    scene.add(advocateSpot);
    scene.add(advocateSpot.target);

    // Skeptic Spotlight (Rose / Ruby Red)
    const skepticSpot = new THREE.SpotLight(0xf43f5e, 0.4, 20, Math.PI / 4.5, 0.35);
    skepticSpot.position.set(4.2, 7.5, 1.5);
    skepticSpot.target.position.set(4.2, 1.5, 0.4);
    scene.add(skepticSpot);
    scene.add(skepticSpot.target);

    // Chief Justice Dais Spotlight (Burnished Gold)
    const judgeSpot = new THREE.SpotLight(0xfbbf24, 0.8, 22, Math.PI / 3.8, 0.3);
    judgeSpot.position.set(0, 8.5, -1.8);
    judgeSpot.target.position.set(0, 2.5, -3.2);
    scene.add(judgeSpot);
    scene.add(judgeSpot.target);

    // 6. TEXTURES & PROCEDURAL ASSETS
    const textureLoader = new THREE.TextureLoader();

    // Procedural Parquet Hardwood Floor Texture
    const createParquetTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#27160d"; // Dark walnut
      ctx.fillRect(0, 0, 512, 512);

      // Herringbone pattern
      ctx.strokeStyle = "#1b0f09";
      ctx.lineWidth = 2.5;
      const step = 32;
      for (let y = 0; y < 512; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();

        const offset = (y / step) % 2 === 0 ? 0 : 48;
        for (let x = offset; x < 512; x += 96) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + step);
          ctx.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Procedural Royal Judicial Carpet Runner (Burgundy & Gold border)
    const createRunnerTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      // Rich burgundy field
      ctx.fillStyle = "#5c0e18";
      ctx.fillRect(0, 0, 256, 512);

      // Deep ruby center
      ctx.fillStyle = "#73121f";
      ctx.fillRect(20, 0, 216, 512);

      // Gold Greek-key / laurel borders
      ctx.fillStyle = "#d4af37"; // Rich gold
      ctx.fillRect(14, 0, 4, 512);
      ctx.fillRect(238, 0, 4, 512);

      // Diamond pattern along center
      ctx.strokeStyle = "#8b1827";
      ctx.lineWidth = 2;
      for (let y = 0; y < 512; y += 32) {
        ctx.beginPath();
        ctx.moveTo(128, y);
        ctx.lineTo(70, y + 16);
        ctx.lineTo(128, y + 32);
        ctx.lineTo(186, y + 16);
        ctx.closePath();
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 4);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Procedural Scales of Justice Wall Plaque (Behind the Chief Justice)
    const createScalesPlaqueTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 360;
      const ctx = canvas.getContext("2d")!;

      // Dark mahogany backplate with gold beveled rim
      ctx.fillStyle = "#1e1008";
      ctx.fillRect(0, 0, 512, 360);
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, 492, 340);

      ctx.strokeStyle = "#996515";
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, 472, 320);

      // Scales of Justice Emblem
      ctx.fillStyle = "#d4af37";
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";

      // Central Pillar
      ctx.beginPath();
      ctx.moveTo(256, 75);
      ctx.lineTo(256, 240);
      ctx.stroke();

      // Top crossbeam
      ctx.beginPath();
      ctx.moveTo(160, 110);
      ctx.lineTo(352, 110);
      ctx.stroke();

      // Central Finial
      ctx.beginPath();
      ctx.arc(256, 70, 10, 0, Math.PI * 2);
      ctx.fill();

      // Left pan
      ctx.beginPath();
      ctx.moveTo(170, 112);
      ctx.lineTo(145, 170);
      ctx.moveTo(170, 112);
      ctx.lineTo(195, 170);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(170, 175, 30, 0, Math.PI);
      ctx.fill();

      // Right pan
      ctx.beginPath();
      ctx.moveTo(342, 112);
      ctx.lineTo(317, 170);
      ctx.moveTo(342, 112);
      ctx.lineTo(367, 170);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(342, 175, 30, 0, Math.PI);
      ctx.fill();

      // Base pedestal
      ctx.fillRect(216, 235, 80, 18);
      ctx.fillRect(200, 250, 112, 14);

      // Courtroom Inscription
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 24px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("LEX ET MEMORIA", 256, 295);

      ctx.fillStyle = "#ca8a04";
      ctx.font = "bold 13px monospace";
      ctx.fillText("SUPREME ARBITER OF PERSONAL HISTORY", 256, 320);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // Procedural Law Book Spines Texture
    const createLawBooksTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 256, 128);

      const colors = ["#7f1d1d", "#1e3a5f", "#365314", "#713f12", "#581c87"];
      const bookWidth = 256 / colors.length;

      colors.forEach((col, idx) => {
        const x = idx * bookWidth;
        ctx.fillStyle = col;
        ctx.fillRect(x + 2, 4, bookWidth - 4, 120);

        // Gold embossed bands
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(x + 4, 20, bookWidth - 8, 4);
        ctx.fillRect(x + 4, 28, bookWidth - 8, 3);
        ctx.fillRect(x + 4, 95, bookWidth - 8, 3);
        ctx.fillRect(x + 4, 102, bookWidth - 8, 4);
      });

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    // 7. COURTROOM ARCHITECTURE
    const courtGroup = new THREE.Group();

    // Main Parquet Floor
    const floorGeo = new THREE.BoxGeometry(18, 0.4, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createParquetTexture(),
      roughness: 0.6,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = true;
    courtGroup.add(floor);

    // Judicial Carpet Runner down center aisle
    const runnerGeo = new THREE.PlaneGeometry(2.6, 12);
    const runnerMat = new THREE.MeshStandardMaterial({
      map: createRunnerTexture(),
      roughness: 0.85,
    });
    const runner = new THREE.Mesh(runnerGeo, runnerMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.015, 0.8);
    runner.receiveShadow = true;
    courtGroup.add(runner);

    // Walls with Rich Mahogany Wainscoting
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x18100a, // Dark antique wood
      roughness: 0.7,
      metalness: 0.05,
    });
    const wainscotMat = new THREE.MeshStandardMaterial({
      color: 0x2e190e, // Rich mahogany lower paneling
      roughness: 0.5,
      metalness: 0.1,
    });

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(18, 9, 0.4), wallMat);
    backWall.position.set(0, 4.3, -8);
    backWall.receiveShadow = true;
    courtGroup.add(backWall);

    const backWainscot = new THREE.Mesh(new THREE.BoxGeometry(18, 3.4, 0.45), wainscotMat);
    backWainscot.position.set(0, 1.5, -7.95);
    backWainscot.receiveShadow = true;
    courtGroup.add(backWainscot);

    // Left Wall with High Arched Windows
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9, 16), wallMat);
    leftWall.position.set(-9, 4.3, 0);
    leftWall.receiveShadow = true;
    courtGroup.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9, 16), wallMat);
    rightWall.position.set(9, 4.3, 0);
    rightWall.receiveShadow = true;
    courtGroup.add(rightWall);

    // Scales of Justice Wall Plaque (Behind Judge)
    const plaqueGeo = new THREE.PlaneGeometry(5.2, 3.6);
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: createScalesPlaqueTexture(),
      roughness: 0.4,
      metalness: 0.3,
    });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(0, 4.8, -7.75);
    courtGroup.add(plaque);

    // 8. THE HIGH JUDICIAL BENCH & DAIS (Center Elevated)
    // Tier 1 Dais (Base Platform)
    const daisBase = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.35, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x2a170d, roughness: 0.5 })
    );
    daisBase.position.set(0, 0.175, -4.5);
    daisBase.receiveShadow = true;
    daisBase.castShadow = true;
    courtGroup.add(daisBase);

    // Tier 2 Dais (Upper Platform)
    const daisUpper = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.4, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x361d10, roughness: 0.45 })
    );
    daisUpper.position.set(0, 0.55, -4.6);
    daisUpper.receiveShadow = true;
    daisUpper.castShadow = true;
    courtGroup.add(daisUpper);

    // High Carved Mahogany Bench Desk
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x3d2112, // Polished dark mahogany
      roughness: 0.35,
      metalness: 0.15,
    });

    const benchFront = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.45, 1.4), benchMat);
    benchFront.position.set(0, 1.45, -3.7);
    benchFront.castShadow = true;
    benchFront.receiveShadow = true;
    courtGroup.add(benchFront);

    // Raised decorative wood panels on bench front
    const panelGeo = new THREE.BoxGeometry(1.2, 0.95, 0.08);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x27140b, roughness: 0.4 });
    [-1.6, 0, 1.6].forEach((px) => {
      const p = new THREE.Mesh(panelGeo, panelMat);
      p.position.set(px, 1.45, -2.96);
      courtGroup.add(p);
    });

    // Bench Top Molding
    const benchTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.12, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x4a2816, roughness: 0.3 })
    );
    benchTop.position.set(0, 2.2, -3.7);
    benchTop.castShadow = true;
    courtGroup.add(benchTop);

    // 9. THE 3D GAVEL & SOUND BLOCK
    const soundBlock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.32, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0x241208, roughness: 0.35 })
    );
    soundBlock.position.set(-0.7, 2.3, -3.3);
    soundBlock.receiveShadow = true;
    courtGroup.add(soundBlock);

    // The Gavel (Handle + Head)
    const gavelGroup = new THREE.Group();
    gavelGroup.position.set(-0.7, 2.34, -3.3);

    // Gavel Head
    const gavelHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.36, 12),
      new THREE.MeshStandardMaterial({ color: 0x5c2b09, roughness: 0.3 })
    );
    gavelHead.rotation.z = Math.PI / 2;
    gavelHead.position.set(0, 0.09, 0);
    gavelHead.castShadow = true;
    gavelGroup.add(gavelHead);

    // Gavel Brass Rings
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
    [-0.12, 0.12].forEach((rx) => {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 12), ringMat);
      ring.rotation.z = Math.PI / 2;
      ring.position.set(rx, 0.09, 0);
      gavelGroup.add(ring);
    });

    // Gavel Handle
    const gavelHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 })
    );
    gavelHandle.rotation.x = Math.PI / 2;
    gavelHandle.position.set(0, 0.09, 0.24);
    gavelHandle.castShadow = true;
    gavelGroup.add(gavelHandle);

    gavelGroup.rotation.y = 0.3;
    courtGroup.add(gavelGroup);

    // Gavel Impact Shockwave Ring (Triggers on Verdict)
    const shockwaveGeo = new THREE.RingGeometry(0.2, 0.35, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwave.rotation.x = -Math.PI / 2;
    shockwave.position.set(-0.7, 2.345, -3.3);
    courtGroup.add(shockwave);

    // Green Banker's Lamp on Judge's Bench
    const createBankersLamp = (x: number, y: number, z: number, color = 0x059669) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, y, z);

      // Brass base & stem
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 0.05, 12),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.25 })
      );
      lamp.add(base);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.38, 8),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.25 })
      );
      stem.position.y = 0.2;
      lamp.add(stem);

      // Glass Shade (Green or Rose)
      const shade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.16, 0.32, 16, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.15,
          emissive: color,
          emissiveIntensity: 0.3,
        })
      );
      shade.rotation.z = Math.PI / 2;
      shade.position.set(0, 0.38, 0);
      lamp.add(shade);

      // Warm glow
      const bulb = new THREE.PointLight(0xfff5db, 0.6, 3);
      bulb.position.set(0, 0.3, 0);
      lamp.add(bulb);

      return lamp;
    };

    courtGroup.add(createBankersLamp(1.4, 2.26, -3.4, 0x047857));

    // Brass Gooseneck Courtroom Microphones
    const createCourtMicrophone = (x: number, y: number, z: number) => {
      const mic = new THREE.Group();
      mic.position.set(x, y, z);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.09, 0.03, 10),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 })
      );
      mic.add(base);

      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
      );
      neck.rotation.x = -0.4;
      neck.position.set(0, 0.16, -0.06);
      mic.add(neck);

      const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
      );
      head.position.set(0, 0.32, -0.14);
      mic.add(head);

      return mic;
    };

    courtGroup.add(createCourtMicrophone(0, 2.26, -3.2));

    // High-back Executive Judicial Chair behind bench
    const judgeChair = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.7 })
    );
    judgeChair.position.set(0, 2.2, -5.2);
    courtGroup.add(judgeChair);

    // 10. OPPOSING COUNSEL STATIONS (Advocate Left, Skeptic Right)
    const createCounselTable = (x: number, z: number, isAdvocate: boolean) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(x, 0, z);

      // Main Table Top
      const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.12, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x381f12, roughness: 0.4 })
      );
      tableTop.position.y = 1.35;
      tableTop.castShadow = true;
      tableTop.receiveShadow = true;
      tableGroup.add(tableTop);

      // Heavy Carved Legs
      const legGeo = new THREE.BoxGeometry(0.2, 1.3, 0.2);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x27140b, roughness: 0.5 });
      [
        [-1.6, -0.7],
        [1.6, -0.7],
        [-1.6, 0.7],
        [1.6, 0.7],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.65, lz);
        leg.castShadow = true;
        tableGroup.add(leg);
      });

      // Modesty Panel
      const modesty = new THREE.Mesh(
        new THREE.BoxGeometry(3.3, 0.75, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x27140b, roughness: 0.5 })
      );
      modesty.position.set(0, 0.85, 0.75);
      tableGroup.add(modesty);

      // Table Props: Lamp, Mic, Briefs / Law Books
      const lampColor = isAdvocate ? 0x059669 : 0xbe123c;
      tableGroup.add(createBankersLamp(1.3, 1.41, -0.3, lampColor));
      tableGroup.add(createCourtMicrophone(0, 1.41, 0.2));

      // Law Books / Folios
      const bookBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.28, 0.5),
        new THREE.MeshStandardMaterial({
          map: createLawBooksTexture(),
          roughness: 0.6,
        })
      );
      bookBlock.position.set(-1.1, 1.55, -0.2);
      bookBlock.rotation.y = 0.15;
      bookBlock.castShadow = true;
      tableGroup.add(bookBlock);

      // Legal Pads
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.04, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.9 })
      );
      pad.position.set(0.2, 1.43, 0.1);
      pad.rotation.y = -0.1;
      tableGroup.add(pad);

      return tableGroup;
    };

    const advocateTable = createCounselTable(-4.5, 0.6, true);
    advocateTable.rotation.y = 0.18; // Angled slightly toward bench
    courtGroup.add(advocateTable);

    const skepticTable = createCounselTable(4.5, 0.6, false);
    skepticTable.rotation.y = -0.18; // Angled slightly toward bench
    courtGroup.add(skepticTable);

    // 11. THE WITNESS BOX (Elevated to right of Judge)
    const witnessBox = new THREE.Group();
    witnessBox.position.set(4.2, 0, -3.8);

    const witnessFloor = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.6, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x2e190e, roughness: 0.5 })
    );
    witnessFloor.position.y = 0.3;
    witnessFloor.castShadow = true;
    witnessBox.add(witnessFloor);

    // Spindle Railing around witness stand
    const railMat = new THREE.MeshStandardMaterial({ color: 0x3d2112, roughness: 0.4 });
    const witnessRailFront = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.1), railMat);
    witnessRailFront.position.set(0, 1.05, 0.85);
    witnessBox.add(witnessRailFront);

    const witnessRailLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 1.8), railMat);
    witnessRailLeft.position.set(-0.85, 1.05, 0);
    witnessBox.add(witnessRailLeft);

    courtGroup.add(witnessBox);

    // 12. THE COURT BAR (Spindle Railing dividing Well from Gallery)
    const barRailing = new THREE.Group();
    barRailing.position.set(0, 0, 3.8);

    // Left Bar Rail
    const railLeft = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.85, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x3a1f12, roughness: 0.45 })
    );
    railLeft.position.set(-4.5, 0.425, 0);
    railLeft.castShadow = true;
    barRailing.add(railLeft);

    // Right Bar Rail
    const railRight = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.85, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x3a1f12, roughness: 0.45 })
    );
    railRight.position.set(4.5, 0.425, 0);
    railRight.castShadow = true;
    barRailing.add(railRight);

    // Center Swinging Gate Post
    const postMat = new THREE.MeshStandardMaterial({ color: 0x4a2816, roughness: 0.4 });
    [-1.3, 1.3].forEach((gx) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.05, 0.25), postMat);
      post.position.set(gx, 0.525, 0);
      post.castShadow = true;
      barRailing.add(post);
    });

    courtGroup.add(barRailing);

    // 13. SPECTATOR GALLERY PEWS (In the back)
    const createGalleryBench = (z: number) => {
      const benchGroup = new THREE.Group();
      benchGroup.position.set(0, 0, z);

      [-4.2, 4.2].forEach((bx) => {
        // Seat plank
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(5.2, 0.1, 0.7),
          new THREE.MeshStandardMaterial({ color: 0x2b170c, roughness: 0.5 })
        );
        seat.position.set(bx, 0.5, 0);
        seat.castShadow = true;
        benchGroup.add(seat);

        // Backrest
        const back = new THREE.Mesh(
          new THREE.BoxGeometry(5.2, 0.65, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x2b170c, roughness: 0.5 })
        );
        back.position.set(bx, 0.85, 0.32);
        back.castShadow = true;
        benchGroup.add(back);

        // Bench legs
        [-2.3, 0, 2.3].forEach((lx) => {
          const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.5, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x1f1008, roughness: 0.6 })
          );
          leg.position.set(bx + lx, 0.25, 0);
          benchGroup.add(leg);
        });
      });

      return benchGroup;
    };

    courtGroup.add(createGalleryBench(5.2));
    courtGroup.add(createGalleryBench(6.8));

    // 14. SUSPENDED BRASS COURT CHANDELIERS
    const createChandelier = (x: number, y: number, z: number) => {
      const chan = new THREE.Group();
      chan.position.set(x, y, z);

      // Suspension rod
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 })
      );
      rod.position.y = 1.2;
      chan.add(rod);

      // Brass Ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.06, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 })
      );
      ring.rotation.x = Math.PI / 2;
      chan.add(ring);

      // 6 Amber Candle Bulbs
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xf59e0b,
            emissiveIntensity: 1.5,
          })
        );
        bulb.position.set(Math.cos(angle) * 1.1, 0.1, Math.sin(angle) * 1.1);
        chan.add(bulb);
      }

      const light = new THREE.PointLight(0xffdfa9, 1.2, 10);
      light.position.y = 0.2;
      chan.add(light);

      return chan;
    };

    courtGroup.add(createChandelier(-3.5, 7.2, -1));
    courtGroup.add(createChandelier(3.5, 7.2, -1));

    scene.add(courtGroup);

    // 15. PIXEL-ART COURTROOM CHARACTERS (Transparent Billboard Sprites)
    const createCourtCharacter = (
      texturePath: string,
      x: number,
      y: number,
      z: number,
      scale = 2.1
    ) => {
      const map = textureLoader.load(`${texturePath}?v=4`);
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
      sprite.scale.set(scale, scale * 1.2, 1);
      scene.add(sprite);

      // Floor Shadow Disk
      const shadowGeo = new THREE.CircleGeometry(0.45 * (scale / 2), 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.45,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(x, 0.04, z + 0.1);
      scene.add(shadow);

      return { sprite, shadow };
    };

    // Role Badges hovering over heads
    const createRoleBadge = (title: string, x: number, y: number, z: number, color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 70;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "rgba(12, 16, 26, 0.92)";
      ctx.roundRect(4, 4, 292, 62, 12);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.roundRect(4, 4, 292, 62, 12);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = "bold 24px monospace";
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

    createRoleBadge("THE ADVOCATE", -4.5, 3.2, 0.6, "#10b981");
    createRoleBadge("CHIEF JUSTICE", 0, 3.9, -3.2, "#fbbf24");
    createRoleBadge("THE SKEPTIC", 4.5, 3.2, 0.6, "#f43f5e");

    // 1. Advocate (Standing at Left Counsel Table)
    const advocateChar = createCourtCharacter(
      "/chatdev/figures/counselor.png",
      -4.5,
      1.75,
      0.6,
      2.1
    );

    // 2. Chief Justice (Elevated behind High Bench)
    const judgeChar = createCourtCharacter(
      "/chatdev/figures/ceo.png",
      0,
      2.55,
      -3.2,
      2.3
    );

    // 3. Skeptic (Standing at Right Counsel Table)
    const skepticChar = createCourtCharacter(
      "/chatdev/figures/reviewer.png",
      4.5,
      1.75,
      0.6,
      2.1
    );

    // Clerk & Spectator Sprites in Courtroom
    createCourtCharacter("/chatdev/figures/designer.png", 4.2, 1.4, -3.6, 1.5);
    createCourtCharacter("/chatdev/figures/programmer.png", -4.2, 1.4, 5.2, 1.5);
    createCourtCharacter("/chatdev/figures/tester.png", 4.2, 1.4, 5.2, 1.5);

    // 16. ANIMATED REBUTTAL LASER / ARGUMENT PULSE BEAM
    const rebuttalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, 1.8, 0.6),
      new THREE.Vector3(-2.0, 2.8, -1.0),
      new THREE.Vector3(0, 2.5, -2.5),
      new THREE.Vector3(2.0, 2.8, -1.0),
      new THREE.Vector3(4.5, 1.8, 0.6),
    ]);
    const rebuttalGeo = new THREE.TubeGeometry(rebuttalCurve, 40, 0.05, 8, false);
    const rebuttalMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0,
    });
    const rebuttalBeam = new THREE.Mesh(rebuttalGeo, rebuttalMat);
    scene.add(rebuttalBeam);

    // 17. ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let shockwaveTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentTurn = activeTurnRef.current;

      controls.update();

      // Subtle breathing idle animation on characters
      advocateChar.sprite.position.y = 1.75 + Math.sin(elapsedTime * 2.8) * 0.04;
      judgeChar.sprite.position.y = 2.55 + Math.sin(elapsedTime * 2.2 + 1) * 0.03;
      skepticChar.sprite.position.y = 1.75 + Math.sin(elapsedTime * 2.8 + 2) * 0.04;

      // Spotlight intensity transitions based on active turn
      if (currentTurn === 1) {
        // Advocate speaks
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 6.5, 0.1);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 0.2, 0.1);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 0.4, 0.1);
        rebuttalMat.opacity = 0;
      } else if (currentTurn === 2) {
        // Skeptic rebuts Advocate
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 0.3, 0.1);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 6.5, 0.1);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 0.4, 0.1);

        // Pulsing Rebuttal Beam between tables
        rebuttalMat.opacity = 0.4 + Math.sin(elapsedTime * 8) * 0.35;
      } else if (currentTurn >= 3) {
        // Chief Justice renders verdict
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 0.5, 0.1);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 0.5, 0.1);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 8.5, 0.1);
        rebuttalMat.opacity = 0;

        // Animated Gavel Strike & Expanding Shockwave
        shockwaveTime += 0.02;
        const strikeCycle = (Math.sin(elapsedTime * 3) + 1) / 2;
        gavelGroup.rotation.x = -0.4 * strikeCycle;

        if (strikeCycle < 0.15) {
          shockwave.scale.set(1 + strikeCycle * 6, 1 + strikeCycle * 6, 1);
          shockwaveMat.opacity = 0.8 * (1 - strikeCycle * 4);
        } else {
          shockwaveMat.opacity = 0;
        }
      } else {
        // Chamber standby
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 1.2, 0.05);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 1.2, 0.05);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 2.0, 0.05);
        rebuttalMat.opacity = 0;
        gavelGroup.rotation.x = 0;
        shockwaveMat.opacity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 18. RESIZE HANDLER
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[590px] rounded-2xl overflow-hidden border border-[#3a2012] bg-[#0c0806] shadow-2xl select-none group">
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
                : "bg-[#231508]/95 border-amber-500/80 text-amber-200"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 uppercase tracking-widest text-[10px] font-bold">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-current" />
                {activeSpeakerRole === "advocate"
                  ? "Advocate — Counsel for Opportunity"
                  : activeSpeakerRole === "skeptic"
                  ? "Skeptic — Counsel for Caution"
                  : "Chief Justice — Supreme Verdict"}
              </span>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            </div>
            <p className="font-sans line-clamp-4 text-xs sm:text-sm text-slate-100">
              "{activeSpeakerText}"
            </p>
          </div>
        </div>
      )}

      {/* Top Camera Preset Buttons */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#170e08]/90 border border-[#4a2a16] p-1 rounded-lg font-mono text-[10px] text-amber-200/90 backdrop-blur z-20">
        <span className="text-amber-400 font-bold px-1.5 flex items-center gap-1">
          <Camera className="w-3 h-3" />
          Camera:
        </span>
        <button
          onClick={() => resetCamera("court")}
          className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-white transition-all border border-amber-900/40"
        >
          Full Chamber
        </button>
        <button
          onClick={() => resetCamera("judge")}
          className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-amber-300 transition-all border border-amber-900/40"
        >
          High Bench
        </button>
        <button
          onClick={() => resetCamera("advocate")}
          className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-emerald-300 transition-all border border-amber-900/40"
        >
          Advocate Bar
        </button>
        <button
          onClick={() => resetCamera("skeptic")}
          className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-rose-300 transition-all border border-amber-900/40"
        >
          Skeptic Bar
        </button>
      </div>

      {/* Bottom Hint Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 bg-[#170e08]/90 border border-[#4a2a16] px-3 py-1.5 rounded-lg font-mono text-[10px] text-amber-200/90 pointer-events-auto backdrop-blur">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>High Courtroom Chamber • Drag to Orbit / Scroll to Zoom / Gavel Strikes on Verdict</span>
        </div>

        <button
          onClick={() => resetCamera("court")}
          className="pointer-events-auto flex items-center gap-1 bg-[#170e08]/90 border border-[#4a2a16] px-2.5 py-1.5 rounded-lg font-mono text-[10px] text-amber-400 hover:text-amber-300 hover:bg-slate-900 transition-all"
          title="Reset Camera View"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset View</span>
        </button>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AgentTurn } from "@/lib/types";
import { Camera, RefreshCw, Eye, Scale } from "lucide-react";

interface ChatDev3DCourtroomProps {
  activeTurnIndex: number;
  turns: AgentTurn[];
}

/* ───────────────────────────────────────────────
 *  VOXEL HELPER: Build a pixel-art box with
 *  dark stroke outlines like a retro RPG
 * ─────────────────────────────────────────────── */
function voxelBox(
  w: number, h: number, d: number,
  color: number,
  opts?: { emissive?: number; emissiveIntensity?: number; metalness?: number; roughness?: number }
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts?.roughness ?? 0.65,
    metalness: opts?.metalness ?? 0.05,
    emissive: opts?.emissive ?? 0x000000,
    emissiveIntensity: opts?.emissiveIntensity ?? 0,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* ───────────────────────────────────────────────
 *  PIXEL CHARACTER BUILDER
 *  Builds a voxel-block character with head, body,
 *  arms, legs — all using flat-shaded boxes like
 *  Crossy Road / Minecraft style.
 * ─────────────────────────────────────────────── */
function createVoxelCharacter(
  bodyColor: number,
  accentColor: number,
  skinColor: number = 0xffcc99,
  hasGavel: boolean = false
): THREE.Group {
  const char = new THREE.Group();

  // HEAD (Cube)
  const head = voxelBox(0.5, 0.5, 0.5, skinColor, { roughness: 0.7 });
  head.position.y = 1.85;
  head.name = "head";
  char.add(head);

  // HAIR / Hat
  const hair = voxelBox(0.52, 0.18, 0.52, hasGavel ? 0x1a1a1a : accentColor === 0xf43f5e ? 0x8b4513 : 0x2c1810);
  hair.position.y = 2.15;
  char.add(hair);

  // EYES (Two tiny black cubes)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const eyeGeo = new THREE.BoxGeometry(0.08, 0.06, 0.05);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.12, 1.88, 0.26);
  char.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.12, 1.88, 0.26);
  char.add(rightEye);

  // MOUTH (small flat box)
  const mouth = voxelBox(0.14, 0.04, 0.04, 0x994433);
  mouth.position.set(0, 1.72, 0.26);
  mouth.name = "mouth";
  char.add(mouth);

  // BODY (Torso)
  const body = voxelBox(0.6, 0.7, 0.35, bodyColor);
  body.position.y = 1.3;
  char.add(body);

  // COLLAR / TIE ACCENT
  const collar = voxelBox(0.2, 0.12, 0.06, accentColor);
  collar.position.set(0, 1.58, 0.2);
  char.add(collar);

  // LEFT ARM
  const leftArm = voxelBox(0.18, 0.6, 0.18, bodyColor);
  leftArm.position.set(-0.42, 1.28, 0);
  leftArm.name = "leftArm";
  // Pivot at top
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.42, 1.58, 0);
  leftArm.position.set(0, -0.3, 0);
  leftArmPivot.add(leftArm);
  leftArmPivot.name = "leftArmPivot";
  char.add(leftArmPivot);

  // RIGHT ARM
  const rightArm = voxelBox(0.18, 0.6, 0.18, bodyColor);
  rightArm.name = "rightArm";
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.42, 1.58, 0);
  rightArm.position.set(0, -0.3, 0);
  rightArmPivot.add(rightArm);
  rightArmPivot.name = "rightArmPivot";
  char.add(rightArmPivot);

  // GAVEL (for Judge)
  if (hasGavel) {
    const gavelHandle = voxelBox(0.06, 0.35, 0.06, 0x8b4513);
    gavelHandle.position.set(0, -0.45, 0.12);
    const gavelHead = voxelBox(0.22, 0.1, 0.1, 0x5c3317);
    gavelHead.position.set(0, -0.65, 0.12);
    rightArmPivot.add(gavelHandle);
    rightArmPivot.add(gavelHead);
  }

  // LEFT LEG
  const leftLeg = voxelBox(0.2, 0.55, 0.22, 0x1a1a2e);
  leftLeg.position.set(-0.15, 0.62, 0);
  leftLeg.name = "leftLeg";
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.15, 0.9, 0);
  leftLeg.position.set(0, -0.28, 0);
  leftLegPivot.add(leftLeg);
  leftLegPivot.name = "leftLegPivot";
  char.add(leftLegPivot);

  // RIGHT LEG
  const rightLeg = voxelBox(0.2, 0.55, 0.22, 0x1a1a2e);
  rightLeg.name = "rightLeg";
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.15, 0.9, 0);
  rightLeg.position.set(0, -0.28, 0);
  rightLegPivot.add(rightLeg);
  rightLegPivot.name = "rightLegPivot";
  char.add(rightLegPivot);

  // SHOES
  const leftShoe = voxelBox(0.22, 0.1, 0.28, 0x1a1000);
  leftShoe.position.set(-0.15, 0.33, 0.03);
  char.add(leftShoe);
  const rightShoe = voxelBox(0.22, 0.1, 0.28, 0x1a1000);
  rightShoe.position.set(0.15, 0.33, 0.03);
  char.add(rightShoe);

  return char;
}

/* ───────────────────────────────────────────────
 *  SPEECH BUBBLE (3D floating bubble over head)
 * ─────────────────────────────────────────────── */
function createSpeechBubble(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 180;
  const ctx = canvas.getContext("2d")!;

  // Background rounded rect
  ctx.fillStyle = "rgba(15, 15, 25, 0.95)";
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 140, 20);
  ctx.fill();

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 140, 20);
  ctx.stroke();

  // Tail triangle
  ctx.fillStyle = "rgba(15, 15, 25, 0.95)";
  ctx.beginPath();
  ctx.moveTo(230, 148);
  ctx.lineTo(256, 175);
  ctx.lineTo(282, 148);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(233, 148);
  ctx.lineTo(256, 172);
  ctx.lineTo(279, 148);
  ctx.stroke();

  // Text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Word wrap
  const words = text.split(" ");
  let lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    if (ctx.measureText(testLine).width > 460) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  lines = lines.slice(0, 3); // Max 3 lines

  const lineHeight = 32;
  const startY = 78 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, 256, startY + i * lineHeight, 470);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.2, 1.15, 1);
  sprite.visible = false;
  return sprite;
}

/* ───────────────────────────────────────────────
 *  EXCLAMATION / REACTION PARTICLES
 * ─────────────────────────────────────────────── */
function createReactionBurst(color: number): THREE.Points {
  const count = 12;
  const positions = new Float32Array(count * 3);
  const velocities: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        Math.random() * 0.06 + 0.03,
        (Math.random() - 0.5) * 0.08
      )
    );
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: 0.12,
    transparent: true,
    opacity: 0,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  (points as any).__velocities = velocities;
  (points as any).__life = 0;
  points.visible = false;
  return points;
}

export function ChatDev3DCourtroom({ activeTurnIndex, turns }: ChatDev3DCourtroomProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeTurnRef = useRef(activeTurnIndex);
  activeTurnRef.current = activeTurnIndex;
  const turnsRef = useRef(turns);
  turnsRef.current = turns;

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const speechBubblesRef = useRef<{
    advocate: THREE.Sprite;
    skeptic: THREE.Sprite;
    judge: THREE.Sprite;
  } | null>(null);

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
      cam.position.set(0, 8, 12);
      ctrl.target.set(0, 2.0, 0);
    } else if (preset === "judge") {
      cam.position.set(0, 5.5, 3);
      ctrl.target.set(0, 3.2, -4);
    } else if (preset === "advocate") {
      cam.position.set(-3, 4.5, 6);
      ctrl.target.set(-4, 2.0, 1);
    } else if (preset === "skeptic") {
      cam.position.set(3, 4.5, 6);
      ctrl.target.set(4, 2.0, 1);
    }
    ctrl.update();
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ═══════════════════════════════════════════
    //  1. SCENE
    // ═══════════════════════════════════════════
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0810);
    scene.fog = new THREE.FogExp2(0x0a0810, 0.018);

    // ═══════════════════════════════════════════
    //  2. CAMERA
    // ═══════════════════════════════════════════
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 8, 12);
    cameraRef.current = camera;

    // ═══════════════════════════════════════════
    //  3. RENDERER
    // ═══════════════════════════════════════════
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Slightly pixelated
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ═══════════════════════════════════════════
    //  4. ORBIT CONTROLS
    // ═══════════════════════════════════════════
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 4;
    controls.maxDistance = 25;
    controls.target.set(0, 2.0, 0);
    controlsRef.current = controls;

    // ═══════════════════════════════════════════
    //  5. LIGHTING — Dramatic Pixel Courtroom
    // ═══════════════════════════════════════════
    // Ambient (very dim — courtroom drama)
    const ambient = new THREE.AmbientLight(0xffe8cc, 0.35);
    scene.add(ambient);

    // Main overhead warm light (chandelier)
    const mainLight = new THREE.PointLight(0xffddaa, 3.5, 30, 1.2);
    mainLight.position.set(0, 9, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Side window light (cool moonlight from left)
    const windowLight = new THREE.DirectionalLight(0xaaccff, 0.8);
    windowLight.position.set(-15, 10, 5);
    windowLight.castShadow = true;
    windowLight.shadow.mapSize.width = 1024;
    windowLight.shadow.mapSize.height = 1024;
    scene.add(windowLight);

    // Dynamic spotlights for each agent
    const advocateSpot = new THREE.SpotLight(0x10b981, 0, 18, Math.PI / 5, 0.4);
    advocateSpot.position.set(-4, 8, 2);
    advocateSpot.target.position.set(-4, 1.5, 1);
    scene.add(advocateSpot);
    scene.add(advocateSpot.target);

    const skepticSpot = new THREE.SpotLight(0xf43f5e, 0, 18, Math.PI / 5, 0.4);
    skepticSpot.position.set(4, 8, 2);
    skepticSpot.target.position.set(4, 1.5, 1);
    scene.add(skepticSpot);
    scene.add(skepticSpot.target);

    const judgeSpot = new THREE.SpotLight(0xfbbf24, 0, 22, Math.PI / 4, 0.3);
    judgeSpot.position.set(0, 9, -2);
    judgeSpot.target.position.set(0, 3, -4.5);
    scene.add(judgeSpot);
    scene.add(judgeSpot.target);

    // ═══════════════════════════════════════════
    //  6. VOXEL COURTROOM ARCHITECTURE
    // ═══════════════════════════════════════════
    const court = new THREE.Group();

    // ── FLOOR ──
    // Checkerboard voxel floor (pixel-art style)
    const floorSize = 22;
    const tileSize = 1;
    for (let x = -floorSize / 2; x < floorSize / 2; x += tileSize) {
      for (let z = -floorSize / 2; z < floorSize / 2; z += tileSize) {
        const isDark = (Math.abs(Math.floor(x)) + Math.abs(Math.floor(z))) % 2 === 0;
        const tile = voxelBox(tileSize * 0.98, 0.2, tileSize * 0.98,
          isDark ? 0x2a1a0e : 0x3d2516, { roughness: 0.7 }
        );
        tile.position.set(x + tileSize / 2, -0.1, z + tileSize / 2);
        tile.receiveShadow = true;
        tile.castShadow = false;
        court.add(tile);
      }
    }

    // ── WALLS ── (Thick voxel walls with wainscoting)
    // Back wall
    const backWall = voxelBox(20, 10, 0.6, 0x161016);
    backWall.position.set(0, 4.8, -9);
    court.add(backWall);
    // Wainscot strip
    const backWainscot = voxelBox(20, 3, 0.65, 0x2e190e);
    backWainscot.position.set(0, 1.5, -8.98);
    court.add(backWainscot);
    // Gold trim
    const backTrim = voxelBox(20, 0.15, 0.7, 0xd4af37, { metalness: 0.7, roughness: 0.3 });
    backTrim.position.set(0, 3.05, -8.96);
    court.add(backTrim);

    // Left wall
    const leftWall = voxelBox(0.6, 10, 20, 0x161016);
    leftWall.position.set(-10, 4.8, 0);
    court.add(leftWall);
    const leftWainscot = voxelBox(0.65, 3, 20, 0x2e190e);
    leftWainscot.position.set(-9.98, 1.5, 0);
    court.add(leftWainscot);

    // Right wall
    const rightWall = voxelBox(0.6, 10, 20, 0x161016);
    rightWall.position.set(10, 4.8, 0);
    court.add(rightWall);
    const rightWainscot = voxelBox(0.65, 3, 20, 0x2e190e);
    rightWainscot.position.set(9.98, 1.5, 0);
    court.add(rightWainscot);

    // ── ARCHED WINDOWS (Left wall — pixel art stained glass) ──
    [-3, 0, 3].forEach((wz) => {
      // Window frame
      const frame = voxelBox(0.12, 3.5, 1.8, 0x3d2112, { roughness: 0.4 });
      frame.position.set(-9.6, 4.5, wz);
      court.add(frame);
      // Stained glass pane (emissive glow)
      const glass = voxelBox(0.08, 3, 1.4, 0x3377aa, {
        emissive: 0x3377aa,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        metalness: 0.3,
      });
      glass.position.set(-9.55, 4.5, wz);
      court.add(glass);
      // Cross bars
      const hBar = voxelBox(0.14, 0.1, 1.8, 0x4a2816);
      hBar.position.set(-9.6, 4.5, wz);
      court.add(hBar);
      const vBar = voxelBox(0.14, 3.5, 0.1, 0x4a2816);
      vBar.position.set(-9.6, 4.5, wz);
      court.add(vBar);

      // Light beam from each window
      const beam = new THREE.SpotLight(0xaabbdd, 0.4, 14, Math.PI / 6, 0.6);
      beam.position.set(-9, 5.5, wz);
      beam.target.position.set(-2, 0, wz);
      scene.add(beam);
      scene.add(beam.target);
    });

    // ── JUDICIAL CREST / SEAL (Back wall, behind judge) ──
    const createSealTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      // Circular dark background
      ctx.fillStyle = "#1a0e08";
      ctx.fillRect(0, 0, 512, 512);

      // Gold circle border
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(256, 256, 210, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.strokeStyle = "#996515";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(256, 256, 190, 0, Math.PI * 2);
      ctx.stroke();

      // Scales of Justice
      ctx.fillStyle = "#d4af37";
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";

      // Central pillar
      ctx.beginPath(); ctx.moveTo(256, 120); ctx.lineTo(256, 330); ctx.stroke();

      // Top beam
      ctx.beginPath(); ctx.moveTo(160, 170); ctx.lineTo(352, 170); ctx.stroke();

      // Finial
      ctx.beginPath(); ctx.arc(256, 115, 14, 0, Math.PI * 2); ctx.fill();

      // Left pan
      ctx.beginPath(); ctx.moveTo(170, 172); ctx.lineTo(140, 240); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(170, 172); ctx.lineTo(200, 240); ctx.stroke();
      ctx.beginPath(); ctx.arc(170, 246, 35, 0, Math.PI); ctx.fill();

      // Right pan
      ctx.beginPath(); ctx.moveTo(342, 172); ctx.lineTo(312, 240); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(342, 172); ctx.lineTo(372, 240); ctx.stroke();
      ctx.beginPath(); ctx.arc(342, 246, 35, 0, Math.PI); ctx.fill();

      // Base pedestal
      ctx.fillRect(216, 325, 80, 18);
      ctx.fillRect(200, 340, 112, 14);

      // Text
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 28px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("LEX ET MEMORIA", 256, 405);

      ctx.fillStyle = "#ca8a04";
      ctx.font = "bold 14px monospace";
      ctx.fillText("CHAMBER OF CONSCIENCE", 256, 435);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      return tex;
    };

    const sealPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshStandardMaterial({
        map: createSealTexture(),
        roughness: 0.4,
        metalness: 0.25,
        emissive: 0x443311,
        emissiveIntensity: 0.15,
      })
    );
    sealPlane.position.set(0, 5.8, -8.65);
    court.add(sealPlane);

    // ── JUDGE'S ELEVATED DAIS (3-Tier Voxel Platform) ──
    const dais1 = voxelBox(9, 0.4, 4.5, 0x2a170d);
    dais1.position.set(0, 0.2, -5.5);
    court.add(dais1);

    const dais2 = voxelBox(7.8, 0.4, 3.6, 0x351d10);
    dais2.position.set(0, 0.6, -5.8);
    court.add(dais2);

    const dais3 = voxelBox(6.5, 0.35, 2.8, 0x402515);
    dais3.position.set(0, 0.95, -6);
    court.add(dais3);

    // ── JUDGE'S BENCH (High voxel desk) ──
    const benchFront = voxelBox(5.5, 1.8, 0.4, 0x3d2112);
    benchFront.position.set(0, 2.0, -4.8);
    court.add(benchFront);

    // Bench sides
    const benchLeft = voxelBox(0.4, 1.8, 2.5, 0x3d2112);
    benchLeft.position.set(-2.75, 2.0, -5.8);
    court.add(benchLeft);
    const benchRight = voxelBox(0.4, 1.8, 2.5, 0x3d2112);
    benchRight.position.set(2.75, 2.0, -5.8);
    court.add(benchRight);

    // Bench top surface
    const benchTop = voxelBox(5.9, 0.15, 2.9, 0x4a2816);
    benchTop.position.set(0, 2.95, -5.8);
    court.add(benchTop);

    // Decorative panels on front of bench
    [-1.6, 0, 1.6].forEach((px) => {
      const panel = voxelBox(1.2, 1.2, 0.08, 0x27140b);
      panel.position.set(px, 1.7, -4.56);
      court.add(panel);
      // Gold inlay
      const inlay = voxelBox(0.8, 0.8, 0.1, 0xd4af37, { metalness: 0.6, roughness: 0.3 });
      inlay.position.set(px, 1.7, -4.54);
      court.add(inlay);
    });

    // Gold trim on bench
    const benchTrim = voxelBox(5.6, 0.12, 0.45, 0xd4af37, { metalness: 0.7, roughness: 0.25 });
    benchTrim.position.set(0, 2.92, -4.78);
    court.add(benchTrim);

    // ── GAVEL & SOUND BLOCK on bench ──
    const soundBlock = voxelBox(0.5, 0.12, 0.5, 0x241208);
    soundBlock.position.set(-1.2, 3.05, -5.5);
    court.add(soundBlock);

    const gavelOnDesk = new THREE.Group();
    gavelOnDesk.position.set(-1.2, 3.12, -5.5);
    const gavelHeadDesk = voxelBox(0.35, 0.12, 0.12, 0x5c3317);
    gavelOnDesk.add(gavelHeadDesk);
    const gavelHandleDesk = voxelBox(0.08, 0.08, 0.4, 0x8b4513);
    gavelHandleDesk.position.set(0, 0, 0.15);
    gavelOnDesk.add(gavelHandleDesk);
    // Brass rings
    const brassRing = voxelBox(0.38, 0.04, 0.04, 0xd4af37, { metalness: 0.8, roughness: 0.2 });
    brassRing.position.set(0, 0, -0.06);
    gavelOnDesk.add(brassRing);
    gavelOnDesk.rotation.y = 0.4;
    court.add(gavelOnDesk);

    // ── GAVEL STRIKE SHOCKWAVE ──
    const shockwaveGeo = new THREE.RingGeometry(0.15, 0.35, 24);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwave.rotation.x = -Math.PI / 2;
    shockwave.position.set(-1.2, 3.15, -5.5);
    court.add(shockwave);

    // ── JUDGE'S HIGH-BACK CHAIR ──
    const chairSeat = voxelBox(1.0, 0.15, 0.8, 0x8b0000);
    chairSeat.position.set(0, 1.25, -6.5);
    court.add(chairSeat);
    const chairBack = voxelBox(1.0, 2.2, 0.2, 0x8b0000);
    chairBack.position.set(0, 2.35, -6.9);
    court.add(chairBack);
    // Chair gold trim
    const chairTrim = voxelBox(1.05, 0.1, 0.22, 0xd4af37, { metalness: 0.7 });
    chairTrim.position.set(0, 3.5, -6.9);
    court.add(chairTrim);

    // ── COUNSEL TABLES (Advocate Left, Skeptic Right) ──
    const createCounselTable = (x: number, z: number, color: number) => {
      const g = new THREE.Group();
      // Table top
      const top = voxelBox(3.2, 0.18, 1.5, 0x381f12);
      top.position.set(x, 1.25, z);
      g.add(top);
      // Legs (4 voxel pillars)
      [[-1.3, -0.55], [1.3, -0.55], [-1.3, 0.55], [1.3, 0.55]].forEach(([lx, lz]) => {
        const leg = voxelBox(0.2, 1.15, 0.2, 0x27140b);
        leg.position.set(x + lx, 0.58, z + lz);
        g.add(leg);
      });
      // Front modesty panel
      const modesty = voxelBox(2.8, 0.7, 0.12, 0x27140b);
      modesty.position.set(x, 0.75, z + 0.65);
      g.add(modesty);
      // Accent trim
      const trim = voxelBox(3.25, 0.08, 1.55, color, { emissive: color, emissiveIntensity: 0.15, metalness: 0.3 });
      trim.position.set(x, 1.35, z);
      g.add(trim);

      // Law books stack
      const books = voxelBox(0.6, 0.3, 0.4, 0x7f1d1d);
      books.position.set(x + 1.0, 1.5, z - 0.3);
      g.add(books);
      const books2 = voxelBox(0.55, 0.15, 0.35, 0x1e3a5f);
      books2.position.set(x + 1.0, 1.72, z - 0.3);
      g.add(books2);

      // Legal pad
      const pad = voxelBox(0.4, 0.04, 0.55, 0xfef9c3, { roughness: 0.9 });
      pad.position.set(x - 0.3, 1.36, z + 0.1);
      g.add(pad);

      // Banker's lamp
      const lampBase = voxelBox(0.2, 0.06, 0.2, 0xd4af37, { metalness: 0.8 });
      lampBase.position.set(x - 1.0, 1.37, z - 0.3);
      g.add(lampBase);
      const lampStem = voxelBox(0.06, 0.35, 0.06, 0xd4af37, { metalness: 0.8 });
      lampStem.position.set(x - 1.0, 1.55, z - 0.3);
      g.add(lampStem);
      const lampShade = voxelBox(0.35, 0.15, 0.2, color, {
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      lampShade.position.set(x - 1.0, 1.78, z - 0.3);
      g.add(lampShade);
      // Lamp glow
      const lampLight = new THREE.PointLight(color === 0x10b981 ? 0x88ffcc : 0xff8899, 0.6, 4);
      lampLight.position.set(x - 1.0, 1.9, z - 0.3);
      g.add(lampLight);

      return g;
    };

    const advocateTableGroup = createCounselTable(-4, 1, 0x10b981);
    court.add(advocateTableGroup);
    const skepticTableGroup = createCounselTable(4, 1, 0xf43f5e);
    court.add(skepticTableGroup);

    // ── COURT BAR RAILING (Divides well from gallery) ──
    const barZ = 4.5;
    // Left bar
    const barLeft = voxelBox(5.5, 1.0, 0.2, 0x3a1f12);
    barLeft.position.set(-4.5, 0.5, barZ);
    court.add(barLeft);
    // Right bar
    const barRight = voxelBox(5.5, 1.0, 0.2, 0x3a1f12);
    barRight.position.set(4.5, 0.5, barZ);
    court.add(barRight);
    // Gate posts
    [-1.5, 1.5].forEach((gx) => {
      const post = voxelBox(0.3, 1.3, 0.3, 0x4a2816);
      post.position.set(gx, 0.65, barZ);
      court.add(post);
      // Gold cap
      const cap = voxelBox(0.35, 0.1, 0.35, 0xd4af37, { metalness: 0.7 });
      cap.position.set(gx, 1.35, barZ);
      court.add(cap);
    });
    // Spindles
    for (let sx = -7; sx <= 7; sx += 0.8) {
      if (Math.abs(sx) > 1.5) {
        const spindle = voxelBox(0.08, 0.85, 0.08, 0x4a2816);
        spindle.position.set(sx, 0.42, barZ);
        court.add(spindle);
      }
    }
    // Top rail
    const topRail = voxelBox(16, 0.12, 0.25, 0x4a2816);
    topRail.position.set(0, 0.92, barZ);
    court.add(topRail);

    // ── SPECTATOR PEWS (Behind the bar) ──
    [6.5, 8].forEach((pz) => {
      [-4, 4].forEach((px) => {
        const pewSeat = voxelBox(5.0, 0.15, 0.6, 0x2b170c);
        pewSeat.position.set(px, 0.55, pz);
        court.add(pewSeat);
        const pewBack = voxelBox(5.0, 0.7, 0.12, 0x2b170c);
        pewBack.position.set(px, 0.95, pz + 0.3);
        court.add(pewBack);
        // Pew legs
        [-2.2, 0, 2.2].forEach((lx) => {
          const pewLeg = voxelBox(0.12, 0.5, 0.5, 0x1f1008);
          pewLeg.position.set(px + lx, 0.25, pz);
          court.add(pewLeg);
        });
      });
    });

    // ── CARPET RUNNER (Royal burgundy & gold) ──
    const runner = voxelBox(2.5, 0.05, 14, 0x5c0e18);
    runner.position.set(0, 0.03, 1);
    court.add(runner);
    // Runner gold edges
    const runnerEdgeL = voxelBox(0.12, 0.06, 14, 0xd4af37, { metalness: 0.6 });
    runnerEdgeL.position.set(-1.3, 0.04, 1);
    court.add(runnerEdgeL);
    const runnerEdgeR = voxelBox(0.12, 0.06, 14, 0xd4af37, { metalness: 0.6 });
    runnerEdgeR.position.set(1.3, 0.04, 1);
    court.add(runnerEdgeR);

    // ── BRASS CHANDELIERS ──
    const createChandelier = (cx: number, cy: number, cz: number) => {
      const ch = new THREE.Group();
      // Chain
      const chain = voxelBox(0.06, 2.5, 0.06, 0xd4af37, { metalness: 0.8 });
      chain.position.set(cx, cy + 1.25, cz);
      ch.add(chain);
      // Hoop
      const hoopSegments = 12;
      for (let i = 0; i < hoopSegments; i++) {
        const angle = (i / hoopSegments) * Math.PI * 2;
        const hx = Math.cos(angle) * 1.2;
        const hz = Math.sin(angle) * 1.2;
        const seg = voxelBox(0.15, 0.15, 0.15, 0xd4af37, { metalness: 0.85, roughness: 0.2 });
        seg.position.set(cx + hx, cy, cz + hz);
        ch.add(seg);
      }
      // Candles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const fx = Math.cos(angle) * 1.2;
        const fz = Math.sin(angle) * 1.2;
        // Candle body
        const candle = voxelBox(0.08, 0.2, 0.08, 0xfff5db);
        candle.position.set(cx + fx, cy + 0.18, cz + fz);
        ch.add(candle);
        // Flame
        const flame = voxelBox(0.06, 0.1, 0.06, 0xf59e0b, {
          emissive: 0xf59e0b,
          emissiveIntensity: 2.0,
        });
        flame.position.set(cx + fx, cy + 0.33, cz + fz);
        flame.name = `flame_${i}`;
        ch.add(flame);
      }
      // Warm chandelier light
      const cLight = new THREE.PointLight(0xffdfa9, 1.5, 12);
      cLight.position.set(cx, cy, cz);
      ch.add(cLight);

      return ch;
    };

    court.add(createChandelier(-4, 7.5, -1));
    court.add(createChandelier(4, 7.5, -1));
    court.add(createChandelier(0, 8, 5));

    scene.add(court);

    // ═══════════════════════════════════════════
    //  7. VOXEL CHARACTERS (3 Agents)
    // ═══════════════════════════════════════════

    // ADVOCATE (Emerald suit, standing at left counsel table)
    const advocate = createVoxelCharacter(0x064e3b, 0x10b981, 0xffcc99, false);
    advocate.position.set(-4, 0, 2.2);
    advocate.rotation.y = 0.3; // Slightly facing center
    scene.add(advocate);

    // SKEPTIC (Dark crimson suit, standing at right counsel table)
    const skeptic = createVoxelCharacter(0x7f1d1d, 0xf43f5e, 0xf5d0a9, false);
    skeptic.position.set(4, 0, 2.2);
    skeptic.rotation.y = -0.3; // Slightly facing center
    scene.add(skeptic);

    // CHIEF JUSTICE (Black robes, elevated behind bench, with gavel)
    const judge = createVoxelCharacter(0x1a1a1a, 0xfbbf24, 0xffddbb, true);
    judge.position.set(0, 1.15, -6.0);
    scene.add(judge);

    // ── SPEECH BUBBLES (3D floating, per-character) ──
    const advocateBubble = createSpeechBubble("", "#10b981");
    advocateBubble.position.set(-4, 3.8, 2.2);
    scene.add(advocateBubble);

    const skepticBubble = createSpeechBubble("", "#f43f5e");
    skepticBubble.position.set(4, 3.8, 2.2);
    scene.add(skepticBubble);

    const judgeBubble = createSpeechBubble("", "#fbbf24");
    judgeBubble.position.set(0, 5.0, -6.0);
    scene.add(judgeBubble);

    speechBubblesRef.current = {
      advocate: advocateBubble,
      skeptic: skepticBubble,
      judge: judgeBubble,
    };

    // ── ROLE LABEL BADGES ──
    const createLabel = (text: string, x: number, y: number, z: number, color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 350;
      canvas.height = 60;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "rgba(10, 8, 16, 0.9)";
      ctx.beginPath();
      ctx.roundRect(4, 4, 342, 52, 10);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(4, 4, 342, 52, 10);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 175, 32);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      spr.position.set(x, y, z);
      spr.scale.set(1.8, 0.32, 1);
      scene.add(spr);
      return spr;
    };

    createLabel("⚖ THE ADVOCATE", -4, 3.2, 2.2, "#10b981");
    createLabel("⚖ THE SKEPTIC", 4, 3.2, 2.2, "#f43f5e");
    createLabel("👨‍⚖️ CHIEF JUSTICE", 0, 4.4, -6.0, "#fbbf24");

    // ── REACTION PARTICLE BURSTS ──
    const advocateParticles = createReactionBurst(0x10b981);
    advocateParticles.position.set(-4, 2.8, 2.2);
    scene.add(advocateParticles);

    const skepticParticles = createReactionBurst(0xf43f5e);
    skepticParticles.position.set(4, 2.8, 2.2);
    scene.add(skepticParticles);

    const judgeParticles = createReactionBurst(0xfbbf24);
    judgeParticles.position.set(0, 4.2, -6.0);
    scene.add(judgeParticles);

    // ── ARGUMENT ARC BEAM (Pulsing between advocate ↔ skeptic) ──
    const arcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 2.5, 2.2),
      new THREE.Vector3(-1.5, 3.8, 0),
      new THREE.Vector3(0, 4.0, -1),
      new THREE.Vector3(1.5, 3.8, 0),
      new THREE.Vector3(4, 2.5, 2.2),
    ]);
    const arcGeo = new THREE.TubeGeometry(arcCurve, 50, 0.04, 6, false);
    const arcMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0 });
    const arcBeam = new THREE.Mesh(arcGeo, arcMat);
    scene.add(arcBeam);

    // ── FLOATING DUST PARTICLES ──
    const dustCount = 150;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 18;
      dustPositions[i * 3 + 1] = Math.random() * 9;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffdfa9,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // ═══════════════════════════════════════════
    //  8. ANIMATION LOOP
    // ═══════════════════════════════════════════
    let frameId: number;
    const clock = new THREE.Clock();
    let prevTurn = -1;
    let gavelStrikePhase = 0;
    let bubbleUpdateNeeded = true;

    const animateParticleBurst = (pts: THREE.Points) => {
      const data = pts as any;
      if (data.__life > 0) {
        data.__life -= 0.02;
        const mat = pts.material as THREE.PointsMaterial;
        mat.opacity = Math.max(0, data.__life);

        const pos = (pts.geometry.getAttribute("position") as THREE.BufferAttribute);
        const vels = data.__velocities as THREE.Vector3[];
        for (let i = 0; i < vels.length; i++) {
          pos.array[i * 3] += vels[i].x;
          pos.array[i * 3 + 1] += vels[i].y;
          pos.array[i * 3 + 2] += vels[i].z;
          vels[i].y -= 0.001; // gravity
        }
        pos.needsUpdate = true;

        if (data.__life <= 0) {
          pts.visible = false;
        }
      }
    };

    const triggerBurst = (pts: THREE.Points) => {
      const data = pts as any;
      data.__life = 1.0;
      pts.visible = true;
      (pts.material as THREE.PointsMaterial).opacity = 1;
      const pos = (pts.geometry.getAttribute("position") as THREE.BufferAttribute);
      const vels = data.__velocities as THREE.Vector3[];
      for (let i = 0; i < vels.length; i++) {
        pos.array[i * 3] = 0;
        pos.array[i * 3 + 1] = 0;
        pos.array[i * 3 + 2] = 0;
        vels[i].set(
          (Math.random() - 0.5) * 0.1,
          Math.random() * 0.08 + 0.04,
          (Math.random() - 0.5) * 0.1
        );
      }
      pos.needsUpdate = true;
    };

    const updateSpeechBubble = (sprite: THREE.Sprite, text: string, color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 180;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "rgba(15, 15, 25, 0.93)";
      ctx.beginPath();
      ctx.roundRect(8, 8, 496, 140, 20);
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(8, 8, 496, 140, 20);
      ctx.stroke();

      // Tail
      ctx.fillStyle = "rgba(15, 15, 25, 0.93)";
      ctx.beginPath();
      ctx.moveTo(230, 148); ctx.lineTo(256, 175); ctx.lineTo(282, 148);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(233, 148); ctx.lineTo(256, 172); ctx.lineTo(279, 148);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const words = text.split(" ");
      let lines: string[] = [];
      let cur = "";
      for (const word of words) {
        const test = cur + (cur ? " " : "") + word;
        if (ctx.measureText(test).width > 440) {
          lines.push(cur);
          cur = word;
        } else {
          cur = test;
        }
      }
      lines.push(cur);
      lines = lines.slice(0, 3);
      if (text.length > 120) {
        lines[lines.length - 1] = lines[lines.length - 1].substring(0, 40) + "…";
      }

      const lh = 30;
      const sy = 78 - ((lines.length - 1) * lh) / 2;
      lines.forEach((line, i) => ctx.fillText(line, 256, sy + i * lh, 470));

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      (sprite.material as THREE.SpriteMaterial).map?.dispose();
      (sprite.material as THREE.SpriteMaterial).map = tex;
      (sprite.material as THREE.SpriteMaterial).needsUpdate = true;
      sprite.visible = true;
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const turn = activeTurnRef.current;
      const currentTurns = turnsRef.current;

      controls.update();

      // ── IDLE BREATHING for all characters ──
      const breathA = Math.sin(t * 2.5) * 0.02;
      const breathS = Math.sin(t * 2.5 + 1.2) * 0.02;
      const breathJ = Math.sin(t * 2.0 + 0.5) * 0.015;

      advocate.position.y = breathA;
      skeptic.position.y = breathS;
      judge.position.y = 1.15 + breathJ;

      // ── ARM GESTURE ANIMATIONS ──
      const advLeftArm = advocate.getObjectByName("leftArmPivot") as THREE.Group;
      const advRightArm = advocate.getObjectByName("rightArmPivot") as THREE.Group;
      const skpLeftArm = skeptic.getObjectByName("leftArmPivot") as THREE.Group;
      const skpRightArm = skeptic.getObjectByName("rightArmPivot") as THREE.Group;
      const jdgRightArm = judge.getObjectByName("rightArmPivot") as THREE.Group;
      const jdgLeftArm = judge.getObjectByName("leftArmPivot") as THREE.Group;

      // ── Detect turn changes for reactions ──
      if (turn !== prevTurn) {
        prevTurn = turn;
        bubbleUpdateNeeded = true;

        // Trigger particle burst on the active speaker
        if (turn === 1) triggerBurst(advocateParticles);
        else if (turn === 2) triggerBurst(skepticParticles);
        else if (turn >= 3) triggerBurst(judgeParticles);
      }

      // ── Update speech bubbles ──
      if (bubbleUpdateNeeded && currentTurns.length > 0) {
        bubbleUpdateNeeded = false;

        // Hide all bubbles first
        advocateBubble.visible = false;
        skepticBubble.visible = false;
        judgeBubble.visible = false;

        if (turn >= 1 && currentTurns[0]) {
          updateSpeechBubble(advocateBubble, currentTurns[0].content, "#10b981");
        }
        if (turn >= 2 && currentTurns[1]) {
          updateSpeechBubble(skepticBubble, currentTurns[1].content, "#f43f5e");
        }
        if (turn >= 3 && currentTurns[2]) {
          updateSpeechBubble(judgeBubble, currentTurns[2].content, "#fbbf24");
        }
      }

      // ── TURN-BASED ANIMATIONS ──
      if (turn === 1) {
        // ADVOCATE SPEAKING — gestures wildly, faces forward
        advocate.rotation.y = 0.3 + Math.sin(t * 4) * 0.08;
        if (advRightArm) advRightArm.rotation.x = Math.sin(t * 5) * 0.6 - 0.3;
        if (advLeftArm) advLeftArm.rotation.x = Math.sin(t * 4.3 + 1) * 0.4 - 0.15;

        // Mouth opens and closes (talking)
        const advMouth = advocate.getObjectByName("mouth") as THREE.Mesh;
        if (advMouth) advMouth.scale.y = 1 + Math.abs(Math.sin(t * 12)) * 1.5;

        // Skeptic crosses arms (listening, annoyed)
        skeptic.rotation.y = -0.5; // Turns slightly away
        if (skpLeftArm) skpLeftArm.rotation.x = -0.5;
        if (skpRightArm) skpRightArm.rotation.x = -0.5;

        // Judge watches impassively
        judge.rotation.y = -0.15; // Looks at advocate

        // Spotlights
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 8, 0.08);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 0.2, 0.08);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 1.0, 0.08);

        // Speech bubble bob
        advocateBubble.position.y = 3.8 + Math.sin(t * 3) * 0.08;

        arcMat.opacity = 0;

      } else if (turn === 2) {
        // SKEPTIC REBUTS — aggressive pointing, faces advocate
        skeptic.rotation.y = -0.3 + Math.sin(t * 3.5) * 0.1;
        if (skpRightArm) skpRightArm.rotation.x = -0.8 + Math.sin(t * 6) * 0.3; // Pointing gesture
        if (skpLeftArm) skpLeftArm.rotation.x = Math.sin(t * 4.5 + 0.8) * 0.3 - 0.2;

        // Skeptic mouth
        const skpMouth = skeptic.getObjectByName("mouth") as THREE.Mesh;
        if (skpMouth) skpMouth.scale.y = 1 + Math.abs(Math.sin(t * 14)) * 1.5;

        // Advocate recoils (defensive)
        advocate.rotation.y = 0.6; // Faces skeptic
        if (advRightArm) advRightArm.rotation.x = -0.2;
        if (advLeftArm) advLeftArm.rotation.x = Math.sin(t * 2) * 0.15 - 0.1;

        // Judge looks at skeptic
        judge.rotation.y = 0.15;

        // Spotlights
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 0.3, 0.08);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 8, 0.08);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 1.0, 0.08);

        skepticBubble.position.y = 3.8 + Math.sin(t * 3) * 0.08;

        // Pulsing argument arc beam
        arcMat.opacity = 0.35 + Math.sin(t * 8) * 0.3;
        arcMat.color.setHex(0xf43f5e);

      } else if (turn >= 3) {
        // JUDGE DELIVERS VERDICT — gavel strike
        judge.rotation.y = Math.sin(t * 0.5) * 0.05; // Slow regal head turn

        // Gavel strike animation
        gavelStrikePhase += 0.04;
        if (jdgRightArm) {
          const strikeAngle = Math.sin(gavelStrikePhase * 3) * 0.8;
          jdgRightArm.rotation.x = strikeAngle < 0 ? strikeAngle : 0;
        }
        if (jdgLeftArm) jdgLeftArm.rotation.x = -0.1;

        // Judge mouth
        const jdgMouth = judge.getObjectByName("mouth") as THREE.Mesh;
        if (jdgMouth) jdgMouth.scale.y = 1 + Math.abs(Math.sin(t * 8)) * 1.2;

        // Both advocates stand at attention
        advocate.rotation.y = 0.15;
        skeptic.rotation.y = -0.15;
        if (advRightArm) advRightArm.rotation.x = 0;
        if (advLeftArm) advLeftArm.rotation.x = 0;
        if (skpRightArm) skpRightArm.rotation.x = 0;
        if (skpLeftArm) skpLeftArm.rotation.x = 0;

        // Reset advocate & skeptic mouths
        const advMouth = advocate.getObjectByName("mouth") as THREE.Mesh;
        if (advMouth) advMouth.scale.y = 1;
        const skpMouth = skeptic.getObjectByName("mouth") as THREE.Mesh;
        if (skpMouth) skpMouth.scale.y = 1;

        // Spotlights — judge dominates
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 0.8, 0.08);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 0.8, 0.08);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 12, 0.08);

        // Gavel desk animation + shockwave
        gavelOnDesk.rotation.x = Math.sin(gavelStrikePhase * 3) * 0.3;
        const strikeCycle = Math.sin(gavelStrikePhase * 3);
        if (strikeCycle < -0.8) {
          shockwave.scale.set(1 + Math.abs(strikeCycle + 1) * 15, 1 + Math.abs(strikeCycle + 1) * 15, 1);
          shockwaveMat.opacity = 0.7 * (1 - Math.abs(strikeCycle + 1) * 3);
        } else {
          shockwaveMat.opacity = Math.max(0, shockwaveMat.opacity - 0.05);
        }

        judgeBubble.position.y = 5.0 + Math.sin(t * 2.5) * 0.06;

        arcMat.opacity = 0;

      } else {
        // IDLE STATE — all agents at rest
        advocate.rotation.y = 0.15;
        skeptic.rotation.y = -0.15;
        judge.rotation.y = 0;
        if (advRightArm) advRightArm.rotation.x = Math.sin(t * 1.5) * 0.05;
        if (advLeftArm) advLeftArm.rotation.x = Math.sin(t * 1.5 + 1) * 0.05;
        if (skpRightArm) skpRightArm.rotation.x = Math.sin(t * 1.5 + 2) * 0.05;
        if (skpLeftArm) skpLeftArm.rotation.x = Math.sin(t * 1.5 + 3) * 0.05;
        if (jdgRightArm) jdgRightArm.rotation.x = 0;
        if (jdgLeftArm) jdgLeftArm.rotation.x = 0;

        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 1.5, 0.05);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 1.5, 0.05);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 2.5, 0.05);

        arcMat.opacity = 0;
        shockwaveMat.opacity = 0;
        gavelOnDesk.rotation.x = 0;
      }

      // ── Particle burst animations ──
      animateParticleBurst(advocateParticles);
      animateParticleBurst(skepticParticles);
      animateParticleBurst(judgeParticles);

      // ── Floating dust ──
      const dustPos = dustParticles.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i++) {
        dustPos.array[i * 3 + 1] += 0.002;
        dustPos.array[i * 3] += Math.sin(t + i) * 0.001;
        if (dustPos.array[i * 3 + 1] > 9) {
          dustPos.array[i * 3 + 1] = 0;
        }
      }
      dustPos.needsUpdate = true;

      // ── Chandelier flame flicker ──
      court.traverse((child) => {
        if (child.name.startsWith("flame_")) {
          child.position.y += Math.sin(t * 15 + child.id) * 0.003;
          child.scale.y = 0.8 + Math.random() * 0.4;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // ═══════════════════════════════════════════
    //  9. RESIZE
    // ═══════════════════════════════════════════
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] rounded-2xl overflow-hidden border-2 border-[#3a2012] bg-[#0a0810] shadow-2xl select-none group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Speech Overlay (HTML backup for long text) */}
      {activeSpeakerText && (
        <div className="absolute top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-20 animate-in fade-in zoom-in-95 duration-300 pointer-events-none">
          <div
            className={`rounded-xl border-2 p-4 backdrop-blur-xl shadow-2xl font-mono text-xs leading-relaxed ${
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
                  ? "⚖ Advocate — Counsel for Opportunity"
                  : activeSpeakerRole === "skeptic"
                  ? "⚖ Skeptic — Counsel for Caution"
                  : "👨‍⚖️ Chief Justice — Supreme Verdict"}
              </span>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            </div>
            <p className="font-sans line-clamp-4 text-xs sm:text-sm text-slate-100">
              &ldquo;{activeSpeakerText}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#170e08]/90 border border-[#4a2a16] p-1 rounded-lg font-mono text-[10px] text-amber-200/90 backdrop-blur z-20">
        <span className="text-amber-400 font-bold px-1.5 flex items-center gap-1">
          <Camera className="w-3 h-3" />
          View:
        </span>
        <button
          onClick={() => resetCamera("court")}
          className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-amber-900/50 text-white transition-all border border-amber-900/40"
        >
          Full Chamber
        </button>
        <button
          onClick={() => resetCamera("judge")}
          className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-amber-900/50 text-amber-300 transition-all border border-amber-900/40"
        >
          High Bench
        </button>
        <button
          onClick={() => resetCamera("advocate")}
          className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-emerald-900/50 text-emerald-300 transition-all border border-amber-900/40"
        >
          Advocate
        </button>
        <button
          onClick={() => resetCamera("skeptic")}
          className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-rose-900/50 text-rose-300 transition-all border border-amber-900/40"
        >
          Skeptic
        </button>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 bg-[#170e08]/90 border border-[#4a2a16] px-3 py-1.5 rounded-lg font-mono text-[10px] text-amber-200/90 pointer-events-auto backdrop-blur">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Voxel Courtroom • Drag to Orbit • Scroll to Zoom • Watch the agents argue!</span>
        </div>
        <button
          onClick={() => resetCamera("court")}
          className="pointer-events-auto flex items-center gap-1 bg-[#170e08]/90 border border-[#4a2a16] px-2.5 py-1.5 rounded-lg font-mono text-[10px] text-amber-400 hover:text-amber-300 hover:bg-slate-900 transition-all"
          title="Reset Camera"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AgentTurn } from "@/lib/types";
import { Camera, RefreshCw, Eye, Scale } from "lucide-react";

interface ChatDev3DCourtroomProps {
  activeTurnIndex: number;
  turns: AgentTurn[];
}

/* ──────────────────────────────────────────────────────────
 *  HELPER: Build a box with warm courtroom wood material
 * ────────────────────────────────────────────────────────── */
function woodBox(
  w: number, h: number, d: number,
  color: number,
  opts?: { roughness?: number; metalness?: number }
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color,
      roughness: opts?.roughness ?? 0.6,
      metalness: opts?.metalness ?? 0.05,
    })
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function ChatDev3DCourtroom({ activeTurnIndex, turns }: ChatDev3DCourtroomProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeTurnRef = useRef(activeTurnIndex);
  activeTurnRef.current = activeTurnIndex;
  const turnsRef = useRef(turns);
  turnsRef.current = turns;

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
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    if (preset === "iso") {
      cam.position.set(14, 12, 14);
      cam.lookAt(0, 1, 0);
    } else if (preset === "judge") {
      cam.position.set(2, 8, 4);
      cam.lookAt(0, 3, -5);
    } else if (preset === "advocate") {
      cam.position.set(10, 6, 10);
      cam.lookAt(-3, 1.5, 1);
    } else if (preset === "skeptic") {
      cam.position.set(-6, 6, 12);
      cam.lookAt(3, 1.5, 1);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ═══════════════════════════════════════════
    //  SCENE
    // ═══════════════════════════════════════════
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a1f14);

    // ═══════════════════════════════════════════
    //  CAMERA — Fixed Isometric-style angle
    // ═══════════════════════════════════════════
    const camera = new THREE.PerspectiveCamera(
      30,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(14, 12, 14);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // ═══════════════════════════════════════════
    //  RENDERER
    // ═══════════════════════════════════════════
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // Slow auto-rotation orbit
    let orbitAngle = Math.PI / 4; // Start at 45°
    let isAutoRotating = true;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartAngle = 0;

    // Manual orbit control via mouse drag
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      isAutoRotating = false;
      dragStartX = e.clientX;
      dragStartAngle = orbitAngle;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      orbitAngle = dragStartAngle + dx * 0.005;
    };
    const onMouseUp = () => { isDragging = false; };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);

    // Scroll zoom
    let zoomDist = 19;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomDist = Math.max(10, Math.min(30, zoomDist + e.deltaY * 0.01));
    };
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // ═══════════════════════════════════════════
    //  LIGHTING — Warm, bright courtroom
    // ═══════════════════════════════════════════
    // Warm ambient fill (bright like reference)
    const ambient = new THREE.AmbientLight(0xfff5e6, 0.7);
    scene.add(ambient);

    // Overhead warm light (simulating ceiling fixtures)
    const overhead = new THREE.DirectionalLight(0xffeedd, 1.6);
    overhead.position.set(3, 15, 5);
    overhead.castShadow = true;
    overhead.shadow.mapSize.width = 2048;
    overhead.shadow.mapSize.height = 2048;
    overhead.shadow.camera.left = -12;
    overhead.shadow.camera.right = 12;
    overhead.shadow.camera.top = 12;
    overhead.shadow.camera.bottom = -12;
    overhead.shadow.bias = -0.001;
    scene.add(overhead);

    // Side fill (window light from left)
    const sideLight = new THREE.DirectionalLight(0xfff0d0, 0.6);
    sideLight.position.set(-10, 8, 8);
    scene.add(sideLight);

    // Back fill
    const backFill = new THREE.DirectionalLight(0xffe8cc, 0.4);
    backFill.position.set(0, 6, -10);
    scene.add(backFill);

    // Dynamic agent spotlights
    const advocateSpot = new THREE.SpotLight(0x10b981, 0, 15, Math.PI / 5, 0.5);
    advocateSpot.position.set(-3, 8, 2);
    advocateSpot.target.position.set(-3, 0, 1);
    scene.add(advocateSpot);
    scene.add(advocateSpot.target);

    const skepticSpot = new THREE.SpotLight(0xf43f5e, 0, 15, Math.PI / 5, 0.5);
    skepticSpot.position.set(3, 8, 2);
    skepticSpot.target.position.set(3, 0, 1);
    scene.add(skepticSpot);
    scene.add(skepticSpot.target);

    const judgeSpot = new THREE.SpotLight(0xfbbf24, 0, 18, Math.PI / 4, 0.4);
    judgeSpot.position.set(0, 10, -3);
    judgeSpot.target.position.set(0, 3, -5);
    scene.add(judgeSpot);
    scene.add(judgeSpot.target);

    // ═══════════════════════════════════════════
    //  COURTROOM GROUP
    // ═══════════════════════════════════════════
    const court = new THREE.Group();

    // ── FLOOR: Warm beige marble/tile ──
    const floorTex = (() => {
      const c = document.createElement("canvas");
      c.width = 512; c.height = 512;
      const ctx = c.getContext("2d")!;
      // Warm cream base
      ctx.fillStyle = "#d4c4a0";
      ctx.fillRect(0, 0, 512, 512);
      // Subtle tile grid
      ctx.strokeStyle = "#c4b490";
      ctx.lineWidth = 2;
      for (let i = 0; i <= 512; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
      }
      // Subtle marble veining
      ctx.strokeStyle = "rgba(180,165,130,0.3)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.quadraticCurveTo(Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      return tex;
    })();

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.3, 18),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.4, metalness: 0.05 })
    );
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    court.add(floor);

    // Darker center circular area (like the reference)
    const centerCircle = new THREE.Mesh(
      new THREE.CircleGeometry(4, 32),
      new THREE.MeshStandardMaterial({ color: 0xc8b888, roughness: 0.5 })
    );
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.02, 1);
    centerCircle.receiveShadow = true;
    court.add(centerCircle);

    // ── WALLS: Rich dark mahogany wood paneling ──
    const wallColor = 0x3b2214;
    const wainscotColor = 0x4e2d18;
    const upperWallColor = 0x5c3a22;
    const trimColor = 0x6b4428;

    // Back wall
    const backWall = woodBox(20, 9, 0.5, wallColor);
    backWall.position.set(0, 4.5, -9);
    court.add(backWall);
    // Upper wall (lighter)
    const backUpper = woodBox(20, 4, 0.52, upperWallColor);
    backUpper.position.set(0, 7, -8.98);
    court.add(backUpper);
    // Wainscot panels
    const backWainscot = woodBox(20, 3.5, 0.55, wainscotColor);
    backWainscot.position.set(0, 1.75, -8.95);
    court.add(backWainscot);
    // Trim molding
    const backTrim = woodBox(20.2, 0.15, 0.6, trimColor);
    backTrim.position.set(0, 3.55, -8.9);
    court.add(backTrim);
    // Crown molding
    const backCrown = woodBox(20.2, 0.2, 0.6, trimColor);
    backCrown.position.set(0, 8.9, -8.9);
    court.add(backCrown);

    // Left wall
    const leftWall = woodBox(0.5, 9, 18, wallColor);
    leftWall.position.set(-10, 4.5, 0);
    court.add(leftWall);
    const leftUpper = woodBox(0.52, 4, 18, upperWallColor);
    leftUpper.position.set(-9.98, 7, 0);
    court.add(leftUpper);
    const leftWainscot = woodBox(0.55, 3.5, 18, wainscotColor);
    leftWainscot.position.set(-9.95, 1.75, 0);
    court.add(leftWainscot);
    const leftTrim = woodBox(0.6, 0.15, 18.2, trimColor);
    leftTrim.position.set(-9.9, 3.55, 0);
    court.add(leftTrim);

    // Right wall
    const rightWall = woodBox(0.5, 9, 18, wallColor);
    rightWall.position.set(10, 4.5, 0);
    court.add(rightWall);
    const rightUpper = woodBox(0.52, 4, 18, upperWallColor);
    rightUpper.position.set(9.98, 7, 0);
    court.add(rightUpper);
    const rightWainscot = woodBox(0.55, 3.5, 18, wainscotColor);
    rightWainscot.position.set(9.95, 1.75, 0);
    court.add(rightWainscot);

    // ── INDIVIDUAL WALL PANELS (visible grooves like reference) ──
    for (let px = -8; px <= 8; px += 2.4) {
      // Back wall vertical grooves
      const groove = woodBox(0.06, 3.4, 0.08, 0x2a1a0e);
      groove.position.set(px, 1.75, -8.68);
      court.add(groove);
    }
    for (let pz = -7; pz <= 7; pz += 2.4) {
      // Left wall vertical grooves
      const grooveL = woodBox(0.08, 3.4, 0.06, 0x2a1a0e);
      grooveL.position.set(-9.68, 1.75, pz);
      court.add(grooveL);
      // Right wall
      const grooveR = woodBox(0.08, 3.4, 0.06, 0x2a1a0e);
      grooveR.position.set(9.68, 1.75, pz);
      court.add(grooveR);
    }

    // ── DOOR (Right wall, rear) ──
    const door = woodBox(1.6, 3.5, 0.15, 0x2e1a0c);
    door.position.set(9.6, 1.75, -5);
    court.add(door);
    // Door handle
    const handle = woodBox(0.08, 0.08, 0.15, 0xd4af37, { metalness: 0.8, roughness: 0.2 });
    handle.position.set(9.55, 1.7, -4.55);
    court.add(handle);

    // ── FLAG (Left of judge) ──
    const flagPole = woodBox(0.08, 4, 0.08, 0xd4af37, { metalness: 0.7 });
    flagPole.position.set(-3.5, 2.5, -7.5);
    court.add(flagPole);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x8b0000, side: THREE.DoubleSide, roughness: 0.8 })
    );
    flag.position.set(-3.5, 3.8, -7.2);
    flag.rotation.y = 0.1;
    court.add(flag);
    // Flag emblem
    const flagSeal = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.5 })
    );
    flagSeal.position.set(-3.5, 3.8, -7.17);
    court.add(flagSeal);

    // ── SCALES OF JUSTICE (Wall-mounted, left side) ──
    const scalesGroup = new THREE.Group();
    scalesGroup.position.set(-9.6, 4.5, -2);
    // Pillar
    const scalesPillar = woodBox(0.06, 1.5, 0.06, 0xd4af37, { metalness: 0.8 });
    scalesGroup.add(scalesPillar);
    // Beam
    const scalesBeam = woodBox(1.2, 0.06, 0.06, 0xd4af37, { metalness: 0.8 });
    scalesBeam.position.y = 0.7;
    scalesGroup.add(scalesBeam);
    // Pans
    [-0.5, 0.5].forEach(sx => {
      const chain = woodBox(0.03, 0.4, 0.03, 0xd4af37, { metalness: 0.8 });
      chain.position.set(sx, 0.45, 0);
      scalesGroup.add(chain);
      const pan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 })
      );
      pan.position.set(sx, 0.22, 0);
      scalesGroup.add(pan);
    });
    court.add(scalesGroup);

    // ── JUDGE'S BENCH (Elevated, center-back like reference) ──
    // Judge's platform (elevated 2 tiers)
    const judgePlatform1 = woodBox(8, 0.4, 4, 0x3b2214);
    judgePlatform1.position.set(0, 0.2, -5.5);
    court.add(judgePlatform1);
    const judgePlatform2 = woodBox(7, 0.4, 3.2, 0x4e2d18);
    judgePlatform2.position.set(0, 0.6, -5.7);
    court.add(judgePlatform2);

    // Main Bench (high imposing desk)
    const benchBody = woodBox(6, 2.2, 0.5, wainscotColor);
    benchBody.position.set(0, 1.9, -4.5);
    court.add(benchBody);
    // Bench wings
    const benchWingL = woodBox(0.5, 2.2, 2.5, wainscotColor);
    benchWingL.position.set(-3, 1.9, -5.5);
    court.add(benchWingL);
    const benchWingR = woodBox(0.5, 2.2, 2.5, wainscotColor);
    benchWingR.position.set(3, 1.9, -5.5);
    court.add(benchWingR);
    // Bench top
    const benchTopSurface = woodBox(6.5, 0.12, 3, trimColor);
    benchTopSurface.position.set(0, 3.05, -5.5);
    court.add(benchTopSurface);
    // Bench panels (carved look)
    [-2, 0, 2].forEach(px => {
      const panel = woodBox(1.4, 1.6, 0.08, 0x3a1e10);
      panel.position.set(px, 1.6, -4.22);
      court.add(panel);
    });
    // Gold trim on bench front
    const benchGoldTrim = woodBox(6.1, 0.1, 0.06, 0xd4af37, { metalness: 0.7, roughness: 0.25 });
    benchGoldTrim.position.set(0, 2.98, -4.22);
    court.add(benchGoldTrim);

    // Judge nameplate
    const nameplateBase = woodBox(1.2, 0.08, 0.25, 0x1a0e06);
    nameplateBase.position.set(0, 3.1, -4.8);
    court.add(nameplateBase);

    // Gavel on judge's bench
    const gavelBlock = woodBox(0.35, 0.08, 0.35, 0x1a0e06);
    gavelBlock.position.set(1.5, 3.1, -5.2);
    court.add(gavelBlock);

    const gavelObj = new THREE.Group();
    gavelObj.position.set(1.5, 3.18, -5.2);
    const gHead = woodBox(0.28, 0.1, 0.1, 0x5c3317);
    gavelObj.add(gHead);
    const gHandle = woodBox(0.06, 0.06, 0.35, 0x8b4513);
    gHandle.position.z = 0.15;
    gavelObj.add(gHandle);
    gavelObj.rotation.y = 0.5;
    court.add(gavelObj);

    // Papers/documents on bench
    const paper1 = woodBox(0.6, 0.02, 0.8, 0xf5f0e0, { roughness: 0.9 });
    paper1.position.set(-0.8, 3.12, -5.5);
    paper1.rotation.y = 0.1;
    court.add(paper1);
    const paper2 = woodBox(0.5, 0.02, 0.7, 0xfaf5e8, { roughness: 0.9 });
    paper2.position.set(-1.5, 3.12, -5.3);
    paper2.rotation.y = -0.15;
    court.add(paper2);

    // ── CLERK'S DESK (Left, slightly elevated — like reference) ──
    const clerkPlatform = woodBox(3.5, 0.35, 2.5, 0x3b2214);
    clerkPlatform.position.set(-5, 0.175, -4);
    court.add(clerkPlatform);
    const clerkDesk = woodBox(3, 1.5, 0.4, wainscotColor);
    clerkDesk.position.set(-5, 1.1, -3.1);
    court.add(clerkDesk);
    const clerkDeskTop = woodBox(3.2, 0.1, 1.8, trimColor);
    clerkDeskTop.position.set(-5, 1.9, -3.8);
    court.add(clerkDeskTop);
    // Papers on clerk desk
    const clerkPaper = woodBox(0.5, 0.02, 0.6, 0xfaf5e8, { roughness: 0.9 });
    clerkPaper.position.set(-5.2, 1.96, -3.7);
    court.add(clerkPaper);

    // ── COUNSEL TABLES (Two desks in front area) ──
    const createTable = (x: number, z: number) => {
      const top = woodBox(2.8, 0.12, 1.2, 0x5c3520);
      top.position.set(x, 1.2, z);
      court.add(top);
      [[-1.1, -0.4], [1.1, -0.4], [-1.1, 0.4], [1.1, 0.4]].forEach(([lx, lz]) => {
        const leg = woodBox(0.12, 1.15, 0.12, 0x3b2214);
        leg.position.set(x + lx, 0.58, z + lz);
        court.add(leg);
      });
      // Papers
      const p = woodBox(0.4, 0.02, 0.55, 0xf5f0e0, { roughness: 0.9 });
      p.position.set(x + 0.3, 1.28, z);
      p.rotation.y = 0.05;
      court.add(p);
      // Book
      const book = woodBox(0.35, 0.18, 0.5, 0x1e3a5f);
      book.position.set(x - 0.8, 1.35, z - 0.1);
      court.add(book);
    };

    createTable(-3, 2.5);
    createTable(3, 2.5);

    // ── SPECTATOR GALLERY (Rows of benches behind bar) ──
    const barZ = 5;
    // Bar railing
    const barRail = woodBox(18, 1.0, 0.2, wainscotColor);
    barRail.position.set(0, 0.5, barZ);
    court.add(barRail);
    // Gate posts
    [-1.2, 1.2].forEach(gx => {
      const post = woodBox(0.25, 1.2, 0.25, trimColor);
      post.position.set(gx, 0.6, barZ);
      court.add(post);
    });
    // Top rail cap
    const topCap = woodBox(18.2, 0.08, 0.3, trimColor);
    topCap.position.set(0, 1.02, barZ);
    court.add(topCap);

    // Pew benches (2 rows)
    [6.5, 8].forEach(pz => {
      [-4, 4].forEach(px => {
        // Seat
        const seat = woodBox(5, 0.12, 0.6, 0x5c3520);
        seat.position.set(px, 0.55, pz);
        court.add(seat);
        // Back
        const back = woodBox(5, 0.65, 0.1, 0x4e2d18);
        back.position.set(px, 0.9, pz + 0.3);
        court.add(back);
        // Legs
        [-2.2, 0, 2.2].forEach(lx => {
          const leg = woodBox(0.1, 0.5, 0.5, 0x3b2214);
          leg.position.set(px + lx, 0.25, pz);
          court.add(leg);
        });
      });
    });

    // ── SCATTERED PAPERS ON FLOOR (Like reference) ──
    const paperPositions = [
      { x: -1.5, z: 0.5, r: 0.3 },
      { x: 0.8, z: 1.5, r: -0.5 },
      { x: -0.3, z: 2.8, r: 1.2 },
      { x: 2.1, z: 0.2, r: 0.7 },
      { x: -2.5, z: 3.2, r: -0.8 },
      { x: 1.2, z: -0.5, r: 0.4 },
      { x: -0.8, z: 4, r: -1.1 },
      { x: 0.3, z: 3.5, r: 0.9 },
    ];
    paperPositions.forEach(pp => {
      const pap = new THREE.Mesh(
        new THREE.PlaneGeometry(0.35, 0.45),
        new THREE.MeshStandardMaterial({
          color: Math.random() > 0.3 ? 0xfaf5e8 : 0xf0e8d0,
          roughness: 0.9,
          side: THREE.DoubleSide,
        })
      );
      pap.rotation.x = -Math.PI / 2;
      pap.rotation.z = pp.r;
      pap.position.set(pp.x, 0.02, pp.z);
      pap.receiveShadow = true;
      court.add(pap);
    });

    // ── CEILING (Subtle warm) ──
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.3, 18),
      new THREE.MeshStandardMaterial({ color: 0x5c4a38, roughness: 0.8 })
    );
    ceiling.position.y = 9.15;
    court.add(ceiling);

    // ── CEILING LIGHT FIXTURES ──
    [-3, 3].forEach(lx => {
      const fixture = woodBox(0.8, 0.15, 0.8, 0xd4af37, { metalness: 0.7 });
      fixture.position.set(lx, 8.9, -1);
      court.add(fixture);
      const bulb = new THREE.PointLight(0xffeedd, 0.8, 10);
      bulb.position.set(lx, 8.7, -1);
      court.add(bulb);
    });

    // ── PICTURE FRAMES on back wall ──
    [-5, 5].forEach(fx => {
      const frame = woodBox(1.4, 2, 0.08, trimColor);
      frame.position.set(fx, 5.5, -8.65);
      court.add(frame);
      const inner = woodBox(1.1, 1.7, 0.04, 0x2a2218);
      inner.position.set(fx, 5.5, -8.6);
      court.add(inner);
    });

    scene.add(court);

    // ═══════════════════════════════════════════
    //  PIXEL-ART CHARACTER SPRITES
    //  (Billboard sprites from PNG assets — exactly
    //   like the reference image's pixel people)
    // ═══════════════════════════════════════════
    const textureLoader = new THREE.TextureLoader();

    const createCharSprite = (
      path: string, x: number, y: number, z: number,
      scale = 2.0
    ) => {
      const map = textureLoader.load(`${path}?v=5`);
      map.magFilter = THREE.NearestFilter;
      map.minFilter = THREE.NearestFilter;

      const mat = new THREE.SpriteMaterial({
        map,
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x, y, z);
      sprite.scale.set(scale, scale * 1.25, 1);
      scene.add(sprite);

      // Ground shadow
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.4 * (scale / 2), 12),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(x, 0.03, z + 0.05);
      scene.add(shadow);

      return { sprite, shadow };
    };

    // 1. CHIEF JUSTICE (Elevated behind bench)
    const judgeChar = createCharSprite("/chatdev/figures/ceo.png", 0, 3.7, -5.8, 2.4);
    // 2. ADVOCATE (Standing at left counsel table — facing right)
    const advocateChar = createCharSprite("/chatdev/figures/counselor.png", -3, 1.5, 1.8, 2.2);
    // 3. SKEPTIC (Standing at right counsel table — facing left)
    const skepticChar = createCharSprite("/chatdev/figures/reviewer.png", 3, 1.5, 1.8, 2.2);
    // 4. CLERK (At clerk desk)
    createCharSprite("/chatdev/figures/designer.png", -5, 1.4, -3.5, 1.7);
    // 5–8. SPECTATORS in gallery
    createCharSprite("/chatdev/figures/programmer.png", -4.5, 1.1, 6.5, 1.5);
    createCharSprite("/chatdev/figures/tester.png", -2.5, 1.1, 6.5, 1.5);
    createCharSprite("/chatdev/figures/hr.png", 3.5, 1.1, 6.5, 1.5);
    createCharSprite("/chatdev/figures/pe.png", 5.5, 1.1, 6.5, 1.5);
    // Back row
    createCharSprite("/chatdev/figures/cpo.png", -3.5, 1.1, 8, 1.4);
    createCharSprite("/chatdev/figures/cto.png", 4.5, 1.1, 8, 1.4);
    // Standing person (center, like reference — lawyer at the bar)
    createCharSprite("/chatdev/figures/user.png", 0, 1.2, 3.5, 1.8);

    // ── ROLE BADGES ──
    const createBadge = (text: string, x: number, y: number, z: number, color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 360; canvas.height = 70;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "rgba(20, 15, 10, 0.92)";
      ctx.beginPath(); ctx.roundRect(4, 4, 352, 62, 12); ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(4, 4, 352, 62, 12); ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 180, 35);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
      );
      spr.position.set(x, y, z);
      spr.scale.set(1.8, 0.35, 1);
      scene.add(spr);
      return spr;
    };

    createBadge("⚖ THE ADVOCATE", -3, 3.3, 1.8, "#10b981");
    createBadge("⚖ THE SKEPTIC", 3, 3.3, 1.8, "#f43f5e");
    createBadge("👨‍⚖️ CHIEF JUSTICE", 0, 5.5, -5.8, "#fbbf24");

    // ── ARGUMENT ARC (Pulsing beam between advocate ↔ skeptic) ──
    const arcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, 2.2, 1.8),
      new THREE.Vector3(-1, 3.2, 0),
      new THREE.Vector3(0, 3.5, -0.5),
      new THREE.Vector3(1, 3.2, 0),
      new THREE.Vector3(3, 2.2, 1.8),
    ]);
    const arcGeo = new THREE.TubeGeometry(arcCurve, 40, 0.04, 6, false);
    const arcMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0 });
    const arcBeam = new THREE.Mesh(arcGeo, arcMat);
    scene.add(arcBeam);

    // ── GAVEL SHOCKWAVE ──
    const shockGeo = new THREE.RingGeometry(0.15, 0.4, 24);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24, transparent: true, opacity: 0, side: THREE.DoubleSide,
    });
    const shockwave = new THREE.Mesh(shockGeo, shockMat);
    shockwave.rotation.x = -Math.PI / 2;
    shockwave.position.set(1.5, 3.2, -5.2);
    court.add(shockwave);

    // ── FLOATING DUST MOTES ──
    const dustCount = 100;
    const dustArr = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustArr[i * 3] = (Math.random() - 0.5) * 18;
      dustArr[i * 3 + 1] = Math.random() * 8 + 0.5;
      dustArr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustArr, 3));
    const dustPts = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xffeedd, size: 0.04, transparent: true, opacity: 0.35, sizeAttenuation: true,
    }));
    scene.add(dustPts);

    // ═══════════════════════════════════════════
    //  ANIMATION LOOP
    // ═══════════════════════════════════════════
    let frameId: number;
    const clock = new THREE.Clock();
    let gavelPhase = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const turn = activeTurnRef.current;

      // ── Slow orbit (isometric rotation) ──
      if (isAutoRotating) {
        orbitAngle += 0.001;
      }
      const camX = Math.sin(orbitAngle) * zoomDist;
      const camZ = Math.cos(orbitAngle) * zoomDist;
      camera.position.set(camX, 12, camZ);
      camera.lookAt(0, 1.5, 0);

      // ── Idle character breathing ──
      advocateChar.sprite.position.y = 1.5 + Math.sin(t * 2.5) * 0.04;
      skepticChar.sprite.position.y = 1.5 + Math.sin(t * 2.5 + 1) * 0.04;
      judgeChar.sprite.position.y = 3.7 + Math.sin(t * 2.0 + 0.5) * 0.03;

      // ── TURN-BASED ANIMATIONS ──
      if (turn === 1) {
        // Advocate speaks — bounces more, shakes
        advocateChar.sprite.position.y = 1.5 + Math.sin(t * 5) * 0.08;
        advocateChar.sprite.scale.x = 2.2 + Math.sin(t * 8) * 0.05;

        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 6, 0.06);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 0, 0.06);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 0.5, 0.06);

        arcMat.opacity = 0;

      } else if (turn === 2) {
        // Skeptic rebuts — aggressive bounce
        skepticChar.sprite.position.y = 1.5 + Math.sin(t * 5.5) * 0.08;
        skepticChar.sprite.scale.x = 2.2 + Math.sin(t * 9) * 0.05;

        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 0.3, 0.06);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 6, 0.06);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 0.5, 0.06);

        // Pulsing argument arc
        arcMat.opacity = 0.3 + Math.sin(t * 7) * 0.25;

      } else if (turn >= 3) {
        // Judge verdict — gavel strike
        gavelPhase += 0.03;
        gavelObj.rotation.x = Math.sin(gavelPhase * 3) * 0.3;

        const strike = Math.sin(gavelPhase * 3);
        if (strike < -0.85) {
          shockwave.scale.set(1 + Math.abs(strike + 1) * 12, 1 + Math.abs(strike + 1) * 12, 1);
          shockMat.opacity = 0.6 * (1 - Math.abs(strike + 1) * 4);
        } else {
          shockMat.opacity = Math.max(0, shockMat.opacity - 0.03);
        }

        judgeChar.sprite.position.y = 3.7 + Math.sin(t * 3) * 0.04;

        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 1, 0.06);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 1, 0.06);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 10, 0.06);

        arcMat.opacity = 0;

      } else {
        // Idle
        advocateSpot.intensity = THREE.MathUtils.lerp(advocateSpot.intensity, 1, 0.04);
        skepticSpot.intensity = THREE.MathUtils.lerp(skepticSpot.intensity, 1, 0.04);
        judgeSpot.intensity = THREE.MathUtils.lerp(judgeSpot.intensity, 2, 0.04);
        arcMat.opacity = 0;
        shockMat.opacity = 0;
        gavelObj.rotation.x = 0;
      }

      // ── Dust drift ──
      const dPos = dustPts.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i++) {
        dPos.array[i * 3 + 1] += 0.003;
        dPos.array[i * 3] += Math.sin(t * 0.5 + i) * 0.001;
        if (dPos.array[i * 3 + 1] > 9) dPos.array[i * 3 + 1] = 0.5;
      }
      dPos.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // ═══════════════════════════════════════════
    //  RESIZE
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
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("mouseleave", onMouseUp);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] rounded-2xl overflow-hidden border-2 border-[#5c3a22] bg-[#2a1f14] shadow-2xl select-none group">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Speech Overlay */}
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
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#2a1a0e]/90 border border-[#5c3a22] p-1 rounded-lg font-mono text-[10px] text-amber-200/90 backdrop-blur z-20">
        <span className="text-amber-400 font-bold px-1.5 flex items-center gap-1">
          <Camera className="w-3 h-3" />
          View:
        </span>
        <button
          onClick={() => { resetCamera("iso"); }}
          className="px-2 py-0.5 rounded bg-[#3b2214]/80 hover:bg-amber-900/50 text-white transition-all border border-amber-900/40"
        >
          Courtroom
        </button>
        <button
          onClick={() => resetCamera("judge")}
          className="px-2 py-0.5 rounded bg-[#3b2214]/80 hover:bg-amber-900/50 text-amber-300 transition-all border border-amber-900/40"
        >
          Bench
        </button>
        <button
          onClick={() => resetCamera("advocate")}
          className="px-2 py-0.5 rounded bg-[#3b2214]/80 hover:bg-emerald-900/50 text-emerald-300 transition-all border border-amber-900/40"
        >
          Advocate
        </button>
        <button
          onClick={() => resetCamera("skeptic")}
          className="px-2 py-0.5 rounded bg-[#3b2214]/80 hover:bg-rose-900/50 text-rose-300 transition-all border border-amber-900/40"
        >
          Skeptic
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 bg-[#2a1a0e]/90 border border-[#5c3a22] px-3 py-1.5 rounded-lg font-mono text-[10px] text-amber-200/90 pointer-events-auto backdrop-blur">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Isometric Courtroom • Drag to Rotate • Scroll to Zoom</span>
        </div>
        <button
          onClick={() => resetCamera("iso")}
          className="pointer-events-auto flex items-center gap-1 bg-[#2a1a0e]/90 border border-[#5c3a22] px-2.5 py-1.5 rounded-lg font-mono text-[10px] text-amber-400 hover:text-amber-300 hover:bg-[#3b2214] transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

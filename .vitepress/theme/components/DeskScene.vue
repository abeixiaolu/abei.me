<script setup lang="ts">
import * as THREE from "three";
import { createPlant } from "../scene/createPlant";
import { createStillLife } from "../scene/createStillLife";
import { mergeStaticMeshes } from "../scene/mergeStaticMeshes";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { onMounted, onUnmounted, ref, watch } from "vue";
const props = defineProps<{ focused: boolean }>();
const emit = defineEmits<{ open: [path: string]; ready: []; failed: [] }>();
const canvas = ref<HTMLCanvasElement>();
const failed = ref(false);
let cleanup = () => {};
let setFocused = (_value: boolean) => {};
watch(
  () => props.focused,
  (value) => setFocused(value),
);
onMounted(() => {
  const el = canvas.value!;
  const mobile = matchMedia("(max-width:700px)");
  // Do not allocate a WebGL scene on a phone; its real HTML interface is the device.
  if (mobile.matches) return;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: el,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    failed.value = true;
    emit("failed");
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#1d201f");
  scene.fog = new THREE.FogExp2("#263139", 0.045);
  const environmentRoom = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentRoom, 0.02);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.22;
  environmentRoom.dispose();
  pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  const textures: THREE.Texture[] = [];
  const rng = (n: number) => {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };
  const material = (c: string, r = 0.6, m = 0) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const black = material("#242526", 0.49),
    rubber = material("#101618"),
    brass = material("#8f7050", 0.32, 0.7),
    paper = material("#d5c59d"),
    copper = material("#ad6043", 0.3, 0.65);
  const box = (
    name: string,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = scene,
    r = 0.025,
  ) => {
    const o = new THREE.Mesh(
      new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 4, h / 4, d / 4)),
      mat,
    );
    o.name = name;
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const cyl = (
    name: string,
    rt: number,
    rb: number,
    h: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = scene,
  ) => {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 32), mat);
    o.name = name;
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const tube = (
    points: number[][],
    radius: number,
    mat: THREE.Material,
    parent: THREE.Object3D = scene,
  ) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    );
    const o = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 8, false), mat);
    o.castShadow = true;
    parent.add(o);
    return o;
  };
  function canvasMap(w: number, h: number, paint: (c: CanvasRenderingContext2D) => void) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    paint(c.getContext("2d")!);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textures.push(t);
    return t;
  }
  function surfaceMap(kind: "plaster" | "cloth" | "plastic", repeatX = 1, repeatY = 1) {
    const t = canvasMap(256, 256, (c) => {
      const data = c.createImageData(256, 256);
      for (let y = 0; y < 256; y++)
        for (let x = 0; x < 256; x++) {
          const i = (y * 256 + x) * 4;
          const noise = rng(x + y * 256);
          const weave =
            kind === "cloth"
              ? Math.sin((x * Math.PI) / 2) * 15 + Math.sin((y * Math.PI) / 2) * 15
              : 0;
          const v = 155 + noise * 70 + weave;
          data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
          data.data[i + 3] = 255;
        }
      c.putImageData(data, 0, 0);
    });
    t.colorSpace = THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
    return t;
  }
  const plasterMap = surfaceMap("plaster", 12, 6),
    clothMap = surfaceMap("cloth", 4, 18),
    plasticMap = surfaceMap("plastic", 5, 5);
  // Broad handling marks vary roughness; microscopic grain stays in the bump map.
  const wearRoughness = canvasMap(512, 512, (c) => {
    c.fillStyle = "#dfdfdf";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 20; i++) {
      const x = rng(i + 230) * 512,
        y = rng(i + 460) * 512,
        r = 35 + rng(i + 88) * 95;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, i % 2 ? "#68686845" : "#ffffff24");
      g.addColorStop(1, "#99999900");
      c.fillStyle = g;
      c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 40; i++) {
      c.strokeStyle = "#74747418";
      c.lineWidth = 0.3;
      c.beginPath();
      const x = rng(i + 4) * 512,
        y = rng(i + 90) * 512;
      c.moveTo(x, y);
      c.lineTo(x + 4 + rng(i + 19) * 38, y + rng(i + 56) * 4);
      c.stroke();
    }
  });
  wearRoughness.colorSpace = THREE.NoColorSpace;
  const polymerPatina = canvasMap(512, 512, (c) => {
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 14; i++) {
      const x = rng(i + 713) * 512,
        y = rng(i + 999) * 512;
      const g = c.createRadialGradient(x, y, 0, x, y, 100);
      g.addColorStop(0, "#8d816e16");
      g.addColorStop(1, "#ffffff00");
      c.fillStyle = g;
      c.fillRect(x - 100, y - 100, 200, 200);
    }
  });
  black.bumpMap = plasticMap;
  black.bumpScale = 0.0003;
  black.roughness = 0.68;
  black.roughnessMap = wearRoughness;
  function decal(
    name: string,
    text: string,
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    bg = "#cbbd94",
    fg = "#292824",
    size = 40,
  ) {
    const map = canvasMap(512, 128, (c) => {
      c.fillStyle = bg;
      c.fillRect(0, 0, 512, 128);
      c.fillStyle = fg;
      c.font = `bold ${size}px monospace`;
      c.textBaseline = "middle";
      c.fillText(text, 22, 66);
    });
    const o = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map, roughness: 0.8 }),
    );
    o.name = name;
    o.position.set(x, y, z);
    scene.add(o);
    return o;
  }
  const woodMap = new THREE.TextureLoader().load("/textures/walnut-desk.webp");
  woodMap.colorSpace = THREE.SRGBColorSpace;
  woodMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  textures.push(woodMap);
  const wood = new THREE.MeshStandardMaterial({ map: woodMap, roughness: 0.67, color: "#c3b496" });
  // The window opening, glass and rain are geometry; the generated exterior is a distant parallax layer.
  const wall = material("#8f7961", 0.96);
  wall.bumpMap = plasterMap;
  wall.bumpScale = 0.018;
  wall.roughnessMap = plasterMap;
  const paint = material("#c4b499", 0.7);
  box("left wall", 24, 12, 0.3, wall, -17, 4, -3.8);
  box("right wall", 24, 12, 0.3, wall, 17, 4, -3.8);
  box("window lintel", 10, 4, 0.3, wall, 0, 9, -3.8);
  box("under window", 10, 3, 0.3, wall, 0, -1, -3.8);
  const cityTex = new THREE.TextureLoader().load("/textures/hangzhou-night.webp");
  cityTex.colorSpace = THREE.SRGBColorSpace;
  cityTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  textures.push(cityTex);
  const night = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 14.6667),
    new THREE.MeshBasicMaterial({ map: cityTex, color: "#e2e8eb", toneMapped: false, fog: false }),
  );
  night.position.set(0, 4.2, -12);
  scene.add(night);
  for (const x of [-5, 0, 5]) box("window jamb", 0.16, 7.6, 0.4, paint, x, 4, -3.55);
  for (const y of [0.55, 4.95, 7.8]) box("window rail", 10.2, 0.15, 0.4, paint, 0, y, -3.55);
  box("window sill", 10.7, 0.18, 0.85, paint, 0, 0.5, -3.45);
  box("window latch", 0.07, 0.48, 0.12, brass, 0.22, 3.7, -3.25);
  const drops = canvasMap(512, 512, (c) => {
    c.fillStyle = "#808080";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 420; i++) {
      const x = rng(i) * 512,
        y = rng(i + 800) * 512;
      const g = c.createRadialGradient(x, y, 0, x, y, 2 + rng(i + 3) * 3);
      g.addColorStop(0, "#bcbcbc");
      g.addColorStop(0.45, "#686868");
      g.addColorStop(1, "#808080");
      c.fillStyle = g;
      c.fillRect(x - 6, y - 6, 12, 12);
    }
  });
  drops.colorSpace = THREE.NoColorSpace;
  drops.wrapS = drops.wrapT = THREE.RepeatWrapping;
  drops.repeat.set(2, 2);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(9.8, 7),
    new THREE.MeshPhysicalMaterial({
      color: "#adbbc0",
      transparent: true,
      opacity: 0.1,
      roughness: 0.16,
      metalness: 0.14,
      bumpMap: drops,
      bumpScale: 0.018,
      envMapIntensity: 0.35,
    }),
  );
  glass.position.set(0, 4.1, -3.65);
  scene.add(glass);
  const rainPts: number[] = [];
  for (let i = 0; i < 420; i++) {
    const x = (rng(i + 41) - 0.5) * 9.8,
      y = 0.8 + rng(i + 99) * 7;
    rainPts.push(x, y, -3.3, x - 0.012, y - 0.04 - rng(i) * 0.1, -3.3);
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute("position", new THREE.Float32BufferAttribute(rainPts, 3));
  const rain = new THREE.LineSegments(
    rainGeo,
    new THREE.LineBasicMaterial({ color: "#d6e2e1", transparent: true, opacity: 0.09 }),
  );
  scene.add(rain);
  // Folded linen curtains: continuous pleated surfaces with the folds affecting light and silhouette.
  for (const side of [-1, 1]) {
    const g = new THREE.PlaneGeometry(1.5, 9, 64, 40);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(
        i,
        0.15 * Math.sin(p.getX(i) * 13 + 0.18 * Math.sin(p.getY(i) * 0.6)) +
          0.035 * Math.sin(p.getX(i) * 27 + p.getY(i) * 0.24),
      );
    g.computeVertexNormals();
    const curtain = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({
        color: "#bda887",
        roughness: 0.98,
        bumpMap: clothMap,
        bumpScale: 0.0012,
        side: THREE.DoubleSide,
      }),
    );
    curtain.position.set(side * 5.4, 4.4, -2.95);
    curtain.castShadow = true;
    curtain.receiveShadow = true;
    scene.add(curtain);
  }
  box("oak desktop", 13.8, 0.24, 5.5, wood, 0, 0.12, 0.2, scene, 0.07);
  box("desk front apron", 13.3, 0.48, 0.14, wood, 0, -0.18, 2.82);
  for (const x of [-6.2, 6.2]) box("desk leg", 0.22, 3, 0.35, wood, x, -1.4, 1.8);
  // CRT and VCR are separate assemblies. Native monitor.blend is retained as editable source.
  const monitor = new THREE.Group();
  monitor.position.set(0, 0.44, 0);
  monitor.scale.set(0.7, 0.82, 0.82);
  scene.add(monitor);
  let alive = true;
  new GLTFLoader().load(
    "/models/monitor.glb?v=2",
    (g) => {
      if (!alive) {
        g.scene.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
          }
        });
        return;
      }
      const sharedMaterials = new Map<THREE.Material, THREE.Material>();
      g.scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          if (/Pedestal/i.test(o.name)) o.visible = false;
          o.castShadow = true;
          o.receiveShadow = true;
          const isArray = Array.isArray(o.material);
          const mats = isArray ? o.material : [o.material];
          const mapped = mats.map((m) => {
            const cached = sharedMaterials.get(m);
            if (cached) return cached;
            const n = m.clone();
            if (n instanceof THREE.MeshStandardMaterial) {
              if (/ABS/i.test(n.name)) {
                n.color.set("#414238");
                n.roughness = 0.6;
                n.metalness = 0;
                n.bumpMap = plasticMap;
                n.bumpScale = 0.00035;
                n.roughnessMap = wearRoughness;
                n.map = polymerPatina;
              } else if (/Faceplate/i.test(n.name)) {
                n.color.set("#3b3d35");
                n.roughness = 0.43;
                n.metalness = 0;
                n.bumpMap = plasticMap;
                n.bumpScale = 0.00025;
                n.roughnessMap = wearRoughness;
                n.map = polymerPatina;
              } else if (/rubber/i.test(n.name)) {
                n.color.set("#101411");
                n.roughness = 0.92;
                n.metalness = 0;
              } else if (/bezel/i.test(n.name)) {
                n.color.set("#181d19");
                n.roughness = 0.3;
                n.metalness = 0.05;
              } else if (/fasteners/i.test(n.name)) {
                n.color.set("#797d75");
                n.roughness = 0.27;
                n.metalness = 0.85;
              } else if (/Buttons/i.test(n.name)) {
                n.color.set("#363b34");
                n.roughness = 0.4;
                n.metalness = 0;
              } else if (/markings/i.test(n.name)) {
                n.color.set("#b3b09a");
                n.roughness = 0.85;
              }
            }
            sharedMaterials.set(m, n);
            return n;
          });
          o.material = isArray ? mapped : mapped[0];
        }
      });
      sharedMaterials.forEach((_value, key) => key.dispose());
      mergeStaticMeshes(g.scene);
      monitor.add(g.scene);
      renderer.shadowMap.needsUpdate = true;
      emit("ready");
    },
    undefined,
    () => {
      failed.value = true;
      emit("failed");
    },
  );
  const vcrCase = material("#30332e", 0.5, 0.35);
  vcrCase.roughnessMap = wearRoughness;
  vcrCase.map = polymerPatina;
  box("VCR deck", 4.15, 0.59, 2.2, vcrCase, 0, 0.54, 0.1, scene, 0.06);
  box("VCR fascia", 4.05, 0.43, 0.1, material("#1c2423"), 0, 0.53, 1.24);
  box("tape insertion door", 2.15, 0.18, 0.03, black, -0.65, 0.58, 1.31);
  decal("VCR logo", "ABEI / Hi-Fi", 0.85, 0.15, -1.45, 0.36, 1.305, "#202626", "#b5b7a5", 25);
  const display = decal(
    "fluorescent time",
    "▶  00:23:08",
    1.05,
    0.23,
    1.2,
    0.59,
    1.31,
    "#152723",
    "#8fe7c8",
    40,
  );
  display.position.z = 1.36;
  box("VCR display surround", 1.16, 0.28, 0.045, material("#101614", 0.3), 1.2, 0.59, 1.326);
  box("VCR door top lip", 2.15, 0.018, 0.025, material("#484b41", 0.45, 0.2), -0.65, 0.68, 1.322);
  box("VCR door lower seam", 2.15, 0.012, 0.025, rubber, -0.65, 0.485, 1.322);
  box("VCR lid seam", 4.02, 0.012, 0.025, rubber, 0, 0.8, 1.2);
  for (const x of [-1.87, 1.87])
    for (const y of [0.36, 0.71]) {
      const screw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.023, 0.023, 0.012, 16),
        material("#77786a", 0.3, 0.8),
      );
      screw.name = "VCR fastener";
      screw.rotation.x = Math.PI / 2;
      screw.position.set(x, y, 1.302);
      scene.add(screw);
      box("VCR screw slot", 0.024, 0.004, 0.003, rubber, x, y, 1.31);
    }
  (display.material as THREE.MeshStandardMaterial).emissive.set("#69ad92");
  (display.material as THREE.MeshStandardMaterial).emissiveMap = (
    display.material as THREE.MeshStandardMaterial
  ).map;
  (display.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7;
  for (let i = 0; i < 5; i++)
    box("VCR transport key", 0.13, 0.05, 0.035, brass, 0.7 + i * 0.23, 0.36, 1.33);
  const vcrGroup = new THREE.Group();
  scene.add(vcrGroup);
  // Attaching children mutates scene.children, so iterate over a snapshot.
  // eslint-disable-next-line unicorn/no-useless-spread
  for (const part of [...scene.children]) {
    if (part.name.startsWith("VCR") || part.name === "tape insertion door" || part === display)
      vcrGroup.attach(part);
  }
  vcrGroup.scale.x = 0.87;
  mergeStaticMeshes(vcrGroup);
  const screenW = 2.604,
    screenH = 1.927,
    screenY = 2.4244,
    screenZ = 0.21;
  const screenTex = canvasMap(1200, 888, (c) => {
    c.fillStyle = "#173d8f";
    c.fillRect(0, 0, 1200, 888);
    c.strokeStyle = "#4470b8";
    c.lineWidth = 1;
    for (let i = 0; i < 32; i++) {
      c.beginPath();
      c.moveTo(0, 360 + i * 14);
      for (let x = 0; x <= 1200; x += 12)
        c.lineTo(x, 490 + i * 6 + Math.sin(x * 0.006 + i * 0.12) * 60);
      c.stroke();
    }
    c.fillStyle = "#dddcc7";
    c.font = "28px monospace";
    c.fillText("▶ PLAY   /   ABEI PERSONAL CHANNEL", 70, 80);
    c.font = "bold 140px sans-serif";
    c.fillText("你好，我是", 65, 278);
    c.fillText("阿北。", 65, 430);
    c.font = "26px monospace";
    c.fillText("THOUGHTS, PROJECTS & EVERYDAY LIFE", 70, 505);
    c.font = "24px monospace";
    c.fillText("CH 01                   HANGZHOU", 70, 808);
    const vignette = c.createRadialGradient(600, 440, 180, 600, 440, 710);
    vignette.addColorStop(0, "#00000000");
    vignette.addColorStop(0.78, "#00000004");
    vignette.addColorStop(1, "#00000075");
    c.fillStyle = vignette;
    c.fillRect(0, 0, 1200, 888);
    for (let y = 0; y < 888; y += 4) {
      c.fillStyle = "#00000018";
      c.fillRect(0, y, 1200, 1);
    }
  });
  const phosphorGeometry = new THREE.PlaneGeometry(screenW, screenH, 40, 30);
  const phosphorVertices = phosphorGeometry.attributes.position;
  for (let i = 0; i < phosphorVertices.count; i++) {
    const x = phosphorVertices.getX(i) / (screenW / 2),
      y = phosphorVertices.getY(i) / (screenH / 2);
    phosphorVertices.setZ(i, 0.045 * (1 - x * x) * (1 - y * y));
  }
  phosphorGeometry.computeVertexNormals();
  const screen = new THREE.Mesh(phosphorGeometry, new THREE.MeshBasicMaterial({ map: screenTex }));
  screen.position.set(0, screenY, screenZ);
  screen.userData.path = "/blog";
  scene.add(screen);
  const glassMask = canvasMap(128, 128, (c) => {
    c.fillStyle = "#000";
    c.fillRect(0, 0, 128, 128);
    c.fillStyle = "#fff";
    c.beginPath();
    c.roundRect(0, 0, 128, 128, 5);
    c.fill();
  });
  glassMask.colorSpace = THREE.NoColorSpace;
  screen.material.alphaMap = glassMask;
  screen.material.alphaTest = 0.4;
  screen.material.needsUpdate = true;
  const crtGlassGeometry = new THREE.PlaneGeometry(screenW, screenH, 48, 36);
  const glassVertices = crtGlassGeometry.attributes.position;
  for (let i = 0; i < glassVertices.count; i++) {
    const x = glassVertices.getX(i) / (screenW / 2),
      y = glassVertices.getY(i) / (screenH / 2);
    glassVertices.setZ(i, 0.075 * (1 - x * x) * (1 - y * y));
  }
  crtGlassGeometry.computeVertexNormals();
  const crtGlass = new THREE.Mesh(
    crtGlassGeometry,
    new THREE.MeshPhysicalMaterial({
      color: "#10171a",
      transparent: true,
      opacity: 0.15,
      alphaMap: glassMask,
      roughness: 0.12,
      metalness: 0.03,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
      envMapIntensity: 0.55,
      depthWrite: false,
    }),
  );
  crtGlass.position.set(0, screenY, screenZ + 0.005);
  scene.add(crtGlass);
  const targets: THREE.Object3D[] = [screen];
  // A hollow enamel shade with rolled edges, a recessed bulb and a weighted base.
  const lampPaint = new THREE.MeshPhysicalMaterial({
    color: "#a96445",
    metalness: 0.72,
    roughness: 0.27,
    clearcoat: 0.15,
    clearcoatRoughness: 0.3,
  });
  const baseProfile = [
    [0, 0],
    [0.47, 0],
    [0.53, 0.025],
    [0.54, 0.06],
    [0.51, 0.1],
    [0.41, 0.14],
    [0.15, 0.15],
    [0, 0.15],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const lampBase = new THREE.Mesh(new THREE.LatheGeometry(baseProfile, 80), lampPaint);
  lampBase.position.set(-3.9, 0.245, 0);
  lampBase.castShadow = lampBase.receiveShadow = true;
  scene.add(lampBase);
  cyl("lamp rubber foot", 0.48, 0.48, 0.02, rubber, -3.9, 0.245, 0);
  const lampStem = new THREE.MeshStandardMaterial({
    color: "#8e7960",
    metalness: 0.75,
    roughness: 0.3,
  });
  tube(
    [
      [-3.9, 0.37, 0],
      [-3.9, 1.6, 0],
      [-3.8, 2.65, -0.08],
      [-3.62, 3.22, -0.12],
    ],
    0.027,
    lampStem,
  );
  const shadeAssembly = new THREE.Group();
  shadeAssembly.position.set(-3.57, 3.05, -0.1);
  shadeAssembly.rotation.z = 0.2;
  scene.add(shadeAssembly);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.6, 0.73, 72, 1, true), lampPaint);
  shade.castShadow = shade.receiveShadow = true;
  shadeAssembly.add(shade);
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.585, 0.71, 72, 1, true),
    new THREE.MeshStandardMaterial({
      color: "#d7c7a8",
      roughness: 0.72,
      side: THREE.BackSide,
      emissive: "#cc8045",
      emissiveIntensity: 0.1,
    }),
  );
  shadeAssembly.add(inner);
  for (const [radius, y] of [
    [0.6, -0.365],
    [0.18, 0.365],
  ]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.014, 8, 72), lampPaint);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = y;
    shadeAssembly.add(rim);
  }
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 24, 16),
    new THREE.MeshBasicMaterial({ color: "#ffe3ae" }),
  );
  bulb.position.y = -0.12;
  shadeAssembly.add(bulb);
  const lamp = new THREE.PointLight("#ffcd96", 20, 10, 2);
  lamp.position.set(-3.49, 2.66, -0.08);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(1024, 1024);
  lamp.shadow.bias = -0.0004;
  lamp.shadow.normalBias = 0.018;
  lamp.shadow.radius = 18;
  lamp.shadow.intensity = 0.86;
  scene.add(lamp);
  const lampSpot = new THREE.SpotLight("#ffdaa6", 30, 9, 0.95, 0.7, 1.8);
  lampSpot.position.copy(lamp.position);
  lampSpot.target.position.set(-2.8, 0.2, 1.0);
  lampSpot.castShadow = true;
  lampSpot.shadow.mapSize.set(1024, 1024);
  lampSpot.shadow.radius = 4;
  lampSpot.shadow.bias = -0.0001;
  lampSpot.shadow.normalBias = 0.006;
  scene.add(lampSpot, lampSpot.target);
  scene.add(new THREE.HemisphereLight("#aebbc7", "#413324", 0.3));
  const warmBounce = new THREE.PointLight("#efbf8b", 20, 9, 2);
  warmBounce.position.set(-3.1, 1.8, 3.2);
  scene.add(warmBounce);
  const windowLight = new THREE.DirectionalLight("#a8bdcd", 0.65);
  windowLight.position.set(1, 7, -5);
  scene.add(windowLight);
  RectAreaLightUniformsLib.init();
  const softKey = new THREE.RectAreaLight("#ffe0b3", 4.5, 2.5, 4);
  softKey.position.set(-3, 4.7, 4);
  softKey.lookAt(-1, 1.8, 0);
  scene.add(softKey);
  const roomBounce = new THREE.RectAreaLight("#f1c69a", 1.4, 5, 4);
  roomBounce.position.set(-3.5, 2.7, 1);
  roomBounce.lookAt(-2, 3, -3.6);
  scene.add(roomBounce);
  const screenLight = new THREE.RectAreaLight("#537fd9", 1.6, 2.4, 1.8);
  screenLight.position.set(0, screenY, screenZ + 0.1);
  screenLight.lookAt(0, screenY, 5);
  scene.add(screenLight);
  const plant = createPlant(scene, textures, renderer.capabilities.getMaxAnisotropy(), () => {
    renderer.shadowMap.needsUpdate = true;
  });
  mergeStaticMeshes(plant);
  // Two uneven towers of VHS sleeves. Their spines are actual navigation targets.
  const apps = [
    ["文章 NOTES", "/blog", "#3a4d67"],
    ["项目 PROJECTS", "/project", "#9e7a43"],
    ["实验 PLAY", "/demo", "#69746a"],
    ["装备 USES", "/use", "#a26449"],
    ["相册 GALLERY", "/gallery", "#725a73"],
  ];
  for (let stack = 0; stack < 2; stack++)
    for (let i = 0; i < 5; i++) {
      const x = 2.85 + stack * 1.8 + (rng(i + stack * 33) - 0.5) * 0.29,
        y = 0.38 + i * 0.225,
        z = stack ? -0.7 : 0.1;
      const [label, path, color] = apps[i];
      const sleeve = box("VHS " + label, 1.7, 0.205, 1.04, material(color), x, y, z);
      sleeve.userData.path = path;
      targets.push(sleeve);
      const spine = decal(
        label,
        label,
        1.48,
        0.139,
        x,
        y,
        z + 0.53,
        i % 2 ? "#c7b986" : "#ded1b2",
        "#282b28",
        32,
      );
      spine.userData.path = path;
      targets.push(spine);
      const end = box("cassette black end", 0.1, 0.17, 1, black, x + 0.79, y, z);
      const tapeGroup = new THREE.Group();
      tapeGroup.position.set(x, y, z);
      scene.add(tapeGroup);
      tapeGroup.attach(sleeve);
      tapeGroup.attach(spine);
      tapeGroup.attach(end);
      tapeGroup.rotation.y = (rng(i + stack * 18) - 0.5) * 0.15;
      tapeGroup.rotation.z = (rng(i + stack * 39) - 0.5) * 0.014;
      for (let j = 0; j < 5; j++)
        box(
          "cassette edge rib",
          0.07,
          0.009,
          0.025,
          rubber,
          0.8,
          -0.06 + j * 0.027,
          0.515,
          tapeGroup,
          0.002,
        );
      const labelMap = canvasMap(512, 96, (c) => {
        c.fillStyle = ["#c3c9b3", "#273b38", "#d1ad6c", "#29384b", "#b8b398"][i];
        c.fillRect(0, 0, 512, 96);
        c.fillStyle = color;
        c.fillRect(0, 0, 34, 96);
        c.fillStyle = i === 1 || i === 3 ? "#dfdcc4" : "#33352e";
        c.font = (i % 2 ? "italic " : "bold ") + "34px monospace";
        c.fillText(label, 48, 48);
        c.font = "13px monospace";
        c.fillText("ABEI ARCHIVE  /  " + (1991 + i) + "   •   E-180", 49, 76);
        for (let j = 0; j < 170; j++) {
          c.fillStyle = j % 2 ? "#4a403912" : "#fff3cd30";
          c.fillRect(rng(j + i * 9) * 512, rng(j + 80) * 96, rng(j + 12) * 12, 1);
        }
        c.fillStyle = "#8b755225";
        c.fillRect(35, 0, 2, 96);
      });
      (spine.material as THREE.MeshStandardMaterial).map = labelMap;
      const carton = canvasMap(512, 256, (c) => {
        c.fillStyle = color;
        c.fillRect(0, 0, 512, 256);
        for (let k = 0; k < 9; k++) {
          const x = rng(k + i * 24) * 512,
            y = rng(k + 98) * 256;
          const g = c.createRadialGradient(x, y, 0, x, y, 60 + rng(k + 11) * 50);
          g.addColorStop(0, k % 2 ? "#e5d5bc20" : "#1a181511");
          g.addColorStop(1, "#ffffff00");
          c.fillStyle = g;
          c.fillRect(x - 110, y - 110, 220, 220);
        }
        c.strokeStyle = "#e4dbc04a";
        c.lineWidth = 2;
        c.strokeRect(2, 2, 508, 252);
        for (let j = 0; j < 1900; j++) {
          c.fillStyle = j % 3 ? "#e8dec00b" : "#171b1914";
          c.fillRect(rng(j + i * 9) * 512, rng(j + 80) * 256, 0.5 + rng(j + 12) * 5, 1);
        }
        for (let j = 0; j < 14; j++) {
          c.strokeStyle = "#e4dbc030";
          c.beginPath();
          const x = rng(j + 61) * 512;
          c.moveTo(x, 1);
          c.lineTo(x + 2 + rng(j) * 11, 2);
          c.stroke();
        }
      });
      (sleeve.material as THREE.MeshStandardMaterial).map = carton;
      (sleeve.material as THREE.MeshStandardMaterial).color.set("#ffffff");
    }
  // Phone, cup with handle, writing pad, pencil, remote and floppy disks give the desk human scale.
  const { book, telephone } = createStillLife(scene, textures);
  mergeStaticMeshes(book);
  mergeStaticMeshes(telephone);
  const ceramic = new THREE.MeshPhysicalMaterial({
    color: "#bbbca5",
    roughness: 0.22,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.18,
  });
  const cupProfile = [
    [0, 0],
    [0.23, 0],
    [0.28, 0.025],
    [0.31, 0.12],
    [0.335, 0.59],
    [0.34, 0.64],
    [0.33, 0.665],
    [0.31, 0.665],
    [0.3, 0.64],
    [0.295, 0.16],
    [0.25, 0.07],
    [0, 0.07],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const mug = new THREE.Mesh(new THREE.LatheGeometry(cupProfile, 96), ceramic);
  mug.position.set(-1.9, 0.245, 1.9);
  mug.castShadow = mug.receiveShadow = true;
  scene.add(mug);
  cyl(
    "coffee surface",
    0.292,
    0.292,
    0.008,
    new THREE.MeshPhysicalMaterial({ color: "#1c120b", roughness: 0.12, clearcoat: 1 }),
    -1.9,
    0.79,
    1.9,
  );
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.055, 16, 40), ceramic);
  handle.scale.y = 1.12;
  handle.position.set(-2.23, 0.59, 1.9);
  handle.castShadow = handle.receiveShadow = true;
  scene.add(handle);
  box("notebook cover", 1.6, 0.06, 1.25, material("#6b7660"), -3.6, 0.28, 1.7);
  const pad = box("notebook pages", 1.5, 0.055, 1.17, paper, -3.6, 0.34, 1.68);
  const pageMap = canvasMap(512, 512, (c) => {
    c.fillStyle = "#d8cda7";
    c.fillRect(0, 0, 512, 512);
    c.strokeStyle = "#a9ad99";
    for (let y = 60; y < 490; y += 27) {
      c.beginPath();
      c.moveTo(30, y);
      c.lineTo(480, y);
      c.stroke();
    }
    c.fillStyle = "#4e6159";
    c.font = "28px cursive";
    c.fillText("ideas for a rainy day", 35, 55);
    c.fillText("build something small.", 35, 145);
  });
  const page = new THREE.Mesh(
    new THREE.PlaneGeometry(1.46, 1.13),
    new THREE.MeshStandardMaterial({ map: pageMap, roughness: 0.9 }),
  );
  page.rotation.x = -Math.PI / 2;
  page.position.set(-3.6, 0.373, 1.68);
  scene.add(page);
  tube(
    [
      [-4.55, 0.3, 1.2],
      [-4.35, 0.3, 2.15],
    ],
    0.028,
    material("#bd9555"),
  );
  box("remote", 1.5, 0.12, 0.42, black, 1.2, 0.34, 2.05);
  for (let i = 0; i < 18; i++)
    box(
      "remote button",
      0.09,
      0.035,
      0.06,
      i === 0 ? material("#9a3f2c") : rubber,
      0.65 + (i % 6) * 0.2,
      0.417,
      1.95 + Math.floor(i / 6) * 0.1,
    );
  for (let i = 0; i < 2; i++) {
    box("floppy", 0.76, 0.045, 0.77, material("#414d55"), 6.0 + i * 0.25, 0.28 + i * 0.055, 2.15);
    box("floppy label", 0.57, 0.006, 0.3, paper, 6.0 + i * 0.25, 0.306 + i * 0.055, 2.32);
    box("floppy shutter", 0.36, 0.012, 0.23, brass, 6.0 + i * 0.25, 0.31 + i * 0.055, 1.91);
  }
  // A printed poster belongs to the room, while keeping the owner's identity original.
  const poster = canvasMap(512, 768, (c) => {
    c.fillStyle = "#304c96";
    c.fillRect(0, 0, 512, 768);
    c.fillStyle = "#d4cba4";
    c.font = "bold 72px sans-serif";
    c.fillText("STAY", 35, 100);
    c.fillText("CURIOUS.", 35, 180);
    c.font = "22px monospace";
    c.fillText("BUILD · WRITE · EXPLORE", 35, 700);
    c.strokeStyle = "#9b9c9d";
    for (let i = 0; i < 16; i++) {
      c.beginPath();
      c.ellipse(256, 420, 190, 30 + i * 4, i * 0.1, 0, Math.PI * 2);
      c.stroke();
    }
  });
  const posterMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.65, 2.48),
    new THREE.MeshStandardMaterial({ map: poster, roughness: 1 }),
  );
  posterMesh.position.set(7, 4.6, -3.62);
  scene.add(posterMesh);
  const sceneTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, sceneTarget);
  composer.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(
    scene,
    camera,
    512,
    512,
    undefined,
    { radius: 0.25, thickness: 0.35, samples: 8, distanceExponent: 1.4, scale: 0.9 },
    { radius: 6, lumaPhi: 10, depthPhi: 2, normalPhi: 3 },
  );
  ao.blendIntensity = 0.85;
  composer.addPass(ao);
  const bokeh = new BokehPass(scene, camera, { focus: 11, aperture: 0.00022, maxblur: 0.0025 });
  composer.addPass(bokeh);
  // Transparent glass must not turn the entire window into a near opaque depth plane.
  const renderBokeh = bokeh.render.bind(bokeh);
  bokeh.render = (...args) => {
    const windowVisible = glass.visible,
      crtVisible = crtGlass.visible;
    glass.visible = crtGlass.visible = false;
    try {
      renderBokeh(...args);
    } finally {
      glass.visible = windowVisible;
      crtGlass.visible = crtVisible;
    }
  };
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.18, 0.55, 0.85);
  composer.addPass(bloom);
  const output = new OutputPass();
  composer.addPass(output);
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:
      "uniform sampler2D tDiffuse; varying vec2 vUv; void main(){vec4 c=texture2D(tDiffuse,vUv);float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;float edge=smoothstep(.24,.78,length((vUv-.5)*vec2(1.05,1.0)));c.rgb=c.rgb*(1.0-edge*.16)+grain*.030;gl_FragColor=c;}",
  });
  composer.addPass(finish);
  let focused = props.focused,
    mouseX = 0,
    mouseY = 0,
    frame = 0,
    previous = 0;
  const profiling = import.meta.env.DEV && new URLSearchParams(location.search).has("profileScene");
  const frameSamples: number[] = [];
  let profileFrames = 0;
  if (profiling) renderer.info.autoReset = false;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const look = new THREE.Vector3(0, 3.1, -0.2),
    dest = new THREE.Vector3(),
    target = new THREE.Vector3();
  camera.position.set(0, 4.1, 12.5);
  const panel = el.parentElement?.querySelector<HTMLElement>(".device-screen");
  setFocused = (v) => {
    focused = v;
    screen.visible = !v;
    crtGlass.visible = !v;
    bokeh.enabled = !v;
  };
  setFocused(focused);
  const ray = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  function hit(e: PointerEvent | MouseEvent) {
    const r = el.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
    ray.setFromCamera(pointer, camera);
    return ray.intersectObjects(targets)[0];
  }
  function move(e: PointerEvent) {
    const h = hit(e);
    mouseX = pointer.x;
    mouseY = pointer.y;
    el.style.cursor = h ? "pointer" : "default";
    el.title = h ? `打开 ${h.object.name || "文章"}` : "";
  }
  function click(e: MouseEvent) {
    const h = hit(e);
    if (h?.object.userData.path) emit("open", h.object.userData.path);
  }
  el.addEventListener("pointermove", move);
  el.addEventListener("click", click);
  function resize() {
    const w = Math.max(el.clientWidth, 1),
      h = Math.max(el.clientHeight, 1);
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bokeh.setSize(Math.max(1, Math.round(w * 0.75)), Math.max(1, Math.round(h * 0.75)));
    ao.setSize(Math.max(1, Math.round(w * 0.6)), Math.max(1, Math.round(h * 0.6)));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
  const corners = [
    new THREE.Vector3(-screenW / 2, screenY + screenH / 2, screenZ),
    new THREE.Vector3(screenW / 2, screenY + screenH / 2, screenZ),
    new THREE.Vector3(-screenW / 2, screenY - screenH / 2, screenZ),
    new THREE.Vector3(screenW / 2, screenY - screenH / 2, screenZ),
  ];
  function projectPanel() {
    if (!panel || !focused || innerWidth <= 700 || el.closest(".scene-expanded")) return;
    const r = el.getBoundingClientRect();
    const p = corners.map((v) => {
      const n = v.clone().project(camera);
      return { x: r.left + ((n.x + 1) * r.width) / 2, y: r.top + ((1 - n.y) * r.height) / 2 };
    });
    const w = 720,
      h = (screenH / screenW) * w;
    const [a, b, c, d] = p;
    const dx = b.x - d.x,
      dy = b.y - d.y,
      ex = c.x - d.x,
      ey = c.y - d.y;
    const sx = a.x - b.x - c.x + d.x,
      sy = a.y - b.y - c.y + d.y;
    const den = dx * ey - ex * dy;
    const g = (sx * ey - ex * sy) / den,
      k = (dx * sy - sx * dy) / den;
    const m = [
      (b.x - a.x + g * b.x) / w,
      (b.y - a.y + g * b.y) / w,
      0,
      g / w,
      (c.x - a.x + k * c.x) / h,
      (c.y - a.y + k * c.y) / h,
      0,
      k / h,
      0,
      0,
      1,
      0,
      a.x,
      a.y,
      0,
      1,
    ];
    panel.style.left = "0";
    panel.style.top = "0";
    panel.style.width = `${w}px`;
    panel.style.height = `${h}px`;
    panel.style.transformOrigin = "0 0";
    panel.style.transform = `matrix3d(${m.join(",")})`;
  }
  function render(now = 0) {
    frame = requestAnimationFrame(render);
    const dt = Math.min((now - previous) / 1000, 0.05) || 0.016;
    if (
      profiling &&
      previous &&
      !document.hidden &&
      ++profileFrames > 60 &&
      frameSamples.length < 120
    ) {
      frameSamples.push(now - previous);
      if (frameSamples.length === 120) {
        const sorted = [...frameSamples].sort((a, b) => a - b);
        console.info(
          "SCENE_PROFILE",
          JSON.stringify({
            medianFrameMs: sorted[60],
            p95FrameMs: sorted[114],
            calls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
            textures: renderer.info.memory.textures,
          }),
        );
      }
    }
    previous = now;
    if (document.hidden || innerWidth <= 700) return;
    const aspect = Math.max(camera.aspect, 0.7);
    const homeZ = aspect < 1.4 ? 16 : 11.1;
    dest.set(
      focused || reduce ? 0 : mouseX * 0.12,
      focused ? screenY : 4.0 + (reduce ? 0 : mouseY * 0.05),
      focused
        ? screenZ +
            Math.max(
              screenH / (2 * Math.tan(THREE.MathUtils.degToRad(19)) * 0.63),
              screenW / (2 * Math.tan(THREE.MathUtils.degToRad(19)) * aspect * 0.77),
            )
        : homeZ,
    );
    target.set(0, focused ? screenY : 3.0, focused ? screenZ : -0.2);
    const alpha = reduce ? 1 : 1 - Math.exp(-dt * 5);
    camera.position.lerp(dest, alpha);
    look.lerp(target, alpha);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    projectPanel();
    bokeh.uniforms.focus.value = camera.position.distanceTo(screen.position);
    rain.position.y = reduce ? 0 : -((now * 0.00008) % 0.5);
    if (profiling) renderer.info.reset();
    composer.render();
  }
  render();
  cleanup = () => {
    alive = false;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("click", click);
    const mats = new Set<THREE.Material>();
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => mats.add(m));
      }
    });
    mats.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    ao.dispose();
    bokeh.dispose();
    bloom.dispose();
    output.dispose();
    finish.dispose();
    composer.dispose();
    environment.dispose();
    renderer.dispose();
    if (panel)
      for (const p of ["left", "top", "width", "height", "transform", "transform-origin"])
        panel.style.removeProperty(p);
  };
});
onUnmounted(() => cleanup());
</script>
<template>
  <canvas
    ref="canvas"
    class="desk-canvas"
    :class="{ 'scene-failed': failed }"
    aria-label="互动复古书桌：点击显示器或录像带打开应用"
  />
</template>

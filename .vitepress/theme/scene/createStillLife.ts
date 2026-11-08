import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function createStillLife(scene: THREE.Scene, textures: THREE.Texture[]) {
  const material = (color: string, roughness = 0.7, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const mesh = (
    geometry: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = scene,
  ) => {
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(x, y, z);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const box = (
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = scene,
    r = 0.02,
  ) => mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat, x, y, z, parent);
  const tube = (
    points: number[][],
    radius: number,
    mat: THREE.Material,
    parent: THREE.Object3D = scene,
  ) =>
    mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))),
        32,
        radius,
        8,
        false,
      ),
      mat,
      0,
      0,
      0,
      parent,
    );
  const map = (w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    paint(canvas.getContext("2d")!);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    return texture;
  };
  // Thin metal walls, rolled rims and a dark recessed interior, rather than a solid cylinder.
  const steel = material("#9d9277", 0.43, 0.72);
  const cupProfile = [
    [0.19, 0],
    [0.22, 0.025],
    [0.26, 0.56],
    [0.255, 0.59],
    [0.242, 0.59],
    [0.245, 0.54],
    [0.205, 0.05],
    [0, 0.05],
  ];
  const holder = mesh(
    new THREE.LatheGeometry(
      cupProfile.map(([r, y]) => new THREE.Vector2(r, y)),
      48,
    ),
    steel,
    -4.75,
    0.245,
    1.8,
  );
  holder.name = "Brushed pencil cup";
  const pencilColors = ["#8c772e", "#53614b", "#b8a383"];
  for (let i = 0; i < 3; i++) {
    const group = new THREE.Group();
    group.position.set(-4.84 + i * 0.09, 0.39, 1.78 + (i % 2) * 0.08);
    group.rotation.set(0.08 - i * 0.08, 0, -0.18 + i * 0.16);
    scene.add(group);
    mesh(
      new THREE.CylinderGeometry(0.023, 0.023, 1.04, 6),
      material(pencilColors[i], 0.6),
      0,
      0.52,
      0,
      group,
    );
    mesh(new THREE.CylinderGeometry(0.003, 0.023, 0.12, 6), material("#bd9e70"), 0, 1.1, 0, group);
    mesh(new THREE.ConeGeometry(0.006, 0.035, 8), material("#292b2a"), 0, 1.175, 0, group);
  }
  const book = new THREE.Group();
  book.name = "Open field notebook";
  book.position.set(4.05, 0.27, 1.65);
  book.rotation.y = -0.12;
  scene.add(book);
  const cover = material("#35483e", 0.9);
  box(3.15, 0.05, 1.7, cover, 0, 0, 0, book);
  // The spine dips, while the outer page edges lift and separate subtly.
  for (const side of [-1, 1]) {
    for (let layer = 0; layer < 5; layer++) {
      const geometry = new THREE.PlaneGeometry(1.5, 1.6, 20, 6);
      const p = geometry.attributes.position;
      for (let j = 0; j < p.count; j++) {
        const u = p.getX(j) / 1.5 + 0.5;
        const rise = 0.03 + Math.sin(u * Math.PI) * 0.085 + Math.pow(u, 5) * 0.03 + layer * 0.006;
        p.setXYZ(j, side * (0.025 + u * 1.5), rise, -p.getY(j));
      }
      geometry.computeVertexNormals();
      mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: layer % 2 ? "#c9bb9b" : "#d9cba8",
          roughness: 0.95,
          side: THREE.DoubleSide,
        }),
        0,
        0,
        0,
        book,
      );
    }
    const pageMap = map(768, 768, (c) => {
      c.fillStyle = "#e2d6b7";
      c.fillRect(0, 0, 768, 768);
      c.strokeStyle = "#a8b5aa65";
      c.lineWidth = 1;
      for (let y = 140; y < 725; y += 43) {
        c.beginPath();
        c.moveTo(42, y);
        c.lineTo(735, y);
        c.stroke();
      }
      c.fillStyle = "#4f6059";
      c.font = "italic 26px serif";
      const lines =
        side < 0
          ? [
              "Notes from Hangzhou",
              "8 November / Sunday",
              "",
              "Observe the ordinary.",
              "A little light, a rainy window.",
              "",
              "Things to build:",
              "  — a place for thoughts",
              "  — keep the small details",
              "",
              "Make room for curiosity.",
            ]
          : [
              "Ideas / in progress",
              "",
              "The shape of a quiet evening.",
              "",
              "Read. Make. Take a walk.",
              "",
              "Listen to the rain.",
              "",
              "More photographs,",
              "fewer open tabs.",
            ];
      lines.forEach((line, i) => c.fillText(line, 48, 88 + i * 44));
      c.strokeStyle = "#6d776988";
      c.lineWidth = 2;
      c.strokeRect(460, 560, 190, 120);
      c.beginPath();
      c.moveTo(555, 560);
      c.lineTo(555, 680);
      c.moveTo(460, 620);
      c.lineTo(650, 620);
      c.stroke();
    });
    const geometry = new THREE.PlaneGeometry(1.5, 1.6, 24, 8),
      p = geometry.attributes.position;
    for (let j = 0; j < p.count; j++) {
      const u = p.getX(j) / 1.5 + 0.5;
      p.setXYZ(
        j,
        side * (0.025 + u * 1.5),
        0.063 + Math.sin(u * Math.PI) * 0.085 + Math.pow(u, 5) * 0.03,
        -p.getY(j),
      );
    }
    if (side < 0) {
      const uv = geometry.attributes.uv;
      for (let j = 0; j < uv.count; j++) uv.setX(j, 1 - uv.getX(j));
    }
    geometry.computeVertexNormals();
    mesh(
      geometry,
      new THREE.MeshStandardMaterial({ map: pageMap, roughness: 0.95, side: THREE.DoubleSide }),
      0,
      0,
      0,
      book,
    );
  }
  const glasses = new THREE.Group();
  glasses.position.set(4.65, 0.47, 2.0);
  glasses.rotation.order = "YXZ";
  glasses.rotation.y = -0.4;
  glasses.rotation.x = -Math.PI / 2 + 0.08;
  glasses.scale.setScalar(0.9);
  scene.add(glasses);
  const frame = material("#655443", 0.27, 0.78);
  for (const side of [-1, 1]) {
    const rim = mesh(
      new THREE.TorusGeometry(0.26, 0.012, 8, 48),
      frame,
      side * 0.31,
      0,
      0,
      glasses,
    );
    rim.scale.y = 0.76;
    const lens = mesh(
      new THREE.CircleGeometry(0.247, 48),
      new THREE.MeshPhysicalMaterial({
        color: "#c1cdbb",
        transparent: true,
        opacity: 0.32,
        roughness: 0.06,
        metalness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 2.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      side * 0.31,
      0,
      0,
      glasses,
    );
    lens.scale.y = 0.76;
    tube(
      [
        [side * 0.56, 0.03, 0],
        [side * 0.62, 0.05, 0.03],
        [side * 0.63, 0.7, 0.04],
        [side * 0.57, 0.86, 0.05],
      ],
      0.012,
      frame,
      glasses,
    );
  }
  tube(
    [
      [-0.06, 0.02, 0],
      [0, 0.065, 0],
      [0.06, 0.02, 0],
    ],
    0.013,
    frame,
    glasses,
  );

  // A sloped ivory telephone atop its answering unit, with dark seams and recessed keys.
  const telephone = new THREE.Group();
  telephone.position.set(5.75, 0.24, -0.85);
  telephone.rotation.y = -0.14;
  scene.add(telephone);
  const ivory = material("#c2b99f", 0.53),
    seam = material("#504c40", 0.85),
    keys = material("#b0a68f", 0.43);
  box(1.65, 0.5, 1.18, ivory, 0, 0.25, 0, telephone, 0.065);
  box(1.57, 0.03, 1.12, seam, 0, 0.49, 0, telephone, 0.01);
  const deck = box(1.6, 0.2, 1.11, ivory, 0, 0.6, 0, telephone, 0.065);
  deck.rotation.x = 0.12;
  box(0.56, 0.19, 0.02, material("#2d3732", 0.24), 0.35, 0.29, 0.598, telephone, 0.025);
  box(0.75, 0.23, 0.02, seam, -0.41, 0.27, 0.598, telephone, 0.025);
  for (let i = 0; i < 12; i++)
    box(0.53, 0.007, 0.009, material("#34352d"), -0.42, 0.18 + i * 0.015, 0.614, telephone, 0.002);
  const handset = new THREE.Group();
  handset.position.set(0, 0.87, -0.22);
  handset.rotation.y = 0.08;
  telephone.add(handset);
  const hp: number[] = [],
    hi: number[] = [],
    hn = 32,
    hs = 24;
  for (let ring = 0; ring <= hn; ring++) {
    const x = (ring / hn - 0.5) * 1.56,
      end = Math.pow(Math.abs(x) / 0.78, 3);
    const cap = Math.sqrt(Math.max(0.002, 1 - Math.pow(Math.max(0, Math.abs(x) - 0.62) / 0.16, 2)));
    for (let segment = 0; segment <= hs; segment++) {
      const a = (segment / hs) * Math.PI * 2,
        cy = 0.035 * (1 - Math.abs(x) / 0.78);
      hp.push(
        x,
        cy +
          Math.sign(Math.cos(a)) *
            Math.pow(Math.abs(Math.cos(a)), 0.65) *
            (0.085 + 0.065 * end) *
            cap,
        Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 0.65) * (0.12 + 0.1 * end) * cap,
      );
      if (ring > 0 && segment > 0) {
        const d = ring * (hs + 1) + segment,
          a = d - hs - 2,
          b = a + 1,
          c = d - 1;
        hi.push(a, b, d, a, d, c);
      }
    }
  }
  const receiverGeometry = new THREE.BufferGeometry();
  receiverGeometry.setAttribute("position", new THREE.Float32BufferAttribute(hp, 3));
  receiverGeometry.setIndex(hi);
  receiverGeometry.computeVertexNormals();
  mesh(receiverGeometry, ivory, 0, 0, 0, handset);
  for (const side of [-1, 1]) {
    box(0.28, 0.017, 0.29, seam, side * 0.57, -0.175, 0, handset, 0.03);
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 3; col++) {
        mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.005, 8),
          seam,
          side * 0.57 + (col - 1) * 0.055,
          0.107,
          (row - 1) * 0.055,
          handset,
        );
      }
  }
  for (let i = 0; i < 12; i++) {
    const x = -0.22 + (i % 3) * 0.21,
      y = 0.735 + Math.floor(i / 3) * 0.012,
      z = 0.04 + Math.floor(i / 3) * 0.16;
    box(0.15, 0.035, 0.12, keys, x, y, z, telephone, 0.018);
    const keyMap = map(64, 64, (c) => {
      c.fillStyle = "#b0a68f";
      c.fillRect(0, 0, 64, 64);
      c.fillStyle = "#383f35";
      c.font = "38px monospace";
      c.textAlign = "center";
      c.fillText(["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"][i], 32, 45);
    });
    const keyFace = mesh(
      new THREE.PlaneGeometry(0.115, 0.09),
      new THREE.MeshStandardMaterial({ map: keyMap, roughness: 0.6 }),
      x,
      y + 0.018,
      z,
      telephone,
    );
    keyFace.rotation.x = -Math.PI / 2;
  }
  const cordPoints: number[][] = [];
  for (let i = 0; i <= 140; i++) {
    const t = i / 140;
    cordPoints.push(
      0.79 + Math.sin(t * Math.PI * 32) * 0.043,
      0.82 - t * 0.64,
      -0.2 + t * 0.9 + Math.cos(t * Math.PI * 32) * 0.043,
    );
  }
  tube(cordPoints, 0.011, material("#726c59"), telephone);
  return { book, telephone };
}

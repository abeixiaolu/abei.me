import * as THREE from "three";
import leafContours from "./pothosContours";

/** A rooted pothos: petioles join branching vines, while each leaf has its own
 * midrib, cupping, twist and drooping tip. Alpha only defines its botanical edge. */
export function createPlant(
  scene: THREE.Scene,
  textures: THREE.Texture[],
  anisotropy: number,
  onTextureReady: () => void,
) {
  const plant = new THREE.Group();
  plant.name = "Golden pothos in aged terracotta";
  plant.position.set(-5.8, 0.245, -0.5);
  scene.add(plant);
  const random = (n: number) => {
    const x = Math.sin(n * 127.1 + 17.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const map = (w: number, h: number, paint: (c: CanvasRenderingContext2D) => void) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    paint(canvas.getContext("2d")!);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = anisotropy;
    textures.push(texture);
    return texture;
  };
  const clayMap = map(512, 512, (c) => {
    c.fillStyle = "#9f6347";
    c.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y++) {
      c.fillStyle = `rgba(46,28,18,${0.018 + 0.025 * Math.sin(y * 0.26)})`;
      c.fillRect(0, y, 512, 1);
    }
    for (let i = 0; i < 16000; i++) {
      c.fillStyle = i % 3 ? "#e9c2a00d" : "#402a2415";
      c.fillRect(random(i) * 512, random(i + 81) * 512, 0.5 + random(i + 21), 0.5 + random(i + 39));
    }
    for (let i = 0; i < 42; i++) {
      const x = random(i + 701) * 512,
        y = 40 + random(i + 311) * 150;
      const g = c.createRadialGradient(x, y, 0, x, y, 25 + random(i + 99) * 35);
      g.addColorStop(0, "#e0d4bc13");
      g.addColorStop(1, "#d9cbb100");
      c.fillStyle = g;
      c.fillRect(x - 70, y - 70, 140, 140);
    }
  });
  const clayBump = clayMap.clone();
  clayBump.colorSpace = THREE.NoColorSpace;
  textures.push(clayBump);
  const clay = new THREE.MeshStandardMaterial({
    map: clayMap,
    bumpMap: clayBump,
    bumpScale: 0.003,
    roughness: 0.92,
  });
  const profile = [
    [0.41, 0.015],
    [0.43, 0.025],
    [0.47, 0.1],
    [0.59, 0.39],
    [0.68, 0.73],
    [0.69, 0.83],
    [0.73, 0.85],
    [0.74, 0.89],
    [0.73, 0.94],
    [0.69, 0.96],
    [0.65, 0.94],
    [0.65, 0.88],
    [0.61, 0.74],
    [0.52, 0.4],
    [0.4, 0.09],
    [0.0, 0.09],
  ];
  const pot = new THREE.Mesh(
    new THREE.LatheGeometry(
      profile.map(([r, y]) => new THREE.Vector2(r, y)),
      96,
    ),
    clay,
  );
  pot.name = "Hollow thrown terracotta pot";
  pot.castShadow = pot.receiveShadow = true;
  plant.add(pot);
  const soilMaterial = new THREE.MeshStandardMaterial({ color: "#282319", roughness: 1 });
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.615, 0.615, 0.035, 48), soilMaterial);
  soil.position.y = 0.84;
  soil.receiveShadow = true;
  plant.add(soil);
  // Small irregular aggregate breaks up the flat soil plane at a believable scale.
  const grains = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(0.025, 0),
    soilMaterial,
    150,
  );
  const transform = new THREE.Object3D();
  for (let i = 0; i < 150; i++) {
    const a = random(i) * Math.PI * 2,
      r = Math.sqrt(random(i + 800)) * 0.6;
    transform.position.set(Math.cos(a) * r, 0.865, Math.sin(a) * r);
    transform.rotation.set(i, i * 0.7, i * 0.4);
    transform.scale.setScalar(0.45 + random(i + 300) * 1.3);
    transform.updateMatrix();
    grains.setMatrixAt(i, transform.matrix);
  }
  grains.castShadow = grains.receiveShadow = true;
  plant.add(grains);
  const leafMap = new THREE.TextureLoader().load("/textures/pothos-atlas-v2.webp", onTextureReady);
  leafMap.colorSpace = THREE.SRGBColorSpace;
  leafMap.anisotropy = anisotropy;
  textures.push(leafMap);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: "#59633a", roughness: 0.72 });
  const materials = [0, 1, 2, 3].map(
    (i) =>
      new THREE.MeshPhysicalMaterial({
        map: leafMap,
        color: ["#f4f4df", "#d4e0bd", "#eee3c1", "#c0cbb2"][i],
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.62 + i * 0.025,
        metalness: 0,
        clearcoat: 0.08,
        clearcoatRoughness: 0.58,
        envMapIntensity: 1.3,
      }),
  );
  function vine(points: number[][], radius: number) {
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          points.map((p) => new THREE.Vector3(...(p as [number, number, number]))),
        ),
        20,
        radius,
        7,
        false,
      ),
      stemMaterial,
    );
    mesh.castShadow = mesh.receiveShadow = true;
    plant.add(mesh);
  }
  // Positions are irregular growing nodes, not an evenly spaced radial spray.
  const branches = [
    [
      [-0.12, 0.83, 0],
      [-0.22, 1.5, -0.1],
      [-0.4, 2.2, -0.16],
      [-0.36, 2.9, -0.24],
    ],
    [
      [0.06, 0.84, 0.03],
      [0.21, 1.4, -0.06],
      [0.38, 1.95, -0.28],
      [0.7, 2.45, -0.2],
    ],
    [
      [-0.03, 0.84, 0.04],
      [-0.4, 1.35, 0.12],
      [-0.82, 1.8, 0.21],
      [-1.2, 1.95, 0.26],
    ],
    [
      [0.12, 0.85, 0.08],
      [0.42, 1.2, 0.33],
      [0.83, 1.5, 0.46],
      [1.15, 1.45, 0.67],
    ],
    [
      [-0.08, 0.85, 0.16],
      [-0.36, 1.2, 0.49],
      [-0.63, 1.05, 0.73],
      [-0.79, 0.55, 0.86],
    ],
    [
      [0.15, 0.84, -0.1],
      [0.48, 1.35, -0.38],
      [0.83, 1.82, -0.61],
      [1.05, 2.02, -0.69],
    ],
  ];
  branches.forEach((points, i) => vine(points, 0.015 - i * 0.001));
  // x,y,z, width,height, pitch,yaw,roll. Each blade starts at its petiole.
  const leaves = [
    [-0.37, 2.72, -0.23, 0.71, 0.99, 0.27, -0.3, 0.3],
    [-0.39, 2.22, -0.16, 0.87, 1.12, 0.5, 0.2, 0.95],
    [-0.29, 1.72, -0.06, 0.79, 1.02, 0.48, -0.5, -0.95],
    [0.61, 2.29, -0.22, 0.7, 0.98, 0.42, 0.4, -0.55],
    [0.37, 1.92, -0.22, 0.85, 1.03, 0.62, -0.3, 0.62],
    [0.18, 1.42, 0.0, 0.76, 1.02, 0.95, 0.5, -1.2],
    [-0.8, 1.77, 0.22, 0.86, 1.1, 0.8, 0.1, 1.25],
    [-1.1, 1.91, 0.25, 0.73, 0.98, 0.4, -0.35, 1.65],
    [-0.44, 1.4, 0.12, 0.75, 0.95, 1.1, -0.2, 0.6],
    [0.79, 1.46, 0.47, 0.86, 1.1, 0.9, 0.3, -1.35],
    [1.1, 1.43, 0.65, 0.7, 0.91, 0.3, -0.2, -2.05],
    [0.44, 1.21, 0.34, 0.77, 0.99, 0.75, 0.15, -0.6],
    [-0.38, 1.19, 0.5, 0.88, 1.05, 0.45, -0.15, 2.45],
    [-0.66, 1.03, 0.73, 0.7, 0.93, 0.22, 0.2, 2.9],
    [-0.78, 0.59, 0.87, 0.51, 0.7, 0.3, -0.1, 2.8],
    [0.46, 1.31, -0.38, 0.75, 1.02, -0.45, 1.1, -1.0],
    [0.8, 1.77, -0.6, 0.81, 1.05, 0.1, 0.8, -0.4],
    [0.97, 2.0, -0.66, 0.61, 0.85, 0.15, 0.2, -0.85],
    [-0.13, 1.1, 0.21, 0.69, 0.85, 1.1, -0.3, 1.5],
    [0.04, 1.6, -0.12, 0.57, 0.82, 0.1, -1.0, -0.5],
    [-0.26, 2.48, -0.22, 0.55, 0.83, -0.25, 1.0, -0.8],
    [0.35, 1.58, -0.16, 0.62, 0.86, -0.2, -0.8, 0.6],
    [-0.2, 1.4, 0.2, 0.83, 1.05, 0.42, -0.4, -0.65],
    [-0.22, 1.85, 0.0, 0.71, 0.98, 0.75, 0.4, 0.9],
    [0.17, 1.9, -0.16, 0.75, 1.05, 0.4, -0.3, -0.1],
    [-0.53, 1.59, 0.16, 0.73, 0.91, 0.5, 0.6, 1.8],
    [0.54, 1.31, 0.38, 0.76, 0.91, 0.4, -0.2, 1.8],
    [-0.12, 1.08, 0.24, 0.73, 0.92, 0.4, 0.2, -2.6],
    [0.1, 1.16, -0.02, 0.71, 0.98, -0.25, 1.4, -0.8],
    [-0.48, 2.05, -0.12, 0.65, 0.86, 0.2, -0.5, 1.25],
  ];
  leaves.forEach(([x, y, z, w, h, pitch, yaw, roll], i) => {
    const leaf = new THREE.Group();
    leaf.position.set(x, y, z);
    leaf.rotation.set(pitch, yaw, roll);
    plant.add(leaf);
    const positions: number[] = [],
      uvs: number[] = [],
      indices: number[] = [];
    const rows = leafContours[i % 4],
      segments = 12;
    for (let row = 0; row < rows.length; row++) {
      const [t, left, right] = rows[row];
      for (let col = 0; col <= segments; col++) {
        const u = left + ((right - left) * col) / segments,
          across = (u - 0.5) * 2;
        const bend = 0.12 * Math.sin(t * Math.PI) - 0.19 * t * t * t;
        const cup = 0.09 * Math.pow(Math.abs(across), 1.5) * Math.sin(t * Math.PI);
        const twist = (i % 2 ? 1 : -1) * 0.1 * across * t * t;
        positions.push(
          (u - 0.5) * w,
          t * h,
          bend + cup + twist + 0.012 * Math.sin(t * 17 + i) * across * across,
        );
        uvs.push((u + (i % 2)) * 0.5, (t + (i % 4 < 2 ? 1 : 0)) * 0.5);
        if (row > 0 && col > 0) {
          const d = row * (segments + 1) + col,
            a = d - segments - 2,
            b = a + 1,
            c = d - 1;
          indices.push(a, b, d, a, d, c);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const blade = new THREE.Mesh(geometry, materials[i % 4]);
    blade.name = `Pothos leaf ${i + 1}`;
    blade.castShadow = blade.receiveShadow = true;
    leaf.add(blade);
    const petiole = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, -0.1, 0),
          new THREE.Vector3(0, 0.04, 0.01),
          new THREE.Vector3(0, 0.15, 0.025),
        ]),
        6,
        0.008,
        6,
        false,
      ),
      stemMaterial,
    );
    leaf.add(petiole);
  });
  return plant;
}

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Batch rigid parts after authoring. The source still retains each editable part;
 * interactive meshes, transparent surfaces and instancing are never flattened. */
export function mergeStaticMeshes(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const groups = new Map<string, THREE.Mesh[]>();
  root.traverse((object) => {
    if (
      !(object instanceof THREE.Mesh) ||
      object instanceof THREE.InstancedMesh ||
      object instanceof THREE.SkinnedMesh ||
      !object.visible ||
      object.userData.path ||
      Array.isArray(object.material) ||
      object.material.transparent
    )
      return;
    const attributes = Object.keys(object.geometry.attributes).sort().join(",");
    const key = `${object.material.uuid}:${attributes}:${!!object.geometry.index}:${object.castShadow}:${object.receiveShadow}`;
    const group = groups.get(key) || [];
    group.push(object);
    groups.set(key, group);
  });
  const retired = new Set<THREE.BufferGeometry>();
  for (const parts of groups.values()) {
    if (parts.length < 2) continue;
    const transformed = parts.map((part) =>
      part.geometry.clone().applyMatrix4(inverse.clone().multiply(part.matrixWorld)),
    );
    const geometry = mergeGeometries(transformed, false);
    transformed.forEach((item) => item.dispose());
    if (!geometry) continue;
    const merged = new THREE.Mesh(geometry, parts[0].material);
    merged.name = `Static batch: ${parts[0].material.name || parts[0].name}`;
    merged.castShadow = parts[0].castShadow;
    merged.receiveShadow = parts[0].receiveShadow;
    root.add(merged);
    parts.forEach((part) => {
      part.removeFromParent();
      retired.add(part.geometry);
    });
  }
  // Shared geometry can still belong to a non-batched mesh.
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) retired.delete(object.geometry);
  });
  retired.forEach((geometry) => geometry.dispose());
}

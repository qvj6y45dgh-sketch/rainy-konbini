// Merges static, opaque meshes that share a material into one mesh per material.
// Purely a draw-call optimisation: geometry is baked into world space, so the image is unchanged.
import { THREE } from './core.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Objects whose transform or visibility changes over time (found by sampling the tick functions) stay separate.
function findDynamic(scene, runTicks) {
  const meshes = [];
  scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
  scene.updateMatrixWorld(true);
  const base = meshes.map((o) => ({ m: o.matrixWorld.clone(), v: isVisible(o) }));
  const dyn = new Set();
  for (let i = 0; i <= 400; i++) {
    runTicks(i * 0.173, 1 / 60); // covers every tick cycle (longest is 24 s) at a fine step
    scene.updateMatrixWorld(true);
    meshes.forEach((o, k) => { if (!o.matrixWorld.equals(base[k].m) || isVisible(o) !== base[k].v) dyn.add(o); });
  }
  runTicks(0, 1 / 60); scene.updateMatrixWorld(true);
  return dyn;
}
function isVisible(o) { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; }

const attrKey = (g) => Object.keys(g.attributes).sort().map((n) => n + g.attributes[n].itemSize).join(',') + (g.index ? '|i' : '|n') + '|' + Object.keys(g.morphAttributes).length;

export function mergeStatic(scene, runTicks) {
  const dyn = findDynamic(scene, runTicks);
  const groups = new Map();
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o.children.length || dyn.has(o) || !isVisible(o)) return;
    if (Array.isArray(o.material) || o.material.transparent) return;
    if (o.onBeforeRender !== THREE.Object3D.prototype.onBeforeRender || o.renderOrder !== 0 || !o.frustumCulled) return;
    const key = o.material.uuid + '|' + o.layers.mask + '|' + o.castShadow + o.receiveShadow + '|' + attrKey(o.geometry);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  });
  let removed = 0, added = 0;
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const geos = list.map((o) => {
      const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
      if (o.matrixWorld.determinant() < 0) flipWinding(g); // mirrored transforms would otherwise turn faces inside out
      return g;
    });
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) continue;
    const m = new THREE.Mesh(merged, list[0].material);
    m.layers.mask = list[0].layers.mask; m.castShadow = list[0].castShadow; m.receiveShadow = list[0].receiveShadow;
    m.matrixAutoUpdate = false; m.updateMatrix();
    for (const o of list) o.removeFromParent();
    scene.add(m);
    removed += list.length; added++;
  }
  return { removed, added };
}

function flipWinding(g) {
  if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; } return; }
  for (const n in g.attributes) {
    const at = g.attributes[n], s = at.itemSize, a = at.array;
    for (let i = 0; i < at.count; i += 3) for (let c = 0; c < s; c++) { const t = a[(i + 1) * s + c]; a[(i + 1) * s + c] = a[(i + 2) * s + c]; a[(i + 2) * s + c] = t; }
  }
}

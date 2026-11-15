import * as THREE from 'three';
export { THREE };

// Layer 0: solid world (colour pass + outline pass + ground reflection)
// Layer 1: effects only (glass, rain, glows) – no outlines, not reflected
export const L_FX = 1;
export const scene = new THREE.Scene();

const ticks = [];
export const onTick = (f) => { ticks.push(f); };
export const runTicks = (t, dt) => { for (const f of ticks) f(t, dt); };
export const fx = (o) => { o.traverse((c) => c.layers.set(L_FX)); return o; };

export const FONT = '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Noto Sans JP","PingFang SC",sans-serif';

// deterministic random so the model always looks the same
let seed = 20261115;
export const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
export const rr = (a, b) => a + (b - a) * rnd();
export const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

// ---------- toon materials ----------
const grad = new THREE.DataTexture(new Uint8Array([0, 0, 44, 132, 208, 255]), 6, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter;
grad.needsUpdate = true;

// adds "albedo * k" as self illumination so lit interiors always read bright and clean
function selfLit(m, k) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSelf = { value: k };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uSelf;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * uSelf;');
  };
  m.customProgramCacheKey = () => 'selflit';
  return m;
}

const cache = new Map();
export function toon(color, lit = 0) {
  const key = color + '_' + lit;
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: grad });
  if (lit > 0) selfLit(m, lit);
  cache.set(key, m);
  return m;
}
export function toonTex(map, lit = 0, extra) {
  const m = new THREE.MeshToonMaterial({ map, gradientMap: grad, ...extra });
  if (lit > 0) selfLit(m, lit);
  return m;
}
export function glow(color, k = 1) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k) });
}
export function glowTex(map, k = 1, extra) {
  return new THREE.MeshBasicMaterial({ map, color: new THREE.Color(k, k, k), ...extra });
}

// ---------- geometry helpers (y = bottom of the piece) ----------
const BOX = new THREE.BoxGeometry(1, 1, 1);
export function box(p, w, h, d, x, y, z, m) {
  const o = new THREE.Mesh(BOX, m);
  o.scale.set(w, h, d); o.position.set(x, y + h / 2, z); p.add(o); return o;
}
const CYL = {};
const cylGeo = (seg) => CYL[seg] || (CYL[seg] = new THREE.CylinderGeometry(1, 1, 1, seg));
export function cyl(p, r, h, x, y, z, m, seg = 14, rTop) {
  const g = rTop === undefined ? cylGeo(seg) : new THREE.CylinderGeometry(rTop / r, 1, 1, seg);
  const o = new THREE.Mesh(g, m);
  o.scale.set(r, h, r); o.position.set(x, y + h / 2, z); p.add(o); return o;
}
const UP = new THREE.Vector3(0, 1, 0);
export function tube(p, a, b, r, m, seg = 8) {
  const A = new THREE.Vector3(...a), d = new THREE.Vector3(...b).sub(A), len = d.length();
  const o = new THREE.Mesh(cylGeo(seg), m);
  o.scale.set(r, len, r); o.position.copy(A).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(UP, d.normalize()); p.add(o); return o;
}
const PLANE = new THREE.PlaneGeometry(1, 1);
// centred quad facing +z; ry = yaw, rx = pitch (-PI/2 lays it flat, facing up)
export function quad(p, w, h, x, y, z, m, ry = 0, rx = 0) {
  const o = new THREE.Mesh(PLANE, m);
  o.scale.set(w, h, 1); o.position.set(x, y, z); o.rotation.set(rx, ry, 0, 'YXZ'); p.add(o); return o;
}

// ---------- canvas textures ----------
export function ctex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
export function txt(g, s, x, y, size, color, weight = 800, align = 'center') {
  g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
  g.fillText(s, x, y);
}
export function rrect(g, x, y, w, h, r, fill, stroke, lw = 2) {
  g.beginPath(); g.roundRect(x, y, w, h, r);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}

// ---------- instanced shop products ----------
const prods = { box: [], cyl: [], tri: [] };
const _e = new THREE.Euler(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
export function prod(parent, shape, w, h, d, x, y, z, color, ry = 0) {
  parent.updateWorldMatrix(true, false);
  const m = new THREE.Matrix4().compose(_p.set(x, y + h / 2, z), _q.setFromEuler(_e.set(0, ry, 0)), _s.set(w, h, d));
  m.premultiply(parent.matrixWorld);
  prods[shape].push({ m, c: color });
}
export function buildProds() {
  const tri = new THREE.CylinderGeometry(0.58, 0.58, 1, 3); tri.rotateX(-Math.PI / 2); tri.translate(0, -0.145, 0);
  const geos = { box: BOX, cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 10), tri };
  const col = new THREE.Color();
  for (const k in prods) {
    const list = prods[k]; if (!list.length) continue;
    const mat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad }); selfLit(mat, 0.62);
    const im = new THREE.InstancedMesh(geos[k], mat, list.length);
    list.forEach((p, i) => { im.setMatrixAt(i, p.m); im.setColorAt(i, col.set(p.c)); });
    im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false;
    scene.add(im);
  }
}

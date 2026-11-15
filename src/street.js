import { THREE, scene, L_FX, ctex, txt, rrect, toon, toonTex, glow, glowTex, box, cyl, tube, quad, rnd, rr, pick, onTick } from './core.js';
import { halo, lightCone } from './fx.js';
import { addGroundLight } from './ground.js';

const IND = '#2f3f9e', ORG = '#ff9a3d', YEL = '#ffd75e';
const grp = (x, y, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); return g; };
const concrete = toon(0x9498a8), metal = toon(0x8f95a6), darkM = toon(0x3a3e52), whiteP = toon(0xeef0f5), steel = toon(0xc3c9d6);

// ---------- vending machines ----------
function vendTex(body, accent, hot) {
  return ctex(256, 464, (g, w, h) => {
    g.fillStyle = body; g.fillRect(0, 0, w, h);
    rrect(g, 14, 14, w - 28, h * 0.5, 6, '#f6fbff');
    const cols = ['#e85d5d', '#f2a541', '#4f9bd9', '#6cc08b', '#f4e06b', '#8d6bd1', '#3b3b46', '#ef8fb3', '#ffffff', '#58c7c2'];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        const x = 24 + c * 30.5, y = 22 + r * 74;
        rrect(g, x, y + 8, 20, 40, 5, pick(cols), 'rgba(0,0,0,.35)', 1.5);
        g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(x + 3, y + 22, 14, 8); g.fillStyle = '#d8dde6'; g.fillRect(x + 6, y + 3, 8, 6);
        rrect(g, x + 1, y + 52, 18, 9, 2, hot && r === 2 ? '#e24b4b' : '#3d7fe0');
      }
      g.fillStyle = '#c9d3de'; g.fillRect(14, 22 + r * 74 + 65, w - 28, 3);
    }
    g.fillStyle = accent; g.fillRect(0, h * 0.56, w, h * 0.06);
    rrect(g, 150, h * 0.65, 84, 54, 4, '#20232e'); rrect(g, 160, h * 0.67, 64, 14, 2, '#7dffb0'); rrect(g, 172, h * 0.725, 40, 6, 2, '#888');
    txt(g, 'つめた〜い', 78, h * 0.685, 20, hot ? '#fff' : '#2f3f9e', 800); txt(g, hot ? 'あったか〜い' : 'DRINK', 78, h * 0.745, 18, hot ? '#ffe0d6' : '#4f6bd0', 800);
    rrect(g, 24, h * 0.84, w - 48, h * 0.11, 6, '#15171f', '#555', 2); txt(g, 'PUSH', w / 2, h * 0.895, 16, '#777', 800);
  });
}
function vending(x, z, body, hex, accent, hot) {
  const g = grp(x, 0.1, z);
  box(g, 1.0, 1.83, 0.7, 0, 0.03, 0, toon(hex)); box(g, 0.9, 0.03, 0.6, 0, 0, 0, darkM);
  const m = glowTex(vendTex(body, accent, hot), 1.08);
  quad(g, 0.96, 1.79, 0, 0.945, 0.352, m);
  return m;
}

// ---------- bicycle ----------
function bike(x, z, ry, color, y = 0) {
  const g = grp(x, y, z, ry); g.rotation.z = 0.07;
  const fr = toon(color), tire = toon(0x23252f), sil = toon(0xc9cfdb);
  const wheel = (wx) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.022, 6, 22), tire); t.position.set(wx, 0.33, 0); g.add(t);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.008, 4, 22), sil); rim.position.set(wx, 0.33, 0); g.add(rim);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; tube(g, [wx + Math.cos(a) * 0.28, 0.33 + Math.sin(a) * 0.28, 0], [wx - Math.cos(a) * 0.28, 0.33 - Math.sin(a) * 0.28, 0], 0.003, sil, 4); }
    const fd = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 4, 14, Math.PI * 0.75), sil); fd.position.set(wx, 0.33, 0); fd.rotation.z = Math.PI * 0.2; fd.scale.z = 2.2; g.add(fd);
  };
  wheel(-0.52); wheel(0.55);
  const T = (a, b, r = 0.016) => tube(g, a, b, r, fr, 6);
  T([-0.08, 0.3, 0], [-0.22, 0.84, 0]); T([-0.08, 0.3, 0], [0.42, 0.62, 0], 0.02); T([-0.15, 0.56, 0], [0.4, 0.7, 0]);
  T([-0.52, 0.33, 0], [-0.08, 0.3, 0], 0.012); T([-0.52, 0.33, 0], [-0.2, 0.78, 0], 0.012);
  T([0.38, 0.92, 0], [0.43, 0.6, 0], 0.02); T([0.43, 0.6, 0.0], [0.55, 0.33, 0], 0.014);
  tube(g, [0.37, 0.92, 0], [0.34, 1.02, 0], 0.012, sil, 6); tube(g, [0.34, 1.02, -0.27], [0.34, 1.02, 0.27], 0.012, sil, 6);
  for (const s of [-1, 1]) tube(g, [0.34, 1.02, s * 0.2], [0.3, 1.02, s * 0.29], 0.018, tire, 6);
  box(g, 0.26, 0.06, 0.17, -0.24, 0.85, 0, toon(0x2b2d38));
  box(g, 0.3, 0.2, 0.36, 0.66, 0.72, 0, toon(0x8f95a6)); box(g, 0.26, 0.01, 0.32, 0.66, 0.915, 0, toon(0x2a2c38));
  box(g, 0.34, 0.02, 0.16, -0.6, 0.7, 0, sil); tube(g, [-0.52, 0.33, 0.06], [-0.72, 0.71, 0.06], 0.006, sil, 4); tube(g, [-0.52, 0.33, -0.06], [-0.72, 0.71, -0.06], 0.006, sil, 4);
  cyl(g, 0.07, 0.02, -0.08, 0.29, 0.03, sil, 10).rotation.x = Math.PI / 2;
  tube(g, [-0.08, 0.3, 0.05], [-0.02, 0.18, 0.09], 0.008, tire, 4); box(g, 0.08, 0.015, 0.05, -0.02, 0.17, 0.11, tire);
  tube(g, [-0.3, 0.3, 0.05], [-0.42, 0.02, 0.16], 0.008, sil, 4);
  return g;
}

// ---------- air-conditioner outdoor unit ----------
const acTex = ctex(160, 120, (g, w, h) => {
  g.fillStyle = '#e4e6ec'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a3e52'; g.beginPath(); g.arc(62, 60, 48, 0, 7); g.fill();
  g.strokeStyle = '#9aa0b2'; g.lineWidth = 2; for (let r = 8; r < 48; r += 8) { g.beginPath(); g.arc(62, 60, r, 0, 7); g.stroke(); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.moveTo(62, 60); g.lineTo(62 + Math.cos(a) * 48, 60 + Math.sin(a) * 48); g.stroke(); }
  g.fillStyle = '#b9bdc9'; for (let y = 20; y < 104; y += 9) g.fillRect(122, y, 28, 4);
});
const acMat = toonTex(acTex);
function acUnit(x, y, z, ry) {
  const g = grp(x, y, z, ry);
  box(g, 0.8, 0.56, 0.3, 0, 0.08, 0, toon(0xdfe2ea)); quad(g, 0.78, 0.54, 0, 0.36, 0.152, acMat);
  box(g, 0.1, 0.08, 0.34, -0.28, 0, 0, concrete); box(g, 0.1, 0.08, 0.34, 0.28, 0, 0, concrete);
  return g;
}

// ---------- utility pole ----------
const stripe = ctex(64, 64, (g) => { g.fillStyle = '#f2c230'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#22242e'; for (let i = -2; i < 6; i++) { g.beginPath(); g.moveTo(i * 16, 64); g.lineTo(i * 16 + 8, 64); g.lineTo(i * 16 + 40, 0); g.lineTo(i * 16 + 32, 0); g.fill(); } });
stripe.wrapS = THREE.RepeatWrapping; stripe.repeat.set(2, 1);
function pole(x, z, armDir, opts = {}) {
  const g = grp(x, 0, z);
  cyl(g, 0.17, 9.2, 0, 0, 0, concrete, 12, 0.11); cyl(g, 0.175, 1.1, 0, 0.5, 0, toonTex(stripe), 12);
  const ax = Math.cos(armDir), az = Math.sin(armDir);
  const arm = (y, len) => { const m = box(g, len, 0.09, 0.09, 0, y, 0, metal); m.rotation.y = -armDir; for (const s of [-1, 0, 1]) cyl(g, 0.045, 0.14, ax * s * (len / 2 - 0.08), y + 0.09, az * s * (len / 2 - 0.08), whiteP, 8); };
  arm(8.5, 1.9); arm(7.7, 1.4);
  for (let i = 0; i < 9; i++) tube(g, [0, 2.4 + i * 0.5, 0], [(i % 2 ? 1 : -1) * 0.27 * az, 2.4 + i * 0.5, (i % 2 ? -1 : 1) * 0.27 * ax], 0.012, metal, 4);
  box(g, 0.3, 0.42, 0.2, -az * 0.2, 5.3, ax * 0.2, darkM);
  if (opts.transformer) { cyl(g, 0.3, 0.8, ax * 0.42, 6.35, az * 0.42, toon(0x9da3b3), 14); cyl(g, 0.31, 0.05, ax * 0.42, 6.95, az * 0.42, metal, 14); box(g, 0.6, 0.07, 0.07, ax * 0.25, 6.3, az * 0.25, metal).rotation.y = -armDir; }
  if (opts.plate) {
    const p = toonTex(ctex(48, 200, (c, w, h) => { c.fillStyle = '#2e7a5e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(3, 3, w - 6, h - 6); '月見町二丁目'.split('').forEach((ch, i) => txt(c, ch, w / 2, 24 + i * 30, 24, '#fff', 800)); }), 0.25);
    quad(g, 0.15, 0.62, opts.plate[0] * 0.175, 2.1, opts.plate[1] * 0.175, p, Math.atan2(opts.plate[0], opts.plate[1]));
  }
  return { top: (s, y = 8.66) => [x + ax * s * 0.87, y, z + az * s * 0.87], low: (s) => [x + ax * s * 0.62, 7.86, z + az * s * 0.62], at: (y) => [x, y, z] };
}
const wireMat = new THREE.MeshBasicMaterial({ color: 0x353c5c });
function wire(a, b, sag, r = 0.014) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), mid = A.clone().lerp(B, 0.5); mid.y -= sag * 2;
  const o = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A, mid, B), 20, r, 5), wireMat);
  o.layers.set(L_FX); scene.add(o);
}

function signPole(x, z, h) { return cyl(scene, 0.035, h, x, 0, z, steel, 8); }

export function buildStreet() {
  // ---------- kerb strips on the far sides of both streets ----------
  const kerb = toon(0x8e92a4);
  box(scene, 22, 0.15, 0.8, 0, 0, 10.6, kerb); box(scene, 0.8, 0.15, 21.2, 10.6, 0, -0.4, kerb);
  box(scene, 22, 0.16, 0.14, 0, 0, 10.27, toon(0xb9bdcb)); box(scene, 0.14, 0.16, 21.2, 10.27, 0, -0.4, toon(0xb9bdcb));
  box(scene, 0.6, 0.012, 3.0, 10.62, 0.15, 3.1, toon(0xe6c13a));

  // ---------- front apron: vending machines, bins, umbrellas, bike ----------
  const v1 = vending(-5.85, -1.06, '#f4f6fa', 0xeef0f5, '#3d7fe0', false);
  const v2 = vending(-4.77, -1.06, '#d8473f', 0xc9423b, '#fff', true);
  const pl = new THREE.PointLight(0xcfe4ff, 3, 4.5, 1.6); pl.position.set(-5.3, 1.3, -0.1); scene.add(pl);
  addGroundLight([-6.3, -0.7], [-4.3, -0.7], [0, 1], '#cfe2ff', 2.6, 3.4);
  onTick((t) => { v1.color.setScalar(1.08 + 0.03 * Math.sin(t * 50)); v2.color.setScalar(1.08 * ((t % 31 > 30.8) ? 0.75 : 1)); });

  const binTex = (label, col, round) => toonTex(ctex(128, 200, (g, w, h) => {
    g.fillStyle = '#d5d8df'; g.fillRect(0, 0, w, h); rrect(g, 10, 12, w - 20, 70, 6, col);
    g.fillStyle = '#16181f'; if (round) { for (const x of [44, 84]) { g.beginPath(); g.arc(x, 47, 15, 0, 7); g.fill(); } } else rrect(g, 22, 34, w - 44, 26, 4, '#16181f');
    rrect(g, 14, 96, w - 28, 44, 4, '#fff', col, 3); txt(g, label, w / 2, 119, label.length > 4 ? 16 : 22, '#333', 900);
    g.fillStyle = '#aeb2be'; g.fillRect(0, h - 22, w, 22);
  }), 0.15);
  [['もえるゴミ', '#d9534f', false], ['ペットボトル', '#3d7fe0', true], ['カン・ビン', '#e6a02c', true]].forEach(([s, c, r], i) => {
    const x = 1.42 + i * 0.6;
    box(scene, 0.56, 0.9, 0.46, x, 0.1, -1.08, toon(0xd5d8df)); box(scene, 0.58, 0.03, 0.48, x, 1.0, -1.08, toon(0xa9adba));
    quad(scene, 0.54, 0.86, x, 0.55, -0.848, binTex(s, c, r));
  });
  // umbrella stand
  {
    const g = grp(0.92, 0.1, -1.08);
    const fr = toon(0x6c7184);
    for (const sx of [-0.2, 0.2]) for (const sz of [-0.2, 0.2]) box(g, 0.025, 0.5, 0.025, sx, 0, sz, fr);
    for (const y of [0.04, 0.48]) { box(g, 0.43, 0.02, 0.02, 0, y, -0.2, fr); box(g, 0.43, 0.02, 0.02, 0, y, 0.2, fr); box(g, 0.02, 0.02, 0.43, -0.2, y, 0, fr); box(g, 0.02, 0.02, 0.43, 0.2, y, 0, fr); }
    box(g, 0.02, 0.02, 0.43, 0, 0.48, 0, fr); box(g, 0.43, 0.02, 0.02, 0, 0.48, 0, fr); box(g, 0.42, 0.02, 0.42, 0, 0.02, 0, toon(0x4a4e60));
    [[-0.1, -0.1, 0xf7fbff, 0.05], [0.1, 0.09, 0x2f3f9e, -0.06], [0.1, -0.1, 0xf4c84a, 0.03]].forEach(([dx, dz, c, lean]) => {
      const u = new THREE.Group(); u.position.set(dx, 0.05, dz); u.rotation.z = lean; u.rotation.x = lean * 0.8; g.add(u);
      cyl(u, 0.014, 0.7, 0, 0, 0, toon(c), 8, 0.04); cyl(u, 0.008, 0.16, 0, 0.7, 0, darkM, 6);
      const h = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 5, 10, Math.PI), toon(c === 0xf7fbff ? 0xffffff : 0x3a2a22)); h.position.set(0.035, 0.86, 0); u.add(h);
    });
  }
  // A-frame board
  {
    const g = grp(-2.35, 0.1, -0.62, 0.15);
    const t = toonTex(ctex(160, 256, (c, w, h) => { c.fillStyle = '#263a2f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a06a'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); txt(c, '本日の', w / 2, 50, 26, '#fff', 800); txt(c, 'おすすめ', w / 2, 88, 28, '#ffe08a', 900); txt(c, 'おでん', w / 2, 150, 40, '#ffb4a2', 900); txt(c, 'あったか', w / 2, 206, 24, '#fff', 800); }), 0.2);
    quad(g, 0.5, 0.8, 0, 0.4, 0.1, t, 0, -0.22); quad(g, 0.5, 0.8, 0, 0.4, -0.1, t, Math.PI, -0.22);
    box(g, 0.5, 0.74, 0.03, 0, 0, 0, toon(0x8a6a44)); box(g, 0.52, 0.03, 0.06, 0, 0.77, 0, toon(0x8a6a44));
  }
  bike(3.85, -0.75, 0.1, 0x4c97dc, 0.1); bike(5.25, -3.1, Math.PI / 2 + 0.12, 0xe9795a, 0.1);

  // wheel stops
  for (const x of [-5.05, -2.75, 2.05, 4.35]) for (const s of [-0.55, 0.55]) { box(scene, 0.6, 0.12, 0.16, x + s, 0, 1.15, toon(0xb9bdc9)); box(scene, 0.2, 0.121, 0.161, x + s, 0, 1.15, toon(0xe6c13a)); }

  // nobori flags
  [[-6.35, 0.5, '#d9433b', 'おでん'], [-6.35, 2.2, '#2f7fd6', 'コーヒー'], [4.95, 3.9, '#ef8a2c', 'からあげ']].forEach(([x, z, col, s], i) => {
    const g = grp(x, 0, z);
    box(g, 0.34, 0.08, 0.34, 0, 0, 0, toon(0x5b6076)); cyl(g, 0.015, 2.5, 0, 0.08, 0, whiteP, 6); tube(g, [0, 2.5, 0], [0, 2.5, 0.52], 0.01, whiteP, 4);
    const t = toonTex(ctex(96, 320, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(0, 0, w, 16); c.fillRect(0, h - 16, w, 16); s.split('').forEach((ch, k) => txt(c, ch, w / 2, 62 + k * (230 / s.length) + 18, 62, '#fff', 900)); }), 0.12, { side: THREE.DoubleSide });
    const f = new THREE.Group(); f.position.set(0, 0, 0); g.add(f);
    quad(f, 0.5, 1.7, 0, 1.64, 0.27, t, Math.PI / 2);
    onTick((tt) => { f.rotation.y = Math.sin(tt * 1.4 + i * 2) * 0.1 + Math.sin(tt * 3.1 + i) * 0.03; });
  });

  // ---------- pole sign ----------
  {
    const g = grp(-7.4, 0, 4.9);
    box(g, 0.5, 0.2, 0.5, 0, 0, 0, concrete); cyl(g, 0.09, 5.2, 0, 0.2, 0, toon(0xaab0c0), 10);
    const t = ctex(256, 256, (c, w, h) => {
      c.fillStyle = '#fbfbf5'; c.fillRect(0, 0, w, h); c.fillStyle = IND; c.fillRect(0, 0, w, 38); c.fillStyle = ORG; c.fillRect(0, h - 44, w, 26); c.fillStyle = YEL; c.fillRect(0, h - 18, w, 18);
      c.fillStyle = YEL; c.beginPath(); c.arc(70, 110, 40, 0, 7); c.fill(); c.fillStyle = '#fbfbf5'; c.beginPath(); c.arc(88, 102, 34, 0, 7); c.fill();
      txt(c, 'ツキミ', 168, 92, 46, IND, 900); txt(c, 'マート', 168, 142, 46, IND, 900); txt(c, '24h OPEN', w / 2, 188, 22, '#e2603a', 900);
    });
    const m = glowTex(t, 1.1);
    box(g, 1.7, 1.7, 0.3, 0, 5.2, 0, toon(0xdfe2ea, 0.3)); quad(g, 1.6, 1.6, 0, 6.05, 0.152, m); quad(g, 1.6, 1.6, 0, 6.05, -0.152, m, Math.PI);
    const t2 = glowTex(ctex(256, 96, (c, w, h) => { c.fillStyle = '#2f7fd6'; c.fillRect(0, 0, w, h); rrect(c, 12, 12, 72, 72, 8, '#fff'); txt(c, 'P', 48, 51, 58, '#2f7fd6', 900); txt(c, '駐車場', 166, 34, 30, '#fff', 900); txt(c, 'ATM ・ 酒', 166, 70, 22, '#dbeaff', 800); }), 0.95);
    box(g, 1.3, 0.5, 0.18, 0, 4.5, 0, toon(0xdfe2ea, 0.3)); quad(g, 1.24, 0.46, 0, 4.75, 0.092, t2); quad(g, 1.24, 0.46, 0, 4.75, -0.092, t2, Math.PI);
    const l = new THREE.PointLight(0xfff0d0, 3, 7, 1.7); l.position.set(-7.4, 3.6, 6.6); scene.add(l);
    addGroundLight([-7.4, 4.9], [-7.4, 4.9], [0, 0], '#fff0cf', 1.2, 4.2);
    onTick((tt) => m.color.setScalar(1.1 * (1 + 0.02 * Math.sin(tt * 47))));
  }

  // ---------- notice board ----------
  {
    const g = grp(-8.75, 0, 3.85, 0.12);
    const gm = toon(0x3f7a5c);
    for (const s of [-0.72, 0.72]) box(g, 0.07, 1.95, 0.07, s, 0, 0, gm);
    box(g, 1.6, 1.05, 0.08, 0, 0.8, 0, gm); box(g, 1.8, 0.06, 0.36, 0, 1.95, 0.02, toon(0x2f5f47));
    const t = toonTex(ctex(384, 240, (c, w, h) => {
      c.fillStyle = '#c9b48f'; c.fillRect(0, 0, w, h);
      const paper = (x, y, pw, ph, col, title, tc) => { c.save(); c.translate(x, y); c.rotate(rr(-0.04, 0.04)); c.fillStyle = col; c.fillRect(0, 0, pw, ph); txt(c, title, pw / 2, 20, 17, tc, 900); c.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < (ph - 44) / 11; i++) c.fillRect(8, 38 + i * 11, pw - 16 - (i % 3) * 14, 3); c.fillStyle = '#d9433b'; c.beginPath(); c.arc(pw / 2, 4, 4, 0, 7); c.fill(); c.restore(); };
      paper(14, 16, 110, 150, '#fff', '町内会だより', '#333'); paper(136, 14, 104, 104, '#ffe9a8', '夏祭り', '#b3261e'); paper(252, 18, 118, 132, '#d9ecff', '防犯パトロール', '#2f3f9e');
      paper(140, 130, 96, 96, '#ffd9d0', '迷い猫', '#7a2f3a'); paper(22, 176, 104, 52, '#e2f5d8', 'ゴミの日', '#2e6b3f'); paper(250, 160, 120, 66, '#fff', '回覧', '#333');
    }), 0.22);
    quad(g, 1.5, 0.95, 0, 1.325, 0.042, t);
    box(g, 1.6, 0.14, 0.085, 0, 1.86, 0, toon(0x2f5f47));
  }

  // ---------- utility poles + wires ----------
  const pA = pole(-9.9, 5.2, Math.PI / 2, { plate: [1, 0] });
  const pB = pole(5.5, 4.95, Math.PI * 0.75, { transformer: true, plate: [-0.7, 0.7] });
  const pC = pole(5.6, -10.3, 0, {});
  for (const s of [-1, 0, 1]) {
    wire(pA.top(s), pB.top(s), 0.55); wire(pB.top(s), pC.top(-s), 0.55);
    wire([-11, 8.45, 5.2 + s * 0.87], pA.top(s), 0.03); wire(pC.top(-s), [5.6 - s * 0.87, 8.6, -11], 0.02);
  }
  for (const s of [-1, 1]) { wire(pA.low(s), pB.low(s), 0.6, 0.012); wire(pB.low(s), pC.low(-s), 0.6, 0.012); }
  wire(pA.at(5.5), pB.at(5.5), 0.8, 0.028); wire(pB.at(5.5), pC.at(5.5), 0.8, 0.028); wire(pA.at(5.5), [-11, 5.35, 5.2], 0.04, 0.028); wire(pC.at(5.5), [5.6, 5.45, -11], 0.03, 0.028);
  wire(pB.at(6.9), [4.3, 4.6, -1.7], 0.35, 0.012); wire(pA.at(6.6), [-9.2, 5.6, 1.05], 0.3, 0.012); wire(pC.at(6.6), [4.4, 4.5, -9.3], 0.1, 0.012);
  tube(scene, [4.3, 4.1, -1.7], [4.3, 4.65, -1.7], 0.02, metal, 6);
  // lamp on pole A
  tube(scene, [-9.9, 6.0, 5.2], [-9.9, 6.3, 6.4], 0.03, metal, 6); box(scene, 0.22, 0.08, 0.5, -9.9, 6.26, 6.5, metal);
  box(scene, 0.16, 0.02, 0.4, -9.9, 6.245, 6.5, glow(0xffe9c4, 2.2));
  const la = new THREE.PointLight(0xffe2b0, 16, 11, 1.7); la.position.set(-9.9, 6.0, 6.5); scene.add(la);
  addGroundLight([-9.9, 6.5], [-9.9, 6.5], [0, 0], '#ffdfae', 3.2, 6.0);
  lightCone(-9.9, 6.24, 6.5, 3.4, 6.2, 0xffe2b0, 0.22); halo(-9.9, 6.22, 6.5, 1.5, 0xffe2b0, 0.5);

  // ---------- modern street lamp on the near kerb ----------
  {
    const x = -4.5, z = 10.6;
    cyl(scene, 0.09, 5.9, x, 0.15, z, toon(0x7b8194), 10, 0.06); cyl(scene, 0.13, 0.5, x, 0.15, z, toon(0x5b6076), 10);
    tube(scene, [x, 6.0, z], [x, 6.25, z - 1.25], 0.035, toon(0x7b8194), 6); box(scene, 0.28, 0.07, 0.62, x, 6.22, z - 1.4, toon(0x7b8194));
    box(scene, 0.2, 0.02, 0.5, x, 6.205, z - 1.4, glow(0xe6f0ff, 2.4));
    const l = new THREE.PointLight(0xdfe9ff, 20, 12, 1.7); l.position.set(x, 5.9, z - 1.4); scene.add(l);
    addGroundLight([x, z - 1.4], [x, z - 1.4], [0, 0], '#cfe0ff', 3.6, 6.8);
    lightCone(x, 6.2, z - 1.4, 3.6, 6.2, 0xcfe0ff, 0.24); halo(x, 6.18, z - 1.4, 1.7, 0xdfe9ff, 0.55);
  }

  // ---------- distant traffic signal over the side street ----------
  {
    const x = 10.6, z = -10.2, gm = toon(0x7b8194);
    cyl(scene, 0.11, 6.2, x, 0.15, z, gm, 10, 0.08); tube(scene, [x, 5.9, z], [8.0, 6.05, z], 0.05, gm, 6); tube(scene, [x, 5.2, z], [9.3, 6.0, z], 0.02, gm, 5);
    box(scene, 1.3, 0.44, 0.2, 8.45, 5.55, z + 0.02, toon(0x4a4f63)); tube(scene, [8.45, 5.99, z], [8.45, 6.06, z], 0.03, gm, 5);
    const lamps = [['#35e0a8', 8.05], ['#ffc83a', 8.45], ['#ff4d4d', 8.85]].map(([c, lx]) => {
      const m = new THREE.MeshBasicMaterial({ color: c });
      const d = cyl(scene, 0.15, 0.03, lx, 5.77 - 0.015, z + 0.125, m, 16); d.rotation.x = Math.PI / 2;
      const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 12, 1, true, -Math.PI / 2, Math.PI), toon(0x4a4f63)); hood.rotation.x = Math.PI / 2; hood.position.set(lx, 5.77, z + 0.22); hood.material.side = THREE.DoubleSide; scene.add(hood);
      return { m, c: new THREE.Color(c), h: halo(lx, 5.77, z + 0.2, 1.5, c, 0) };
    });
    const pool = addGroundLight([8.4, -9.0], [8.4, -9.0], [0, 0], '#35e0a8', 1, 5.5);
    onTick((t) => {
      const c = t % 24; const on = c < 10 ? 0 : c < 12.5 ? 1 : 2;
      lamps.forEach((L, i) => { L.m.color.copy(L.c).multiplyScalar(i === on ? 2.4 : 0.09); L.h.material.opacity = i === on ? 0.5 : 0; });
      pool.copy(lamps[on].c).multiplyScalar(1.5);
    });
  }

  // ---------- road signs ----------
  {
    // stop sign
    signPole(4.6, 5.35, 2.7);
    const stopTex = (back) => toonTex(ctex(128, 128, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = back ? '#aab0be' : '#fff'; g.beginPath(); g.moveTo(2, 8); g.lineTo(126, 8); g.lineTo(64, 122); g.fill();
      if (!back) { g.fillStyle = '#d6332e'; g.beginPath(); g.moveTo(12, 14); g.lineTo(116, 14); g.lineTo(64, 110); g.fill(); txt(g, '止まれ', 64, 44, 26, '#fff', 900); }
      g.strokeStyle = '#1a1c2e'; g.lineWidth = 3; g.beginPath(); g.moveTo(2, 8); g.lineTo(126, 8); g.lineTo(64, 122); g.closePath(); g.stroke();
    }), 0.3, { alphaTest: 0.5 });
    quad(scene, 0.8, 0.8, 4.56, 2.35, 5.35, stopTex(false), -Math.PI / 2).layers.set(L_FX);
    quad(scene, 0.8, 0.8, 4.57, 2.35, 5.35, stopTex(true), Math.PI / 2).layers.set(L_FX);
    // pedestrian crossing sign
    signPole(10.6, 0.9, 3.0).position.y += 0.15;
    const t2 = toonTex(ctex(128, 128, (g, w, h) => { g.fillStyle = '#d9dce6'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f6fd6'; g.beginPath(); g.moveTo(64, 4); g.lineTo(124, 54); g.lineTo(124, 124); g.lineTo(4, 124); g.lineTo(4, 54); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 44, 9, 0, 7); g.fill(); g.lineWidth = 8; g.beginPath(); g.moveTo(64, 54); g.lineTo(62, 82); g.lineTo(46, 108); g.moveTo(62, 82); g.lineTo(80, 108); g.moveTo(46, 68); g.lineTo(82, 66); g.stroke(); }), 0.3);
    box(scene, 0.7, 0.7, 0.02, 10.6, 2.4, 0.87, toon(0xd9dce6)); quad(scene, 0.72, 0.72, 10.6, 2.75, 0.855, t2, Math.PI);
    // curve mirror on the near corner
    const o = toon(0xf08a2c);
    cyl(scene, 0.045, 3.3, 10.55, 0.15, 10.55, o, 8);
    const mg = grp(10.5, 3.2, 10.5, -Math.PI * 0.75);
    cyl(mg, 0.42, 0.06, 0, 0, 0, o, 20).rotation.x = Math.PI / 2; mg.children[0].position.set(0, 0, 0);
    const mm = glowTex(ctex(128, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#9fb8e6'); gr.addColorStop(0.5, '#3a4a7c'); gr.addColorStop(1, '#ffcf8f'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(44, 40, 22, 9, -0.6, 0, 7); g.fill(); }), 0.6);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.37, 24), mm); disc.position.set(0, 0, 0.035); mg.add(disc);
    box(mg, 0.5, 0.05, 0.14, 0, 0.42, 0.05, o);
  }

  // ---------- guard rails ----------
  {
    const post = (x, z) => { cyl(scene, 0.035, 0.9, x, 0, z, whiteP, 8); cyl(scene, 0.04, 0.03, x, 0.9, z, toon(0xd9dce6), 8); };
    for (let z = -9.4; z <= 1.21; z += 1.77) post(6.02, z);
    for (const y of [0.42, 0.78]) tube(scene, [6.02, y, -9.4], [6.02, y, 1.22], 0.028, whiteP, 6);
    // corner arc
    const c = [5.15, 4.75], R = 0.85, pts = [];
    for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; pts.push([c[0] + Math.cos(a) * R, c[1] + Math.sin(a) * R]); }
    for (const y of [0.42, 0.78]) { for (let i = 0; i < 8; i++) tube(scene, [pts[i][0], y, pts[i][1]], [pts[i + 1][0], y, pts[i + 1][1]], 0.028, whiteP, 6); tube(scene, [6.0, y, 4.75], [6.0, y, 4.72], 0.028, whiteP, 6); }
    [0, 4, 8].forEach((i) => post(pts[i][0], pts[i][1]));
    box(scene, 0.03, 0.1, 0.1, 6.03, 0.55, 4.75, toon(0xf2c230, 0.4));
  }

  // ---------- side wall of the shop: AC units, service door, meter ----------
  acUnit(4.68, 0.1, -6.2, Math.PI / 2); acUnit(4.68, 0.1, -7.25, Math.PI / 2);
  tube(scene, [4.54, 0.5, -6.75], [4.54, 3.6, -6.75], 0.025, toon(0xcfd3dc), 6);
  box(scene, 0.06, 2.05, 0.9, 4.52, 0.1, -8.6, toon(0x7f8aa3)); box(scene, 0.03, 0.1, 0.04, 4.56, 1.1, -8.25, steel);
  box(scene, 0.1, 0.06, 0.3, 4.56, 2.3, -8.6, metal); box(scene, 0.06, 0.02, 0.22, 4.57, 2.285, -8.6, glow(0xfff0cf, 1.8));
  box(scene, 0.16, 0.3, 0.26, 4.6, 0.8, -5.5, toon(0xb9bfcc)); tube(scene, [4.6, 0.1, -5.5], [4.6, 0.8, -5.5], 0.02, toon(0xb9bfcc), 6);

  // ---------- neighbour house + alley ----------
  {
    const wall = toon(0xcfc6b6), trim = toon(0x6b6f84), dk = toon(0x4a4f63);
    box(scene, 2.7, 6.0, 12, -9.65, 0, -5.0, wall); box(scene, 2.74, 0.5, 12.04, -9.65, 0, -5.0, toon(0x8a8798));
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(3.05, 0); sh.lineTo(3.05, 0.14); sh.lineTo(0, 1.55); sh.closePath();
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 12.3, bevelEnabled: false }), toon(0x3f4666)); roof.position.set(-11, 6.0, -11); scene.add(roof);
    const win = (lit, hue) => glowTex(ctex(128, 96, (g, w, h) => {
      g.fillStyle = lit ? hue : '#1c2440'; g.fillRect(0, 0, w, h);
      if (lit) { g.fillStyle = 'rgba(255,255,255,.28)'; for (let i = 0; i < 7; i++) g.fillRect(6 + i * 18, 0, 7, h); g.fillStyle = 'rgba(120,70,30,.35)'; g.fillRect(0, h - 26, 34, 26); g.beginPath(); g.arc(96, h - 8, 16, 0, 7); g.fill(); }
      else { g.fillStyle = 'rgba(120,150,220,.18)'; g.beginPath(); g.moveTo(0, h); g.lineTo(50, 0); g.lineTo(80, 0); g.lineTo(30, h); g.fill(); }
      g.strokeStyle = '#e9ecf2'; g.lineWidth = 8; g.strokeRect(0, 0, w, h); g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
    }), lit ? 1.15 : 0.5);
    // front
    quad(scene, 1.5, 1.1, -9.6, 4.25, 1.012, win(true, '#ffd591'));
    box(scene, 2.3, 0.08, 0.75, -9.6, 3.2, 1.37, trim); for (let i = 0; i <= 8; i++) box(scene, 0.03, 0.75, 0.03, -10.7 + i * 0.275, 3.28, 1.72, dk);
    box(scene, 2.3, 0.05, 0.05, -9.6, 4.03, 1.72, dk); box(scene, 0.04, 0.8, 0.7, -8.47, 3.28, 1.37, dk);
    acUnit(-10.3, 3.28, 1.3, 0).scale.setScalar(0.8);
    const shut = toonTex(ctex(128, 128, (g, w, h) => { g.fillStyle = '#9aa0b0'; g.fillRect(0, 0, w, h); g.fillStyle = '#7d8394'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 2); }));
    quad(scene, 2.0, 2.3, -9.6, 1.25, 1.012, shut); box(scene, 2.2, 0.1, 0.5, -9.6, 2.45, 1.2, trim);
    box(scene, 0.3, 0.42, 0.16, -8.55, 1.0, 1.08, toon(0xc9423b));
    cyl(scene, 0.16, 0.26, -8.6, 0, 1.4, toon(0xb5653f), 10, 0.2); const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), toon(0x3f7a5c)); bush.position.set(-8.6, 0.5, 1.4); scene.add(bush);
    // alley side
    const tv = win(true, '#9cc4ff');
    quad(scene, 1.3, 1.0, -8.288, 4.3, -1.6, win(true, '#ffd591'), Math.PI / 2); quad(scene, 1.3, 1.0, -8.288, 4.3, -5.0, tv, Math.PI / 2); quad(scene, 1.3, 1.0, -8.288, 4.3, -8.4, win(false), Math.PI / 2);
    quad(scene, 0.8, 0.6, -8.288, 1.7, -3.2, win(false), Math.PI / 2); quad(scene, 0.8, 0.6, -8.288, 1.7, -7.0, win(true, '#ffe3b0'), Math.PI / 2);
    onTick((t) => { const f = 0.75 + 0.3 * Math.sin(t * 2.1) * Math.sin(t * 5.3) + (Math.sin(t * 13.7) > 0.8 ? 0.25 : 0); tv.color.setScalar(f); });
    tube(scene, [-8.24, 0.1, -0.2], [-8.24, 6.0, -0.2], 0.04, toon(0xa9a294), 6);
    acUnit(-8.1, 0, -4.6, Math.PI / 2); box(scene, 0.14, 0.26, 0.22, -8.2, 0.9, -6.0, toon(0xb9bfcc));
    acUnit(-6.7, 0, -4.2, -Math.PI / 2); acUnit(-6.7, 0, -6.4, -Math.PI / 2);
    tube(scene, [-6.55, 0.1, -1.85], [-6.55, 3.9, -1.85], 0.035, toon(0xcfd3dc), 6);
    for (let i = 0; i < 2; i++) { box(scene, 0.45, 0.3, 0.33, -6.82, i * 0.3, -2.5, toon(0xe6b93a)); box(scene, 0.37, 0.02, 0.25, -6.82, i * 0.3 + 0.29, -2.5, toon(0x7a5a10)); }
    cyl(scene, 0.17, 0.3, -7.95, 0, -2.0, toon(0x3d7fe0), 12, 0.2);
    cyl(scene, 0.13, 0.2, -8.05, 0, -9.3, toon(0xb5653f), 10, 0.16); const b2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), toon(0x4c8a66)); b2.position.set(-8.05, 0.4, -9.3); scene.add(b2);
    // flickering tube light in the alley
    const tubeM = glow(0xd6ffe8, 2.0);
    box(scene, 0.06, 0.07, 0.7, -6.54, 2.5, -3.3, toon(0xcfd3dc)); box(scene, 0.03, 0.04, 0.6, -6.585, 2.5, -3.3, tubeM);
    const al = new THREE.PointLight(0xc8ffe0, 7, 6, 1.6); al.position.set(-7.0, 2.4, -3.3); scene.add(al);
    const pool = addGroundLight([-7.4, -3.3], [-7.4, -3.3], [0, 0], '#bff5d6', 2.2, 3.8);
    const base = pool.clone();
    onTick((t) => { const c = t % 9; const k = (c > 6.0 && c < 6.08) || (c > 6.2 && c < 6.3) || (c > 6.6 && c < 6.64) ? 0.15 : 1; tubeM.color.set(0xd6ffe8).multiplyScalar(2.0 * k); al.intensity = 7 * k; pool.copy(base).multiplyScalar(k); });
    addGroundLight([-9.6, 1.7], [-9.6, 1.7], [0, 0], '#ffd591', 0.9, 3.2);
  }
  // back of the shop: vents, pipes, ladder, cabinet, a dim window
  {
    const g2 = toon(0xb9bfcc);
    for (const x of [-4.2, -2.2]) { box(scene, 0.9, 0.6, 0.08, x, 2.5, -9.54, g2); for (let i = 0; i < 5; i++) box(scene, 0.8, 0.03, 0.04, x, 2.57 + i * 0.11, -9.6, toon(0x7d8394)); }
    box(scene, 0.8, 1.2, 0.26, 2.6, 1.7, -9.63, g2); box(scene, 0.7, 0.04, 0.02, 2.6, 2.3, -9.77, toon(0x7d8394));
    tube(scene, [-5.6, 0.1, -9.57], [-5.6, 3.9, -9.57], 0.04, g2, 6); tube(scene, [-5.6, 2.1, -9.57], [1.2, 2.1, -9.57], 0.03, g2, 6); tube(scene, [1.2, 2.1, -9.57], [1.2, 0.1, -9.57], 0.03, g2, 6);
    for (const x of [0.2, 0.62]) tube(scene, [x, 1.7, -9.62], [x, 4.6, -9.62], 0.018, metal, 5);
    for (let y = 1.9; y < 4.5; y += 0.3) tube(scene, [0.2, y, -9.62], [0.62, y, -9.62], 0.012, metal, 4);
    quad(scene, 0.9, 0.5, -0.9, 2.75, -9.505, glowTex(ctex(64, 32, (g, w, h) => { g.fillStyle = '#ffe9bf'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e9ecf2'; g.lineWidth = 5; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); }), 0.85), Math.PI);
  }
  // a cat sheltering under the canopy, watching the rain
  {
    const g = grp(-3.75, 0.1, -0.78, 0.35);
    const SPH = new THREE.SphereGeometry(1, 14, 10), bk = toon(0x2d2f3c, 0.1), wh = toon(0xf3efe6, 0.1);
    const sp = (m, sx, sy, sz, x, y, z) => { const o = new THREE.Mesh(SPH, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); g.add(o); return o; };
    sp(bk, 0.105, 0.15, 0.125, 0, 0.15, 0); sp(bk, 0.12, 0.09, 0.14, 0, 0.08, -0.02); sp(wh, 0.06, 0.09, 0.05, 0, 0.14, 0.085);
    sp(bk, 0.085, 0.078, 0.08, 0, 0.345, 0.03); sp(wh, 0.04, 0.03, 0.03, 0, 0.32, 0.095);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.07, 4), bk); e.position.set(s * 0.05, 0.43, 0.02); e.rotation.z = -s * 0.2; g.add(e); sp(wh, 0.025, 0.02, 0.03, s * 0.04, 0.012, 0.1); sp(glow(0xd8ff7a, 1.6), 0.012, 0.014, 0.006, s * 0.032, 0.36, 0.105); }
    const tail = new THREE.Group(); tail.position.set(0.02, 0.05, -0.12); g.add(tail);
    const tt = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 6, 12, Math.PI * 0.9), bk); tt.rotation.x = Math.PI / 2; tt.position.set(0.11, 0, 0); tail.add(tt);
    onTick((t) => { tail.rotation.y = 0.25 * Math.sin(t * 1.1) + 0.1 * Math.sin(t * 2.7); });
  }
  // block wall behind the shop
  {
    const t = ctex(128, 64, (g, w, h) => { g.fillStyle = '#9da1b0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#737789'; g.lineWidth = 3; g.strokeRect(0, 0, w, h / 2); g.strokeRect(-w / 2, h / 2, w, h / 2); g.strokeRect(w / 2, h / 2, w, h / 2); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(33, 4);
    box(scene, 13.2, 1.55, 0.14, -1.6, 0, -10.85, toon(0x9da1b0)); quad(scene, 13.2, 1.55, -1.6, 0.775, -10.778, toonTex(t)); box(scene, 13.3, 0.06, 0.2, -1.6, 1.55, -10.85, toon(0x7d8194));
  }
}

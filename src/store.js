import { THREE, scene, ctex, txt, rrect, toon, toonTex, glow, glowTex, box, cyl, tube, quad, prod, rnd, rr, pick, onTick } from './core.js';
import { rainGlass, simpleGlass, addDrip, steam, halo } from './fx.js';
import { addGroundLight } from './ground.js';

const X0 = -6.5, X1 = 4.5, Z0 = -9.5, Z1 = -1.5, FL = 0.12, WT = 0.18;
const IND = '#2f3f9e', ORG = '#ff9a3d', YEL = '#ffd75e';
const PAL = ['#e9584f', '#f4a23c', '#f6d955', '#63b86f', '#4c97dc', '#8a6ad0', '#ef8db4', '#fafafa', '#7a4d32', '#3ec2b8', '#d93b6a', '#2f4a9c', '#f3efe0', '#a6d65c'];
const DRINK = ['#3a7d44', '#2b2b33', '#bfe6ff', '#f08a2c', '#6b4226', '#f4f7fb', '#f2d63f', '#d84a4a', '#3d6fd6', '#b7e07a', '#e9a7c8', '#8fd3d0'];

function moon(g, cx, cy, r, bg) {
  g.fillStyle = YEL; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.fillStyle = bg; g.beginPath(); g.arc(cx + r * 0.45, cy - r * 0.2, r * 0.84, 0, 7); g.fill();
}
function signTex(w, h, side) {
  return ctex(w, h, (g) => {
    g.fillStyle = '#fbfbf5'; g.fillRect(0, 0, w, h);
    g.fillStyle = IND; g.fillRect(0, 0, w, h * 0.16);
    g.fillStyle = ORG; g.fillRect(0, h * 0.8, w, h * 0.11); g.fillStyle = YEL; g.fillRect(0, h * 0.91, w, h * 0.09);
    const unit = (cx) => { moon(g, cx - h * 1.45, h * 0.48, h * 0.2, '#fbfbf5'); txt(g, 'ツキミマート', cx + h * 0.2, h * 0.49, h * 0.38, IND, 900); };
    const badge = (cx, s, col) => { rrect(g, cx - h * 1.25, h * 0.27, h * 2.5, h * 0.44, h * 0.22, col); txt(g, s, cx, h * 0.5, h * 0.24, '#fff', 900); };
    if (side) { unit(w * 0.5 + h * 0.15); badge(h * 1.5, '24時間営業', ORG); badge(w - h * 1.5, '酒 ・ たばこ', IND); }
    else { badge(h * 1.5, '24時間営業', ORG); badge(w - h * 1.5, '酒 ・ たばこ', IND); unit(w * 0.5 - h * 1.7); unit(w * 0.5 + h * 2.0); }
  });
}
function banner(w, h, bg, fg, s, price) {
  return ctex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    txt(g, s, price ? w * 0.38 : w / 2, h * 0.52, h * 0.46, fg, 900);
    if (price) { g.fillStyle = '#e23b3b'; g.beginPath(); g.arc(w * 0.84, h / 2, h * 0.42, 0, 7); g.fill(); txt(g, price, w * 0.84, h * 0.52, h * 0.28, '#fff', 900); }
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
  });
}
function poster(w, h, bg, fg, title, sub, accent) {
  return ctex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = accent; g.beginPath(); g.arc(w / 2, h * 0.56, w * 0.3, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(w * 0.42, h * 0.5, w * 0.1, 0, 7); g.fill();
    txt(g, title, w / 2, h * 0.17, w * 0.17, fg, 900);
    rrect(g, w * 0.12, h * 0.8, w * 0.76, h * 0.13, 8, fg); txt(g, sub, w / 2, h * 0.868, w * 0.1, bg, 900);
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
  });
}
function tileMat(rx, ry, base, line, lit = 0) {
  const t = ctex(64, 64, (g) => { g.fillStyle = base; g.fillRect(0, 0, 64, 64); g.strokeStyle = line; g.lineWidth = 3; g.strokeRect(0, 0, 64, 64); });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  return toonTex(t, lit);
}

// fill one shelf row with facings of products (row runs along local x, faces ±z)
function fillRow(p, x0, x1, y, z, depth, maxH = 0.26, pal = PAL) {
  let x = x0 + 0.03;
  while (x < x1 - 0.1) {
    const kind = pick(['box', 'box', 'box', 'cyl', 'tall']);
    const w = kind === 'cyl' ? rr(0.09, 0.12) : kind === 'tall' ? rr(0.07, 0.1) : rr(0.11, 0.2);
    const h = Math.min(maxH, kind === 'tall' ? rr(0.2, 0.26) : kind === 'cyl' ? rr(0.1, 0.16) : rr(0.12, 0.24));
    const n = 2 + Math.floor(rnd() * 3), col = pick(pal);
    for (let i = 0; i < n && x + w < x1 - 0.02; i++) {
      prod(p, kind === 'cyl' ? 'cyl' : 'box', w, h, kind === 'cyl' ? w : depth, x + w / 2, y, z, col);
      x += w + 0.014;
    }
    x += 0.025;
  }
}

export function buildStore() {
  const S = new THREE.Group(); scene.add(S);
  const wallExt = toon(0xdfe2ea), wallBase = toon(0x767b90), alu = toon(0xeef1f7, 0.2);
  const inWall = toon(0xfbeed6, 0.5), white = toon(0xf3f0ea, 0.5), dark = toon(0x343850, 0.3), steel = toon(0xcfd5df, 0.4);
  const H = 3.85;

  // ---------- shell ----------
  box(S, 12, 0.1, 9.3, -0.5, 0, -4.85, toon(0x9da1b3));
  quad(S, 12, 1.3, -0.5, 0.102, -0.85, tileMat(30, 3.25, '#b3b7c6', '#8a8ea1', 0.05), 0, -Math.PI / 2);
  quad(S, 1.0, 8, 5.0, 0.102, -5.5, tileMat(2.5, 20, '#b3b7c6', '#8a8ea1', 0.05), 0, -Math.PI / 2);
  box(S, 11, H, WT, -1, 0.1, Z0 + WT / 2, wallExt);
  box(S, WT, H, 8, X0 + WT / 2, 0.1, -5.5, wallExt);
  box(S, WT, H, 4.5, X1 - WT / 2, 0.1, -7.25, wallExt);
  box(S, 2.2, H, WT, -5.4, 0.1, Z1 - WT / 2, wallExt);
  box(S, 2.8, 0.3, WT + 0.02, -2.9, 0.1, Z1 - WT / 2, wallBase);
  box(S, 4.0, 0.3, WT + 0.02, 2.5, 0.1, Z1 - WT / 2, wallBase);
  box(S, WT + 0.02, 0.3, 3.5, X1 - WT / 2, 0.1, -3.25, wallBase);
  box(S, 8.8, 1.2, WT, 0.1, 2.75, Z1 - WT / 2, wallExt);
  box(S, WT, 1.2, 3.5, X1 - WT / 2, 2.75, -3.25, wallExt);
  // dark skirting on the solid walls
  box(S, 2.24, 0.3, WT + 0.04, -5.4, 0.1, Z1 - WT / 2, wallBase);
  box(S, WT + 0.04, 0.3, 4.5, X1 - WT / 2, 0.1, -7.25, wallBase);
  // roof
  box(S, 11.3, 0.15, 8.3, -1, 3.95, -5.5, toon(0x8b90a3));
  const par = toon(0xc9cdd9);
  box(S, 11.3, 0.35, 0.15, -1, 4.1, -1.425, par); box(S, 11.3, 0.35, 0.15, -1, 4.1, -9.575, par);
  box(S, 0.15, 0.35, 8.0, -6.575, 4.1, -5.5, par); box(S, 0.15, 0.35, 8.0, 4.575, 4.1, -5.5, par);
  for (const x of [-3.6, -1.3]) {
    box(S, 1.6, 0.85, 0.95, x, 4.16, -6.4, toon(0xb9bfcc)); box(S, 1.7, 0.06, 1.05, x, 4.1, -6.4, toon(0x6c7184));
    for (const dx of [-0.4, 0.4]) { cyl(S, 0.3, 0.04, x + dx, 5.01, -6.4, toon(0x3b3f52), 16); cyl(S, 0.08, 0.05, x + dx, 5.02, -6.4, toon(0x8b90a3), 8); }
  }
  box(S, 3.2, 0.3, 0.4, 1.6, 4.1, -7.6, toon(0xaab0be)); box(S, 0.4, 0.3, 2.2, 3.0, 4.1, -6.5, toon(0xaab0be));
  box(S, 0.8, 0.5, 0.8, 2.9, 4.1, -3.4, toon(0x9aa0b0)); cyl(S, 0.22, 0.3, 0.6, 4.1, -3.2, toon(0xb9bfcc), 12); cyl(S, 0.3, 0.06, 0.6, 4.4, -3.2, toon(0x8b90a3), 12);
  tube(S, [3.9, 4.1, -8.9], [3.9, 6.3, -8.9], 0.03, toon(0x8b90a3));
  for (const y of [5.5, 5.8, 6.1]) tube(S, [3.9 - 0.45 + (y - 5.5) * 0.3, y, -8.9], [3.9 + 0.45 - (y - 5.5) * 0.3, y, -8.9], 0.015, toon(0x8b90a3));

  // window frames
  const zf = Z1 - WT / 2, xf = X1 - WT / 2;
  for (const x of [-4.27, -2.9, -1.5, 0.5, 1.83, 3.17]) box(S, 0.07, 2.35, 0.1, x, 0.4, zf, alu);
  box(S, 0.07, 0.3, 0.1, -1.5, 0.1, zf, alu); box(S, 0.07, 0.3, 0.1, 0.5, 0.1, zf, alu);
  box(S, 0.2, 2.65, 0.2, xf, 0.1, zf, alu);
  box(S, 8.6, 0.05, 0.1, 0.1, 2.7, zf, alu); box(S, 2.8, 0.05, 0.1, -2.9, 0.4, zf, alu); box(S, 3.9, 0.05, 0.1, 2.45, 0.4, zf, alu);
  box(S, 2.0, 0.08, 0.14, -0.5, 2.3, zf, alu); box(S, 0.34, 0.07, 0.1, -0.5, 2.38, zf + 0.1, dark);
  for (const z of [-4.97, -3.83, -2.67]) box(S, 0.1, 2.35, 0.07, xf, 0.4, z, alu);
  box(S, 0.1, 0.05, 3.4, xf, 2.7, -3.3, alu); box(S, 0.1, 0.05, 3.4, xf, 0.4, -3.3, alu);
  // glass
  [[-3.585, 1.3], [-2.2, 1.33], [1.165, 1.26], [2.5, 1.27], [3.75, 1.1]].forEach(([x, w]) => rainGlass(S, w, 2.28, x, 1.59, zf));
  rainGlass(S, 1.93, 0.34, -0.5, 2.55, zf);
  [[-4.4, 1.07], [-3.25, 1.09], [-2.13, 1.02]].forEach(([z, w]) => rainGlass(S, w, 2.28, xf, 1.59, z, Math.PI / 2));

  // automatic door
  const sticker = toonTex(ctex(256, 32, (g, w, h) => { g.fillStyle = '#3aa66a'; g.fillRect(0, 0, w, h); txt(g, '自 動 ド ア', w / 2, h / 2 + 1, 20, '#fff', 900); }), 0.5);
  const leaves = [];
  for (const s of [-1, 1]) {
    const L = new THREE.Group(); L.position.set(s < 0 ? -1.0 : 0.0, 0.12, zf - 0.05); S.add(L);
    box(L, 0.05, 2.18, 0.04, -0.475, 0, 0, alu); box(L, 0.05, 2.18, 0.04, 0.475, 0, 0, alu);
    box(L, 1.0, 0.07, 0.04, 0, 0, 0, alu); box(L, 1.0, 0.05, 0.04, 0, 2.13, 0, alu);
    rainGlass(L, 0.9, 2.07, 0, 1.1, 0);
    quad(L, 0.9, 0.11, 0, 1.12, 0.012, sticker);
    L.userData = { x0: L.position.x, s }; leaves.push(L);
  }
  onTick((t) => {
    const c = (t + 8) % 19; let e = 0;
    if (c > 11 && c < 12) e = c - 11; else if (c >= 12 && c < 14.6) e = 1; else if (c >= 14.6 && c < 15.7) e = 1 - (c - 14.6) / 1.1;
    e = e * e * (3 - 2 * e);
    for (const L of leaves) L.position.x = L.userData.x0 + L.userData.s * 0.93 * e;
  });
  const matTex = ctex(256, 128, (g, w, h) => { g.fillStyle = '#7a2f3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e9c9a0'; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20); txt(g, 'いらっしゃいませ', w / 2, h / 2 + 2, 25, '#f3dcb8', 900); });
  box(S, 1.84, 0.02, 0.94, -0.5, 0.1, -0.86, toon(0x3b2a33));
  quad(S, 1.8, 0.9, -0.5, 0.122, -0.86, toonTex(matTex, 0.1), 0, -Math.PI / 2);

  // sign band (light box)
  const signF = glowTex(signTex(2816, 220, false), 1.12), signS = glowTex(signTex(2048, 220, true), 1.12);
  box(S, 11.1, 0.92, 0.14, -1, 2.97, Z1 + 0.07, toon(0xe7e9f0, 0.4)); quad(S, 11, 0.86, -1, 3.43, Z1 + 0.142, signF);
  box(S, 0.14, 0.92, 8.1, X1 + 0.07, 2.97, -5.45, toon(0xe7e9f0, 0.4)); quad(S, 8, 0.86, X1 + 0.142, 3.43, -5.5, signS, Math.PI / 2);
  onTick((t) => {
    const n = Math.sin(t * 61.0) * Math.sin(t * 7.3);
    const dip = (Math.sin(t * 0.9) > 0.985 || (t % 23 > 22.75 && Math.sin(t * 70) > 0)) ? 0.72 : 1;
    signF.color.setScalar(1.12 * dip * (1 + 0.025 * n)); signS.color.setScalar(1.12 * (1 + 0.02 * Math.sin(t * 43)));
  });

  // canopy with downlights, drips fall from its edge
  const can = toon(0xe3e6ee);
  box(S, 10.2, 0.12, 1.4, 0.4, 2.8, -0.8, can); box(S, 1.0, 0.12, 3.7, 5.0, 2.8, -3.35, can);
  box(S, 10.24, 0.17, 0.05, 0.4, 2.775, -0.1, toon(0x3a4aa8)); box(S, 0.05, 0.17, 5.12, 5.5, 2.775, -2.66, toon(0x3a4aa8));
  const dl = glow(0xfff0cf, 1.7);
  for (let x = -4.1; x <= 5.2; x += 1.55) cyl(S, 0.085, 0.02, x, 2.782, -0.8, dl, 12);
  for (const z of [-2.4, -4.0]) cyl(S, 0.085, 0.02, 5.0, 2.782, z, dl, 12);
  for (let x = -4.4; x <= 5.3; x += 0.62) addDrip(x + rr(-0.12, 0.12), 2.775, -0.075);
  for (let z = -4.9; z <= -0.4; z += 0.75) addDrip(5.525, 2.775, z + rr(-0.1, 0.1));

  // ---------- interior shell ----------
  const floorTex = ctex(1024, 736, (g, w, h) => {
    const kx = w / 10.64, kz = h / 7.64, PX = (x) => (x + 6.32) * kx, PZ = (z) => (z + 9.32) * kz;
    g.fillStyle = '#f6eedb'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e3d8c0'; g.lineWidth = 2;
    for (let x = -6.3; x < 4.4; x += 0.45) { g.beginPath(); g.moveTo(PX(x), 0); g.lineTo(PX(x), h); g.stroke(); }
    for (let z = -9.3; z < -1.6; z += 0.45) { g.beginPath(); g.moveTo(0, PZ(z)); g.lineTo(w, PZ(z)); g.stroke(); }
    for (let i = 0; i < 14; i++) { const x = rr(0, w); const gr = g.createLinearGradient(x, 0, x + 40, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x, 0, 40, h); }
    // floor guides: blue line from the door to the till, queue marks
    g.strokeStyle = '#3f7fd9'; g.lineWidth = 10; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(PX(0.25), PZ(-1.8)); g.lineTo(PX(0.25), PZ(-6.25)); g.lineTo(PX(2.0), PZ(-6.25)); g.stroke();
    g.fillStyle = '#3f7fd9'; g.beginPath(); g.moveTo(PX(2.35), PZ(-6.25)); g.lineTo(PX(1.95), PZ(-6.0)); g.lineTo(PX(1.95), PZ(-6.5)); g.fill();
    txt(g, 'レジ', PX(0.72), PZ(-6.5), 22, '#3f7fd9', 900);
    for (const x of [2.0, 2.75, 3.5]) { rrect(g, PX(x) - 20, PZ(-6.05) - 20, 40, 40, 6, '#ffd75e', '#d9a520', 3); g.fillStyle = '#7a5a10'; g.beginPath(); g.ellipse(PX(x) - 7, PZ(-6.05), 5, 11, 0, 0, 7); g.ellipse(PX(x) + 7, PZ(-6.05), 5, 11, 0, 0, 7); g.fill(); }
    rrect(g, PX(-1.4), PZ(-2.1), 1.8 * kx, 0.34 * kz, 4, '#4f8c7c'); txt(g, 'WELCOME', PX(-0.5), PZ(-1.93), 20, '#fff', 900);
  });
  quad(S, 10.64, 7.64, -1, FL + 0.001, -5.5, toonTex(floorTex, 0.42), 0, -Math.PI / 2);
  box(S, 10.64, 0.02, 7.64, -1, 0.1, -5.5, toon(0xf6eedb, 0.5));
  box(S, 10.64, 0.04, 7.64, -1, 2.92, -5.5, toon(0xf6f2ea, 0.6));
  const lamp = glow(0xfff5e0, 1.55);
  for (const x of [-5.1, -3.1, -1.1, 0.9, 2.9]) for (const z of [-8.3, -6.4, -4.5, -2.6]) box(S, 0.26, 0.02, 1.25, x, 2.9, z, lamp);
  box(S, 0.02, 2.8, 7.64, X0 + WT + 0.01, FL, -5.5, inWall); box(S, 10.64, 2.8, 0.02, -1, FL, Z0 + WT + 0.01, inWall);
  box(S, 0.02, 2.8, 4.32, X1 - WT - 0.01, FL, -7.16, inWall); box(S, 2.02, 2.8, 0.02, -5.31, FL, Z1 - WT - 0.01, inWall);
  box(S, 8.6, 0.16, 0.02, 0.1, 2.76, Z1 - WT - 0.01, inWall); box(S, 0.02, 0.16, 3.4, X1 - WT - 0.01, 2.76, -3.3, inWall);
  // brand stripe round the top of the walls
  box(S, 0.03, 0.14, 7.64, X0 + WT + 0.02, 2.68, -5.5, toon(0xff9a3d, 0.6)); box(S, 0.03, 0.14, 4.3, X1 - WT - 0.02, 2.68, -7.16, toon(0xff9a3d, 0.6));
  for (const p of [[-4, -5.6], [-0.6, -5.2], [2.7, -4.4]]) { const l = new THREE.PointLight(0xfff0d8, 3.0, 11, 1.5); l.position.set(p[0], 2.5, p[1]); scene.add(l); }

  // ---------- gondola shelves ----------
  const gondola = (x, z, len) => {
    const g = new THREE.Group(); g.position.set(x, FL, z); g.rotation.y = Math.PI / 2; S.add(g);
    box(g, len, 0.12, 0.9, 0, 0, 0, toon(0x5b6076, 0.3));
    box(g, len, 1.33, 0.04, 0, 0.12, 0, toon(0xf2efe8, 0.5));
    box(g, len + 0.04, 0.04, 0.3, 0, 1.45, 0, white);
    for (const s of [-1, 1]) for (let lv = 0; lv < 4; lv++) {
      const y = 0.12 + lv * 0.33;
      if (lv > 0) box(g, len, 0.025, 0.4, 0, y - 0.025, s * 0.22, white);
      box(g, len, 0.04, 0.012, 0, y - 0.04, s * 0.43, toon(lv % 2 ? 0xffe9a8 : 0xffffff, 0.7));
      fillRow(g, -len / 2, len / 2, y, s * 0.24, 0.3, lv === 3 ? 0.2 : 0.26);
    }
    for (const e of [-1, 1]) {          // end caps
      const xe = e * (len / 2 + 0.17);
      box(g, 0.04, 1.3, 0.86, e * (len / 2 + 0.02), 0.12, 0, toon(0xf2efe8, 0.5));
      box(g, 0.34, 0.12, 0.9, xe, 0, 0, toon(0x5b6076, 0.3));
      for (let lv = 0; lv < 4; lv++) {
        const y = 0.12 + lv * 0.3;
        if (lv > 0) box(g, 0.3, 0.025, 0.86, xe, y - 0.025, 0, white);
        let z2 = -0.4; const col = pick(PAL), w = rr(0.12, 0.17), hh = rr(0.14, 0.22);
        while (z2 + w < 0.42) { prod(g, 'box', 0.24, hh, w, xe, y, z2 + w / 2, col); z2 += w + 0.015; }
      }
      const pop = toonTex(banner(256, 64, e < 0 ? '#e23b3b' : '#ffd75e', e < 0 ? '#fff' : '#b3261e', e < 0 ? 'おすすめ' : '新発売'), 0.7);
      quad(g, 0.8, 0.2, e * (len / 2 + 0.35), 1.4, 0, pop, e * Math.PI / 2);
    }
  };
  gondola(-4.0, -5.45, 4.5); gondola(-2.2, -5.45, 4.5); gondola(1.5, -4.25, 2.7);

  // ---------- open chiller along the left wall (bento / onigiri / desserts) ----------
  {
    const g = new THREE.Group(); g.position.set(X0 + WT + 0.03, FL, -5.35); g.rotation.y = Math.PI / 2; S.add(g);
    const len = 6.5, navy = toon(0x2e3a66, 0.35);
    box(g, len, 2.02, 0.05, 0, 0, 0.025, white); box(g, len, 0.38, 0.72, 0, 0, 0.36, navy); box(g, len, 0.06, 0.74, 0, 0.32, 0.37, white);
    for (const x of [-len / 2, -1.1, 1.1, len / 2]) box(g, 0.05, 2.02, 0.72, x, 0, 0.36, white);
    box(g, len, 0.22, 0.72, 0, 1.8, 0.36, white);
    box(g, len - 0.1, 0.03, 0.05, 0, 1.775, 0.66, glow(0xffffff, 1.7));
    const ys = [0.38, 0.69, 0.99, 1.27, 1.53], deps = [0.6, 0.5, 0.46, 0.42, 0.4];
    ys.forEach((y, lv) => {
      const dep = deps[lv], zc = 0.05 + dep / 2;
      if (lv > 0) box(g, len - 0.1, 0.02, dep, 0, y - 0.02, zc, white);
      box(g, len - 0.1, 0.035, 0.012, 0, y - 0.035, 0.05 + dep, toon(0xbfe3ff, 0.9));
      const zf2 = 0.05 + dep - 0.14;
      for (let sct = 0; sct < 3; sct++) {
        const a = -len / 2 + 0.08 + sct * 2.15, b = a + 2.05;
        const kind = [['bento', 'bento', 'drinkbox'], ['don', 'bento', 'cup'], ['onigiri', 'onigiri', 'cup'], ['sand', 'onigiri', 'sweet'], ['drinkbox', 'drinkbox', 'drinkbox']][lv][sct];
        let x = a;
        while (x < b - 0.1) {
          const col = pick(PAL);
          if (kind === 'bento') { prod(g, 'box', 0.24, 0.045, 0.2, x + 0.12, y, zf2, '#2b2b33'); prod(g, 'box', 0.2, 0.02, 0.16, x + 0.12, y + 0.045, zf2, pick(['#f4c95d', '#e9795a', '#8cc66d', '#f1ead7', '#c9763a'])); x += 0.27; }
          else if (kind === 'don') { prod(g, 'cyl', 0.19, 0.07, 0.19, x + 0.1, y, zf2, pick(['#3a2e2a', '#f1ead7', '#b3261e'])); prod(g, 'cyl', 0.15, 0.015, 0.15, x + 0.1, y + 0.07, zf2, pick(['#f4c95d', '#c9763a', '#8cc66d'])); x += 0.23; }
          else if (kind === 'onigiri') { prod(g, 'tri', 0.115, 0.115, 0.05, x + 0.06, y, zf2, '#27322c'); prod(g, 'box', 0.06, 0.04, 0.008, x + 0.06, y + 0.025, zf2 + 0.03, col); x += 0.135; }
          else if (kind === 'sand') { prod(g, 'box', 0.13, 0.12, 0.07, x + 0.065, y, zf2, '#fbf6e9'); prod(g, 'box', 0.13, 0.03, 0.074, x + 0.065, y + 0.045, zf2, pick(['#8cc66d', '#f4c95d', '#e9795a', '#f2a5b5'])); x += 0.15; }
          else if (kind === 'cup') { const c2 = pick(['#fff', '#f6d7e0', '#d9ecff', '#f7e7a6', '#6b4226']); for (let i = 0; i < 3 && x < b - 0.1; i++) { prod(g, 'cyl', 0.075, 0.08, 0.075, x + 0.04, y, zf2, c2); x += 0.09; } x += 0.02; }
          else if (kind === 'sweet') { const w = rr(0.12, 0.17); for (let i = 0; i < 2 && x < b - 0.15; i++) { prod(g, 'box', w, 0.07, 0.12, x + w / 2, y, zf2, pick(['#f6d7e0', '#fff3d1', '#d8f0dc', '#e8dcf7'])); x += w + 0.02; } }
          else { const n = 3; const c2 = pick(DRINK); for (let i = 0; i < n && x < b - 0.08; i++) { prod(g, 'box', 0.068, 0.19, 0.068, x + 0.034, y, zf2, c2); x += 0.08; } x += 0.02; }
        }
      }
    });
    const head = glowTex(ctex(2048, 150, (c, w, h) => {
      c.fillStyle = '#fff8e6'; c.fillRect(0, 0, w, h); c.fillStyle = ORG; c.fillRect(0, h - 22, w, 22);
      ['お弁当', 'おにぎり', 'サンドイッチ', 'デザート'].forEach((s, i) => { rrect(c, 60 + i * 500, 22, 420, 86, 43, ['#e9584f', '#63b86f', '#f4a23c', '#ef8db4'][i]); txt(c, s, 270 + i * 500, 67, 54, '#fff', 900); });
    }), 1.02);
    box(g, len, 0.5, 0.08, 0, 2.08, 0.04, white); quad(g, len - 0.06, 0.46, 0, 2.33, 0.082, head);
  }

  // ---------- drink coolers on the back wall ----------
  {
    const g = new THREE.Group(); g.position.set(-2.9, FL, Z0 + WT + 0.02); S.add(g);
    const len = 5.2;
    box(g, len, 2.3, 0.04, 0, 0, 0.02, toon(0xffffff, 0.85)); box(g, len, 0.2, 0.62, 0, 0, 0.31, dark); box(g, len, 0.28, 0.62, 0, 2.05, 0.31, dark);
    box(g, 0.06, 2.3, 0.62, -len / 2 - 0.03, 0, 0.31, dark); box(g, 0.06, 2.3, 0.62, len / 2 + 0.03, 0, 0.31, dark);
    for (let i = 0; i <= 4; i++) { const x = -len / 2 + i * 1.3; box(g, 0.07, 1.85, 0.06, x, 0.2, 0.59, dark); box(g, 0.03, 1.8, 0.03, x + (i === 4 ? -0.06 : 0.06), 0.22, 0.52, glow(0xeaf6ff, 1.6)); }
    for (let lv = 0; lv < 5; lv++) {
      const y = 0.24 + lv * 0.36;
      box(g, len - 0.1, 0.015, 0.46, 0, y - 0.015, 0.28, white);
      box(g, len - 0.1, 0.03, 0.01, 0, y - 0.03, 0.515, toon(0xffffff, 0.9));
      for (let d = 0; d < 4; d++) {
        let x = -len / 2 + d * 1.3 + 0.1; const end = x + 1.1;
        while (x < end - 0.05) { const col = pick(DRINK), hh = rr(0.2, 0.25), n = 2 + Math.floor(rnd() * 3); for (let i = 0; i < n && x < end - 0.05; i++) { prod(g, 'cyl', 0.068, hh, 0.068, x + 0.034, y, 0.45, col); prod(g, 'cyl', 0.068, hh, 0.068, x + 0.034, y, 0.36, col); x += 0.078; } }
      }
    }
    for (let d = 0; d < 4; d++) { const cx = -len / 2 + d * 1.3 + 0.65; simpleGlass(g, 1.22, 1.85, cx, 1.125, 0.6); box(g, 0.025, 0.5, 0.035, cx + (d % 2 ? -0.5 : 0.5), 0.9, 0.62, steel); }
    const head = glowTex(ctex(1664, 84, (c, w, h) => { c.fillStyle = '#2f7fd6'; c.fillRect(0, 0, w, h); ['ソフトドリンク', 'お茶 ・ 水', 'コーヒー', 'お酒'].forEach((s, i) => txt(c, s, 208 + i * 416, h / 2 + 2, 44, '#fff', 900)); }), 1.0);
    quad(g, len, 0.26, 0, 2.19, 0.622, head);
    box(S, 0.78, 2.6, 0.7, -5.9, FL, -8.95, inWall);
  }

  // ---------- ice cream freezer island ----------
  {
    const g = new THREE.Group(); g.position.set(-0.45, FL, -5.3); S.add(g);
    box(g, 0.9, 0.62, 1.9, 0, 0, 0, white); box(g, 0.92, 0.12, 1.92, 0, 0.1, 0, toon(0x4c97dc, 0.5));
    for (const s of [-1, 1]) { box(g, 0.05, 0.25, 1.9, s * 0.425, 0.62, 0, white); box(g, 0.9, 0.25, 0.05, 0, 0.62, s * 0.925, white); }
    box(g, 0.8, 0.02, 1.8, 0, 0.6, 0, toon(0xeaf6ff, 0.9));
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) prod(g, 'box', 0.3, 0.07, 0.17, s * 0.19, 0.62, -0.78 + i * 0.195, pick(['#ef8db4', '#f6d955', '#8fd3d0', '#7a4d32', '#fafafa', '#a6d65c', '#4c97dc', '#e9584f']));
    simpleGlass(g, 0.8, 1.8, 0, 0.86, 0, 0, -Math.PI / 2);
    box(g, 0.02, 0.02, 1.8, 0, 0.86, 0, steel);
    const pop = toonTex(banner(256, 96, '#4c97dc', '#fff', 'アイス'), 0.7);
    box(g, 0.02, 0.5, 0.02, 0, 0.87, -0.93, steel); quad(g, 0.6, 0.22, 0, 1.45, -0.93, pop); quad(g, 0.6, 0.22, 0, 1.45, -0.932, pop, Math.PI);
  }

  // ---------- magazine rack along the front window ----------
  {
    const g = new THREE.Group(); g.position.set(-2.95, FL, -2.05); S.add(g);
    const titles = ['週刊ヨル', 'マンガ月', '旅と街', 'ねこ日和', 'FASHION', 'ゲーム通', '料理帖', '映画館', '音楽夜', 'カメラ', '鉄道の旅'];
    const row = (sd) => toonTex(ctex(1024, 128, (c, w, h) => {
      c.fillStyle = '#d8d2c4'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) {
        const x = i * w / 9 + 5, cw = w / 9 - 10, hue = (i * 47 + sd * 83) % 360;
        c.fillStyle = `hsl(${hue} 68% 60%)`; c.fillRect(x, 4, cw, h - 8);
        c.fillStyle = `hsl(${(hue + 40) % 360} 85% 86%)`; c.beginPath(); c.arc(x + cw / 2, h * 0.62, cw * 0.27, 0, 7); c.fill();
        txt(c, titles[(i + sd * 3) % titles.length], x + cw / 2, h * 0.2, 21, '#fff', 900);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 8, h * 0.88, cw - 16, 4);
      }
    }), 0.65);
    box(g, 2.5, 0.16, 0.56, 0, 0, 0, toon(0x5b6076, 0.3)); box(g, 2.5, 1.0, 0.04, 0, 0.16, 0, toon(0xf2efe8, 0.5));
    for (const s of [1, -1]) {
      const ry = s > 0 ? 0 : Math.PI;
      quad(g, 2.44, 0.32, 0, 0.4, s * 0.21, row(s > 0 ? 1 : 3), ry, -0.3); box(g, 2.5, 0.03, 0.1, 0, 0.21, s * 0.24, white);
      quad(g, 2.44, 0.32, 0, 0.82, s * 0.1, row(s > 0 ? 2 : 4), ry, -0.3); box(g, 2.5, 0.03, 0.1, 0, 0.63, s * 0.13, white);
    }
  }

  // ---------- till counter: oden, register, hot snacks, coffee ----------
  {
    const cy = FL + 1.0, cz = -7.25;
    box(S, 3.1, 0.95, 0.7, 2.75, FL, cz, white); box(S, 3.12, 0.14, 0.72, 2.75, FL + 0.55, cz, toon(0xff9a3d, 0.6)); box(S, 3.12, 0.1, 0.72, 2.75, FL, cz, dark);
    box(S, 3.2, 0.05, 0.82, 2.75, FL + 0.95, cz, toon(0x4a4f63, 0.4));
    // gum rack on the counter front
    box(S, 0.9, 0.3, 0.12, 2.3, FL + 0.6, cz + 0.42, white);
    for (let i = 0; i < 9; i++) prod(S, 'box', 0.08, 0.1, 0.05, 1.93 + i * 0.092, FL + 0.9, cz + 0.42, pick(PAL));
    // oden pot
    box(S, 0.56, 0.2, 0.44, 1.6, cy, cz, steel); box(S, 0.5, 0.01, 0.38, 1.6, cy + 0.2, cz, toon(0x9a6a36, 0.7));
    box(S, 0.5, 0.02, 0.015, 1.6, cy + 0.2, cz, steel); box(S, 0.015, 0.02, 0.38, 1.6, cy + 0.2, cz, steel);
    [[-0.14, -0.09, '#f3ead2', 'cyl'], [0.1, -0.1, '#fff8ea', 'cyl'], [-0.1, 0.09, '#8d8f86', 'box'], [0.14, 0.08, '#d9a55e', 'cyl'], [0.0, 0.0, '#f0e2c0', 'box']].forEach(([dx, dz, c, k]) => prod(S, k, 0.09, 0.035, 0.09, 1.6 + dx, cy + 0.2, cz + dz, c));
    steam(1.6, cy + 0.25, cz);
    const odenPop = toonTex(banner(256, 110, '#b3261e', '#fff', 'おでん', '70円'), 0.7);
    box(S, 0.02, 0.3, 0.02, 1.6, cy + 0.2, cz - 0.26, steel); quad(S, 0.5, 0.21, 1.6, cy + 0.6, cz - 0.25, odenPop);
    // register
    box(S, 0.38, 0.1, 0.36, 2.28, cy, cz, dark); box(S, 0.05, 0.3, 0.05, 2.28, cy + 0.1, cz - 0.08, dark);
    const scr = glowTex(ctex(128, 96, (g, w, h) => { g.fillStyle = '#16264d'; g.fillRect(0, 0, w, h); g.fillStyle = '#7fd0ff'; for (let i = 0; i < 4; i++) g.fillRect(10, 12 + i * 14, 60 + (i * 17) % 40, 6); rrect(g, 10, 70, 108, 18, 3, '#3fd08a'); txt(g, '¥ 648', 64, 80, 13, '#083', 900); }), 1.0);
    const sm = box(S, 0.36, 0.26, 0.03, 2.28, cy + 0.34, cz - 0.07, dark); sm.rotation.x = -0.25;
    const sq = quad(S, 0.32, 0.22, 2.28, cy + 0.47, cz - 0.052, scr, 0, -0.25);
    box(S, 0.22, 0.02, 0.16, 2.28, cy, cz + 0.27, toon(0x4c97dc, 0.6));
    // hot snack case
    box(S, 0.62, 0.06, 0.42, 3.0, cy, cz, dark); box(S, 0.62, 0.1, 0.42, 3.0, cy + 0.58, cz, toon(0xff7a2f, 0.8));
    for (const dx of [-0.29, 0.29]) for (const dz of [-0.19, 0.19]) box(S, 0.03, 0.52, 0.03, 3.0 + dx, cy + 0.06, cz + dz, dark);
    box(S, 0.56, 0.02, 0.36, 3.0, cy + 0.3, cz, steel);
    box(S, 0.54, 0.015, 0.34, 3.0, cy + 0.565, cz, glow(0xffc070, 1.8));
    for (const yy of [0.06, 0.32]) for (let i = 0; i < 5; i++) prod(S, pick(['box', 'cyl']), 0.085, 0.05, 0.11, 2.78 + i * 0.11, cy + yy, cz + 0.03, pick(['#c9843a', '#b86a2a', '#e0a04a', '#d9903a']));
    simpleGlass(S, 0.58, 0.52, 3.0, cy + 0.32, cz + 0.2);
    const hot = glowTex(banner(256, 40, '#ff7a2f', '#fff', 'ホットスナック'), 1.0); quad(S, 0.6, 0.09, 3.0, cy + 0.63, cz + 0.212, hot);
    // coffee machine
    box(S, 0.5, 0.72, 0.46, 3.78, cy, cz - 0.05, toon(0x24262f, 0.3)); box(S, 0.5, 0.05, 0.3, 3.78, cy, cz + 0.2, steel);
    const cof = glowTex(ctex(128, 180, (g, w, h) => {
      g.fillStyle = '#1b1c23'; g.fillRect(0, 0, w, h); rrect(g, 14, 12, 100, 44, 5, '#3b2a1e'); txt(g, 'COFFEE', 64, 26, 17, '#ffe2b0', 900); txt(g, '¥110', 64, 44, 14, '#fff', 800);
      [['#6b4226', 'HOT'], ['#9a6a36', 'ICE'], ['#c9a06a', 'LATTE'], ['#e8d9c0', 'MILK']].forEach(([c, s], i) => { const x = 36 + (i % 2) * 56, y = 82 + Math.floor(i / 2) * 36; g.fillStyle = c; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); txt(g, s, x, y + 21, 9, '#ddd', 800); });
      rrect(g, 34, 148, 60, 26, 3, '#0c0c10');
    }), 0.9);
    quad(S, 0.44, 0.62, 3.78, cy + 0.38, cz + 0.182, cof);
    for (let i = 0; i < 2; i++) cyl(S, 0.04, 0.26, 4.12, cy, cz + 0.05 + i * 0.12, toon(0xffffff, 0.6), 10, 0.05);
    box(S, 0.12, 0.14, 0.1, 2.62, cy, cz + 0.25, toon(0xffd75e, 0.6));
    // back counter, microwaves, cigarettes, menu light box
    box(S, 2.9, 0.9, 0.5, 2.85, FL, -9.05, white); box(S, 2.94, 0.04, 0.54, 2.85, FL + 0.9, -9.05, toon(0x4a4f63, 0.4));
    for (const x of [1.9, 2.55]) { box(S, 0.5, 0.3, 0.38, x, FL + 0.94, -9.08, toon(0xdadde5, 0.5)); box(S, 0.32, 0.2, 0.01, x - 0.06, FL + 0.99, -8.885, toon(0x22242c, 0.3)); }
    const cig = toonTex(ctex(512, 200, (g, w, h) => { g.fillStyle = '#4a4f63'; g.fillRect(0, 0, w, h); for (let r = 0; r < 5; r++) for (let c = 0; c < 22; c++) { g.fillStyle = pick(['#fff', '#e9584f', '#2f4a9c', '#3a7d44', '#f6d955', '#222', '#c9a06a', '#8fd3d0', '#fff']); g.fillRect(8 + c * 22.6, 8 + r * 38, 18, 28); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(8 + c * 22.6, 28 + r * 38, 18, 8); } }), 0.6);
    box(S, 2.0, 0.95, 0.12, 3.25, 1.3, -9.24, white); quad(S, 1.94, 0.9, 3.25, 1.775, -9.175, cig);
    const menu = glowTex(ctex(1024, 180, (g, w, h) => {
      g.fillStyle = '#fff6e0'; g.fillRect(0, 0, w, h);
      const cell = (x, bg, s, p, draw) => { rrect(g, x + 8, 8, 325, h - 16, 12, bg); draw(x + 90, h * 0.5); txt(g, s, x + 225, h * 0.36, 34, '#fff', 900); txt(g, p, x + 225, h * 0.7, 36, '#fff3b0', 900); };
      cell(0, '#d9693a', 'からあげ', '¥180', (x, y) => { g.fillStyle = '#b86a2a'; for (const [a, b] of [[-20, 8], [16, 12], [0, -16]]) { g.beginPath(); g.arc(x + a, y + b, 24, 0, 7); g.fill(); } });
      cell(341, '#c94f5f', '肉まん', '¥140', (x, y) => { g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(x, y + 6, 46, 36, 0, 0, 7); g.fill(); });
      cell(682, '#6b4a34', 'コーヒー', '¥110', (x, y) => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x - 30, y - 34); g.lineTo(x + 30, y - 34); g.lineTo(x + 22, y + 40); g.lineTo(x - 22, y + 40); g.fill(); g.fillStyle = '#6b4226'; g.fillRect(x - 26, y - 14, 52, 22); });
    }), 1.02);
    box(S, 2.9, 0.52, 0.1, 2.85, 2.33, -9.25, white); quad(S, 2.84, 0.48, 2.85, 2.59, -9.195, menu);
    // staff door
    box(S, 0.95, 2.1, 0.05, 0.45, FL, -9.28, toon(0x8b90a3, 0.4)); box(S, 0.85, 2.02, 0.05, 0.45, FL, -9.26, toon(0xb7c9c3, 0.5));
    cyl(S, 0.13, 0.02, 0.45, 1.62, -9.23, toon(0x22304f, 0.4), 16).rotation.x = Math.PI / 2;
    box(S, 0.85, 0.22, 0.01, 0.45, FL, -9.232, steel); box(S, 0.04, 0.16, 0.05, 0.8, 1.05, -9.22, steel);
    quad(S, 0.5, 0.13, 0.45, 1.33, -9.232, toonTex(banner(256, 64, '#b3261e', '#fff', 'STAFF ONLY'), 0.6));
  }

  // ---------- eat-in counter by the side window ----------
  box(S, 0.42, 0.05, 2.9, 4.03, 1.0, -3.35, toon(0xc9a06a, 0.5));
  for (const z of [-4.7, -2.0]) box(S, 0.05, 0.88, 0.05, 3.9, FL, z, steel);
  for (const z of [-4.3, -3.35, -2.4]) { cyl(S, 0.17, 0.06, 3.5, 0.66, z, toon(0xe9584f, 0.5), 14); cyl(S, 0.025, 0.54, 3.5, FL, z, steel, 8); cyl(S, 0.16, 0.02, 3.5, FL, z, steel, 14); }
  cyl(S, 0.04, 0.11, 4.0, 1.05, -3.6, toon(0xffffff, 0.6), 10, 0.05); cyl(S, 0.052, 0.012, 4.0, 1.16, -3.6, toon(0x3b2a1e, 0.4), 10);
  // baskets by the door
  for (let i = 0; i < 5; i++) box(S, 0.44, 0.07, 0.32, 0.95, FL + 0.05 + i * 0.075, -2.15, toon(i % 2 ? 0xf4a23c : 0xe9584f, 0.55));
  tube(S, [0.76, FL + 0.44, -2.15], [1.14, FL + 0.44, -2.15], 0.012, dark);
  // hanging POP signs, security mirror
  [[-3.1, -4.4, '#e23b3b', '#fff', '新発売'], [-0.4, -3.3, '#ffd75e', '#b3261e', 'おにぎり100円'], [1.5, -6.1, '#2f7fd6', '#fff', 'ポイント2倍']].forEach(([x, z, bg, fg, s]) => {
    const m = toonTex(banner(320, 110, bg, fg, s), 0.75);
    quad(S, 0.95, 0.33, x, 2.3, z, m); quad(S, 0.95, 0.33, x, 2.3, z - 0.004, m, Math.PI);
    for (const dx of [-0.4, 0.4]) tube(S, [x + dx, 2.46, z], [x + dx, 2.92, z], 0.005, dark, 4);
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon(0x9fb4d6, 0.5)); dome.position.set(-0.5, 2.92, -3.0); S.add(dome);
  // posters on the glass, neon OPEN sign
  quad(S, 1.15, 0.36, 1.165, 2.42, zf - 0.03, toonTex(banner(512, 160, '#b3261e', '#fff', 'おでん全品', '70円'), 0.7));
  quad(S, 1.15, 0.36, -3.585, 2.42, zf - 0.03, toonTex(banner(512, 160, '#ffd75e', '#7a2f0e', 'からあげ増量中'), 0.7));
  quad(S, 0.6, 0.85, xf - 0.03, 1.25, -4.4, toonTex(poster(240, 340, '#fdf3d8', '#2f3f9e', 'スタッフ', '募集中', '#ffb4a2'), 0.7), Math.PI / 2);
  const neonTex = ctex(256, 104, (g, w, h) => {
    g.fillStyle = '#0e0f1c'; g.fillRect(0, 0, w, h);
    g.shadowColor = '#ff5fa2'; g.shadowBlur = 14; rrect(g, 10, 10, w - 20, h - 20, 18, null, '#5ff0ff', 5);
    g.shadowColor = '#ff5fa2'; txt(g, 'OPEN', w / 2, h / 2 + 3, 52, '#ff8fc0', 900); txt(g, 'OPEN', w / 2, h / 2 + 3, 52, '#ffd0e4', 900);
  });
  const neon = glowTex(neonTex, 1.5);
  quad(S, 0.9, 0.36, 3.75, 2.4, zf - 0.03, neon);
  onTick((t) => { const c = t % 13; const off = (c > 9.2 && c < 9.3) || (c > 9.45 && c < 9.52) || (c > 9.9 && c < 10.4); neon.color.setScalar(off ? 0.25 : 1.5 + 0.08 * Math.sin(t * 37)); });

  // light spilling out of the shop
  const l1 = new THREE.PointLight(0xffdcae, 10, 10, 1.6); l1.position.set(-0.5, 2.3, 0.5); scene.add(l1);
  const l2 = new THREE.PointLight(0xffdcae, 6, 8, 1.6); l2.position.set(6.0, 2.2, -3.2); scene.add(l2);
  addGroundLight([-4.3, -1.5], [4.5, -1.5], [0, 1], '#ffbf73', 6.5, 10);
  addGroundLight([4.5, -5.0], [4.5, -1.5], [1, 0], '#ffbf73', 5.0, 7);
  halo(-0.5, 1.6, -1.3, 9, 0xffc98a, 0.1);
}

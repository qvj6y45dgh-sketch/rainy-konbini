import { THREE, scene, L_FX, ctex, FONT, txt, toon, toonTex, box, quad, rnd, rr } from './core.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { uTime } from './fx.js';

// ---------- fake light pools on the wet ground (segment lights) ----------
const NL = 12;
const mk = (f) => Array.from({ length: NL }, f);
const lA = mk(() => new THREE.Vector2()), lB = mk(() => new THREE.Vector2()), lN = mk(() => new THREE.Vector2());
const lC = mk(() => new THREE.Color(0, 0, 0)), lR = new Array(NL).fill(1);
let nl = 0;
export function addGroundLight(a, b, n, color, k, r) {
  const i = nl++;
  lA[i].set(a[0], a[1]); lB[i].set(b[0], b[1]); lN[i].set(n[0], n[1]); lC[i].set(color).multiplyScalar(k); lR[i] = r;
  return lC[i];
}

const TS = 2048, K = TS / 22;
const X = (v) => (v + 11) * K;

function paint(g) {
  const R = (x0, z0, x1, z1, c) => { g.fillStyle = c; g.fillRect(X(x0), X(z0), (x1 - x0) * K, (z1 - z0) * K); };
  const WH = '#e4e7ee';
  R(-11, -11, 11, 11, '#4a4f64');                 // road asphalt
  R(-11, -11, 6.05, 5.55, '#565b70');             // shop lot
  R(-8.3, -11, -6.5, 1.0, '#6c7082');             // alley concrete
  R(-11, 1.0, -6.45, 5.55, '#5e6276');            // yard in front of the neighbour
  // asphalt patches
  R(-10, 7.2, -7.4, 9.0, '#444959'); R(7.0, -8.2, 9.2, -5.6, '#515669'); R(2.2, 2.0, 4.6, 3.4, '#5c6176');
  // gutter (排水沟)
  const GUT = '#8b8fa0';
  R(-11, 5.55, 6.5, 6.0, GUT); R(6.05, -11, 6.5, 6.0, GUT);
  g.strokeStyle = 'rgba(30,32,45,.55)'; g.lineWidth = 1.5;
  for (let x = -11; x < 6.5; x += 0.6) { g.beginPath(); g.moveTo(X(x), X(5.55)); g.lineTo(X(x), X(6.0)); g.stroke(); }
  for (let z = -11; z < 5.55; z += 0.6) { g.beginPath(); g.moveTo(X(6.05), X(z)); g.lineTo(X(6.5), X(z)); g.stroke(); }
  g.strokeStyle = 'rgba(20,22,32,.7)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(X(-11), X(5.56)); g.lineTo(X(6.05), X(5.56)); g.lineTo(X(6.05), X(-11)); g.stroke();
  const grate = (x0, z0, w, d, alongX) => {
    R(x0, z0, x0 + w, z0 + d, '#1b1d28');
    g.fillStyle = '#6f7386';
    const n = 9;
    for (let i = 0; i < n; i++) {
      if (alongX) g.fillRect(X(x0 + (i + 0.3) * w / n), X(z0 + 0.04), w / n * 0.4 * K, (d - 0.08) * K);
      else g.fillRect(X(x0 + 0.04), X(z0 + (i + 0.3) * d / n), (w - 0.08) * K, d / n * 0.4 * K);
    }
  };
  for (const x of [-9.2, -5.4, -0.9, 3.2]) grate(x, 5.6, 0.9, 0.36, true);
  for (const z of [-8.4, -4.2, 0.2]) grate(6.1, z, 0.36, 0.9, false);
  grate(6.08, 5.58, 0.4, 0.4, true);

  // road edge lines
  R(-11, 6.3, 5.6, 6.44, WH); R(-11, 9.78, 6.4, 9.92, WH);
  R(6.8, -11, 6.94, 1.1, WH); R(9.78, -11, 9.92, 1.1, WH); R(9.78, 5.0, 9.92, 9.92, WH); R(6.4, 9.78, 9.92, 9.92, WH);
  // zebra crossing over the side street
  for (let i = 0; i < 4; i++) R(6.72 + i * 0.86, 1.6, 7.17 + i * 0.86, 4.6, WH);
  R(8.4, 0.7, 9.75, 1.1, WH);                      // stop line (side street)
  // crossing-ahead diamonds
  g.strokeStyle = WH; g.lineWidth = 0.15 * K; g.lineJoin = 'miter';
  for (const z of [-3.2, -7.4]) {
    g.beginPath(); g.moveTo(X(8.35), X(z - 1.3)); g.lineTo(X(8.95), X(z)); g.lineTo(X(8.35), X(z + 1.3)); g.lineTo(X(7.75), X(z)); g.closePath(); g.stroke();
  }
  // 止まれ + stop line (front street)
  R(5.75, 6.5, 6.15, 8.1, WH);
  g.save(); g.translate(X(3.0), X(7.28)); g.rotate(Math.PI / 2);
  g.fillStyle = WH; g.font = `900 ${1.05 * K}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  [['止', -1.7], ['ま', 0], ['れ', 1.7]].forEach(([ch, off]) => { g.save(); g.translate(0, off * K); g.scale(1, 1.5); g.fillText(ch, 0, 0); g.restore(); });
  g.restore();

  // parking bays
  for (const x of [-6.2, -3.9, -1.6, 0.9, 3.2, 5.5]) R(x - 0.06, 0.7, x + 0.06, 5.3, WH);
  [[-5.05, '1'], [-2.75, '2'], [2.05, '3'], [4.35, '4']].forEach(([x, n]) => txt(g, n, X(x), X(4.75), 0.6 * K, 'rgba(228,231,238,.9)', 800));
  // green walkway to the door
  R(-1.3, -0.2, 0.3, 5.5, '#4f8c7c');
  g.fillStyle = WH; for (let z = 0.0; z < 5.4; z += 0.7) { g.fillRect(X(-1.36), X(z), 0.09 * K, 0.4 * K); g.fillRect(X(0.27), X(z), 0.09 * K, 0.4 * K); }
  g.fillStyle = 'rgba(240,244,250,.85)';
  for (const z of [1.6, 3.6]) { g.beginPath(); g.moveTo(X(-0.5), X(z - 0.45)); g.lineTo(X(-0.1), X(z + 0.1)); g.lineTo(X(-0.36), X(z + 0.1)); g.lineTo(X(-0.36), X(z + 0.5)); g.lineTo(X(-0.64), X(z + 0.5)); g.lineTo(X(-0.64), X(z + 0.1)); g.lineTo(X(-0.9), X(z + 0.1)); g.closePath(); g.fill(); }

  // manholes
  const hole = (x, z, r) => {
    g.fillStyle = '#6a6e7f'; g.beginPath(); g.arc(X(x), X(z), r * K, 0, 7); g.fill();
    g.strokeStyle = '#262833'; g.lineWidth = 3; g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.arc(X(x), X(z), r * K * 0.62, 0, 7); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(X(x) + Math.cos(a) * r * K * 0.62, X(z) + Math.sin(a) * r * K * 0.62); g.lineTo(X(x) + Math.cos(a) * r * K * 0.95, X(z) + Math.sin(a) * r * K * 0.95); g.stroke(); }
  };
  hole(-3.6, 8.5, 0.36); hole(8.5, 7.9, 0.36);
  R(8.1, -9.6, 8.7, -9.0, '#6a6e7f'); g.strokeStyle = '#262833'; g.lineWidth = 3; g.strokeRect(X(8.1), X(-9.6), 0.6 * K, 0.6 * K);
  // alley centre drain
  R(-7.5, -10.5, -7.3, 0.6, '#555869');

  // cracks
  g.strokeStyle = 'rgba(20,22,32,.5)'; g.lineWidth = 1.5;
  for (let i = 0; i < 16; i++) {
    let x = rr(-10.5, 10.5), z = rr(-1, 10.5);
    g.beginPath(); g.moveTo(X(x), X(z));
    for (let k = 0; k < 6; k++) { x += rr(-0.4, 0.4); z += rr(-0.35, 0.35); g.lineTo(X(x), X(z)); }
    g.stroke();
  }
  // contact shadows under street furniture
  const shadow = (x, z, rx, rz, a = 0.6) => {
    g.save(); g.translate(X(x), X(z)); g.scale(rx * K, rz * K);
    const gr = g.createRadialGradient(0, 0, 0.3, 0, 0, 1); gr.addColorStop(0, `rgba(8,9,20,${a})`); gr.addColorStop(1, 'rgba(8,9,20,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 7); g.fill(); g.restore();
  };
  [[-9.9, 5.2, .5, .5], [5.5, 4.95, .5, .5], [5.6, -10.3, .5, .5], [-7.4, 4.9, .7, .6], [-8.7, 3.9, 1.1, .5], [4.6, 5.35, .3, .3],
   [-6.35, 0.5, .4, .4], [-6.35, 2.2, .4, .4], [4.95, 3.9, .4, .4], [5.3, -3.1, .6, 1.1], [5.2, -6.8, .7, 1.5]].forEach((s) => shadow(...s));
  for (const x of [-5.05, -2.75, 2.05, 4.35]) for (const s of [-0.55, 0.55]) shadow(x + s, 1.15, 0.5, 0.22, 0.5);
  shadow(-0.5, -0.1, 6.5, 0.35, 0.45);            // apron edge
  // grit
  for (let i = 0; i < 26000; i++) {
    const a = rnd();
    g.fillStyle = a > 0.5 ? `rgba(255,255,255,${0.02 + rnd() * 0.05})` : `rgba(0,0,10,${0.05 + rnd() * 0.1})`;
    const s = 1 + rnd() * 2.2; g.fillRect(rnd() * TS, rnd() * TS, s, s);
  }
}

function paintPuddles(g, w) {
  g.fillStyle = '#000'; g.fillRect(0, 0, w, w);
  const k = w / 22;
  const P = (x, z, rx, rz, a = 1) => {
    g.save(); g.translate((x + 11) * k, (z + 11) * k); g.scale(rx * k, rz * k);
    const gr = g.createRadialGradient(0, 0, 0.15, 0, 0, 1); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 7); g.fill(); g.restore();
  };
  P(-0.4, 3.4, 2.6, 1.5); P(3.6, 4.4, 1.7, 1.1, 0.9); P(-4.6, 2.6, 1.8, 1.1, 0.8); P(-6, 7.9, 2.6, 1.3); P(1.6, 8.9, 3.0, 1.1);
  P(8.3, 7.6, 1.9, 2.0); P(8.2, 2.9, 1.5, 1.6, 0.9); P(8.6, -4.6, 1.2, 2.4, 0.9); P(-7.4, -0.4, 0.8, 1.6, 0.9); P(-9, 2.6, 1.3, 1.0, 0.8);
  P(-2, 6.25, 6, 0.45, 0.9); P(6.72, -3, 0.45, 6, 0.9); P(5.2, 1.4, 0.9, 1.3, 0.7); P(-7.4, -6.5, 0.7, 2.2, 0.8);
}

const groundShader = {
  uniforms: {
    color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null },
    tMap: { value: null }, tPuddle: { value: null }, time: { value: 0 },
    lA: { value: null }, lB: { value: null }, lN: { value: null }, lC: { value: null }, lR: { value: null },
  },
  vertexShader: /* glsl */`
    uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
    void main(){ vUv = textureMatrix * vec4(position, 1.0); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: /* glsl */`
    #define NL ${NL}
    uniform vec3 color; uniform sampler2D tDiffuse; uniform sampler2D tMap; uniform sampler2D tPuddle; uniform float time;
    uniform vec2 lA[NL]; uniform vec2 lB[NL]; uniform vec2 lN[NL]; uniform vec3 lC[NL]; uniform float lR[NL];
    varying vec4 vUv; varying vec3 vW;
    float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
    float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ return vnoise(p)*0.55 + vnoise(p*2.13+7.1)*0.3 + vnoise(p*4.7+3.3)*0.15; }
    vec3 ripples(vec2 p, float t){
      vec3 acc = vec3(0.0);
      for(int i=0;i<3;i++){
        float fi = float(i);
        vec2 g = p*(1.3+fi*0.6) + fi*vec2(13.7,5.3);
        vec2 id = floor(g), f = fract(g)-0.5;
        float h = h21(id+fi*9.1);
        float tt = fract(t*(0.5+h*0.5) + h*11.0);
        vec2 c = (vec2(h21(id+1.7), h21(id+4.3))-0.5)*0.36;
        vec2 d = f-c; float r = length(d);
        float R = 0.03 + tt*0.3, fade = (1.0-tt)*(1.0-tt)*smoothstep(0.0, 0.12, tt);
        float ring = smoothstep(0.03, 0.0, abs(r-R))*fade;
        ring += smoothstep(0.028, 0.0, abs(r-R*0.55))*fade*0.5*step(0.25, tt);
        acc.xy += d/(r+1e-3)*ring; acc.z += ring;
      }
      return acc;
    }
    void main(){
      vec2 guv = (vW.xz+11.0)/22.0;
      vec3 alb = texture2D(tMap, guv).rgb;
      float pm = texture2D(tPuddle, guv).r;
      float n = fbm(vW.xz*0.6+3.0);
      float puddle = smoothstep(0.45, 0.62, pm*0.75 + n*0.5);
      vec3 rp = ripples(vW.xz, time);
      vec3 lit = vec3(0.10, 0.135, 0.26);
      for(int i=0;i<NL;i++){
        vec2 ab = lB[i]-lA[i]; vec2 ap = vW.xz-lA[i];
        float tt = clamp(dot(ap,ab)/max(dot(ab,ab),1e-4), 0.0, 1.0);
        vec2 dv = ap-ab*tt; float d = length(dv);
        float a = clamp(1.0-d/lR[i], 0.0, 1.0); a *= a;
        if(dot(lN[i],lN[i]) > 0.25) a *= smoothstep(-0.1, 0.45, dot(dv/(d+1e-3), lN[i]));
        a = a*0.5 + smoothstep(0.08, 0.1, a)*0.16 + smoothstep(0.34, 0.37, a)*0.34;
        lit += lC[i]*a;
      }
      vec3 base = alb*lit; base = base/(1.0+base*0.9);
      vec3 V = normalize(cameraPosition - vW);
      float fres = pow(1.0-clamp(V.y, 0.0, 1.0), 2.2);
      float micro = vnoise(vW.xz*8.0)-0.5;
      vec2 off = rp.xy*0.03*(0.3+puddle) + vec2(micro, 0.0)*0.007*(1.0-puddle);
      float spread = mix(0.02, 0.0, puddle);
      vec3 refl = vec3(0.0); float ws = 0.0;
      for(int i=-3;i<=3;i++){
        float fi = float(i); float w = 1.0-abs(fi)*0.22;
        vec4 uv = vUv; uv.xy += (off + vec2(0.0, fi*spread*(1.0+micro*0.8)))*uv.w;
        refl += texture2DProj(tDiffuse, uv).rgb*w; ws += w;
      }
      refl /= ws;
      float paintK = smoothstep(0.2, 0.55, dot(alb, vec3(0.333)));
      float k = mix(0.4, 0.95, puddle)*mix(0.5, 1.0, fres)*(1.0-0.4*paintK*(1.0-puddle));
      vec3 col = base*(1.0-0.5*puddle) + refl*k;
      col += vec3(0.6,0.72,1.0)*rp.z*(0.05+0.07*puddle)*(0.3+lit.g);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function buildGround(pixelRatio) {
  // collector's base
  box(scene, 22, 0.2, 22, 0, -0.22, 0, toon(0x565a70, 0.25));
  box(scene, 22, 0.85, 22, 0, -1.07, 0, toon(0x2c2f45, 0.35));
  box(scene, 22.7, 0.3, 22.7, 0, -1.37, 0, toon(0x191b2b, 0.4));
  const plaque = ctex(768, 96, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9b877'); gr.addColorStop(1, '#a8823f');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = '#6b4f1f'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
    txt(g, '雨夜のコンビニ角   RAINY NIGHT KONBINI  ·  1:64', w / 2, h / 2 + 2, 30, '#3d2c0e', 800);
  });
  quad(scene, 4.4, 0.55, 0, -0.66, 11.005, toonTex(plaque, 0.75));

  const map = ctex(TS, TS, paint); map.flipY = false; map.anisotropy = 16;
  const pud = ctex(512, 512, (g, w) => paintPuddles(g, w)); pud.flipY = false; pud.colorSpace = THREE.NoColorSpace;
  const ref = new Reflector(new THREE.PlaneGeometry(22, 22), {
    shader: groundShader, clipBias: 0.003,
    textureWidth: Math.min(2048, Math.max(64, Math.round(innerWidth * pixelRatio * 0.75))),
    textureHeight: Math.min(2048, Math.max(64, Math.round(innerHeight * pixelRatio * 0.75))),
  });
  const u = ref.material.uniforms;
  u.tMap.value = map; u.tPuddle.value = pud; u.time = uTime;
  u.lA.value = lA; u.lB.value = lB; u.lN.value = lN; u.lC.value = lC; u.lR.value = lR;
  ref.rotation.x = -Math.PI / 2; ref.layers.set(L_FX);
  scene.add(ref);
  return ref;
}

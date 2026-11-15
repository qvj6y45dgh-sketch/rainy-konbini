import { THREE, scene, L_FX, fx, onTick, ctex, rnd, rr } from './core.js';

export const uTime = { value: 0 };

// ---------- window glass with rain running down it ----------
const glassVert = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const glassFrag = /* glsl */`
uniform float time; uniform vec2 size; uniform float seed;
varying vec2 vUv;
float h11(float n){ return fract(sin(n*127.1)*43758.5453); }
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){
  vec2 p = vUv*size + seed*13.7;
  float acc = 0.0, head = 0.0;
  for(int L=0; L<2; L++){
    float fl = float(L);
    float colW = mix(0.075, 0.045, fl);
    float cx = p.x/colW + fl*17.3; float id = floor(cx); float fx = fract(cx)-0.5;
    float r1 = h11(id+fl*3.1), r2 = h11(id*1.7+9.2);
    float per = 1.5 + 2.2*r1;
    float spd = 0.14 + 0.42*r2;
    float y = p.y + time*spd + r1*31.0;
    float cell = floor(y/per); float fy = fract(y/per)*per;
    float rr = h21(vec2(id, cell)+fl*5.0);
    if(rr > 0.45){
      float wob = sin(p.y*24.0 + rr*40.0)*0.1;
      float dx = (fx - (rr-0.72)*1.1 - wob)*colW;
      float dy = fy - 0.12;
      float hd = smoothstep(0.012, 0.006, length(vec2(dx, dy*0.65)));
      float trail = smoothstep(0.005, 0.0015, abs(dx)) * step(0.0, dy) * smoothstep(per*0.7, 0.0, dy);
      acc += max(hd, trail*0.55); head += hd;
    }
  }
  vec2 g = p*34.0; vec2 gi = floor(g); vec2 gf = fract(g)-0.5; float br = h21(gi);
  float bead = step(0.8, br) * smoothstep(0.3, 0.1, length(gf - (vec2(h21(gi+3.1), h21(gi+7.7))-0.5)*0.5));
  bead *= 0.55 + 0.45*sin(time*0.6 + br*30.0);
  float d = vUv.x*size.x*0.55 + vUv.y*size.y;
  float ph = fract(d*0.21 + seed);
  float gloss = smoothstep(0.07, 0.0, abs(ph-0.3))*0.55 + smoothstep(0.02, 0.0, abs(ph-0.43))*0.4;
  vec3 col = vec3(0.78, 0.9, 1.0) * (0.6 + acc*0.8 + head*1.0 + bead*0.5);
  float a = 0.05 + acc*0.8 + bead*0.42 + gloss*0.11;
  gl_FragColor = vec4(col, a);
}`;
const PLANE = new THREE.PlaneGeometry(1, 1);
export function rainGlass(parent, w, h, x, y, z, ry = 0) {
  const m = new THREE.ShaderMaterial({
    uniforms: { time: uTime, size: { value: new THREE.Vector2(w, h) }, seed: { value: rnd() } },
    vertexShader: glassVert, fragmentShader: glassFrag,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const o = new THREE.Mesh(PLANE, m);
  o.scale.set(w, h, 1); o.position.set(x, y, z); o.rotation.y = ry; o.layers.set(L_FX); parent.add(o);
  return o;
}
const plainGlass = new THREE.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide });
export function simpleGlass(parent, w, h, x, y, z, ry = 0, rx = 0) {
  const o = new THREE.Mesh(PLANE, plainGlass);
  o.scale.set(w, h, 1); o.position.set(x, y, z); o.rotation.set(rx, ry, 0, 'YXZ'); o.layers.set(L_FX); parent.add(o);
  return o;
}

// ---------- soft glows ----------
const haloTex = ctex(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
export function halo(x, y, z, size, color, opacity = 0.5) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color, opacity, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.position.set(x, y, z); s.scale.set(size, size, 1); s.layers.set(L_FX); scene.add(s);
  return s;
}
// light cone hanging in the rainy air under a lamp
export function lightCone(x, yTop, z, r, h, color, strength = 0.2) {
  const m = new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(color) }, k: { value: strength } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 col; uniform float k; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ float rim = pow(abs(dot(normalize(vN), normalize(vV))), 1.6); float a = pow(max(vUv.y, 0.0), 1.7) * rim * k; gl_FragColor = vec4(col*a, a); }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, 28, 1, true), m);
  o.position.set(x, yTop - h / 2, z); o.layers.set(L_FX); scene.add(o);
  return o;
}

// ---------- falling rain ----------
// areas where rain is stopped by a roof: [x0, z0, x1, z1, height]
const SHELTER = [
  [-6.65, -9.65, 4.65, -1.4, 4.45],   // store roof
  [-4.7, -1.5, 5.5, -0.1, 2.92],      // front canopy
  [4.5, -5.2, 5.5, -1.5, 2.92],       // side canopy
  [-11, -11, -8.1, 1.1, 6.6],         // neighbour house
];
export function buildRain(count = 2600) {
  const base = new THREE.PlaneGeometry(1, 1);
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index; g.setAttribute('position', base.attributes.position); g.setAttribute('uv', base.attributes.uv);
  const a = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) { a[i * 4] = rr(-11, 13.5); a[i * 4 + 1] = rr(-12, 11); a[i * 4 + 2] = rnd(); a[i * 4 + 3] = rnd(); }
  g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(a, 4));
  g.instanceCount = count;
  const shelter = SHELTER.map((s) => new THREE.Vector4(s[0], s[1], s[2], s[3]));
  const m = new THREE.ShaderMaterial({
    uniforms: { time: uTime, sh: { value: shelter }, shH: { value: SHELTER.map((s) => s[4]) } },
    vertexShader: /* glsl */`
      attribute vec4 aSeed; uniform float time; uniform vec4 sh[4]; uniform float shH[4];
      varying float vA; varying vec3 vC; varying vec2 vUv;
      void main(){
        vUv = uv;
        const float H = 17.0;
        float spd = 12.0 + aSeed.w*7.0;
        float fall = mod(aSeed.z*H + time*spd, H);
        float y = H - fall;
        vec3 dir = normalize(vec3(-0.16, -1.0, 0.07));
        vec3 c = vec3(aSeed.x + dir.x/(-dir.y)*fall, y, aSeed.y + dir.z/(-dir.y)*fall);
        float len = 0.45 + 0.55*aSeed.w;
        vec3 view = normalize(cameraPosition - c);
        vec3 side = normalize(cross(dir, view) + vec3(1e-5, 0.0, 0.0));
        vec3 p = c + dir*len*(position.y) + side*0.02*position.x;
        float a = 0.2 + 0.25*aSeed.w;
        if(abs(c.x) > 11.0 || abs(c.z) > 11.0) a = 0.0;
        for(int i=0;i<4;i++){ if(c.x > sh[i].x && c.x < sh[i].z && c.z > sh[i].y && c.z < sh[i].w && c.y < shH[i]) a = 0.0; }
        a *= smoothstep(0.0, 0.6, c.y) * smoothstep(H, H-3.0, c.y);
        vec3 d1 = c - vec3(-0.5, 1.6, 1.2);
        float warm = exp(-dot(d1,d1)/26.0);
        vec3 d2 = c - vec3(-4.5, 4.0, 9.3);
        float cool = exp(-dot(d2.xz,d2.xz)/5.0) * step(c.y, 5.9);
        vC = mix(vec3(0.62,0.74,1.0), vec3(1.0,0.86,0.62), warm) * (1.0 + warm*1.2 + cool*1.6);
        vA = a * (1.0 + warm*0.9 + cool*1.2);
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying float vA; varying vec3 vC; varying vec2 vUv;
      void main(){ float s = 1.0 - abs(vUv.x-0.5)*2.0; float e = smoothstep(0.0,0.25,vUv.y)*smoothstep(1.0,0.6,vUv.y); gl_FragColor = vec4(vC, vA*s*e); }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false; mesh.layers.set(L_FX); mesh.renderOrder = 5; scene.add(mesh);
}

// ---------- drips from the eaves ----------
const drips = [];
const dripGeo = new THREE.SphereGeometry(0.02, 8, 6);
const dripMat = new THREE.MeshBasicMaterial({ color: 0xd8ebff, transparent: true, opacity: 0.85, depthWrite: false });
const ringGeo = new THREE.RingGeometry(0.82, 1, 24);
export function addDrip(x, y, z, ground = 0.004) {
  const d = new THREE.Mesh(dripGeo, dripMat); d.layers.set(L_FX); scene.add(d);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xcfe2ff, transparent: true, opacity: 0, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(x, ground + 0.006, z); ring.layers.set(L_FX); scene.add(ring);
  drips.push({ d, ring, x, y, z, ground, per: rr(1.0, 2.6), ph: rnd() * 3 });
}
onTick((t) => {
  for (const o of drips) {
    const c = (t + o.ph) % o.per;
    const hang = o.per * 0.4, fallT = Math.sqrt(2 * (o.y - o.ground) / 9.8);
    if (c < hang) {
      const s = 0.3 + 0.9 * (c / hang);
      o.d.visible = true; o.d.scale.set(s, s * 1.2, s); o.d.position.set(o.x, o.y - 0.012 * s, o.z);
    } else if (c < hang + fallT) {
      const tt = c - hang;
      o.d.visible = true; o.d.scale.set(0.8, 2.6, 0.8); o.d.position.set(o.x, o.y - 0.5 * 9.8 * tt * tt, o.z);
    } else o.d.visible = false;
    const k = (c - hang - fallT) / 0.45;
    if (k > 0 && k < 1) { const r = 0.03 + k * 0.2; o.ring.scale.set(r, r, 1); o.ring.material.opacity = 0.55 * (1 - k); }
    else o.ring.material.opacity = 0;
  }
});

// ---------- steam (oden pot) ----------
export function steam(x, y, z, n = 6) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xfff6e8, opacity: 0, transparent: true, depthWrite: false }));
    s.layers.set(L_FX); scene.add(s); list.push({ s, ph: i / n, ox: rr(-0.14, 0.14), oz: rr(-0.08, 0.08) });
  }
  onTick((t) => {
    for (const o of list) {
      const k = (t * 0.28 + o.ph) % 1;
      o.s.position.set(x + o.ox + Math.sin(t * 0.9 + o.ph * 9) * 0.05 * k, y + k * 0.75, z + o.oz);
      const sc = 0.14 + k * 0.36; o.s.scale.set(sc, sc, 1);
      o.s.material.opacity = 0.34 * Math.sin(k * Math.PI);
    }
  });
}
export { fx };

import { THREE, scene, L_FX, runTicks, buildProds, ctex } from './core.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { buildGround } from './ground.js';
import { buildStore } from './store.js';
import { buildStreet } from './street.js';
import { buildRain, uTime } from './fx.js';

const PR = Math.min(window.devicePixelRatio || 1, 2);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(PR);
renderer.setSize(Math.max(2, innerWidth), Math.max(2, innerHeight));
renderer.toneMapping = THREE.NoToneMapping;
document.body.appendChild(renderer.domElement);

scene.background = ctex(16, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#04050d'); gr.addColorStop(0.55, '#0b0f26'); gr.addColorStop(1, '#1a1f45');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});

// ---------- camera ----------
const W = () => Math.max(2, innerWidth), Hh = () => Math.max(2, innerHeight);
const camera = new THREE.PerspectiveCamera(27, W() / Hh(), 2, 400);
const target = new THREE.Vector3(-0.3, 1.9, 0.6);
{
  const az = THREE.MathUtils.degToRad(36), pol = THREE.MathUtils.degToRad(64), d = Math.max(47, 70 / camera.aspect);
  camera.position.set(target.x + d * Math.sin(az) * Math.sin(pol), target.y + d * Math.cos(pol), target.z + d * Math.cos(az) * Math.sin(pol));
}
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(target);
controls.enableDamping = true; controls.dampingFactor = 0.07;
controls.minDistance = 9; controls.maxDistance = 130;
controls.minPolarAngle = 0.12; controls.maxPolarAngle = 1.535;
controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.9; controls.panSpeed = 0.8;
controls.addEventListener('change', () => { const t = controls.target; t.x = THREE.MathUtils.clamp(t.x, -11, 11); t.z = THREE.MathUtils.clamp(t.z, -11, 11); t.y = THREE.MathUtils.clamp(t.y, 0, 8); });
controls.update();

// ---------- lights ----------
scene.add(new THREE.HemisphereLight(0x7088d8, 0x1c1a36, 1.0));
const moon = new THREE.DirectionalLight(0x8ea4ff, 0.8); moon.position.set(-9, 14, 7); scene.add(moon);

// ---------- world ----------
const ground = buildGround(PR);
buildStore();
buildStreet();
buildProds();
buildRain();

// ---------- toon outline: normal + depth edge detection ----------
const normalRT = new THREE.WebGLRenderTarget(Math.max(2, innerWidth) * PR, Math.max(2, innerHeight) * PR, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
normalRT.depthTexture = new THREE.DepthTexture(Math.max(2, innerWidth) * PR, Math.max(2, innerHeight) * PR);
const normalMat = new THREE.MeshNormalMaterial();
const NORMAL_CLEAR = new THREE.Color(0.5, 0.5, 1);

const outlineShader = {
  uniforms: {
    tDiffuse: { value: null }, tNormal: { value: null }, tDepth: { value: null },
    texel: { value: new THREE.Vector2() }, near: { value: camera.near }, far: { value: camera.far }, thick: { value: 1 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform sampler2D tNormal; uniform sampler2D tDepth;
    uniform vec2 texel; uniform float near; uniform float far; uniform float thick;
    varying vec2 vUv;
    float iz(vec2 uv){ float d = texture2D(tDepth, uv).x; return (far-(far-near)*d)/(near*far); }
    vec3 nn(vec2 uv){ return texture2D(tNormal, uv).xyz*2.0-1.0; }
    void main(){
      vec4 col = texture2D(tDiffuse, vUv);
      if(!(col.r >= 0.0 && col.g >= 0.0 && col.b >= 0.0)) col.rgb = vec3(0.0);
      col.rgb = min(col.rgb, vec3(24.0));
      vec2 o = texel*thick;
      float c = iz(vUv);
      float s = iz(vUv+vec2(o.x,0.0)) + iz(vUv-vec2(o.x,0.0)) + iz(vUv+vec2(0.0,o.y)) + iz(vUv-vec2(0.0,o.y));
      float de = abs(s-4.0*c)/(c*c);
      vec3 n = nn(vUv);
      float nd = 4.0 - dot(n, nn(vUv+vec2(o.x,0.0))) - dot(n, nn(vUv-vec2(o.x,0.0))) - dot(n, nn(vUv+vec2(0.0,o.y))) - dot(n, nn(vUv-vec2(0.0,o.y)));
      float e = max(smoothstep(0.035, 0.12, de), smoothstep(0.4, 1.0, nd));
      vec3 ink = vec3(0.03, 0.035, 0.1);
      col.rgb = mix(col.rgb, col.rgb*0.16 + ink, e*0.9);
      gl_FragColor = col;
    }`,
};

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(Math.max(2, innerWidth) * PR, Math.max(2, innerHeight) * PR, { type: THREE.HalfFloatType, samples: 4 }));
composer.addPass(new RenderPass(scene, camera));
const outlinePass = new ShaderPass(outlineShader);
outlinePass.uniforms.tNormal.value = normalRT.texture;
outlinePass.uniforms.tDepth.value = normalRT.depthTexture;
composer.addPass(outlinePass);
const bloom = new UnrealBloomPass(new THREE.Vector2(Math.max(2, innerWidth), Math.max(2, innerHeight)), 0.34, 0.7, 1.0);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const fxaa = new ShaderPass(FXAAShader);
composer.addPass(fxaa);

function resize() {
  const w = W(), h = Hh();
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h); composer.setSize(w, h);
  normalRT.setSize(w * PR, h * PR);
  outlinePass.uniforms.texel.value.set(1 / (w * PR), 1 / (h * PR));
  outlinePass.uniforms.thick.value = Math.max(1, PR * 0.62);
  fxaa.material.uniforms.resolution.value.set(1 / (w * PR), 1 / (h * PR));
  ground.getRenderTarget().setSize(Math.min(2048, Math.round(w * PR * 0.75)), Math.min(2048, Math.round(h * PR * 0.75)));
}
addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  draw(t, dt);
}
function draw(t, dt) {
  uTime.value = t;
  runTicks(t, dt);
  controls.update();

  // pass 1: normals + depth of the solid world (layer 0)
  camera.layers.set(0);
  const bg = scene.background; scene.background = null; scene.overrideMaterial = normalMat;
  renderer.setRenderTarget(normalRT); renderer.setClearColor(NORMAL_CLEAR, 1); renderer.clear();
  renderer.render(scene, camera);
  scene.overrideMaterial = null; scene.background = bg; renderer.setRenderTarget(null);

  // pass 2: colour + reflections + outlines + bloom
  camera.layers.enable(L_FX);
  composer.render();
}
frame();


import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const host=document.getElementById('viewer');
const size=()=>[host.clientWidth, host.clientHeight];

// Coordenadas em metros: x = ao longo da parede de fundo (0 = canto esquerdo),
// z = profundidade a partir da parede de fundo, y = altura.
const W = 4.00, D = 4.20, H = 2.50;

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(...size());
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdfe7ec);

const camera = new THREE.PerspectiveCamera(50, size()[0]/size()[1], 0.05, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ---------- materiais ----------
// textura de madeira gerada (veio vertical), sem ficheiros externos
function veio(base){
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const g = c.getContext('2d'); const col = new THREE.Color(base);
  g.fillStyle = '#' + col.getHexString(); g.fillRect(0,0,256,512);
  for (let i=0;i<140;i++){
    const x = Math.random()*256, w = 0.5+Math.random()*2.5, a = 0.04+Math.random()*0.12;
    const light = Math.random() < 0.45;
    g.strokeStyle = light ? `rgba(255,220,180,${a})` : `rgba(20,8,0,${a})`; g.lineWidth = w;
    g.beginPath(); let xx = x; g.moveTo(xx,0);
    for (let y=0;y<=512;y+=16){ xx += (Math.random()-0.5)*2.2; g.lineTo(xx,y); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const M = {
  wall:   new THREE.MeshStandardMaterial({ color:0xefe9df, roughness:.95 }),
  floor:  new THREE.MeshStandardMaterial({ color:0xd8cbb4, roughness:.8 }),
  front:  new THREE.MeshStandardMaterial({ map:veio(0xa0583a), roughness:.5 }),       // cerejeira (todos os móveis)
  carcass:new THREE.MeshStandardMaterial({ map:veio(0x8c4a2f), roughness:.6 }),
  upperF: new THREE.MeshStandardMaterial({ map:veio(0xa0583a), roughness:.5 }),
  upperC: new THREE.MeshStandardMaterial({ map:veio(0x8c4a2f), roughness:.6 }),
  plinth: new THREE.MeshStandardMaterial({ color:0x1e1b19, roughness:.8 }),
  counter:new THREE.MeshStandardMaterial({ color:0xd8d3cb, roughness:.4 }),
  black:  new THREE.MeshStandardMaterial({ color:0x111111, roughness:.15, metalness:.3 }),
  steel:  new THREE.MeshStandardMaterial({ color:0xb8bcc0, roughness:.35, metalness:.25 }),
  frame:  new THREE.MeshStandardMaterial({ color:0xfafafa, roughness:.5 }),
  glass:  new THREE.MeshStandardMaterial({ color:0xcfe6f5, roughness:.05, transparent:true, opacity:.35 }),
  wood:   new THREE.MeshStandardMaterial({ color:0xb8895a, roughness:.55 }),
  chair:  new THREE.MeshStandardMaterial({ color:0xd8cfc2, roughness:.9 }),
  handle: new THREE.MeshStandardMaterial({ color:0x2a2a2a, roughness:.4, metalness:.6 }),
  dark:   new THREE.MeshStandardMaterial({ color:0x6b625a, roughness:.9 }),
  led:    new THREE.MeshBasicMaterial({ color:0xffe2b0 }),
};

function box(x0,x1,y0,y1,z0,z1,mat,parent=scene){
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0), mat);
  m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
  m.castShadow = m.receiveShadow = true;
  parent.add(m); return m;
}
const G = 0.003; // folga entre frentes

// ---------- chão e paredes ----------
box(-0.15, W+0.15, -0.02, 0, -0.15, D, M.floor);
// parede de fundo, janela 130..288, altura 100..210
box(-0.15, 1.30, 0, H, -0.15, 0, M.wall);
box(2.88, W+0.15, 0, H, -0.15, 0, M.wall);
box(1.30, 2.88, 0, 1.00, -0.15, 0, M.wall);
box(1.30, 2.88, 2.10, H, -0.15, 0, M.wall);
// parede esquerda: janela 36..180, despenseiro 180..260, porta 260..345
box(-0.15, 0, 0, H, 0, 0.36, M.wall);
box(-0.15, 0, 0, 1.00, 0.36, 1.80, M.wall);
box(-0.15, 0, 2.10, H, 0.36, 1.80, M.wall);
box(-0.15, 0, 0, H, 1.80, 2.60, M.wall);
box(-0.15, 0, 2.10, H, 2.60, 3.45, M.wall);
box(-0.15, 0, 0, H, 3.45, D, M.wall);
// parede direita: porta despensa 270..350
box(W, W+0.15, 0, H, 0, 2.70, M.wall);
box(W, W+0.15, 2.10, H, 2.70, 3.50, M.wall);
box(W, W+0.15, 0, H, 3.50, D, M.wall);

// janelas
function janelaFundo(){
  box(1.30,2.88,1.00,1.03,-0.15,0.02,M.frame); // peitoril
  box(1.30,2.88,1.00,2.10,-0.08,-0.07,M.glass);
  for (const x of [1.30,2.06,2.88-0.04]) box(x,x+0.04,1.00,2.10,-0.09,-0.05,M.frame);
  box(1.30,2.88,1.00,1.04,-0.09,-0.05,M.frame); box(1.30,2.88,2.06,2.10,-0.09,-0.05,M.frame);
}
function janelaEsq(){
  box(-0.15,0.02,1.00,1.03,0.36,1.80,M.frame);
  box(-0.08,-0.07,1.00,2.10,0.36,1.80,M.glass);
  for (const z of [0.36,1.06,1.80-0.04]) box(-0.09,-0.05,1.00,2.10,z,z+0.04,M.frame);
  box(-0.09,-0.05,1.00,1.04,0.36,1.80,M.frame); box(-0.09,-0.05,2.06,2.10,0.36,1.80,M.frame);
}
janelaFundo(); janelaEsq();

// porta da rua (branca com 4 vidros)
box(-0.06,-0.02,0,2.10,2.60,3.45,M.frame);
for (let i=0;i<4;i++){ const y=0.35+i*0.42; box(-0.015,-0.01,y,y+0.28,2.95,3.12,M.glass); }
box(-0.01,0.03,1.0,1.03,3.32,3.42,M.handle);

// despensa (atrás da porta direita) com frigorífico
box(W+0.15,W+0.95,-0.02,0,2.60,3.60,M.dark);
box(W+0.15,W+0.95,0,H,3.60,3.62,M.wall);
box(W+0.15,W+0.95,0,H,2.58,2.60,M.wall);
box(W+0.95,W+0.97,0,H,2.60,3.60,M.wall);
box(W+0.25,W+0.90,0,1.80,2.80,3.45,M.steel);

// ---------- azulejo (backsplash): branco 7,5 x 15 cm, junta desencontrada ----------
const azTex = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; // = 30 x 15 cm
  const g = c.getContext('2d');
  g.fillStyle = '#d9d6d0'; g.fillRect(0,0,256,128);                     // junta
  const tile = (x,y) => { const gr = g.createLinearGradient(x,y,x,y+60);
    gr.addColorStop(0,'#fbfbf9'); gr.addColorStop(1,'#efeeea'); g.fillStyle = gr; g.fillRect(x+2,y+2,124,60); };
  tile(0,0); tile(128,0); tile(-64,64); tile(64,64); tile(192,64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
})();
function azulejo(face, a0, a1, y0, y1){
  const w = a1 - a0, h = y1 - y0, t = azTex.clone(); t.needsUpdate = true;
  t.repeat.set(w / 0.30, h / 0.15);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map:t, roughness:.25 }));
  if (face === 'fundo') m.position.set((a0+a1)/2, (y0+y1)/2, 0.003);
  if (face === 'esq')  { m.position.set(0.003, (y0+y1)/2, (a0+a1)/2); m.rotation.y =  Math.PI/2; }
  if (face === 'dir')  { m.position.set(W-0.003, (y0+y1)/2, (a0+a1)/2); m.rotation.y = -Math.PI/2; }
  m.receiveShadow = true; scene.add(m);
}
// fundo: até aos módulos de cima; debaixo da janela só até ao peitoril
azulejo('fundo', 0, 1.30, 0.90, 1.45); azulejo('fundo', 1.30, 2.88, 0.90, 1.00); azulejo('fundo', 2.88, W, 0.90, 1.45);
// direita: atrás do exaustor sobe até 1,60
azulejo('dir', 0, 0.75, 0.90, 1.45); azulejo('dir', 0.75, 1.65, 0.90, 1.60); azulejo('dir', 1.65, 2.10, 0.90, 1.45);
// esquerda: canto até 1,45 e debaixo da janela até ao peitoril
azulejo('esq', 0, 0.36, 0.90, 1.45); azulejo('esq', 0.36, 1.80, 0.90, 1.00);

// ---------- módulos de baixo (0,86 caixa + 4 cm bancada = 90) ----------
const PL=0.10, TOP=0.86, CT=0.04;
function baseRun(x0,x1,z0,z1){
  box(x0,x1,PL,TOP,z0,z1,M.carcass);
}
baseRun(0,W,0,0.60);             // fundo
// esquerda (debaixo da janela): espaços livres para as máquinas
baseRun(W-0.60,W,0.60,2.10);     // direita
// rodapés recuados
box(0,W,0,PL,0,0.55,M.plinth);box(W-0.55,W,0,PL,0.55,2.10,M.plinth);
// bancadas (com aba de 2 cm)
box(0,W,TOP,TOP+CT,0,0.62,M.counter);
box(0,0.62,TOP,TOP+CT,0.62,1.80,M.counter);
box(W-0.62,W,TOP,TOP+CT,0.62,2.10,M.counter);

// frentes: face +z (fundo), +x (esquerda), -x (direita)
let FM = M.front; // material das frentes: nogueira em baixo/colunas, branco em cima
function frontZ(x0,x1,y0,y1,z){ return box(x0+G,x1-G,y0+G,y1-G,z,z+0.02,FM); }
function frontX(z0,z1,y0,y1,x,dir){ return dir>0 ? box(x,x+0.02,y0+G,y1-G,z0+G,z1-G,FM) : box(x-0.02,x,y0+G,y1-G,z0+G,z1-G,FM); }
function gavetas(fn,a,b,...rest){ const h=(TOP-PL)/3; for(let i=0;i<3;i++) fn(a,b,PL+i*h,PL+(i+1)*h,...rest); }
// fundo (de 60 a 340 cm; os cantos ficam escondidos)
// = alçado da parede de fundo: 60|130|209|288|340 (60-130 e 288-340 = portas de canto)
frontZ(0.60,1.30,PL,TOP,0.60);
frontZ(1.30,2.09,PL,TOP,0.60); frontZ(2.09,2.88,PL,TOP,0.60);
frontZ(2.88,3.40,PL,TOP,0.60);
// esquerda
// máquina lavar loiça (60..120) e máquina lavar roupa (120..180)
const white = new THREE.MeshStandardMaterial({ color:0xf4f4f2, roughness:.4 });
box(0.02,0.58,0,0.85,0.61,1.19,white);
box(0.58,0.60,0.12,0.84,0.62,1.18,M.steel);
box(0.58,0.60,0.74,0.84,0.62,1.18,M.black);
box(0.02,0.58,0,0.85,1.21,1.79,white);
const porta = new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.03,40), M.black);
porta.rotation.z = Math.PI/2; porta.position.set(0.595,0.42,1.50); scene.add(porta);
const aro = new THREE.Mesh(new THREE.TorusGeometry(0.17,0.02,12,40), M.steel);
aro.rotation.y = Math.PI/2; aro.position.set(0.605,0.42,1.50); scene.add(aro);
box(0.58,0.60,0.74,0.84,1.22,1.78,M.steel);
// direita
// = alçado da parede direita: tampo 60-80, 2 gavetas grandes 80-160 (placa 75), porta 160-210
frontX(0.60,0.80,PL,TOP,W-0.60,-1);
frontX(0.80,1.60,PL,0.48,W-0.60,-1); frontX(0.80,1.60,0.48,TOP,W-0.60,-1);
frontX(1.60,2.10,PL,TOP,W-0.60,-1);

// ---------- colunas altas (do chão a 2,40) ----------
// despenseiro esquerdo 180..260
// despenseiro: 76 cm (180..256), 4 cm livres até ao aro da porta
box(0,0.60,0,2.40,1.80,2.56,M.carcass);
box(0,0.55,0,PL,1.80,2.56,M.plinth);
for (const [z0,z1] of [[1.80,2.18],[2.18,2.56]]) { frontX(z0,z1,PL,1.40,0.60,1); frontX(z0,z1,1.40,2.40,0.60,1); }
box(0.62,0.64,0.95,1.65,2.17,2.19,M.handle);
// coluna forno + micro 210..270
box(W-0.60,W,0,2.40,2.10,2.70,M.carcass);
box(W-0.55,W,0,PL,2.10,2.70,M.plinth);
for (let i=0;i<4;i++){ const h=(0.85-PL)/4; frontX(2.10,2.70,PL+i*h,PL+(i+1)*h,W-0.60,-1); } // 4 gavetas pequenas
box(W-0.62,W-0.60,0.85,1.45,2.12,2.68,M.black);   // forno
box(W-0.63,W-0.62,1.36,1.38,2.16,2.64,M.steel);
frontX(2.10,2.70,1.45,1.50,W-0.60,-1);
box(W-0.62,W-0.60,1.50,1.88,2.12,2.68,M.black);   // micro-ondas
frontX(2.10,2.70,1.88,1.90,W-0.60,-1);
frontX(2.10,2.70,1.90,2.40,W-0.60,-1);

// ---------- módulos de cima 145..215, 35 cm ----------
const UY0=1.45, UY1=2.15;
FM = M.upperF;
box(0,1.30,UY0,UY1,0,0.35,M.upperC);
frontZ(0,0.65,UY0,UY1,0.35); frontZ(0.65,1.30,UY0,UY1,0.35);
box(2.88,W,UY0,UY1,0,0.35,M.upperC);
frontZ(2.88,3.44,UY0,UY1,0.35); frontZ(3.44,W,UY0,UY1,0.35);
// parede direita: 0-45 | 45-90 (o canto 0-35 é partilhado com o módulo do fundo)
box(W-0.35,W,UY0,UY1,0.35,0.75,M.upperC);
frontX(0.35,0.55,UY0,UY1,W-0.35,-1); frontX(0.55,0.75,UY0,UY1,W-0.35,-1);
// entre o exaustor e a coluna do forno: sem módulo de cima (não há espaço)
// LED debaixo dos módulos
box(0.02,1.28,UY0-0.006,UY0,0.28,0.31,M.led);
box(2.90,W-0.02,UY0-0.006,UY0,0.28,0.31,M.led);
for (const [x,z] of [[0.65,0.4],[3.4,0.4],[3.65,1.2]]) {
  const l = new THREE.PointLight(0xffd9a0, 0.6, 1.6); l.position.set(x,UY0-0.05,z); scene.add(l);
}

// ---------- equipamentos ----------
// lava-loiça (centro da janela: 209 cm)
box(1.69,2.49,TOP+CT,TOP+CT+0.004,0.08,0.52,M.steel);
box(1.73,2.07,TOP-0.12,TOP+CT+0.005,0.12,0.48,M.black).material = M.steel.clone();
box(2.11,2.45,TOP-0.12,TOP+CT+0.005,0.12,0.48,M.steel);
box(2.08,2.10,TOP+CT,TOP+CT+0.30,0.04,0.06,M.handle);
box(2.08,2.10,TOP+CT+0.28,TOP+CT+0.30,0.06,0.20,M.handle);
// placa 75 cm, 5 bicos (centro a 120 cm do canto)
box(W-0.56,W-0.04,TOP+CT,TOP+CT+0.006,0.825,1.575,M.black);
for (const [x,z,r] of [[W-0.43,0.96,0.05],[W-0.17,0.96,0.05],[W-0.30,1.20,0.075],[W-0.43,1.44,0.05],[W-0.17,1.44,0.05]]) {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(r,r,0.02,28), M.steel);
  b.position.set(x,TOP+CT+0.016,z); scene.add(b);
}
// exaustor inclinado + chaminé
// exaustor = alçado: campânula 75-165 (90 cm) a 160-175 cm, chaminé 105-135 até ao teto
box(W-0.50,W,1.60,1.75,0.75,1.65,M.steel);
box(W-0.30,W,1.75,H,1.05,1.35,M.steel);

// ---------- mesa e cadeiras ----------
const mesa = new THREE.Group(); scene.add(mesa);
box(1.40,2.60,0.72,0.76,2.40,3.20,M.wood,mesa);
for (const [x,z] of [[1.45,2.45],[2.55,2.45],[1.45,3.15],[2.55,3.15]]) box(x-0.03,x+0.03,0,0.72,z-0.03,z+0.03,M.wood,mesa);
function cadeira(cx,cz,dir){
  box(cx-0.22,cx+0.22,0.44,0.50,cz-0.22,cz+0.22,M.chair,mesa);
  for (const [dx,dz] of [[-0.19,-0.19],[0.19,-0.19],[-0.19,0.19],[0.19,0.19]]) box(cx+dx-0.015,cx+dx+0.015,0,0.44,cz+dz-0.015,cz+dz+0.015,M.wood,mesa);
  const bz = cz + dir*0.22; box(cx-0.22,cx+0.22,0.50,0.95,bz-0.03,bz+0.03,M.chair,mesa);
}
cadeira(1.70,2.25,-1); cadeira(2.30,2.25,-1); cadeira(1.70,3.35,1); cadeira(2.30,3.35,1);
// candeeiros suspensos
for (const x of [1.70,2.30]) {
  box(x-0.004,x+0.004,1.85,H,2.79,2.81,M.handle,mesa);
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.17,24,12,0,Math.PI*2,0,Math.PI/2), new THREE.MeshStandardMaterial({color:0xf2ede4, side:THREE.DoubleSide}));
  s.position.set(x,1.70,2.80); mesa.add(s);
  const pl = new THREE.PointLight(0xffd9a0, 1.2, 3); pl.position.set(x,1.62,2.80); mesa.add(pl);
}
document.getElementById('mesa').onchange = e => mesa.visible = e.target.checked;

// ---------- luz ----------
scene.add(new THREE.HemisphereLight(0xffffff, 0xcbbfae, 1.3));
const sun = new THREE.DirectionalLight(0xfff3e0, 1.6);
sun.position.set(2.5, 6, 5); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera, { left:-4, right:4, top:4, bottom:-4, near:1, far:15 });
scene.add(sun);
const amb = new THREE.AmbientLight(0xffffff, 0.35); scene.add(amb);

// ---------- vistas ----------
const T = new THREE.Vector3(2.0, 1.1, 1.0);
const views = {
  frente: [2.0, 1.75, 5.4],
  esq:    [3.6, 1.7, 3.9],
  dir:    [0.4, 1.7, 3.9],
  topo:   [2.0, 7.0, 2.2],
};
function setView(k){ camera.position.set(...views[k]); controls.target.copy(k==='topo' ? new THREE.Vector3(2,0,2.0) : T); controls.update(); }
document.querySelectorAll('#viewer-ui [data-v]').forEach(b => b.onclick = () => setView(b.dataset.v));
setView('frente');

new ResizeObserver(() => { const [w,h]=size(); camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); }).observe(host);
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });

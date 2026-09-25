import * as THREE from 'three';

const $ = id => document.getElementById(id);
let scene, camera, renderer, clock, player, body, visor, running = false, paused = false;
let lane = 0, distance = 0, coins = 0, life = 3, boss = 0, speed = 18;
let objects = [], jumpY = 0, verticalVelocity = 0, sliding = false, slideTimer = 0;
const screens = [...document.querySelectorAll('.screen')];
const show = id => screens.forEach(s => s.classList.toggle('active', s.id === id));
function card(title, icon, text, button = 'SELECIONAR') { return `<article class="card"><div style="font-size:36px">${icon}</div><h3>${title}</h3><p>${text}</p><button>${button}</button></article>`; }
$('heroGrid').innerHTML = card('Kael', '⚔️', 'Guardião veloz dos reinos.', 'EQUIPADO') + card('Luna', '🏹', 'Ataques precisos e salto aprimorado.') + card('Orion', '🛡️', 'Resiste a um impacto extra.');
$('upgradeGrid').innerHTML = card('Escudo', '🛡️', 'Protege contra obstáculos por alguns segundos.') + card('Ímã', '🧲', 'Atrai cristais próximos automaticamente.') + card('Impulso', '⚡', 'Aumenta a velocidade e a pontuação.');
$('missionGrid').innerHTML = card('Primeiros passos', '🏃', 'Alcance 250 metros.', 'RECOMPENSA 💎 50') + card('Caçador de cristais', '💎', 'Colete 25 cristais.', 'RECOMPENSA 💎 100');
document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => show(b.dataset.open));
document.querySelectorAll('.back').forEach(b => b.onclick = () => show('menu'));
document.querySelector('.home').onclick = () => show('menu');

function setupWorld() {
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x071525); scene.fog = new THREE.Fog(0x071525, 25, 125);
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 250); camera.position.set(0, 5.2, 9); camera.lookAt(0, 1, 0);
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; $('game3d').replaceChildren(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0x9dc8ff, 0x111522, 2)); const sun = new THREE.DirectionalLight(0xffffff, 3); sun.position.set(-8, 16, 10); sun.castShadow = true; scene.add(sun); const glow = new THREE.PointLight(0x4f7cff, 16, 35); glow.position.set(0, 5, -20); scene.add(glow);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(18, 260), new THREE.MeshStandardMaterial({ color: 0x111d32, roughness: .85 })); ground.rotation.x = -Math.PI / 2; ground.position.z = -62; ground.receiveShadow = true; scene.add(ground);
  [-3.1, 3.1].forEach(x => { const rail = new THREE.Mesh(new THREE.BoxGeometry(.06, .08, 260), new THREE.MeshBasicMaterial({ color: 0x3a8dca })); rail.position.set(x, .03, -62); scene.add(rail); });
  for (let z = -8; z > -125; z -= 12) { const gate = new THREE.Mesh(new THREE.TorusGeometry(2.8, .08, 8, 32), new THREE.MeshBasicMaterial({ color: 0x6d48ff })); gate.rotation.x = Math.PI / 2; gate.position.set(0, 2, z); scene.add(gate); }
  player = new THREE.Group();
  body = new THREE.Mesh(new THREE.CapsuleGeometry(.55, 1.15, 6, 12), new THREE.MeshStandardMaterial({ color: 0x45caff, metalness: .2, roughness: .35 })); body.castShadow = true; body.position.y = 1.05; player.add(body);
  visor = new THREE.Mesh(new THREE.SphereGeometry(.28, 12, 8), new THREE.MeshBasicMaterial({ color: 0xd7f6ff })); visor.position.set(0, 1.45, .42); visor.scale.set(1, .7, .35); player.add(visor);
  const cape = new THREE.Mesh(new THREE.BoxGeometry(.72, .9, .08), new THREE.MeshStandardMaterial({ color: 0x8c3cff, roughness: .55 })); cape.position.set(0, 1.02, -.48); player.add(cape); player.position.set(0, 0, 3); scene.add(player);
  addEventListener('resize', resize); requestAnimationFrame(loop);
}
function resize() { if (!camera || !renderer) return; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
function spawn() { const type = Math.random() < .65 ? 'crystal' : 'rock'; const o = new THREE.Mesh(type === 'crystal' ? new THREE.OctahedronGeometry(.42) : new THREE.DodecahedronGeometry(.7), new THREE.MeshStandardMaterial({ color: type === 'crystal' ? 0x57e6ff : 0xef477d, emissive: type === 'crystal' ? 0x164b66 : 0x4c102b, emissiveIntensity: 1 })); o.position.set([-2, 0, 2][Math.floor(Math.random() * 3)], type === 'crystal' ? 1.25 : .7, -90); o.userData.type = type; o.castShadow = true; scene.add(o); objects.push(o); }
function start() { if (!renderer) setupWorld(); objects.forEach(o => scene.remove(o)); objects = []; distance = coins = boss = 0; life = 3; speed = 18; lane = 0; jumpY = verticalVelocity = 0; sliding = false; player.position.set(0, 0, 3); running = true; paused = false; $('tutorial').classList.add('show'); $('pauseOverlay').classList.remove('show'); show('game'); updateHud(); }
function end() { running = false; $('finalDistance').textContent = Math.floor(distance) + ' m'; $('finalCoins').textContent = coins; $('finalXp').textContent = '+' + Math.floor(distance / 5); $('finalBoss').textContent = boss; $('finalBest').textContent = Math.floor(distance) + ' m'; show('result'); }
function updateHud() { $('distance').textContent = Math.floor(distance) + ' m'; $('runCoins').textContent = coins; $('life').textContent = '❤'.repeat(Math.max(0, life)) + '♡'.repeat(3 - Math.max(0, life)); $('bossBar').style.width = Math.max(0, 100 - boss * 20) + '%'; }
function jump() { if (!running || paused || jumpY > .02 || sliding) return; verticalVelocity = 8.8; sliding = false; }
function slide() { if (!running || paused || jumpY > .1) return; sliding = true; slideTimer = .7; }
function loop() { requestAnimationFrame(loop); if (!renderer) return; if (!clock) clock = new THREE.Clock(); const dt = Math.min(clock.getDelta(), .05); if (running && !paused && !$('tutorial').classList.contains('show')) {
  distance += speed * dt; speed = Math.min(30, 18 + distance / 300); if (Math.random() < dt * .8) spawn();
  jumpY += verticalVelocity * dt; verticalVelocity -= 24 * dt; if (jumpY <= 0) { jumpY = 0; verticalVelocity = 0; } if (slideTimer > 0) slideTimer -= dt; else sliding = false;
  for (let i = objects.length - 1; i >= 0; i--) { const o = objects[i]; o.position.z += speed * dt; o.rotation.x += dt * 2; o.rotation.y += dt * 3; if (o.position.z > 10) { scene.remove(o); objects.splice(i, 1); continue; } if (Math.abs(o.position.z - player.position.z) < 1.1 && Math.abs(o.position.x - player.position.x) < 1 && Math.abs(o.position.y - (jumpY + (sliding ? .45 : 1))) < 1) { if (o.userData.type === 'crystal') coins++; else { life--; boss++; } scene.remove(o); objects.splice(i, 1); if (life <= 0) end(); updateHud(); } }
  player.position.x += (lane * 2 - player.position.x) * Math.min(1, dt * 9); player.position.y = jumpY; const runBob = Math.sin(distance * .8) * .06; body.position.y = (sliding ? .62 : 1.05) + runBob; body.scale.y = sliding ? .58 : 1; visor.position.y = sliding ? 1.02 : 1.45; player.rotation.z = (lane * 2 - player.position.x) * -.08; player.rotation.x = sliding ? -.22 : Math.sin(distance * .8) * .025; updateHud(); }
 renderer.render(scene, camera); }
function move(dir) { if (running && !paused) lane = Math.max(-1, Math.min(1, lane + dir)); }
addEventListener('keydown', e => { if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','a','d','w','s'].includes(e.key)) e.preventDefault(); if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') move(-1); if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') move(1); if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w' || e.key === ' ') jump(); if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') slide(); if (e.key === 'Escape') togglePause(); });
let touchX = 0, touchY = 0; addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true }); addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY; if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) move(dx > 0 ? 1 : -1); else if (Math.abs(dy) > 30) dy < 0 ? jump() : slide(); }, { passive: true });
function togglePause() { if (!running) return; paused = !paused; $('pauseOverlay').classList.toggle('show', paused); } $('play').onclick = start; $('again').onclick = start; $('pause').onclick = togglePause; $('resume').onclick = togglePause; $('quit').onclick = () => { running = false; show('menu'); }; $('tutorialOk').onclick = () => $('tutorial').classList.remove('show');
const menuCanvas = document.createElement('canvas'); $('menu3d').append(menuCanvas); const ctx = menuCanvas.getContext('2d'); function menuAnim(t) { menuCanvas.width = innerWidth; menuCanvas.height = innerHeight; ctx.fillStyle = '#071321'; ctx.fillRect(0, 0, innerWidth, innerHeight); for (let i = 0; i < 18; i++) { const x = innerWidth * (.55 + Math.sin(t / 1500 + i) * .35), y = innerHeight * (.5 + Math.cos(t / 1100 + i * 2) * .35); ctx.beginPath(); ctx.arc(x, y, 2 + i % 4, 0, 7); ctx.fillStyle = `hsl(${190 + i * 10},90%,${45 + i % 2 * 25}%)`; ctx.fill(); } requestAnimationFrame(menuAnim); } menuAnim(0);

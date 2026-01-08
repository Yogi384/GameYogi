const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let keys = {};
let bullets = [];
let meteors = [];
let score = 0;
let gameOver = false;

const plane = {
  x: W/2,
  y: H - 80,
  w: 60,
  h: 40,
  speed: 6,
  cooldown: 0
};

function rand(min,max){ return Math.random()*(max-min)+min; }

function spawnMeteor(){
  const size = rand(25,60);
  meteors.push({
    x: rand(size, W - size),
    y: -size,
    r: size,
    speed: rand(1.5, 4.0),
    angle: rand(0, Math.PI*2),
    rotSpeed: rand(-0.03, 0.03)
  });
}

function shoot(){
  if(plane.cooldown > 0) return;
  bullets.push({ x: plane.x, y: plane.y-20, vx: 0, vy: -9, r: 5 });
  plane.cooldown = 12;
}

function update(){
  if(gameOver) return;

  if(keys['ArrowLeft'] || keys['a']) plane.x -= plane.speed;
  if(keys['ArrowRight'] || keys['d']) plane.x += plane.speed;
  plane.x = Math.max(20, Math.min(W-20, plane.x));
  if(keys[' ']) shoot();

  if(plane.cooldown>0) plane.cooldown--;

  for(let i=bullets.length-1;i>=0;i--){
    const b = bullets[i];
    b.x += b.vx; 
    b.y += b.vy;
    if(b.y < -10) bullets.splice(i,1);
  }

  for(let i=meteors.length-1;i>=0;i--){
    const m = meteors[i];
    m.y += m.speed;
    m.angle += m.rotSpeed;
    if(m.y - m.r > H+50) meteors.splice(i,1);
  }

  for(let i=meteors.length-1;i>=0;i--){
    const m = meteors[i];
    for(let j=bullets.length-1;j>=0;j--){
      const b = bullets[j];
      const dx = m.x - b.x;
      const dy = m.y - b.y;
      if(dx*dx + dy*dy < (m.r + b.r)*(m.r + b.r)){
        bullets.splice(j,1);
        meteors.splice(i,1);
        score += 10;
        document.getElementById('score').textContent = score;
        break;
      }
    }
  }

  for(const m of meteors){
    const dx = m.x - plane.x;
    const dy = m.y - plane.y;
    if(dx*dx + dy*dy < (m.r + 30)*(m.r + 30)){
      gameOver = true;
    }
  }

  if(Math.random() < 0.02 + Math.min(0.03, score/2000)){
    spawnMeteor();
  }
}

function drawPlane(){
  ctx.save();
  ctx.translate(plane.x, plane.y);
  ctx.fillStyle = '#bfe6ff';
  ctx.beginPath();
  ctx.moveTo(-30,10);
  ctx.quadraticCurveTo(0,-30,30,10);
  ctx.lineTo(22,18);
  ctx.lineTo(-22,18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0b3a66';
  ctx.beginPath();
  ctx.ellipse(0,0,12,8,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function draw(){
  ctx.clearRect(0,0,W,H);

  for(let i=0;i<60;i++){
    const x = (i*37) % W;
    const y = ((i*91)+ (Date.now()/100)%H) % H;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, y, 1, 1);
  }

  for(const b of bullets){
    ctx.beginPath();
    ctx.fillStyle = '#ffd9a3';
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
  }

  for(const m of meteors){
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.angle);
    ctx.beginPath();
    ctx.fillStyle = '#8b6b5b';
    ctx.moveTo(-m.r, -m.r*0.4);
    for(let a=0;a<7;a++){
      const ang = a*(Math.PI*2)/7;
      const rr = m.r * (0.7 + 0.3 * Math.sin(a*2));
      ctx.lineTo(Math.cos(ang)*rr, Math.sin(ang)*rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawPlane();

  if(gameOver){
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#fff';
    ctx.font = '36px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W/2, H/2 - 20);
    ctx.font = '20px system-ui';
    ctx.fillText('Tekan R untuk main lagi', W/2, H/2 + 20);
    ctx.fillText('Skor akhir: ' + score, W/2, H/2 + 60);
  }
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e)=>{
  keys[e.key] = true;
  if(e.key === ' ') e.preventDefault();
  if(gameOver && (e.key === 'r' || e.key === 'R')){
    bullets = [];
    meteors = [];
    score = 0;
    gameOver = false;
    document.getElementById('score').textContent = score;
  }
});
window.addEventListener('keyup', (e)=>{ keys[e.key] = false; });

for(let i=0;i<6;i++) spawnMeteor();
loop();

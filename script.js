/* Fayzur Rahman Portfolio — interactions + 3D background */

/* ═══════════ 3D ENGINE (vanilla, no libraries) ═══════════ */
const R3D = {
  // Rotate 3D point around Y axis
  rotY: (x, y, z, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [x * c + z * s, y, -x * s + z * c];
  },
  // Rotate around X axis
  rotX: (x, y, z, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [x, y * c - z * s, y * s + z * c];
  },
  // Project 3D to 2D screen
  project: (x, y, z, fov, cx, cy) => {
    const scale = fov / (fov + z);
    return [cx + x * scale, cy + y * scale, scale];
  },
};

// Build sphere wireframe: meridians + parallels + glow points
function buildSphere(radius, meridians, parallels) {
  const lines = []; // [ [ [x,y,z], [x,y,z] ] ... ]
  // Meridians (longitude lines)
  for (let i = 0; i < meridians; i++) {
    const lon = (i / meridians) * Math.PI * 2;
    const pts = [];
    for (let j = 0; j <= 40; j++) {
      const lat = (j / 40) * Math.PI - Math.PI / 2;
      pts.push([
        radius * Math.cos(lat) * Math.cos(lon),
        radius * Math.sin(lat),
        radius * Math.cos(lat) * Math.sin(lon),
      ]);
    }
    lines.push(pts);
  }
  // Parallels (latitude lines)
  for (let i = 1; i < parallels; i++) {
    const lat = (i / parallels) * Math.PI - Math.PI / 2;
    const pts = [];
    for (let j = 0; j <= 40; j++) {
      const lon = (j / 40) * Math.PI * 2;
      pts.push([
        radius * Math.cos(lat) * Math.cos(lon),
        radius * Math.sin(lat),
        radius * Math.cos(lat) * Math.sin(lon),
      ]);
    }
    lines.push(pts);
  }
  // Glow points (fibonacci sphere)
  const points = [];
  const N = 90;
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = phi * i;
    points.push([radius * r * Math.cos(th), radius * y, radius * r * Math.sin(th)]);
  }
  return { lines, points };
}

// Build a wireframe cube
function buildCube(size) {
  const h = size / 2;
  const v = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h],
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  return { v, edges };
}

// Build an orbit ring (ellipse in 3D, tilted)
function buildRing(radius, tiltX, tiltZ) {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    let x = radius * Math.cos(a);
    let y = radius * Math.sin(a) * 0.42;
    let z = 0;
    // tilt around X
    const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
    let y2 = y * cx - z * sx, z2 = y * sx + z * cx;
    y = y2; z = z2;
    // tilt around Z
    const cz = Math.cos(tiltZ), sz = Math.sin(tiltZ);
    const x2 = x * cz - y * sz, y3 = x * sz + y * cz;
    pts.push([x2, y3, z]);
  }
  return pts;
}

const globe = buildSphere(150, 12, 8);
const rings = [
  buildRing(225, 0.5, 0.2),
  buildRing(270, -0.35, 0.6),
];
const cubes = [];
for (let i = 0; i < 5; i++) {
  cubes.push({
    c: buildCube(24 + Math.random() * 30),
    x: (Math.random() - 0.5) * 900,
    y: (Math.random() - 0.5) * 600,
    z: (Math.random() - 0.5) * 300,
    ry: Math.random() * Math.PI,
    rx: Math.random() * Math.PI,
    speed: 0.002 + Math.random() * 0.004,
    color: ['#00a6e2', '#4d65ff', '#13ce66', '#ff659d', '#9b0984'][i % 5],
    size: 0.6 + Math.random() * 0.9,
  });
}

function drawWireframe(ctx, pts, color, alphaBase) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = alphaBase;
  ctx.stroke();
}

/* ═══════════ Particle network background ═══════════ */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const COUNT = 60;
  const LINK_DIST = 130;
  const COLORS = ['#915eff', '#00cea8', '#56ccf2', '#fc6767', '#bf61ff'];
  let time = 0;

  // Mouse parallax targets (used by globe + cubes)
  let mouseNX = 0, mouseNY = 0, mouseTX = 0, mouseTY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseTX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function Particle() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.r = Math.random() * 2 + 1;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function tick() {
    time += 0.005;
    // Smooth mouse follow (eased)
    mouseNX += (mouseTX - mouseNX) * 0.03;
    mouseNY += (mouseTY - mouseNY) * 0.03;
    ctx.clearRect(0, 0, w, h);

    /* ── 3D wireframe globe (right side, CBDC-style) ── */
    const gx = w * 0.8 + mouseNX * 36;
    const gy = h * 0.3 + mouseNY * 24;
    const globeScale = Math.min(w, h) / 900 + 0.75;
    const fov = 500;
    const rotY = time * 1.2;
    const rotX = Math.sin(time * 0.6) * 0.25;

    // Soft glow halo behind globe
    const halo = ctx.createRadialGradient(gx, gy, 0, gx, gy, 260 * globeScale);
    halo.addColorStop(0, 'rgba(145,94,255,0.20)');
    halo.addColorStop(0.6, 'rgba(86,204,242,0.08)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(gx, gy, 260 * globeScale, 0, Math.PI * 2);
    ctx.fill();

    // Orbit rings (CBDC-style)
    for (let ri = 0; ri < rings.length; ri++) {
      const ring = rings[ri];
      const proj = [];
      let avgScale = 0;
      for (const p of ring) {
        let [x, y, z] = R3D.rotY(p[0], p[1], p[2], rotY * (ri === 0 ? 0.8 : -0.5));
        [x, y, z] = R3D.rotX(x, y, z, rotX);
        const [sx, sy, sc] = R3D.project(x * globeScale, y * globeScale, z * globeScale, fov, gx, gy);
        proj.push([sx, sy]);
        avgScale += sc;
      }
      avgScale /= ring.length;
      drawWireframe(ctx, proj, ri === 0 ? '#915eff' : '#00cea8', 0.22 + avgScale * 0.4);
    }

    // Globe lines
    for (const line of globe.lines) {
      const proj = [];
      let avgScale = 0;
      for (const p of line) {
        let [x, y, z] = R3D.rotY(p[0], p[1], p[2], rotY);
        [x, y, z] = R3D.rotX(x, y, z, rotX);
        const [sx, sy, sc] = R3D.project(
          x * globeScale, y * globeScale, z * globeScale, fov, gx, gy
        );
        proj.push([sx, sy]);
        avgScale += sc;
      }
      avgScale /= line.length;
      drawWireframe(ctx, proj, '#56ccf2', 0.22 + avgScale * 0.42);
    }

    // Glow points on globe
    for (const p of globe.points) {
      let [x, y, z] = R3D.rotY(p[0], p[1], p[2], rotY);
      [x, y, z] = R3D.rotX(x, y, z, rotX);
      const [sx, sy, sc] = R3D.project(x * globeScale, y * globeScale, z * globeScale, fov, gx, gy);
      if (sc > 0.55) {
        ctx.beginPath();
        ctx.arc(sx, sy, 2.1 * sc, 0, Math.PI * 2);
        ctx.fillStyle = '#00cea8';
        ctx.globalAlpha = 0.8 * sc;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    /* ── Floating 3D wireframe cubes ── */
    for (const cube of cubes) {
      cube.ry += cube.speed;
      cube.rx += cube.speed * 0.7;
      const pts = [];
      let sumScale = 0;
      for (const v of cube.c.v) {
        let [x, y, z] = R3D.rotY(v[0], v[1], v[2], cube.ry);
        [x, y, z] = R3D.rotX(x, y, z, cube.rx);
        x += cube.x; y += cube.y; z += cube.z;
        const [sx, sy, sc] = R3D.project(x * cube.size, y * cube.size, z * cube.size, fov, w / 2, h / 2);
        pts.push([sx, sy]);
        sumScale += sc;
      }
      const alpha = 0.2 + (sumScale / 8) * 0.45;
      for (const [a, b] of cube.c.edges) {
        ctx.beginPath();
        ctx.moveTo(pts[a][0], pts[a][1]);
        ctx.lineTo(pts[b][0], pts[b][1]);
        ctx.strokeStyle = cube.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    /* ── Particle network (existing) ── */
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.8;
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = a.color;
          ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.3;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ── Typing effect ── */
const roles = [
  'UK Property Sourcing & BMV Analysis',
  'BRRR Strategy · Auction Due Diligence',
  'High-Ticket Sales · BDT 15Cr+ track record',
  'AI-Augmented Operations · OpenClaw · AutoClaw',
];
const typingEl = document.getElementById('typing');
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIdx];
  if (!deleting) {
    charIdx++;
    typingEl.textContent = current.slice(0, charIdx);
    if (charIdx === current.length) { deleting = true; setTimeout(typeLoop, 1800); return; }
    setTimeout(typeLoop, 70);
  } else {
    charIdx--;
    typingEl.textContent = current.slice(0, charIdx);
    if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; setTimeout(typeLoop, 350); return; }
    setTimeout(typeLoop, 32);
  }
}
typeLoop();

/* ── Mobile nav toggle ── */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  spans[0].style.transform = navLinks.classList.contains('open') ? 'rotate(45deg) translateY(7px)' : '';
  spans[1].style.opacity = navLinks.classList.contains('open') ? '0' : '1';
  spans[2].style.transform = navLinks.classList.contains('open') ? 'rotate(-45deg) translateY(-7px)' : '';
});
navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

/* ── Folder tree (Repo section) ── */
const folders = [
  {
    name: 'research_analysis/',
    icon: '🗄️',
    color: '#00a6e2',
    desc: '7 analysis workbooks — Liverpool, E1, Grays',
    items: ['01_Liverpool_Wirral_BRRR_Real_DUV_Analysis.xlsx', '02_Liverpool_BRRR_All_L_Postcodes_Screening.xlsx', '03_Liverpool_BRRR_50pct_Bridge_50pct_Cash_Model.xlsx', '04_London_E1_Standard_Sale_BRRR_Area_Wise.xlsx', '05_Liverpool_Standard_Sale_BRRR_with_Crime_Rates.xlsx', '06_Grays_Property_Comparison_Max_Offer.xlsx', '07_Freehold_Property_Comparison_Grays.xlsx'],
  },
  {
    name: 'case_studies/',
    icon: '🏠',
    color: '#9b0984',
    desc: 'Single-property deep-dives + legal',
    items: ['08_Liverpool_13_Manningham_Road_L4_BRRR_Analysis.xlsx', '09_Grays_12_Parsonage_Road_Complete_Cost_Analysis.xlsx', '10_UK_Legal_Analysis_Argent_Parsonage.xlsx', '11_EWS1_Deep_Analysis_57_Argent_Court.pdf'],
  },
  {
    name: 'prompt_library/',
    icon: '🤖',
    color: '#13ce66',
    desc: 'Reusable prompts & agent workflows',
    items: ['property_research/', 'content_production/', 'agent_operations/', 'admin_workflow/'],
  },
  {
    name: 'content_samples/',
    icon: '✍️',
    color: '#ff659d',
    desc: 'LinkedIn posts, campaigns, personas',
    items: ['B2B apparel series/', 'personas/', 'voice-guide/'],
  },
  {
    name: 'cv/',
    icon: '📄',
    color: '#ff8c42',
    desc: 'Property Consultant CV',
    items: ['Fayzur_Rahman_Property_Consultant_CV.docx'],
  },
];

const repoBody = document.getElementById('repoBody');
folders.forEach((folder) => {
  const row = document.createElement('div');
  row.className = 'folder-row';
  row.innerHTML = `
    <span class="folder-chevron" style="color:${folder.color}">▶</span>
    <span class="folder-icon">${folder.icon}</span>
    <span class="folder-name" style="color:${folder.color}">${folder.name}</span>
    <span class="folder-desc">${folder.desc}</span>
  `;
  const children = document.createElement('div');
  children.className = 'folder-children';
  folder.items.forEach((item) => {
    const child = document.createElement('div');
    child.className = 'folder-child';
    child.innerHTML = `<span style="color:${folder.color}">└─</span> ${item}`;
    children.appendChild(child);
  });
  row.addEventListener('click', () => {
    const wasOpen = children.classList.contains('open');
    document.querySelectorAll('.folder-children.open').forEach((c) => c.classList.remove('open'));
    document.querySelectorAll('.folder-chevron.open').forEach((c) => c.classList.remove('open'));
    if (!wasOpen) {
      children.classList.add('open');
      row.querySelector('.folder-chevron').classList.add('open');
    }
  });
  repoBody.appendChild(row);
  repoBody.appendChild(children);
});

/* ── Reveal on scroll ── */
const revealEls = document.querySelectorAll(
  '.stat-card, .skill-card, .tl-item, .pf-card, .chart-card, .contact-card, .section-head'
);
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});

/* ── SCROLL PROGRESS BAR ── */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ── BACK TO TOP + NAV SHADOW ── */
const backTop = document.getElementById('backTop');
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('show', window.scrollY > 480);
  nav.style.boxShadow = window.scrollY > 20 ? '0 6px 30px rgba(0,0,0,.4)' : 'none';
}, { passive: true });
backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── SCROLL SPY (active nav) ── */
const spySections = document.querySelectorAll('section[id], header[id]');
const spyLinks = document.querySelectorAll('.nav-links a');
const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        spyLinks.forEach((l) =>
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id)
        );
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
spySections.forEach((s) => spyObserver.observe(s));

/* ── COUNT-UP STATS ── */
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const isComma = el.dataset.format === 'comma';
  const decimals = String(el.dataset.count).includes('.') ? String(el.dataset.count).split('.')[1].length : 0;
  const dur = 1400;
  const start = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    let text;
    if (isComma) text = Math.round(val).toLocaleString('en-US');
    else text = decimals ? val.toFixed(decimals) : Math.round(val).toString();
    el.textContent = text + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

/* ── HERO CARD 3D TILT ── */
const tiltWrap = document.querySelector('.hero-card-wrap');
if (tiltWrap) {
  const tiltCard = tiltWrap.querySelector('.hero-card');
  tiltWrap.addEventListener('mousemove', (e) => {
    const r = tiltWrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltCard.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 12}deg) translateZ(8px)`;
  });
  tiltWrap.addEventListener('mouseleave', () => {
    tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
  });
}

/* ── CHART ANIMATIONS TRIGGER ── */
const chartsSection = document.getElementById('charts');
if (chartsSection) {
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          chartsSection.classList.add('charts-anim');
          chartObserver.unobserve(chartsSection);
        }
      });
    },
    { threshold: 0.3 }
  );
  chartObserver.observe(chartsSection);
}

/* ── STAGGER REVEAL ── */
document.querySelectorAll('.skills-grid .skill-card, .pf-grid .pf-card').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 0.08 + 's';
});

/* ═══════════════════════════════════════════
   3D CHARTS — vanilla 3D engine (no libraries)
   ═══════════════════════════════════════════ */

function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}

function camProject(p, cam, cx, cy) {
  let [x, y, z] = R3D.rotY(p[0], p[1], p[2], cam.rotY);
  [x, y, z] = R3D.rotX(x, y, z, cam.rotX);
  const sc = cam.fov / (cam.fov + z);
  return [cx + x * sc, cy + y * sc, sc];
}

// 3D box: center (cx,cy,cz), w,h,d; returns faces [{pts2D, color}]
function boxFaces(cx, cy, cz, w, h, d, color, cam, ox, oy) {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const y0 = cy - h, y1 = cy;
  const z0 = cz - d / 2, z1 = cz + d / 2;
  const P = [
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
  ];
  const Q = P.map((p) => camProject(p, cam, ox, oy));
  const faces = [
    { idx: [0, 1, 2, 3], color: shadeHex(color, -42) },
    { idx: [4, 5, 6, 7], color: color },
    { idx: [0, 1, 5, 4], color: shadeHex(color, 42) },
    { idx: [1, 2, 6, 5], color: shadeHex(color, -18) },
  ];
  return faces.map((f) => ({
    pts: f.idx.map((i) => [Q[i][0], Q[i][1]]),
    color: f.color,
    depth: f.idx.reduce((s, i) => s + Q[i][2], 0) / f.idx.length,
  }));
}

function fillFaces(ctx, faces) {
  faces.sort((a, b) => b.depth - a.depth);
  for (const f of faces) {
    ctx.beginPath();
    ctx.moveTo(f.pts[0][0], f.pts[0][1]);
    for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = f.color;
    ctx.fill();
  }
}

function chartCam() {
  return { rotY: -0.6, rotX: 0.32, fov: 760 };
}

const easeOut = (p) => 1 - Math.pow(1 - p, 3);

function init3DCharts() {
  const charts = [
    { id: 'chartBars', draw: draw3DBars },
    { id: 'chartFunnel', draw: draw3DFunnel },
    { id: 'chartLine', draw: draw3DLine },
  ];
  charts.forEach((cfg) => {
    const cv = document.getElementById(cfg.id);
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let raf = null, t0 = null, visible = false;

    const sizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = cv.clientWidth || 300;
      const h = cv.clientHeight || 230;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    const loop = (ts) => {
      if (!visible) return;
      if (t0 === null) t0 = ts;
      const t = (ts - t0) / 1000;
      const w = cv.clientWidth || 300;
      const h = cv.clientHeight || 230;
      ctx.clearRect(0, 0, w, h);
      cfg.draw(ctx, w, h, t);
      raf = requestAnimationFrame(loop);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!visible) {
              visible = true;
              t0 = performance.now();
              raf = requestAnimationFrame(loop);
            }
          } else {
            visible = false;
            if (raf) cancelAnimationFrame(raf);
          }
        });
      },
      { threshold: 0.25 }
    );
    obs.observe(cv);
  });
}

/* ── 3D BAR CHART ── */
function draw3DBars(ctx, w, h, t) {
  const cam = chartCam();
  const data = [
    { v: 0.3, l: 'M1', c: '#2f80ed' },
    { v: 0.63, l: 'M2', c: '#56ccf2' },
    { v: 1.05, l: 'M3', c: '#915eff' },
    { v: 1.44, l: 'M4', c: '#00cea8' },
    { v: 2.1, l: 'M5', c: '#bf61ff' },
    { v: 2.37, l: 'M6', c: '#fc6767' },
  ];
  const maxV = 2.37;
  const ox = w / 2, oy = h - 26;
  const barW = 30, barD = 30, step = 52;
  const x0 = -((data.length - 1) * step) / 2;

  // ground glow line
  const gA = camProject([-160, 0, 40], cam, ox, oy);
  const gB = camProject([160, 0, -40], cam, ox, oy);
  ctx.beginPath();
  ctx.moveTo(gA[0], gA[1]);
  ctx.lineTo(gB[0], gB[1]);
  ctx.strokeStyle = 'rgba(145,94,255,.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  data.forEach((d, i) => {
    const delay = 0.12 + i * 0.1;
    const p = easeOut(Math.min(Math.max((t - delay) / 0.75, 0), 1));
    const hgt = (d.v / maxV) * 135 * p;
    const cx = x0 + i * step;
    const faces = boxFaces(cx, 0, 0, barW, hgt, barD, d.c, cam, ox, oy);
    fillFaces(ctx, faces);
    // label under bar
    const lb = camProject([cx, -6, 0], cam, ox, oy);
    ctx.font = '600 10px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#777';
    ctx.fillText(d.l, lb[0], lb[1] + 14);
    // value above bar (after grown)
    if (p > 0.55) {
      const top = camProject([cx, hgt + 8, 0], cam, ox, oy);
      ctx.font = '700 11px Poppins, sans-serif';
      ctx.fillStyle = i === data.length - 1 ? '#fc6767' : '#aaa6c3';
      ctx.fillText(i === data.length - 1 ? d.v + 'Cr' : d.v.toFixed(1), top[0], top[1] - 6);
    }
  });
}

/* ── 3D FUNNEL ── */
function draw3DFunnel(ctx, w, h, t) {
  const cam = chartCam();
  const levels = [
    { wd: 240, label: '3,589 raw', pct: '66%', c: '#2f80ed' },
    { wd: 190, label: '2,386 unique', pct: '3.6%', c: '#915eff' },
    { wd: 140, label: '87 analysed', pct: '36%', c: '#00cea8' },
    { wd: 92, label: '31 leads · 12 biddable', pct: '39%', c: '#fc6767' },
  ];
  const ox = w / 2, oy = h - 20;
  const lh = 38, gap = 4;
  let cy = 0;

  // draw from bottom level up
  for (let i = levels.length - 1; i >= 0; i--) {
    const lv = levels[i];
    const delay = 0.25 + (levels.length - 1 - i) * 0.18;
    const p = easeOut(Math.min(Math.max((t - delay) / 0.5, 0), 1));
    const drop = (1 - p) * -26;
    const cyb = cy + lh;
    const d = lv.wd * 0.42;
    const faces = boxFaces(0, cyb + drop, 0, lv.wd, lh, d, lv.c, cam, ox, oy);
    fillFaces(ctx, faces);
    // label on front face
    if (p > 0.5) {
      const lp = camProject([0, cyb - lh / 2 + drop, d / 2 + 1], cam, ox, oy);
      ctx.font = '700 10px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(lv.label, lp[0], lp[1] + 3);
      // pct on right
      const pp = camProject([lv.wd / 2 + 26, cyb - lh / 2 + drop, 0], cam, ox, oy);
      ctx.font = '600 9px Poppins, sans-serif';
      ctx.fillStyle = '#aaa6c3';
      ctx.fillText(lv.pct, pp[0], pp[1] + 3);
    }
    cy += lh + gap;
  }
}

/* ── 3D LINE CHART ── */
function draw3DLine(ctx, w, h, t) {
  const cam = chartCam();
  const pts = [165, 130, 108, 85, 55];
  const ox = w / 2, oy = h - 24;
  const minV = 55, maxV = 165;
  const worldPts = pts.map((v, i) => [
    -132 + i * 66,
    ((v - minV) / (maxV - minV)) * 132,
    0,
  ]);

  // floor grid
  for (let gx = -132; gx <= 132; gx += 66) {
    const a = camProject([gx, 0, -36], cam, ox, oy);
    const b = camProject([gx, 0, 36], cam, ox, oy);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.stroke();
  }
  const fA = camProject([-132, 0, 0], cam, ox, oy);
  const fB = camProject([132, 0, 0], cam, ox, oy);
  ctx.beginPath();
  ctx.moveTo(fA[0], fA[1]);
  ctx.lineTo(fB[0], fB[1]);
  ctx.strokeStyle = 'rgba(145,94,255,.3)';
  ctx.stroke();

  const p = easeOut(Math.min(t / 1.7, 1));
  const segs = worldPts.length - 1;
  const drawn = p * segs;

  // draw line progressively
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < segs; i++) {
    const segP = Math.min(Math.max(drawn - i, 0), 1);
    if (segP <= 0) break;
    const a = camProject(worldPts[i], cam, ox, oy);
    const b = camProject(worldPts[i + 1], cam, ox, oy);
    const mx = a[0] + (b[0] - a[0]) * segP;
    const my = a[1] + (b[1] - a[1]) * segP;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(mx, my);
    ctx.strokeStyle = '#56ccf2';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(86,204,242,.8)';
    ctx.shadowBlur = 10;
    ctx.stroke();
  }
  ctx.restore();

  // dots + labels
  worldPts.forEach((wp, i) => {
    const dotP = Math.min(Math.max((drawn - i + 0.4) / 0.6, 0), 1);
    if (dotP <= 0) return;
    const dp = camProject(wp, cam, ox, oy);
    const r = 6 * dotP;
    const grad = ctx.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], r * 2.6);
    const col = i === 0 ? '#fc6767' : i === worldPts.length - 1 ? '#00cea8' : '#915eff';
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.35, col);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(dp[0], dp[1], r * 2.6, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // labels
    if (i === 0) {
      ctx.font = '700 10px Poppins, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fc6767';
      ctx.fillText('165min', dp[0] + 10, dp[1] - 8);
      ctx.font = '600 9px Poppins, sans-serif';
      ctx.fillStyle = '#777';
      ctx.fillText('Day 1', dp[0] + 10, dp[1] + 16);
    } else if (i === worldPts.length - 1) {
      ctx.font = '700 10px Poppins, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#00cea8';
      ctx.fillText('55min', dp[0] - 10, dp[1] - 8);
      ctx.font = '600 9px Poppins, sans-serif';
      ctx.fillStyle = '#777';
      ctx.fillText('Day 5', dp[0] - 10, dp[1] + 16);
    }
  });

  // big result label
  if (p > 0.85) {
    const lp = camProject([0, 40, 60], cam, ox, oy);
    ctx.font = '800 14px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#bf61ff';
    ctx.fillText('−67% in 5 days', lp[0], lp[1]);
  }
}

init3DCharts();

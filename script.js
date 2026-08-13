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

const globe = buildSphere(150, 12, 8);
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
  const COLORS = ['#00a6e2', '#4d65ff', '#13ce66', '#ff659d', '#9b0984'];
  let time = 0;

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
    ctx.clearRect(0, 0, w, h);

    /* ── 3D wireframe globe (right side, CBDC-style) ── */
    const gx = w * 0.82, gy = h * 0.3;
    const globeScale = Math.min(w, h) / 1100 + 0.7;
    const fov = 500;
    const rotY = time * 1.2;
    const rotX = Math.sin(time * 0.6) * 0.25;

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
      drawWireframe(ctx, proj, '#00a6e2', 0.12 + avgScale * 0.2);
    }

    // Glow points on globe
    for (const p of globe.points) {
      let [x, y, z] = R3D.rotY(p[0], p[1], p[2], rotY);
      [x, y, z] = R3D.rotX(x, y, z, rotX);
      const [sx, sy, sc] = R3D.project(x * globeScale, y * globeScale, z * globeScale, fov, gx, gy);
      if (sc > 0.55) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.6 * sc, 0, Math.PI * 2);
        ctx.fillStyle = '#22d3ee';
        ctx.globalAlpha = 0.5 * sc;
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
      const alpha = 0.08 + (sumScale / 8) * 0.25;
      for (const [a, b] of cube.c.edges) {
        ctx.beginPath();
        ctx.moveTo(pts[a][0], pts[a][1]);
        ctx.lineTo(pts[b][0], pts[b][1]);
        ctx.strokeStyle = cube.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1;
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

/* ── Nav background on scroll ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 20 ? '0 6px 30px rgba(0,0,0,.4)' : 'none';
});

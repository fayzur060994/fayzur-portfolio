/* ═══════════════════════════════════════════════════════
   FAYZUR RAHMAN — DIGITAL COMMAND CENTER (V2)
   Vanilla JS · no libraries · GitHub Pages ready
   ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   SINGLE SOURCE OF TRUTH — all site statistics
   Every [data-stat] element reads from here.
   (fixes the old "About shows 0" inconsistency)
   ───────────────────────────────────────────── */
const SITE_STATS = {
  screened: 3589,      // properties screened (PropertyData + Rightmove + auctions)
  postcodes: 2386,     // unique postcodes
  targets: 2573,       // 2–3 bed target properties
  auction: 350,        // auction lots analysed
  deals: 2,            // deals successfully completed
  towns: 79,           // towns covered (Liverpool export)
  orders: 454,         // Isho furniture orders
  furniture: 2.37,     // BDT Cr Isho showroom sales
  electronics: 12.78,  // BDT Cr Samsung sales
  biddable: 12,        // biddable auction candidates
};

const fmtStat = (v) =>
  Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2);

/* ────────────────────────────── ENVIRONMENT ────────────────────────────── */
const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
const mqCoarse = window.matchMedia('(pointer: coarse)');

function detectPerf() {
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  let mode = 'high';
  if (mqReduced.matches) mode = 'low';
  else if (mqCoarse.matches && (mem <= 4 || cores <= 4)) mode = 'low';
  else if (mem <= 4 || cores <= 4 || mqCoarse.matches) mode = 'medium';
  document.documentElement.classList.add('perf-' + mode);
  if (mode === 'low') {
    const p = document.getElementById('particles');
    if (p) p.style.display = 'none';
  }
  return mode;
}
const PERF = detectPerf();
const DPR_CAP = PERF === 'high' ? 2 : PERF === 'medium' ? 1.5 : 1;

/* ────────────────────────────── LOADER ────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  const bar = document.getElementById('loaderBar');
  if (!loader) return;
  if (mqReduced.matches) {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 700);
    return;
  }
  let pct = 0;
  const step = () => {
    pct = Math.min(pct + Math.random() * 22 + 8, 100);
    if (bar) bar.style.width = pct + '%';
    if (pct < 100) setTimeout(step, 90);
    else {
      setTimeout(() => {
        loader.classList.add('done');
        setTimeout(() => loader.remove(), 700);
      }, 250);
    }
  };
  setTimeout(step, 150);
}

/* ────────────────────────────── CUSTOM CURSOR ────────────────────────────── */
function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring || !mqFine.matches) return;
  let mx = -100, my = -100, rx = -100, ry = -100;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });
  (function ringLoop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(ringLoop);
  })();
  const INTERACTIVE = 'a, button, .cmd-module, .about-tile, .inv-stage, .chat-chip, input, .folder-row';
  document.addEventListener('mouseover', (e) => {
    ring.classList.toggle('hover', !!e.target.closest(INTERACTIVE));
  });
  document.addEventListener('mouseleave', () => {
    dot.classList.add('hidden');
    ring.classList.add('hidden');
  });
  document.addEventListener('mouseenter', () => {
    dot.classList.remove('hidden');
    ring.classList.remove('hidden');
  });
}

/* ────────────────────────────── NAV ────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!nav || !toggle || !links) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  // scroll spy
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.querySelectorAll('a').forEach((l) =>
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id)
        );
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['world', 'property', 'ai', 'data', 'career', 'about', 'contact'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) spyObserver.observe(el);
  });
}

/* ────────────────────────────── SCROLL PROGRESS + BACK TOP ────────────────────────────── */
function initScrollChrome() {
  const bar = document.getElementById('scrollProgress');
  const backTop = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
    if (backTop) backTop.classList.toggle('show', window.scrollY > 480);
  }, { passive: true });
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ────────────────────────────── STATS (single source) ────────────────────────────── */
function initStats() {
  const els = document.querySelectorAll('[data-stat]');
  els.forEach((el) => {
    const key = el.dataset.stat;
    if (key === undefined || !(key in SITE_STATS)) return;
    const target = SITE_STATS[key];
    const finalText = fmtStat(target);
    el.dataset.final = finalText;
    el.textContent = finalText; // no "0" flash — value is always correct
  });
  if (mqReduced.matches) return; // no animation for reduced motion

  function animateCount(el) {
    const target = parseFloat(el.dataset.stat ? SITE_STATS[el.dataset.stat] : el.dataset.final.replace(/,/g, ''));
    const isInt = Number.isInteger(target);
    const finalText = el.dataset.final;
    const dur = 1300;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isInt ? Math.round(val).toLocaleString('en-US') : val.toFixed(2);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  els.forEach((el) => obs.observe(el));
}

/* ────────────────────────────── REVEAL ON SCROLL ────────────────────────────── */
function initReveal() {
  const sel = [
    '.stat-card', '.skill-card', '.pf-card', '.chart-card', '.contact-card',
    '.section-head', '.pf-step', '.cmd-module', '.data-tile', '.about-tile',
    '.mnote', '.station', '.inv-stage', '.geo-step', '.pf-chip',
  ].join(',');
  const els = document.querySelectorAll(sel);
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach((el) => {
    el.classList.add('reveal');
    obs.observe(el);
  });
  // stagger
  document.querySelectorAll('.pf-step, .data-tile, .about-tile, .mnote').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.07 + 's';
  });
}

/* ────────────────────────────── HERO PARALLAX (orbs) ────────────────────────────── */
function initParallax() {
  const orbs = document.querySelectorAll('.orb');
  if (!orbs.length || !mqFine.matches || mqReduced.matches) return;
  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    orbs.forEach((o, i) => {
      const d = (i + 1) * 14;
      o.style.transform = `translate(${nx * d}px, ${ny * d}px)`;
    });
  }, { passive: true });
}

/* ────────────────────────────── MAGNETIC BUTTONS ────────────────────────────── */
function initMagnetic() {
  if (!mqFine.matches || mqReduced.matches) return;
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.18;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ═══════════════════════════════════════════
   3D ENGINE (vanilla, no libraries)
   ═══════════════════════════════════════════ */
const R3D = {
  rotY: (x, y, z, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [x * c + z * s, y, -x * s + z * c];
  },
  rotX: (x, y, z, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [x, y * c - z * s, y * s + z * c];
  },
  project: (x, y, z, fov, cx, cy) => {
    const scale = fov / (fov + z);
    return [cx + x * scale, cy + y * scale, scale];
  },
};

function buildSphere(radius, meridians, parallels) {
  const lines = [];
  for (let i = 0; i < meridians; i++) {
    const lon = (i / meridians) * Math.PI * 2;
    const pts = [];
    for (let j = 0; j <= 40; j++) {
      const lat = (j / 40) * Math.PI - Math.PI / 2;
      pts.push([radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.sin(lon)]);
    }
    lines.push(pts);
  }
  for (let i = 1; i < parallels; i++) {
    const lat = (i / parallels) * Math.PI - Math.PI / 2;
    const pts = [];
    for (let j = 0; j <= 40; j++) {
      const lon = (j / 40) * Math.PI * 2;
      pts.push([radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.sin(lon)]);
    }
    lines.push(pts);
  }
  const points = [];
  const N = 80, phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = phi * i;
    points.push([radius * r * Math.cos(th), radius * y, radius * r * Math.sin(th)]);
  }
  return { lines, points };
}

function buildCube(size) {
  const h = size / 2;
  const v = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h],
  ];
  const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return { v, edges };
}

function buildRing(radius, tiltX, tiltZ) {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    let x = radius * Math.cos(a);
    let y = radius * Math.sin(a) * 0.42;
    let z = 0;
    const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
    let y2 = y * cx - z * sx, z2 = y * sx + z * cx;
    y = y2; z = z2;
    const cz = Math.cos(tiltZ), sz = Math.sin(tiltZ);
    const x2 = x * cz - y * sz, y3 = x * sz + y * cz;
    pts.push([x2, y3, z]);
  }
  return pts;
}

function drawWireframe(ctx, pts, color, alphaBase) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = alphaBase;
  ctx.stroke();
}

/* ── Particle network + 3D command-core background ── */
(function initBackground() {
  const canvas = document.getElementById('particles');
  if (!canvas || PERF === 'low') return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const COLORS = ['#59d8ff', '#00e5a0', '#6ea8ff', '#ffb454', '#8b7cf6'];
  const COUNT = PERF === 'medium' ? 26 : 55;
  const LINK_DIST = 130;
  let time = 0;
  let mouseNX = 0, mouseNY = 0, mouseTX = 0, mouseTY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseTX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = window.innerWidth; h = window.innerHeight;
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

  const globe = buildSphere(150, 12, 8);
  const rings = [buildRing(225, 0.5, 0.2), buildRing(270, -0.35, 0.6)];
  const cubes = [];
  const cubeCount = PERF === 'medium' ? 3 : 5;
  for (let i = 0; i < cubeCount; i++) {
    cubes.push({
      c: buildCube(24 + Math.random() * 30),
      x: (Math.random() - 0.5) * 900,
      y: (Math.random() - 0.5) * 600,
      z: (Math.random() - 0.5) * 300,
      ry: Math.random() * Math.PI,
      rx: Math.random() * Math.PI,
      speed: 0.002 + Math.random() * 0.004,
      color: ['#59d8ff', '#6ea8ff', '#00e5a0', '#ffb454', '#8b7cf6'][i % 5],
      size: 0.6 + Math.random() * 0.9,
    });
  }

  function tick() {
    time += 0.005;
    mouseNX += (mouseTX - mouseNX) * 0.03;
    mouseNY += (mouseTY - mouseNY) * 0.03;
    ctx.clearRect(0, 0, w, h);

    // 3D globe (right side)
    const gx = w * 0.82 + mouseNX * 36;
    const gy = h * 0.3 + mouseNY * 24;
    const globeScale = Math.min(w, h) / 900 + 0.75;
    const fov = 500;
    const rotY = time * 1.2;
    const rotX = Math.sin(time * 0.6) * 0.25;

    const halo = ctx.createRadialGradient(gx, gy, 0, gx, gy, 260 * globeScale);
    halo.addColorStop(0, 'rgba(110,168,255,0.16)');
    halo.addColorStop(0.6, 'rgba(89,216,255,0.07)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(gx, gy, 260 * globeScale, 0, Math.PI * 2);
    ctx.fill();

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
      drawWireframe(ctx, proj, ri === 0 ? '#59d8ff' : '#00e5a0', 0.2 + avgScale * 0.4);
    }

    for (const line of globe.lines) {
      const proj = [];
      let avgScale = 0;
      for (const p of line) {
        let [x, y, z] = R3D.rotY(p[0], p[1], p[2], rotY);
        [x, y, z] = R3D.rotX(x, y, z, rotX);
        const [sx, sy, sc] = R3D.project(x * globeScale, y * globeScale, z * globeScale, fov, gx, gy);
        proj.push([sx, sy]);
        avgScale += sc;
      }
      avgScale /= line.length;
      drawWireframe(ctx, proj, '#6ea8ff', 0.2 + avgScale * 0.42);
    }

    for (const p of globe.points) {
      let [x, y, z] = R3D.rotY(p[0], p[1], p[2], rotY);
      [x, y, z] = R3D.rotX(x, y, z, rotX);
      const [sx, sy, sc] = R3D.project(x * globeScale, y * globeScale, z * globeScale, fov, gx, gy);
      if (sc > 0.55) {
        ctx.beginPath();
        ctx.arc(sx, sy, 2.1 * sc, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5a0';
        ctx.globalAlpha = 0.8 * sc;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

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
      const alpha = 0.18 + (sumScale / 8) * 0.45;
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

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.7;
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
          ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.28;
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

/* ────────────────────────────── COMMAND CENTER ────────────────────────────── */
function initCommand() {
  document.querySelectorAll('.cmd-module').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
  const core = document.querySelector('.cmd-core');
  if (core) {
    core.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const target = document.getElementById('property');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/* ────────────────────────────── UK MAP ────────────────────────────── */
function initMap() {
  const svg = document.getElementById('ukMap');
  const tip = document.getElementById('mapTip');
  if (!svg || !tip) return;

  const POINTS = [
    { name: 'Liverpool', x: 108, y: 276, note: 'L postcodes · 79 towns', detail: 'City Centre 150 · Toxteth 54 · Everton 25 · Walton 24' },
    { name: 'Wirral', x: 96, y: 288, note: 'Deep analysis', detail: 'Wirral Deep Analysis Final · 04.07.2026' },
    { name: '10-Mile Radius', x: 120, y: 262, note: 'Matched properties', detail: 'Liverpool 10-mile radius matched workbook' },
    { name: 'London E1', x: 170, y: 348, note: '53 properties', detail: '40-min commute band · standard sale BRRR' },
    { name: 'Grays', x: 182, y: 344, note: 'RM17 · freehold', detail: '10-property comparison · max-offer maths' },
  ];

  const dotsG = document.getElementById('mapDots');
  const labelsG = document.getElementById('mapLabels');

  POINTS.forEach((pt) => {
    // halo pulse
    const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y); halo.setAttribute('r', 16);
    halo.setAttribute('fill', 'url(#dotGlow)');
    halo.setAttribute('class', 'pulse-dot-svg');
    // core dot
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'map-dot');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', pt.name + ' — ' + pt.note);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); dot.setAttribute('r', 6);
    dot.setAttribute('fill', '#59d8ff');
    dot.setAttribute('stroke', '#0a0c13'); dot.setAttribute('stroke-width', '2');
    g.appendChild(dot);
    dotsG.appendChild(halo);
    dotsG.appendChild(g);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', pt.x + 12); label.setAttribute('y', pt.y + 4);
    label.setAttribute('class', 'map-label');
    label.textContent = pt.name;
    labelsG.appendChild(label);

    const show = (ev) => {
      tip.hidden = false;
      tip.innerHTML = '<b>' + pt.name + '</b><span>' + pt.note + ' · ' + pt.detail + '</span>';
      const rect = svg.getBoundingClientRect();
      const sx = (pt.x / 340) * rect.width;
      const sy = (pt.y / 430) * rect.height;
      tip.style.left = Math.min(Math.max(sx - 100, 6), rect.width - 206) + 'px';
      tip.style.top = Math.max(sy - 74, 4) + 'px';
    };
    const hide = () => { tip.hidden = true; };
    g.addEventListener('mouseenter', show);
    g.addEventListener('mouseleave', hide);
    g.addEventListener('focus', show);
    g.addEventListener('blur', hide);
    g.addEventListener('click', show);
  });

  // add label styles
  const style = document.createElement('style');
  style.textContent = '.map-label { fill:#6b7288; font-size:10px; font-family:Poppins,sans-serif; letter-spacing:.08em; pointer-events:none; }';
  document.head.appendChild(style);
}

/* ────────────────────────────── INVESTMENT FLOW ────────────────────────────── */
function initInvFlow() {
  const stages = document.querySelectorAll('.inv-stage');
  const detail = document.getElementById('invDetail');
  if (!stages.length || !detail) return;

  const DATA = [
    { t: 'SOURCE', d: 'Finding opportunities across Rightmove, auction portals and PropertyData exports — 3,589 listings scanned into the pipeline.', tags: ['Rightmove', 'Auction portals', 'PropertyData'] },
    { t: 'SCREEN', d: 'Buy-box filters: freehold, 2–3 beds, price band, postcode. 3,589 → 2,386 unique postcodes → 2,573 target properties.', tags: ['Tenure', 'Bed count', 'Price band'] },
    { t: 'ANALYSE', d: 'DUV reverse-engineered from sold comparables, refurb cost build-up, 50% bridge / 50% cash financing. Max Offer = DUV − Refurb − Buying Costs, capped at asking price.', tags: ['DUV', 'ARV', 'Max Offer'] },
    { t: 'DUE DILIGENCE', d: 'Legal pack review, EWS1, leasehold terms, SDLT and solicitor cross-check. 87 properties carried into deep analysis.', tags: ['Legal pack', 'EWS1', 'SDLT'] },
    { t: 'REFURB', d: 'Refurbishment tiering and cost verification — every cost line cross-checked against a sourced evidence base.', tags: ['Refurb tiers', 'Cost evidence'] },
    { t: 'BRRR', d: 'Buy-Refurb-Rent-Refinance. Hold strategy — no profit deduction, exit via refinance at post-refurb value.', tags: ['Hold strategy', 'Refi exit'] },
    { t: 'REFINANCE', d: 'Post-refurb valuation and refinance maths — capital recycled into the next deal. 12 biddable · 2 deals completed.', tags: ['Post-refurb value', 'Capital recycling'] },
  ];

  function render(idx) {
    stages.forEach((s, i) => s.classList.toggle('active', i === idx));
    const d = DATA[idx];
    detail.innerHTML =
      '<h3>' + d.t + '</h3><div><p>' + d.d + '</p><div class="inv-tags">' +
      d.tags.map((t) => '<span>' + t + '</span>').join('') + '</div></div>';
  }
  stages.forEach((s, i) => s.addEventListener('click', () => render(i)));
  render(0);
}

/* ────────────────────────────── AI CHAT (local knowledge engine) ────────────────────────────── */
function initAI() {
  const log = document.getElementById('chatLog');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const suggests = document.getElementById('chatSuggests');
  if (!log || !form || !input) return;

  const KB = [
    { k: ['specialise', 'specialize', 'what does', 'expert', 'focus', 'about fayzur'], a: 'Fayzur operates at the intersection of PROPERTY × AI × RESEARCH × SALES — UK property sourcing, BRRR/BMV analysis, auction due diligence, data research, AI automation and commercial sales.' },
    { k: ['property', 'experience'], a: 'He is Operations & Research Lead to MD at BricksBuilder.co.uk (May 2026 – present): 3,589 properties screened, 2,386 unique postcodes, 2,573 target properties, 350 auction lots and 2 deals completed. Coverage: Liverpool & Wirral, London E1 and Grays.' },
    { k: ['achievement', 'strong', 'best', 'result', 'accomplish', 'impressive'], a: 'Three standouts: BDT 12.78Cr Samsung electronics sales (3 years), BDT 2.37Cr Isho Furniture showroom sales (454 orders, 20 months), and an AI-augmented screening pipeline that cut time per property from 165min to 55min (−67%).' },
    { k: ['ai', 'tool', 'automation', 'llm', 'agent', 'tech'], a: 'OpenClaw, AutoClaw, Hermes Agent, LLMs, Chrome CDP automation, prompt engineering and workflow automation — used to run a real property pipeline: scraper → dedupe → screen → rank → audit engine.' },
    { k: ['brrr', 'refurb', 'refinance', 'bmv', 'duv', 'formula', 'model'], a: 'BRRR = Buy-Refurb-Rent-Refinance. His formula: Max Offer = DUV − Refurb − Buying Costs, capped at asking price, 50% bridge / 50% cash financing, hold strategy with refinance exit. DUV comes from sold comparables — no fantasy figures.' },
    { k: ['hire', 'why', 'candidate', 'value', 'strength', 'work with'], a: '11+ years of commercial sales, a verified BDT 15Cr+ track record, deep UK property research capability and an AI-first workflow — an operator who turns data into decisions, not a generic researcher.' },
    { k: ['contact', 'email', 'phone', 'reach', 'linkedin'], a: 'Email sense060994@gmail.com · Phone +880 1795-913204 · LinkedIn /in/fayzur0609 · GitHub fayzur060994.' },
    { k: ['screening', 'pipeline', 'screened', 'postcode', 'number'], a: '3,589 raw listings (PropertyData + Rightmove + auctions) → 2,386 unique postcodes → 2,573 two–three-bed targets → 87 deep analyses → 31 leads · 12 biddable → 2 deals completed.' },
    { k: ['timeline', 'career', 'job', 'work history', 'companies'], a: 'Jadroo (2019–20, Business Development) → Samsung (2021–23, 12.78Cr) → Asian Paints (2023–24, APEC) → Isho (2024–26, 2.37Cr) → BricksBuilder (2026–, Research Lead). Earlier: BNMKS Territory Sales Officer (2016–18).' },
    { k: ['skill', 'expertise', 'capab', 'good at'], a: 'PROPERTY: BRRR, BMV, sourcing, auction analysis, due diligence, refurb analysis. DATA: Excel, research, analytics, reporting. AI: LLMs, agents, automation, workflow design. COMMERCIAL: sales, negotiation, business development, account management.' },
  ];

  function answer(q) {
    const ql = q.toLowerCase();
    let best = null, bestScore = 0;
    KB.forEach((entry) => {
      const score = entry.k.reduce((s, kw) => s + (ql.includes(kw) ? 1 : 0), 0);
      if (score > bestScore) { best = entry; bestScore = score; }
    });
    return best
      ? best.a
      : "I'm a local knowledge engine over Fayzur's verified portfolio. I can answer about his property work, AI tools, career, achievements and contact — try one of the suggested prompts.";
  }

  function addMsg(text, who) {
    const row = document.createElement('div');
    row.className = 'chat-msg ' + who;
    row.innerHTML = '<span class="chat-avatar">' + (who === 'bot' ? '◆' : 'F') + '</span><div class="chat-bubble"></div>';
    row.querySelector('.chat-bubble').textContent = text;
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  function ask(q) {
    if (!q.trim()) return;
    addMsg(q, 'user');
    input.value = '';
    const typing = addMsg('', 'bot');
    typing.classList.add('typing');
    const t0 = performance.now();
    const tick = (now) => {
      const p = (now - t0) / 600;
      if (p < 1) requestAnimationFrame(tick);
      else {
        typing.classList.remove('typing');
        typing.querySelector('.chat-bubble').textContent = answer(q);
        log.scrollTop = log.scrollHeight;
      }
    };
    requestAnimationFrame(tick);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
  });
  suggests.addEventListener('click', (e) => {
    if (e.target.classList.contains('chat-chip')) ask(e.target.textContent);
  });
}

/* ────────────────────────────── NODE GRAPHS (AI network + skills) ────────────────────────────── */
function initNodeGraph(canvasId, fallbackId, graph, opts) {
  const cv = document.getElementById(canvasId);
  if (!cv) return;
  const fb = document.getElementById(fallbackId);
  if (PERF === 'low' || mqCoarse.matches) {
    cv.style.display = 'none';
    if (fb) fb.style.display = 'flex';
    return;
  }
  const ctx = cv.getContext('2d');
  const reduced = mqReduced.matches;
  let W = 0, H = 0, anim = 0, raf = null, visible = false;
  let hover = -1;

  const nodes = [];   // {x,y,r,label,desc,kind,hub,ox,oy,phase}
  const edges = [];   // [aIndex, bIndex, hubToHub]

  graph.hubs.forEach((h, hi) => {
    const hubIdx = nodes.length;
    nodes.push({ x: h.x, y: h.y, r: h.r || 17, label: h.label, desc: h.desc, kind: 'hub', ox: h.x, oy: h.y, phase: hi });
    h.leaves.forEach((leaf, li) => {
      const total = h.leaves.length;
      const ang = (Math.PI * 2 * li) / total + (h.offset || 0);
      const dist = h.leafDist || 0.17;
      nodes.push({
        x: h.x + Math.cos(ang) * dist,
        y: h.y + Math.sin(ang) * dist,
        r: 5, label: leaf.label, desc: leaf.desc, kind: 'leaf',
        hub: hubIdx, ox: h.x + Math.cos(ang) * dist, oy: h.y + Math.sin(ang) * dist,
        phase: li,
      });
      edges.push([hubIdx, nodes.length - 1, false]);
    });
  });
  (graph.hubLinks || []).forEach(([a, b]) => edges.push([a, b, true]));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    W = cv.clientWidth || 600;
    H = cv.clientHeight || 320;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function wrap(text, maxW) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach((wd) => {
      if ((line + ' ' + wd).trim().length > maxW) { lines.push(line.trim()); line = wd; }
      else line += ' ' + wd;
    });
    if (line.trim()) lines.push(line.trim());
    return lines;
  }

  function nodeAt(mx, my) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = n.x * W - mx, dy = n.y * H - my;
      if (Math.sqrt(dx * dx + dy * dy) < Math.max(n.r + 10, 22)) return i;
    }
    return -1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // edges
    edges.forEach(([ai, bi, hubToHub]) => {
      const a = nodes[ai], b = nodes[bi];
      const linked = hover === ai || hover === bi || (hover >= 0 && (nodes[hover].hub === ai || nodes[hover].hub === bi));
      ctx.beginPath();
      ctx.moveTo(a.x * W, a.y * H);
      ctx.lineTo(b.x * W, b.y * H);
      ctx.strokeStyle = linked
        ? 'rgba(89,216,255,0.55)'
        : hubToHub ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)';
      ctx.lineWidth = linked ? 1.6 : 1;
      ctx.stroke();
    });

    // hub-hub ring
    if (graph.hubLinks) {
      // subtle outer ring connecting hubs
    }

    nodes.forEach((n, i) => {
      const px = n.x * W, py = n.y * H;
      const pulse = reduced ? 0 : Math.sin(anim * 2 + n.phase) * 0.12;
      if (n.kind === 'hub') {
        const r = n.r * (1 + pulse * 0.4);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
        grad.addColorStop(0, 'rgba(110,168,255,0.28)');
        grad.addColorStop(1, 'rgba(110,168,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = hover === i ? '#59d8ff' : '#1a2236';
        ctx.fill();
        ctx.strokeStyle = hover === i ? '#7ce2ff' : 'rgba(110,168,255,0.7)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.font = '700 11px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e9ecf4';
        ctx.fillText(n.label, px, py + 4);
      } else {
        const r = n.r * (1 + pulse);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = hover === i || hover === n.hub ? '#00e5a0' : '#6b7288';
        ctx.fill();
        if (hover === i) {
          ctx.font = '600 10px Poppins, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillStyle = '#98a0b6';
          ctx.fillText(n.label, px + 10, py + 4);
        }
      }
    });

    // tooltip
    if (hover >= 0) {
      const n = nodes[hover];
      const px = n.x * W, py = n.y * H;
      const lines = wrap((n.label + ' — ' + n.desc), 34);
      const tw = 210, th = lines.length * 16 + 20;
      let bx = px + 16, by = py - th - 8;
      if (bx + tw > W - 8) bx = px - tw - 16;
      if (by < 8) by = py + 20;
      ctx.fillStyle = 'rgba(10,12,19,0.94)';
      ctx.strokeStyle = 'rgba(89,216,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, tw, th, 10);
      ctx.fill();
      ctx.stroke();
      ctx.font = '600 11px Poppins, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#59d8ff';
      ctx.fillText(n.label, bx + 12, by + 18);
      ctx.font = '400 10.5px Poppins, sans-serif';
      ctx.fillStyle = '#98a0b6';
      lines.forEach((ln, li) => ctx.fillText(ln, bx + 12, by + 34 + li * 15));
    }

    if (!reduced) anim += 0.016;
  }

  function loop() {
    if (!visible) return;
    draw();
    raf = requestAnimationFrame(loop);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!visible) { visible = true; raf = requestAnimationFrame(loop); }
      } else {
        visible = false;
        if (raf) cancelAnimationFrame(raf);
      }
    });
  }, { threshold: 0.15 });
  obs.observe(cv);

  cv.addEventListener('mousemove', (e) => {
    const r = cv.getBoundingClientRect();
    hover = nodeAt(e.clientX - r.left, e.clientY - r.top);
  });
  cv.addEventListener('mouseleave', () => { hover = -1; });
  cv.addEventListener('focus', () => { hover = 0; draw(); });
  cv.addEventListener('blur', () => { hover = -1; draw(); });

  if (reduced) {
    visible = true;
    draw();
  }
}

/* AI network graph */

/* ────────────────────────────── JOURNEY (career) ────────────────────────────── */
function initJourney() {
  const track = document.getElementById('journeyTrack');
  const prev = document.getElementById('jcPrev');
  const next = document.getElementById('jcNext');
  const count = document.getElementById('jcCount');
  if (!track) return;
  const STEP = 322;

  function updateCount() {
    if (!count) return;
    const idx = Math.min(Math.max(Math.round(track.scrollLeft / STEP), 0), 5);
    count.textContent = '0' + (idx + 1) + ' / 06';
  }
  track.addEventListener('scroll', updateCount, { passive: true });
  if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -STEP, behavior: 'smooth' }));
  if (next) next.addEventListener('click', () => track.scrollBy({ left: STEP, behavior: 'smooth' }));
  updateCount();
}

/* ────────────────────────────── ABOUT TILES ────────────────────────────── */
function initAboutTiles() {
  const tiles = document.querySelectorAll('.about-tile');
  const INFO = [
    'Investment research and sourcing — BRRR, BMV, auction analysis, due diligence across 2,386 unique postcodes.',
    'PropertyData research, Excel models, analytics and reporting — every decision backed by verifiable data.',
    'Automation and agents — OpenClaw, AutoClaw, Hermes, LLMs and workflow automation running a real screening pipeline.',
    'Commercial performance — BDT 15Cr+ combined sales across Samsung and Isho, high-ticket closing and negotiation.',
    'Operational thinking — from showroom floor to research lead: systems, reporting and cross-timezone delivery.',
  ];
  tiles.forEach((t, i) => {
    t.addEventListener('click', () => {
      tiles.forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      const bio = document.querySelector('.about-bio');
      if (bio) {
        const p = document.createElement('p');
        p.textContent = INFO[i];
        p.style.cssText = 'border-left:3px solid var(--ice);padding-left:12px;color:var(--text);';
        const old = bio.querySelector('.tile-note');
        if (old) old.remove();
        p.classList.add('tile-note');
        bio.appendChild(p);
      }
    });
  });
}

/* ═══════════════════════════════════════════
   3D CHARTS (vanilla engine, preserved)
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
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
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

    const obs = new IntersectionObserver((entries) => {
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
    }, { threshold: 0.2 });
    obs.observe(cv);
  });
}

/* ── 3D BAR CHART ── */
function draw3DBars(ctx, w, h, t) {
  const cam = chartCam();
  const data = [
    { v: 0.3, l: 'M1', c: '#6ea8ff' },
    { v: 0.63, l: 'M2', c: '#59d8ff' },
    { v: 1.05, l: 'M3', c: '#8b7cf6' },
    { v: 1.44, l: 'M4', c: '#00e5a0' },
    { v: 2.1, l: 'M5', c: '#6ea8ff' },
    { v: 2.37, l: 'M6', c: '#ffb454' },
  ];
  const maxV = 2.37;
  const ox = w / 2, oy = h - 26;
  const barW = 30, barD = 30, step = 52;
  const x0 = -((data.length - 1) * step) / 2;

  const gA = camProject([-160, 0, 40], cam, ox, oy);
  const gB = camProject([160, 0, -40], cam, ox, oy);
  ctx.beginPath();
  ctx.moveTo(gA[0], gA[1]);
  ctx.lineTo(gB[0], gB[1]);
  ctx.strokeStyle = 'rgba(110,168,255,.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  data.forEach((d, i) => {
    const delay = 0.12 + i * 0.1;
    const p = easeOut(Math.min(Math.max((t - delay) / 0.75, 0), 1));
    const hgt = (d.v / maxV) * 135 * p;
    const cx = x0 + i * step;
    const faces = boxFaces(cx, 0, 0, barW, hgt, barD, d.c, cam, ox, oy);
    fillFaces(ctx, faces);
    const lb = camProject([cx, -6, 0], cam, ox, oy);
    ctx.font = '600 10px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#777';
    ctx.fillText(d.l, lb[0], lb[1] + 14);
    if (p > 0.55) {
      const top = camProject([cx, hgt + 8, 0], cam, ox, oy);
      ctx.font = '700 11px Poppins, sans-serif';
      ctx.fillStyle = i === data.length - 1 ? '#ffb454' : '#aaa6c3';
      ctx.fillText(i === data.length - 1 ? d.v + 'Cr' : d.v.toFixed(1), top[0], top[1] - 6);
    }
  });
}

/* ── 3D FUNNEL ── */
function draw3DFunnel(ctx, w, h, t) {
  const cam = chartCam();
  const levels = [
    { wd: 240, label: '3,589 raw', pct: '66%', c: '#6ea8ff' },
    { wd: 190, label: '2,386 unique', pct: '3.6%', c: '#8b7cf6' },
    { wd: 140, label: '87 analysed', pct: '36%', c: '#00e5a0' },
    { wd: 92, label: '31 leads · 12 biddable', pct: '39%', c: '#ff6b9d' },
    { wd: 62, label: '2 deals ✓', pct: '17%', c: '#ffb454' },
  ];
  const ox = w / 2, oy = h - 20;
  const lh = 38, gap = 4;
  let cy = 0;

  for (let i = levels.length - 1; i >= 0; i--) {
    const lv = levels[i];
    const delay = 0.25 + (levels.length - 1 - i) * 0.18;
    const p = easeOut(Math.min(Math.max((t - delay) / 0.5, 0), 1));
    const drop = (1 - p) * -26;
    const cyb = cy + lh;
    const d = lv.wd * 0.42;
    const faces = boxFaces(0, cyb + drop, 0, lv.wd, lh, d, lv.c, cam, ox, oy);
    fillFaces(ctx, faces);
    if (p > 0.5) {
      const lp = camProject([0, cyb - lh / 2 + drop, d / 2 + 1], cam, ox, oy);
      ctx.font = '700 10px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(lv.label, lp[0], lp[1] + 3);
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
  const worldPts = pts.map((v, i) => [-132 + i * 66, ((v - minV) / (maxV - minV)) * 132, 0]);

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
  ctx.strokeStyle = 'rgba(110,168,255,.3)';
  ctx.stroke();

  const p = easeOut(Math.min(t / 1.7, 1));
  const segs = worldPts.length - 1;
  const drawn = p * segs;

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
    ctx.strokeStyle = '#59d8ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(89,216,255,.8)';
    ctx.shadowBlur = 10;
    ctx.stroke();
  }
  ctx.restore();

  worldPts.forEach((wp, i) => {
    const dotP = Math.min(Math.max((drawn - i + 0.4) / 0.6, 0), 1);
    if (dotP <= 0) return;
    const dp = camProject(wp, cam, ox, oy);
    const r = 6 * dotP;
    const grad = ctx.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], r * 2.6);
    const col = i === 0 ? '#ff6b9d' : i === worldPts.length - 1 ? '#00e5a0' : '#8b7cf6';
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.35, col);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(dp[0], dp[1], r * 2.6, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    if (i === 0) {
      ctx.font = '700 10px Poppins, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ff6b9d';
      ctx.fillText('165min', dp[0] + 10, dp[1] - 8);
      ctx.font = '600 9px Poppins, sans-serif';
      ctx.fillStyle = '#777';
      ctx.fillText('Day 1', dp[0] + 10, dp[1] + 16);
    } else if (i === worldPts.length - 1) {
      ctx.font = '700 10px Poppins, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#00e5a0';
      ctx.fillText('55min', dp[0] - 10, dp[1] - 8);
      ctx.font = '600 9px Poppins, sans-serif';
      ctx.fillStyle = '#777';
      ctx.fillText('Day 5', dp[0] - 10, dp[1] + 16);
    }
  });

  if (p > 0.85) {
    const lp = camProject([0, 40, 60], cam, ox, oy);
    ctx.font = '800 14px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8b7cf6';
    ctx.fillText('−67% in 5 days', lp[0], lp[1]);
  }
}

/* ────────────────────────────── FOLDER TREE (repo archive) ────────────────────────────── */
function initFolderTree() {
  const repoBody = document.getElementById('repoBody');
  if (!repoBody) return;
  const folders = [
    { name: 'research_analysis/', icon: '🗄️', color: '#59d8ff', desc: '22 workbooks — Liverpool, E1, Grays, matched, 42-candidate shortlist', items: ['01–07 core workbooks', '20_Liverpool_10_Mile_Matched_Properties.xlsx', '21_BRRR_BMV_42_Candidates_Positive_Lead.xlsx', '22_Liverpool_Wirral_Deep_Analysis_Final.xlsx'] },
    { name: 'case_studies/', icon: '🏠', color: '#8b7cf6', desc: '19 files — 8 properties: checklist + max offer + legal review', items: ['08–11 core deep-dives', '12_Sulby_Avenue', '13_Greenwood_House', '14_Rufford_Road', '15_Exeter_Road', '16_Sandy_Grove', '17_Marlborough', '18_Solicitor_Review_Argent', '19_Parsonage_Deep_Drive'] },
    { name: 'prompt_library/', icon: '🤖', color: '#00e5a0', desc: 'Reusable prompts & agent workflows + master prompts', items: ['property_research/', 'content_production/', 'agent_operations/', 'admin_workflow/', 'Elite_Acquisition_Master_Prompt.md'] },
    { name: 'ai/', icon: '⚙️', color: '#6ea8ff', desc: 'Agent stack + real automation scripts (Chrome CDP scraper, pipeline, rank, audit)', items: ['agent_stack_workflows.md', 'scripts/rightmove_scraper.py', 'scripts/property_pipeline.py', 'scripts/audit_engine.py', 'scripts/OPERATING_MANUAL.md'] },
    { name: 'client_work/', icon: '🤝', color: '#ff6b9d', desc: 'B2B LinkedIn content delivered for client (Ruhrose)', items: ['ruhrose_linkedin/ — briefing, content plan, 5 post series'] },
    { name: 'daily_reports/', icon: '📆', color: '#ffb454', desc: 'Daily research workflow outputs', items: ['Active_Property_Screening_15062026.xlsx', 'BRRR_Analysis_Max_Offer_21072026.xlsx', 'Cross_Checked_Costs_Verified.xlsx'] },
    { name: 'content_samples/', icon: '✍️', color: '#ff6b9d', desc: 'LinkedIn posts, campaigns, personas', items: ['B2B apparel series/', 'personas/', 'voice-guide/'] },
    { name: 'cv/', icon: '📄', color: '#ffb454', desc: 'Property Consultant CV', items: ['Fayzur_Rahman_Property_Consultant_CV.docx'] },
  ];
  folders.forEach((folder) => {
    const row = document.createElement('div');
    row.className = 'folder-row';
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'button');
    row.setAttribute('aria-expanded', 'false');
    row.innerHTML =
      '<span class="folder-chevron">▶</span>' +
      '<span class="folder-icon">' + folder.icon + '</span>' +
      '<span class="folder-name" style="color:' + folder.color + '">' + folder.name + '</span>' +
      '<span class="folder-desc">' + folder.desc + '</span>';
    const children = document.createElement('div');
    children.className = 'folder-children';
    folder.items.forEach((item) => {
      const child = document.createElement('div');
      child.className = 'folder-child';
      child.innerHTML = '<span style="color:' + folder.color + '">└─</span> ' + item;
      children.appendChild(child);
    });
    const toggle = () => {
      const wasOpen = children.classList.contains('open');
      document.querySelectorAll('.folder-children.open').forEach((c) => c.classList.remove('open'));
      document.querySelectorAll('.folder-chevron.open').forEach((c) => c.classList.remove('open'));
      document.querySelectorAll('.folder-row[aria-expanded="true"]').forEach((r) => r.setAttribute('aria-expanded', 'false'));
      if (!wasOpen) {
        children.classList.add('open');
        row.querySelector('.folder-chevron').classList.add('open');
        row.setAttribute('aria-expanded', 'true');
      }
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    repoBody.appendChild(row);
    repoBody.appendChild(children);
  });
}

/* ────────────────────────────── BOOT ────────────────────────────── */
initLoader();
initCursor();
initNav();
initScrollChrome();
initStats();
initReveal();
initParallax();
initMagnetic();
initCommand();
initMap();
initInvFlow();
initAI();
initJourney();
initAboutTiles();
initFolderTree();
init3DCharts();

/* AI + skill node graphs */
const AI_GRAPH = {
  hubs: [
    { x: 0.5, y: 0.14, r: 19, label: 'LLM', desc: 'Language models powering research and content', leaves: [
      { label: 'OpenClaw', desc: 'Agent platform' },
      { label: 'AutoClaw', desc: 'Desktop agent runtime' },
      { label: 'Hermes Agent', desc: 'Self-improving agent' },
    ] },
    { x: 0.8, y: 0.34, r: 17, label: 'AGENTS', desc: 'Autonomous research and content agents', leaves: [
      { label: 'Research agents', desc: 'Screening pipelines' },
      { label: 'Content agents', desc: 'LinkedIn B2B series' },
      { label: 'B2B personas', desc: 'Client voice tuning' },
    ] },
    { x: 0.72, y: 0.82, r: 17, label: 'AUTOMATION', desc: 'Workflow automation that removes manual loops', leaves: [
      { label: 'Chrome CDP', desc: 'Bot-block bypass scraping' },
      { label: 'Prompt pipeline', desc: 'Reusable prompt library' },
      { label: 'Audit engine', desc: 'Cost-line verification' },
    ] },
    { x: 0.2, y: 0.76, r: 17, label: 'DATA', desc: 'Research and analytics backbone', leaves: [
      { label: 'PropertyData', desc: 'Listings exports' },
      { label: 'Excel models', desc: 'BRRR workbooks' },
      { label: 'Analytics', desc: 'Funnel and metrics' },
    ] },
    { x: 0.24, y: 0.26, r: 18, label: 'PROPERTY', desc: 'The domain — BRRR, BMV, auctions', leaves: [
      { label: 'BRRR', desc: 'Buy-Refurb-Rent-Refinance' },
      { label: 'BMV', desc: 'Below-market-value' },
      { label: 'Auction DD', desc: 'Legal pack review' },
    ] },
  ],
  hubLinks: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 4]],
};

const SKILL_GRAPH = {
  hubs: [
    { x: 0.22, y: 0.24, r: 19, label: 'PROPERTY', desc: 'Investment research and sourcing', leaves: [
      { label: 'BRRR', desc: 'Buy-Refurb-Rent-Refinance' },
      { label: 'BMV', desc: 'Below-market-value deals' },
      { label: 'Sourcing', desc: 'Rightmove + auction portals' },
      { label: 'Auction DD', desc: 'Legal pack analysis' },
      { label: 'Due Diligence', desc: 'EWS1 · SDLT · tenure' },
      { label: 'Refurb Analysis', desc: 'Cost-tier verification' },
    ] },
    { x: 0.8, y: 0.3, r: 16, label: 'DATA', desc: 'Research and analytics', leaves: [
      { label: 'Excel', desc: 'Financial modelling' },
      { label: 'Research', desc: 'PropertyData exports' },
      { label: 'Analytics', desc: 'Funnel and metrics' },
      { label: 'Reporting', desc: 'Daily workbooks' },
    ] },
    { x: 0.74, y: 0.78, r: 17, label: 'AI', desc: 'Automation and agents', leaves: [
      { label: 'LLMs', desc: 'OpenClaw · AutoClaw · Hermes' },
      { label: 'AI Agents', desc: 'Research + content agents' },
      { label: 'Automation', desc: 'Chrome CDP pipeline' },
      { label: 'Workflow Design', desc: 'Prompt library systems' },
    ] },
    { x: 0.24, y: 0.8, r: 17, label: 'COMMERCIAL', desc: 'Sales and business development', leaves: [
      { label: 'Sales', desc: 'BDT 15Cr+ combined' },
      { label: 'Negotiation', desc: 'High-ticket closing' },
      { label: 'Business Dev', desc: 'Partner + dealer networks' },
      { label: 'Account Mgmt', desc: 'CRM and retention' },
    ] },
  ],
  hubLinks: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]],
};

initNodeGraph('aiNetwork', 'netFallback', AI_GRAPH, {});
initNodeGraph('skillNet', 'skillFallback', SKILL_GRAPH, {});

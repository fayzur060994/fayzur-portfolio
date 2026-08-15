/* ═══════════════════════════════════════════════════════
   FAYZUR RAHMAN — PREMIUM ≠ COMPLEX (V4)
   Vanilla JS · no libraries · GitHub Pages ready
   "Simple interface. Sophisticated technology underneath."
   ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   SINGLE SOURCE OF TRUTH — all statistics.
   Every [data-stat] element reads from here.
   ───────────────────────────────────────────── */
const SITE_STATS = {
  screened: 3589,      // properties screened
  postcodes: 2386,     // unique postcodes
  auction: 350,        // auction lots analysed
  deals: 2,            // deals completed
  towns: 79,           // towns covered
  orders: 454,         // Isho orders · 20 months
  furniture: 2.37,     // BDT Cr Isho sales
  electronics: 12.78,  // BDT Cr Samsung sales
  targets: 2573,       // 2–3 bed targets
  biddable: 12,        // biddable candidates
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
  return mode;
}
const PERF = detectPerf();
const DPR_CAP = PERF === 'high' ? 1.75 : PERF === 'medium' ? 1.25 : 1;

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

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        links.querySelectorAll('a').forEach((l) =>
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id)
        );
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['work', 'property', 'ai', 'career', 'about', 'contact'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });
}

/* ────────────────────────────── SCROLL PROGRESS + BACK TOP ────────────────────────────── */
function initScrollChrome() {
  const bar = document.getElementById('scrollProgress');
  const backTop = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
    if (backTop) backTop.classList.toggle('show', window.scrollY > 520);
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
    el.dataset.final = fmtStat(target);
    el.textContent = fmtStat(target); // never shows 0
  });
  if (mqReduced.matches) return;

  function animate(el) {
    const target = parseFloat(SITE_STATS[el.dataset.stat]);
    const isInt = Number.isInteger(target);
    const finalText = el.dataset.final;
    const dur = 1200;
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
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  els.forEach((el) => obs.observe(el));
}

/* ────────────────────────────── REVEAL ────────────────────────────── */
function initReveal() {
  const sel = [
    '.cap-card', '.ps-card', '.chart-card', '.case-card', '.tl-item',
    '.about-line', '.as-item', '.ai-step', '.ai-tools span', '.sec-head',
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
  document.querySelectorAll('.cap-card, .ps-card, .tl-item, .case-card').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.07 + 's';
  });
}

/* ────────────────────────────── MAGNETIC BUTTONS ────────────────────────────── */
function initMagnetic() {
  if (!mqFine.matches || mqReduced.matches) return;
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.14;
      const y = (e.clientY - r.top - r.height / 2) * 0.14;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
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

function buildBox(sizeX, sizeY, sizeZ) {
  const hx = sizeX / 2, hy = sizeY / 2, hz = sizeZ / 2;
  const v = [
    [-hx, -hy, -hz], [hx, -hy, -hz], [hx, hy, -hz], [-hx, hy, -hz],
    [-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz],
  ];
  const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return { v, edges };
}

/* ── "PROPERTY INTELLIGENCE" city grid (fixed background) ── */
(function initCityGrid() {
  const canvas = document.getElementById('cityGrid');
  if (!canvas || PERF === 'low') return;
  const ctx = canvas.getContext('2d');
  let w, h, time = 0;
  let mx = 0, my = 0, tx = 0, ty = 0;
  const DPR = Math.min(window.devicePixelRatio || 1, DPR_CAP);

  const N = PERF === 'medium' ? 26 : 42;
  const blocks = [];
  for (let i = 0; i < N; i++) {
    const size = 26 + Math.random() * 46;
    blocks.push({
      geo: buildBox(size, size * (0.6 + Math.random() * 1.8), size),
      x: (Math.random() - 0.5) * 520,
      z: (Math.random() - 0.5) * 520,
      ry: Math.random() * Math.PI * 2,
      speed: 0.0004 + Math.random() * 0.0012,
      h: 0.5 + Math.random() * 0.5,
    });
  }
  // data points (location nodes)
  const nodes = [];
  for (let i = 0; i < 26; i++) {
    nodes.push({
      x: (Math.random() - 0.5) * 560,
      y: (Math.random() - 0.5) * 180,
      z: (Math.random() - 0.5) * 560,
      r: 1.2 + Math.random() * 1.6,
      accent: Math.random() < 0.4,
    });
  }
  // connecting lines between nearby nodes
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dz = nodes[i].z - nodes[j].z;
      if (dx * dx + dy * dy + dz * dz < 260 * 260) links.push([i, j]);
    }
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    tx = (e.clientX / w - 0.5) * 2;
    ty = (e.clientY / h - 0.5) * 2;
  }, { passive: true });

  let visible = true;
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) requestAnimationFrame(tick);
  });

  const rotY = PERF === 'medium' ? 0.12 : 0.22; // very slow

  function tick() {
    if (!visible) return;
    time += 0.0016;
    mx += (tx - mx) * 0.02;
    my += (ty - my) * 0.02;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2 + mx * 14;
    const cy = h * 0.44 + my * 10;
    const fov = 620;
    const camY = rotY * Math.sin(time * 0.35) + 0.55;

    // data links (thin lines)
    ctx.lineWidth = 1;
    for (const [a, b] of links) {
      const pa = nodes[a], pb = nodes[b];
      let [ax, ay, az] = R3D.rotY(pa.x, pa.y, pa.z, camY);
      let [bx, by, bz] = R3D.rotY(pb.x, pb.y, pb.z, camY);
      const s1 = R3D.project(ax, ay, az, fov, cx, cy);
      const s2 = R3D.project(bx, by, bz, fov, cx, cy);
      ctx.beginPath();
      ctx.moveTo(s1[0], s1[1]);
      ctx.lineTo(s2[0], s2[1]);
      ctx.strokeStyle = pa.accent || pb.accent
        ? 'rgba(198,240,78,0.10)'
        : 'rgba(255,255,255,0.05)';
      ctx.stroke();
    }

    // city blocks (wireframe, calm)
    for (const b of blocks) {
      b.ry += b.speed;
      const pts = [];
      let sumScale = 0;
      for (const v of b.geo.v) {
        let [x, y, z] = R3D.rotY(v[0], v[1], v[2], b.ry);
        x += b.x; y += 0; z += b.z;
        let [rx, ry, rz] = R3D.rotY(x, y, z, camY);
        const [sx, sy, sc] = R3D.project(rx * b.h, ry * b.h, rz * b.h, fov, cx, cy);
        pts.push([sx, sy]);
        sumScale += sc;
      }
      const alpha = 0.10 + (sumScale / 8) * 0.22;
      for (const [e1, e2] of b.geo.edges) {
        ctx.beginPath();
        ctx.moveTo(pts[e1][0], pts[e1][1]);
        ctx.lineTo(pts[e2][0], pts[e2][1]);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // accent roof dot on some blocks
      if (b.h > 1.1) {
        const top = R3D.rotY(b.x, b.geo.v[6][1] * b.h, b.z, camY);
        const [sx, sy, sc] = R3D.project(top[0], top[1], top[2], fov, cx, cy);
        if (sc > 0.3) {
          ctx.beginPath();
          ctx.arc(sx, sy, 1.6 * sc, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(198,240,78,0.5)';
          ctx.globalAlpha = 0.35;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // data points
    for (const p of nodes) {
      let [x, y, z] = R3D.rotY(p.x, p.y, p.z, camY);
      const [sx, sy, sc] = R3D.project(x, y, z, fov, cx, cy);
      if (sc > 0.4) {
        ctx.beginPath();
        ctx.arc(sx, sy, p.r * sc, 0, Math.PI * 2);
        ctx.fillStyle = p.accent ? 'rgba(198,240,78,0.75)' : 'rgba(255,255,255,0.5)';
        ctx.globalAlpha = 0.5 * sc;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ────────────────────────────── PORTRAIT PARALLAX ────────────────────────────── */
function initPortraitParallax() {
  const visual = document.querySelector('.hero-visual');
  if (!visual || !mqFine.matches || mqReduced.matches) return;
  const frame = visual.querySelector('.portrait-frame');
  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    if (frame) frame.style.transform = `rotateY(${nx * 5}deg) rotateX(${-ny * 4}deg)`;
    visual.style.transform = `translate(${nx * 6}px, ${ny * 6}px)`;
  }, { passive: true });
}

/* ────────────────────────────── UK MAP ────────────────────────────── */
function initMap() {
  const svg = document.getElementById('ukMap');
  const tip = document.getElementById('mapTip');
  if (!svg || !tip) return;

  const POINTS = [
    { name: 'Liverpool', x: 108, y: 276, labelSide: 'r', note: 'L postcodes · 79 towns', detail: 'City Centre 150 · Toxteth 54 · Everton 25 · Walton 24' },
    { name: 'Wirral', x: 96, y: 288, labelSide: 'r', note: 'Deep analysis', detail: 'Wirral Deep Analysis · 04.07.2026' },
    { name: '10-Mile Radius', x: 120, y: 262, labelSide: 'l', labelX: -18, note: 'Matched properties', detail: 'Liverpool 10-mile matched workbook' },
    { name: 'London E1', x: 170, y: 348, labelSide: 'r', labelX: 16, note: '53 properties', detail: '40-min commute band · standard sale BRRR' },
    { name: 'Grays', x: 190, y: 352, labelSide: 'l', labelX: -16, note: 'RM17 · freehold', detail: '10-property comparison · max-offer maths' },
  ];

  const dotsG = document.getElementById('mapDots');
  const labelsG = document.getElementById('mapLabels');

  POINTS.forEach((pt) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'map-dot');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', pt.name + ' — ' + pt.note);
    const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    halo.setAttribute('cx', pt.x); halo.setAttribute('cy', pt.y); halo.setAttribute('r', 13);
    halo.setAttribute('fill', 'rgba(198,240,78,0.12)');
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); dot.setAttribute('r', 5);
    dot.setAttribute('fill', '#c6f04e');
    dot.setAttribute('stroke', '#0a0b0d'); dot.setAttribute('stroke-width', '1.5');
    g.appendChild(halo);
    g.appendChild(dot);
    dotsG.appendChild(g);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('class', 'map-label');
    label.setAttribute('x', pt.labelSide === 'r' ? pt.x + (pt.labelX || 12) : pt.x - (pt.labelX ? -pt.labelX : 10));
    label.setAttribute('y', pt.y + 4);
    label.setAttribute('text-anchor', pt.labelSide === 'r' ? 'start' : 'end');
    label.textContent = pt.name;
    labelsG.appendChild(label);

    const show = () => {
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

  const style = document.createElement('style');
  style.textContent = '.map-label { fill:#9aa39a; font-size:9.5px; font-family:Inter,sans-serif; letter-spacing:.06em; pointer-events:none; }';
  document.head.appendChild(style);
}

/* ═══════════════════════════════════════════
   3D CHARTS (vanilla engine)
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
    { idx: [0, 1, 5, 4], color: shadeHex(color, 40) },
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
      const h = cv.clientHeight || 240;
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
      const h = cv.clientHeight || 240;
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

/* ── 3D FUNNEL (calm grey + accent) ── */
function draw3DFunnel(ctx, w, h, t) {
  const cam = chartCam();
  const levels = [
    { wd: 240, label: '3,589 raw', pct: '66%', c: '#3a4048' },
    { wd: 190, label: '2,386 unique', pct: '3.6%', c: '#454c56' },
    { wd: 140, label: '87 analysed', pct: '36%', c: '#525a66' },
    { wd: 92, label: '31 leads · 12 biddable', pct: '39%', c: '#6d756d' },
    { wd: 62, label: '2 deals ✓', pct: '17%', c: '#c6f04e' },
  ];
  const ox = w / 2, oy = h - 24; // baseline: bottom level rests on oy; levels stack UPWARD (−y)
  const lh = 38, gap = 4;

  for (let i = levels.length - 1; i >= 0; i--) {
    const lv = levels[i];
    const delay = 0.25 + (levels.length - 1 - i) * 0.18;
    const p = easeOut(Math.min(Math.max((t - delay) / 0.5, 0), 1));
    const drop = (1 - p) * 30; // start below the baseline, rise into place
    const cyb = -((levels.length - 1 - i) * (lh + gap) + lh);
    const d = lv.wd * 0.42;
    const faces = boxFaces(0, cyb + drop, 0, lv.wd, lh, d, lv.c, cam, ox, oy);
    fillFaces(ctx, faces);
    if (p > 0.5) {
      const lp = camProject([0, cyb - lh / 2 + drop, d / 2 + 1], cam, ox, oy);
      ctx.font = '600 10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = i === levels.length - 1 ? '#0a0b0d' : '#f2f4ef';
      ctx.fillText(lv.label, lp[0], lp[1] + 3);
      const pp = camProject([lv.wd / 2 + 26, cyb - lh / 2 + drop, 0], cam, ox, oy);
      ctx.font = '500 9px Inter, sans-serif';
      ctx.fillStyle = '#9aa39a';
      ctx.fillText(lv.pct, pp[0], pp[1] + 3);
    }
  }
}

/* ── 3D LINE (accent stroke) ── */
function draw3DLine(ctx, w, h, t) {
  const cam = chartCam();
  const pts = [165, 130, 108, 85, 55];
  const ox = w / 2, oy = h - 30;
  const minV = 55, maxV = 165;
  // analysis time falls over the week: 165min (top) → 55min (bottom)
  const worldPts = pts.map((v, i) => [-132 + i * 66, -((v - minV) / (maxV - minV)) * 132, 0]);

  for (let gx = -132; gx <= 132; gx += 66) {
    const a = camProject([gx, 0, -36], cam, ox, oy);
    const b = camProject([gx, 0, 36], cam, ox, oy);
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.stroke();
  }
  const fA = camProject([-132, 0, 0], cam, ox, oy);
  const fB = camProject([132, 0, 0], cam, ox, oy);
  ctx.beginPath();
  ctx.moveTo(fA[0], fA[1]);
  ctx.lineTo(fB[0], fB[1]);
  ctx.strokeStyle = 'rgba(198,240,78,0.25)';
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
    ctx.strokeStyle = '#c6f04e';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(198,240,78,0.6)';
    ctx.shadowBlur = 8;
    ctx.stroke();
  }
  ctx.restore();

  worldPts.forEach((wp, i) => {
    const dotP = Math.min(Math.max((drawn - i + 0.4) / 0.6, 0), 1);
    if (dotP <= 0) return;
    const dp = camProject(wp, cam, ox, oy);
    const r = 5.5 * dotP;
    const grad = ctx.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], r * 2.6);
    const col = i === 0 ? '#9aa39a' : i === worldPts.length - 1 ? '#c6f04e' : '#6d756d';
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.35, col);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(dp[0], dp[1], r * 2.6, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    if (i === 0) {
      ctx.font = '600 10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#9aa39a';
      ctx.fillText('165min', dp[0] + 10, dp[1] - 8);
      ctx.font = '500 9px Inter, sans-serif';
      ctx.fillStyle = '#6d756d';
      ctx.fillText('Day 1', dp[0] + 10, dp[1] + 16);
    } else if (i === worldPts.length - 1) {
      ctx.font = '600 10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#c6f04e';
      ctx.fillText('55min', dp[0] - 10, dp[1] - 8);
      ctx.font = '500 9px Inter, sans-serif';
      ctx.fillStyle = '#6d756d';
      ctx.fillText('Day 5', dp[0] - 10, dp[1] + 16);
    }
  });

  if (p > 0.85) {
    const lp = camProject([0, -86, 60], cam, ox, oy);
    ctx.font = '700 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c6f04e';
    ctx.fillText('−67% in 5 days', lp[0], lp[1]);
  }
}

/* ────────────────────────────── FAYZUR AI (local knowledge engine) ────────────────────────────── */
function initAI() {
  const log = document.getElementById('chatLog');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const suggests = document.getElementById('chatSuggests');
  if (!log || !form || !input) return;

  /* Structured portfolio knowledge — the only source the assistant answers from. */
  const KB = [
    {
      k: ['do', 'specialise', 'specialize', 'who', 'about', 'position', 'work'],
      a: 'Fayzur works at the intersection of PROPERTY × AI × DATA × RESEARCH × SALES — UK property sourcing and analysis, AI-assisted research automation, and 11+ years of commercial sales. Headline: "I turn property data into better decisions."',
    },
    {
      k: ['property', 'research', 'screen', 'brrr', 'bmv', 'auction'],
      a: '3,589+ properties screened across PropertyData exports, Rightmove and auction portals → 2,386 unique postcodes → 350 auction lots analysed → 2 deals completed. Focus areas: Liverpool & Wirral (79 towns), London E1 (53 properties), Grays/Chafford Hundred (freehold focus).',
    },
    {
      k: ['ai', 'tool', 'automation', 'llm', 'agent', 'n8n', 'api', 'excel'],
      a: 'AI-assisted research, workflow automation, LLMs, OpenClaw, AutoClaw, Hermes agents, n8n, APIs, Excel and data analysis — used to run a screening pipeline that cut time per property from 165min to 55min (−67%).',
    },
    {
      k: ['career', 'timeline', 'job', 'experience', 'history', 'companies'],
      a: 'BNMKS — Territory Sales Officer (2016–18) → Jadroo — Business Development Executive (2019–20) → Samsung — Experience Consultant, BDT 12.78Cr sales (2021–23) → Asian Paints — APEC Consultant (2023–24) → Isho Furniture — Assistant Manager, BDT 2.37Cr sales (2024–26) → BricksBuilder — Operations & Research Lead to MD (2026–present).',
    },
    {
      k: ['sales', 'achievement', 'result', 'track', 'samsung', 'isho'],
      a: 'Verified results: BDT 12.78Cr Samsung electronics sales over 3 years; BDT 2.37Cr Isho Furniture showroom sales (454 orders, 20 months); 3,589+ properties screened; 2 property deals completed.',
    },
    {
      k: ['contact', 'email', 'phone', 'reach', 'linkedin'],
      a: 'Email sense060994@gmail.com · Phone +880 1795-913204 · LinkedIn /in/fayzur0609 · GitHub fayzur060994.',
    },
    {
      k: ['skill', 'good at', 'strength', 'expertise'],
      a: 'Property research and due diligence · AI-assisted workflow automation · sales, negotiation and high-value closing · operations and reporting · Excel and data analysis.',
    },
    {
      k: ['hire', 'why', 'value', 'work with'],
      a: 'A commercially experienced operator who uses AI to move faster: 11+ years of sales, a verified BDT 15Cr+ track record, deep UK property research capability and an automation-first workflow.',
    },
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
      : "I don't have that information in Fayzur's portfolio yet. Try one of the suggested questions — property, AI tools, career or sales.";
  }

  function addMsg(text, who) {
    const row = document.createElement('div');
    row.className = 'chat-msg ' + who;
    row.innerHTML = '<span class="chat-avatar">' + (who === 'bot' ? 'F' : 'You') + '</span><div class="chat-bubble"></div>';
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
      if ((now - t0) / 620 < 1) requestAnimationFrame(tick);
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

/* ────────────────────────────── BOOT ────────────────────────────── */
initNav();
initScrollChrome();
initStats();
initReveal();
initMagnetic();
initPortraitParallax();
initMap();
init3DCharts();
initAI();

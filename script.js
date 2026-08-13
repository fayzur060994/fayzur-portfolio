/* Fayzur Rahman Portfolio — interactions */

/* ── Particle network background (animated) ── */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const COUNT = 70;
  const LINK_DIST = 140;
  const COLORS = ['#00a6e2', '#4d65ff', '#13ce66', '#ff659d', '#9b0984'];

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
    ctx.clearRect(0, 0, w, h);
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
          ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.35;
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

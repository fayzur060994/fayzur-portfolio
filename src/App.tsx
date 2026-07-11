import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, MeshDistortMaterial, Sphere, Torus, Icosahedron } from '@react-three/drei'
import { motion } from 'framer-motion'
import {
  Mail, Phone, Brain, Building2, TrendingUp,
  Cpu, Sparkles, ArrowRight, ExternalLink, Award, BookOpen, Zap,
  Target, Users, BarChart3, Code, Bot, FileText, Briefcase
} from 'lucide-react'
import './App.css'

// ============== 3D SCENE ==============
function FloatingShape({ position, color, geometry, speed = 1, scale = 1 }: any) {
  const meshRef = useRef<any>(null)
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
    }
  })
  return (
    <Float speed={2 * speed} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry === 'sphere' && <Sphere args={[1, 64, 64]} />}
        {geometry === 'torus' && <Torus args={[1, 0.4, 16, 100]} />}
        {geometry === 'icosahedron' && <Icosahedron args={[1, 0]} />}
        <MeshDistortMaterial
          color={color}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
      <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, 0, 5]} intensity={1} color="#06b6d4" />
      <Suspense fallback={null}>
        <FloatingShape position={[-2, 1, 0]} color="#3b82f6" geometry="icosahedron" speed={0.8} scale={1.2} />
        <FloatingShape position={[2, -1, 0]} color="#8b5cf6" geometry="sphere" speed={1} scale={1} />
        <FloatingShape position={[0, 1.5, -1]} color="#06b6d4" geometry="torus" speed={1.2} scale={0.8} />
        <FloatingShape position={[-1.5, -1.5, 0]} color="#a78bfa" geometry="icosahedron" speed={0.9} scale={0.6} />
        <FloatingShape position={[1.8, 1.2, -1]} color="#60a5fa" geometry="sphere" speed={1.1} scale={0.7} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}

// ============== DATA ==============
const stats = [
  { value: '10+', label: 'Years Experience' },
  { value: '1,274', label: 'Properties Screened' },
  { value: '31', label: 'Positive Leads Found' },
  { value: '67%', label: 'Time Reduction' },
]

const skills = [
  {
    icon: Bot,
    title: 'AI Agent Orchestration',
    description: 'Local agent stack on Windows — no cloud control plane.',
    tags: ['OpenClaw', 'AutoClaw', 'Hermes Agent', 'Nous Research']
  },
  {
    icon: Cpu,
    title: 'Multi-Model LLM',
    description: 'Orchestrate multiple LLM backends for different task types.',
    tags: ['GLM-5.2', 'Gemini', 'Owl-2', 'Multimodal']
  },
  {
    icon: Building2,
    title: 'UK Property Research',
    description: 'End-to-end deal sourcing, due diligence, BRRR calculations.',
    tags: ['BRRR', 'Due Diligence', 'Legal Pack Review', 'SDLT']
  },
  {
    icon: TrendingUp,
    title: 'Sales & Marketing',
    description: '10+ years across premium retail, B2B, e-commerce.',
    tags: ['Samsung', 'Asian Paints', 'Isho', 'Customer Psychology']
  },
  {
    icon: FileText,
    title: 'B2B Content Production',
    description: 'Persona-driven content for apparel buying house audience.',
    tags: ['LinkedIn', 'Voice Design', 'Persona', 'Series Planning']
  },
  {
    icon: Sparkles,
    title: 'Prompt Engineering',
    description: 'System prompts, agent handoff, structured output, persistent memory.',
    tags: ['System Prompts', 'Agent Handoff', 'JSON Schema', 'Skill Files']
  },
]

const experiences = [
  {
    date: 'Apr 2026 — Present',
    title: 'Personal Secretary to the Managing Director',
    company: 'BricksBuilder (UK Property) + Ruhrose RBT (Apparel Buying House)',
    description: 'Remote right-hand to UK-based MD. 70% Property Research, 10% Marketing, 15% Admin, 5% Seasonal Projects. Lead UK property deal sourcing, due diligence, BRRR calculations. Delivered Liverpool & Wirral deep-dive in 5 working days — 1,274 properties screened to 31 positive leads and 12 biddable auctions. Reduced per-property research time 2-3 hours to 45-60 min using local AI agent stack.',
  },
  {
    date: 'Oct 2024 — Mar 2026',
    title: 'Assistant Manager, Showroom Operations',
    company: 'Isho Furniture (Dekko Isho Ltd.)',
    description: 'Managed premium furniture showroom operations, supervised sales executives, coordinated stock with warehouse and logistics teams, resolved customer complaints, acted as Showroom Manager in absence.',
  },
  {
    date: 'Nov 2023 — Sep 2024',
    title: 'APEC (Area Product Experience Consultant)',
    company: 'Asian Paints Bangladesh Ltd.',
    description: 'Guided customers on paint colors and design options, set up product demos and color trials, trained painters and contractors, collected customer insights for product teams.',
  },
  {
    date: 'Jan 2021 — Oct 2023',
    title: 'Samsung Experience Consultant',
    company: 'Samsung Consumer Electronics (via Market Access Provider Ltd.)',
    description: 'Managed showroom sales operations, generated qualified leads, analyzed competitor activity, conducted hygiene audits and POP/POSM compliance, trained team members on new product launches.',
  },
  {
    date: 'Jan 2019 — Dec 2020',
    title: 'Business Development Executive',
    company: 'Jadroo.com',
    description: 'Developed organizational changes for e-business strategy, identified business partners, managed product inventory and e-commerce platform operations.',
  },
  {
    date: 'Jan 2016 — Nov 2018',
    title: 'Territory Sales Officer (TSO)',
    company: 'BNMKS',
    description: 'Developed territory sales strategies, performed retail mapping, generated leads, closed deals, established new dealer networks, trained new team members.',
  },
]

const portfolioItems = [
  {
    tag: 'UK Property',
    title: 'Liverpool & Wirral Property Deep-Dive',
    description: '1,274 properties screened in 5 working days → 31 positive leads → 12 biddable auctions. 8 worksheets including BRRR calc, bid logic, market notes.',
    link: 'https://github.com/fayzur060994/portfolio',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  },
  {
    tag: 'AI Stack',
    title: 'Local AI Agent Architecture',
    description: '4-layer architecture: Operator → Agent Orchestrators (OpenClaw, AutoClaw, Hermes) → LLM Backends (GLM-5.2, Gemini, Owl-2) → Business Outputs.',
    link: 'https://github.com/fayzur060994/portfolio',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
  {
    tag: 'Performance',
    title: 'Per-Property Research Speed',
    description: 'Reduced research time from 165 min (Day 1) to 55 min (Day 5) — 67% improvement in first working week via prompt iteration and Hermes skill files.',
    link: 'https://github.com/fayzur060994/portfolio',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
  },
  {
    tag: 'B2B Content',
    title: 'Apparel Sourcing LinkedIn Series',
    description: 'Persona-driven content for fashion buyers and sourcing managers. Voice design, hook variety, engagement-driven CTAs.',
    link: 'https://github.com/fayzur060994/portfolio',
    gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)',
  },
  {
    tag: 'Sales',
    title: '10+ Years Premium Retail',
    description: 'Samsung, Asian Paints, Isho, Jadroo. Showroom operations, team training, customer psychology, cross-functional coordination.',
    link: 'https://github.com/fayzur060994/portfolio',
    gradient: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
  },
  {
    tag: 'Prompt Engineering',
    title: 'Reusable Prompt Library',
    description: '10-15 prompts across property research, content production, agent operations, admin. Each documented with failure modes and iteration notes.',
    link: 'https://github.com/fayzur060994/portfolio',
    gradient: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
  },
]

const certifications = [
  {
    name: 'Business Administration Pathway',
    issuer: 'Saylor Academy (ACE-credit eligible)',
    status: 'In Progress',
    progress: 25,
  },
  {
    name: 'Digital Marketing Certification',
    issuer: 'Google Skillshop',
    status: 'Planned',
    progress: 0,
  },
  {
    name: 'Inbound Sales Certification',
    issuer: 'HubSpot Academy',
    status: 'Planned',
    progress: 0,
  },
  {
    name: 'Social Media Marketing',
    issuer: 'Meta (via Coursera)',
    status: 'Planned',
    progress: 0,
  },
]

const contacts = [
  { icon: Mail, label: 'Email', value: 'sense060994@gmail.com', link: 'mailto:sense060994@gmail.com' },
  { icon: Phone, label: 'Phone', value: '+880 1795-913204', link: 'tel:+8801795913204' },
  { icon: Brain, label: 'LinkedIn', value: 'fayzur-rahman', link: 'https://linkedin.com/in/fayzur-rahman' },
  { icon: Code, label: 'GitHub', value: 'fayzur060994', link: 'https://github.com/fayzur060994' },
]

// ============== COMPONENTS ==============
function Navbar() {
  const links = ['About', 'Skills', 'Experience', 'Portfolio', 'Certifications', 'Contact']
  return (
    <nav className="navbar">
      <div className="container">
        <a href="#hero" className="navbar-logo">FR.</a>
        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`}>{link}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="container">
        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">
              Available for EU relocation
            </div>
            <h1 className="hero-title">
              Fayzur Rahman
              <br />
              <span className="gradient-text">AI-Augmented Operations</span>
              <br />
              & Research Lead
            </h1>
            <p className="hero-subtitle">
              10+ years sales & marketing → UK property research + AI agent orchestration
            </p>
            <p className="hero-description">
              Currently serving as remote right-hand to a UK-based MD across two businesses.
              Leading UK property deal sourcing, BRRR calculations, due diligence, and B2B
              content production — augmented by a local AI agent stack (OpenClaw, AutoClaw, Hermes Agent).
            </p>
            <div className="hero-cta">
              <a href="#portfolio" className="btn btn-primary">
                View Portfolio <ArrowRight size={18} />
              </a>
              <a href="#contact" className="btn btn-secondary">
                Get in Touch
              </a>
            </div>
          </motion.div>
          <motion.div
            className="hero-3d"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <Scene3D />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag">// ABOUT</div>
          <h2 className="section-title">Tech-savvy operations, research & marketing professional</h2>
          <p className="section-subtitle">
            Rapid adopter of new tools — picks up unfamiliar domains, AI stacks, and analytic
            frameworks quickly. Polymath mindset connecting skills across sales, marketing, AI
            orchestration, UK property finance, and B2B content.
          </p>
        </motion.div>
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag">// SKILLS</div>
          <h2 className="section-title">What I Bring</h2>
          <p className="section-subtitle">
            Six core capability areas spanning AI, property, sales, marketing, and content.
          </p>
        </motion.div>
        <div className="skills-grid">
          {skills.map((skill, i) => {
            const Icon = skill.icon
            return (
              <motion.div
                key={i}
                className="skill-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="skill-icon">
                  <Icon size={24} />
                </div>
                <h3 className="skill-title">{skill.title}</h3>
                <p className="skill-description">{skill.description}</p>
                <div className="skill-tags">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="skill-tag">{tag}</span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag">// EXPERIENCE</div>
          <h2 className="section-title">10+ Years Across Industries</h2>
          <p className="section-subtitle">
            From B2B territory sales to AI-augmented operations for a UK principal.
          </p>
        </motion.div>
        <div className="timeline">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              className="timeline-item"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-date">{exp.date}</div>
                <h3 className="timeline-title">{exp.title}</h3>
                <div className="timeline-company">{exp.company}</div>
                <p className="timeline-description">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Portfolio() {
  return (
    <section id="portfolio" className="section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag">// PORTFOLIO</div>
          <h2 className="section-title">Selected Work</h2>
          <p className="section-subtitle">
            Real outputs from current role and 10+ years of experience.
          </p>
        </motion.div>
        <div className="portfolio-grid">
          {portfolioItems.map((item, i) => (
            <motion.a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="portfolio-image" style={{ background: item.gradient }} />
              <div className="portfolio-content">
                <span className="portfolio-tag">{item.tag}</span>
                <h3 className="portfolio-title">{item.title}</h3>
                <p className="portfolio-description">{item.description}</p>
                <span className="portfolio-link">
                  View on GitHub <ExternalLink size={14} />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Certifications() {
  return (
    <section id="certifications" className="section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag">// LEARNING</div>
          <h2 className="section-title">Continuous Development</h2>
          <p className="section-subtitle">
            Currently studying and planned certifications for the next 6-12 months.
          </p>
        </motion.div>
        <div className="cert-grid">
          {certifications.map((cert, i) => (
            <motion.div
              key={i}
              className="cert-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className={`cert-status ${cert.status === 'In Progress' ? 'cert-in-progress' : 'cert-planned'}`}>
                {cert.status}
              </span>
              <h3 className="cert-name">{cert.name}</h3>
              <p className="cert-issuer">{cert.issuer}</p>
              <div className="cert-progress">
                <div className="cert-progress-bar" style={{ width: `${cert.progress}%` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag">// CONTACT</div>
          <h2 className="section-title">Let's Connect</h2>
          <p className="section-subtitle">
            Open to AI-augmented Operations, Research Operations, Property Analyst, or Marketing
            Operations roles in Germany (Chancenkarte route) and other EU member states.
          </p>
        </motion.div>
        <div className="contact-cards">
          {contacts.map((contact, i) => {
            const Icon = contact.icon
            return (
              <motion.a
                key={i}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Icon className="contact-icon" size={32} />
                <div className="contact-label">{contact.label}</div>
                <div className="contact-value">{contact.value}</div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-text">
          Fayzur Rahman · Dubai, UAE · Open to EU relocation
        </p>
        <p className="footer-tech">
          Built with React + Vite + Three.js + Framer Motion
        </p>
      </div>
    </footer>
  )
}

// ============== MAIN APP ==============
function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Portfolio />
      <Certifications />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
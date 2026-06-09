import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, Mail, ArrowRight, Menu, X, ExternalLink, 
  Code2, Sparkles, Layers, Cpu, Globe, Award, Check, Send
} from 'lucide-react';
import { gsap } from 'gsap';
import * as THREE from 'three';

// Custom SVG Icons for GitHub and LinkedIn to avoid dependency mismatches
const Github = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// 3D Canvas component inside the Hero section
const Hero3DCanvas = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      60, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create Geometries & Materials
    // Outer mesh: Torus Knot (cyan wireframe)
    const torusKnotGeo = new THREE.TorusKnotGeometry(2, 0.45, 120, 16);
    const torusKnotMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, // Neon Cyan
      wireframe: true, 
      transparent: true, 
      opacity: 0.35 
    });
    const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    scene.add(torusKnot);

    // Inner mesh: Icosahedron (magenta wireframe)
    const icosahedronGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const icosahedronMat = new THREE.MeshBasicMaterial({ 
      color: 0xec4899, // Hot Magenta
      wireframe: true, 
      transparent: true, 
      opacity: 0.55 
    });
    const icosahedron = new THREE.Mesh(icosahedronGeo, icosahedronMat);
    scene.add(icosahedron);

    // Dynamic particles background (parallax stars)
    const particlesCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20; // x
      positions[i + 1] = (Math.random() - 0.5) * 20; // y
      positions[i + 2] = (Math.random() - 0.5) * 15; // z
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0x7c3aed, // Violet
      size: 0.08,
      transparent: true,
      opacity: 0.8
    });

    const starfield = new THREE.Points(particlesGeo, particlesMat);
    scene.add(starfield);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Mouse interactive variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Rotate geometries
      torusKnot.rotation.x = elapsedTime * 0.15;
      torusKnot.rotation.y = elapsedTime * 0.2;

      icosahedron.rotation.x = -elapsedTime * 0.3;
      icosahedron.rotation.y = -elapsedTime * 0.25;

      // Slow particle rotation
      starfield.rotation.y = elapsedTime * 0.02;

      // Smooth mouse follow (interpolation/easing)
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Apply subtle camera/scene tilt based on mouse
      scene.rotation.y = targetX * 0.3;
      scene.rotation.x = -targetY * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      torusKnotGeo.dispose();
      torusKnotMat.dispose();
      icosahedronGeo.dispose();
      icosahedronMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

// 3D Card Tilt Component for Projects
const TiltCard = ({ children, className, ...props }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Calculate rotation angles (max 10 degrees)
    const rotateX = -(y / (box.height / 2)) * 10;
    const rotateY = (x / (box.width / 2)) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} transition-all duration-100 ease-out`}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </div>
  );
};

// Falling Matrix Rain overlay (Easter Egg)
const MatrixRain = ({ onClose }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const cols = Math.floor(width / 20) + 1;
    const ypos = Array(cols).fill(0);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const matrix = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#06b6d4'; // Cyan Matrix rain to match our palette
      ctx.font = '14px "JetBrains Mono", monospace';

      ypos.forEach((y, ind) => {
        const text = String.fromCharCode(33 + Math.floor(Math.random() * 93));
        const x = ind * 20;
        ctx.fillText(text, x, y);

        if (y > 100 + Math.random() * 10000) {
          ypos[ind] = 0;
        } else {
          ypos[ind] = y + 20;
        }
      });
    };

    const interval = setInterval(matrix, 40);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black/95">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="relative z-10 p-8 max-w-lg text-center glass-card rounded-2xl border-cyan-glow/50 m-4 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
        <h2 className="text-3xl font-bebas text-cyan-glow tracking-widest mb-4">ACCESS GRANTED: EASTER EGG FOUND</h2>
        <div className="font-jetbrains text-xs text-left text-gray-300 space-y-3 bg-black/60 p-4 rounded border border-white/5 mb-6">
          <p className="text-violet-glow">&gt; INIT CONSOLE TAKE-OVER...</p>
          <p>&gt; DETECTED KEY SEQUENCE: [UP, UP, DOWN, DOWN, LEFT, RIGHT, LEFT, RIGHT, B, A]</p>
          <p className="text-magenta-glow">&gt; STATUS: recruiter_wow_level = 9999</p>
          <p>&gt; CANDIDATE: Santu Manna</p>
          <p>&gt; ROLE: UI/UX Designer & Creative Developer</p>
          <p className="text-green-400 font-bold">&gt; MESSAGE: "Let's build something next-gen together."</p>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-glow to-cyan-glow text-white font-space font-medium rounded-full cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all"
        >
          RETURN TO PORTFOLIO
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Custom cursor states
  const cursorRef = useRef(null);
  const [cursorHovered, setCursorHovered] = useState(false);
  
  // Curtain reveal & loading percent
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const curtainRef = useRef(null);
  const loaderTextRef = useRef(null);

  // Typewriter states
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Stats Counters
  const [stats, setStats] = useState({ projects: 0, experience: 0, delivered: 0 });
  const statsSectionRef = useRef(null);
  const [hasStatsAnimated, setHasStatsAnimated] = useState(false);

  // Vertical Timeline Scroll Draw
  const timelineRef = useRef(null);
  const [timelineProgress, setTimelineProgress] = useState(0);

  // Konami Code sequence
  const [konamiKeys, setKonamiKeys] = useState([]);
  const [easterEggActive, setEasterEggActive] = useState(false);

  // Form submission
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Projects Data
  const projects = [
    {
      id: 1,
      title: "gramAI",
      category: "SOFTWARE & UI/UX DESIGN",
      year: "2025",
      image: "/gramai_hero.png",
      description: "An Instagram Auto DM automation SaaS dashboard designed to streamline marketing funnels, auto-trigger campaign triggers, and manage interactive message sequences.",
      role: "Lead Developer & UI/UX",
      tools: ["Figma", "SaaS Architecture", "Interaction Design", "User Flow"],
      impact: [
        "Designed high-conversion automated conversation nodes",
        "Structured real-time analytics for message delivery rates",
        "Engineered smooth customer onboarding dashboard pages"
      ],
      gradient: "from-violet-600/30 to-magenta-500/10",
      accentColor: "#7c3aed",
      link: "https://www.figma.com/design/YbJq09Dm7x76Pjtfl0a4Zz/My_insta_saas?node-id=0-1&p=f&t=TaARkq9tqc8gw809-0"
    },
    {
      id: 2,
      title: "Hiring Platform",
      category: "UI/UX DESIGN",
      year: "2025",
      image: "/hiring_hero.png",
      description: "An end-to-end recruitment solution focusing on candidate tracking optimization, interview scheduling, and creating a modern, frictionless applicant experience.",
      role: "Personal Project",
      tools: ["Figma", "User Research", "Wireframing", "Prototyping"],
      impact: [
        "Optimized recruitment funnel flows",
        "Designed standardized interview feedback cards",
        "Built a modular design system for scalability"
      ],
      gradient: "from-cyan-600/30 to-magenta-500/10",
      accentColor: "#06b6d4",
      link: "https://www.figma.com/design/Mm3cMIEsMV3iyYRAv7nW9f/hiring-platform?node-id=0-1&p=f&t=EworEqC0Nmt8WrtB-0"
    },
    {
      id: 3,
      title: "DWLR Anomalous Data System",
      category: "SOFTWARE DESIGN",
      year: "2025",
      image: "/dwlr_hero.png",
      description: "A comprehensive application designed for telemetry data analysis of Digital Water Level Recorders (DWLR). Features include detecting anomalous values, flagging faulty devices, and structuring real-time alarm interfaces.",
      role: "Personal Project",
      tools: ["Figma", "Data Visualization", "Dashboard Design", "Analytics"],
      impact: [
        "Designed threshold-based anomalous value alerts",
        "Structured real-time sensor health monitoring dashboards",
        "Optimized complex data tables for administrative users"
      ],
      gradient: "from-magenta-600/30 to-violet-500/10",
      accentColor: "#ec4899",
      link: "https://www.figma.com/design/TxN0SjmSHsEAHquBojZZu6/DWLRs?node-id=0-1&p=f&t=X8ncsKddWfj1TfWb-0"
    }
  ];

  // Timeline Data
  const experienceTimeline = [
    {
      year: "Ongoing",
      role: "SaaS Developer & Creator",
      company: "GramAI Auto DM SaaS",
      desc: "Architecting automated Instagram messaging funnels, lead conversion analytics, and designing responsive SaaS dashboards as lead UI/UX & Developer."
    },
    {
      year: "2025",
      role: "Lead Developer & UI/UX Designer",
      company: "Hackathon Competitions",
      desc: "Won multiple collegiate and regional hackathons. Served as the lead developer and lead UI/UX designer, delivering high-performance prototypes in limited timelines."
    },
    {
      year: "2024",
      role: "UI/UX Coordinator",
      company: "College Club Design Core",
      desc: "Selected as the Design Coordinator. Conducted design workshops, mentored junior members, and managed layouts and visuals for all club portals."
    }
  ];

  // Auto scroll navigation helper
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  // 1. Loading Simulation and Curtain Reveal
  useEffect(() => {
    let currentPercent = 0;
    const interval = setInterval(() => {
      currentPercent += Math.floor(Math.random() * 15) + 5;
      if (currentPercent >= 100) {
        currentPercent = 100;
        clearInterval(interval);
        
        // GSAP animate curtain slide-up
        gsap.to(curtainRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: 'power4.inOut',
          onComplete: () => {
            setIsLoaded(true);
            
            // Stagger character entry in the hero
            gsap.fromTo('.hero-char', 
              { y: 80, opacity: 0, rotate: 10 },
              { y: 0, opacity: 1, rotate: 0, duration: 0.8, stagger: 0.04, ease: 'back.out(1.5)' }
            );
          }
        });
      }
      setLoadingPercent(currentPercent);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // 2. Custom Cursor Follower
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Enable custom cursor behavior for desktop only
    if (window.innerWidth > 1024) {
      document.body.classList.add('custom-cursor-active');
    }

    const moveCursor = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: 'power1.out',
      });
    };

    window.addEventListener('mousemove', moveCursor);

    // Event delegation to capture hovered status
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest('a') || 
        target.closest('button') || 
        target.closest('.interactive-hover') ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        setCursorHovered(true);
      } else {
        setCursorHovered(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  // 3. Scroll Header state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4. Typewriter Effect
  useEffect(() => {
    const words = ["I build digital products", "I design premium interfaces", "I create recruiter-stopping code"];
    let timer;
    
    const currentWord = words[typewriterIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setTypewriterText(currentWord.substring(0, typewriterText.length - 1));
      }, 35);
    } else {
      timer = setTimeout(() => {
        setTypewriterText(currentWord.substring(0, typewriterText.length + 1));
      }, 75);
    }

    if (!isDeleting && typewriterText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 2000); // Wait 2s at the end of word
    } else if (isDeleting && typewriterText === "") {
      setIsDeleting(false);
      setTypewriterIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, typewriterIndex]);

  // 5. Stats Counter Animation on Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasStatsAnimated) {
          setHasStatsAnimated(true);
          
          // Animate statistics using GSAP object ticker
          const duration = 2.0;
          const statsObj = { projects: 0, experience: 0, delivered: 0 };
          
          gsap.to(statsObj, {
            projects: 7,
            experience: 2,
            delivered: 2,
            duration: duration,
            ease: 'power3.out',
            onUpdate: () => {
              setStats({
                projects: Math.floor(statsObj.projects),
                experience: Math.floor(statsObj.experience),
                delivered: Math.floor(statsObj.delivered),
              });
            }
          });
        }
      },
      { threshold: 0.2 }
    );

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }

    return () => {
      if (statsSectionRef.current) observer.unobserve(statsSectionRef.current);
    };
  }, [hasStatsAnimated]);

  // 6. Timeline Scroll Progress Draw
  useEffect(() => {
    const handleTimelineScroll = () => {
      const timeline = timelineRef.current;
      if (!timeline) return;

      const box = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start counting scroll progress when timeline hits center viewport
      const startOffset = box.top - windowHeight / 1.5;
      const totalTimelineHeight = box.height;

      if (startOffset < 0) {
        const scrolledDistance = -startOffset;
        const progress = Math.min(100, Math.max(0, (scrolledDistance / totalTimelineHeight) * 115));
        setTimelineProgress(progress);
      } else {
        setTimelineProgress(0);
      }
    };

    window.addEventListener('scroll', handleTimelineScroll);
    return () => window.removeEventListener('scroll', handleTimelineScroll);
  }, []);

  // 7. Konami Code Code Rain Easter Egg
  useEffect(() => {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKeyDown = (e) => {
      const newKeys = [...konamiKeys, e.key].slice(-10);
      setKonamiKeys(newKeys);
      
      if (newKeys.join(',') === code.join(',')) {
        setEasterEggActive(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiKeys]);

  // Handle message form inputs
  const handleFormChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formState.name && formState.email && formState.message) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormState({ name: '', email: '', message: '' });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen relative bg-bg-deep text-gray-200 font-inter selection:bg-cyan-glow selection:text-black">
      
      {/* Background grain texture overlay */}
      <div className="noise-overlay" />

      {/* Floating glowing background orb blobs */}
      <div className="glow-orb glow-orb-animated w-[400px] h-[400px] bg-violet-glow/20 top-[15%] left-[-10%]" />
      <div className="glow-orb glow-orb-animated w-[500px] h-[500px] bg-cyan-glow/15 bottom-[30%] right-[-15%]" />
      <div className="glow-orb glow-orb-animated w-[450px] h-[450px] bg-magenta-glow/15 top-[60%] left-[50%] -translate-x-1/2" />

      {/* Custom Follower Cursor Blob (Desktop only) */}
      <div 
        ref={cursorRef} 
        className={`custom-cursor-blob hidden lg:block ${cursorHovered ? 'hovered' : ''}`}
      />

      {/* Easter Egg Trigger Modal */}
      {easterEggActive && <MatrixRain onClose={() => setEasterEggActive(false)} />}

      {/* Loading Screen Curtain Reveal */}
      <div 
        ref={curtainRef}
        className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#0a0a0f]"
      >
        <div className="text-center space-y-6 max-w-sm px-6">
          {/* Neon rotating geometric wireframe loader SVG */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-violet-glow/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-t-cyan-glow border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin [animation-duration:1s]" />
            <div className="absolute inset-2 border-4 border-b-magenta-glow border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bebas text-3xl tracking-widest text-white">SANTU MANNA</h3>
            <p className="font-jetbrains text-xs text-cyan-glow tracking-widest">INITIALIZING NEXT-GEN EXPERIENCES...</p>
          </div>
          <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-glow via-cyan-glow to-magenta-glow shadow-[0_0_8px_#06b6d4] transition-all duration-75"
              style={{ width: `${loadingPercent}%` }}
            />
          </div>
          <div ref={loaderTextRef} className="font-jetbrains text-[10px] text-gray-500">
            {loadingPercent}% LOADED. PRESS KEY SEQUENCE DURING WORK TO BEYOND.
          </div>
        </div>
      </div>

      {/* Fixed Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-bg-deep/75 backdrop-blur-xl border-b border-white/5 py-4' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group cursor-pointer font-space font-bold text-xl tracking-wider text-white"
          >
            SANTU<span className="text-cyan-glow group-hover:text-magenta-glow transition-colors duration-300">.</span>MANNA
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-8 items-center font-space text-sm font-medium tracking-wide">
            <button onClick={() => scrollToSection('about')} className="nav-link-draw text-gray-400 hover:text-white transition-colors py-1">ABOUT</button>
            <button onClick={() => scrollToSection('skills')} className="nav-link-draw text-gray-400 hover:text-white transition-colors py-1">SKILLS</button>
            <button onClick={() => scrollToSection('projects')} className="nav-link-draw text-gray-400 hover:text-white transition-colors py-1">WORK</button>
            <button onClick={() => scrollToSection('timeline')} className="nav-link-draw text-gray-400 hover:text-white transition-colors py-1">TIMELINE</button>
            <button onClick={() => scrollToSection('contact')} className="nav-link-draw text-gray-400 hover:text-white transition-colors py-1">CONTACT</button>
            
            <button 
              onClick={() => scrollToSection('contact')}
              className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-cyan-glow/50 rounded-full text-white cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
            >
              HIRE ME
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-bg-deep/95 border-b border-white/5 backdrop-blur-2xl px-6 py-8 flex flex-col gap-6 text-lg font-space font-medium tracking-wider shadow-2xl">
            <button onClick={() => scrollToSection('about')} className="text-left text-gray-300 hover:text-cyan-glow transition-colors">ABOUT</button>
            <button onClick={() => scrollToSection('skills')} className="text-left text-gray-300 hover:text-cyan-glow transition-colors">SKILLS</button>
            <button onClick={() => scrollToSection('projects')} className="text-left text-gray-300 hover:text-cyan-glow transition-colors">WORK</button>
            <button onClick={() => scrollToSection('timeline')} className="text-left text-gray-300 hover:text-cyan-glow transition-colors">TIMELINE</button>
            <button onClick={() => scrollToSection('contact')} className="text-left text-gray-300 hover:text-cyan-glow transition-colors">CONTACT</button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="w-full text-center py-3 bg-gradient-to-r from-violet-glow to-cyan-glow text-white rounded-full mt-4"
            >
              HIRE ME
            </button>
          </div>
        )}
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
        {/* Floating 3D Geometric Scene Mesh Canvas Background */}
        <Hero3DCanvas />

        {/* Diagonal lighting highlight overlays */}
        <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, transparent 60%, rgba(10, 10, 15, 0.9) 100%) pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto text-center pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-cyan-glow font-jetbrains text-xs tracking-widest uppercase mb-8 backdrop-blur shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <Sparkles size={12} className="animate-spin [animation-duration:4s]" />
            UI/UX DESIGNER & CREATIVE ENGINEER
          </div>

          {/* Kinetic typography heading */}
          <h1 className="text-[6vw] sm:text-[5vw] leading-[1.3] text-white select-none mb-8">
            <div className="overflow-hidden h-[1.3em] flex justify-center items-center">
              {"SANTU".split('').map((char, index) => (
                <span key={index} className="hero-char inline-block text-retro-8bit opacity-0 mx-1 sm:mx-1.5">
                  {char}
                </span>
              ))}
            </div>
            <div className="overflow-hidden h-[1.3em] flex justify-center items-center mt-3">
              {"MANNA".split('').map((char, index) => (
                <span key={index} className="hero-char inline-block text-retro-8bit opacity-0 mx-1 sm:mx-1.5 !text-magenta-glow [text-shadow:3px_3px_0px_#06b6d4,6px_6px_0px_#0a0a0f]">
                  {char}
                </span>
              ))}
            </div>
          </h1>

          {/* Auto Typing subtitle */}
          <div className="h-8 mb-12 font-space text-lg sm:text-xl text-gray-400 tracking-wider">
            <span className="text-white font-medium">{typewriterText}</span>
            <span className="w-1 h-5 bg-cyan-glow inline-block ml-1 animate-pulse" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center pointer-events-auto">
            <button 
              onClick={() => scrollToSection('projects')}
              className="btn-liquid px-8 py-4 bg-transparent border-2 border-cyan-glow text-white font-space font-medium tracking-wider rounded-full cursor-pointer hover:shadow-[0_0_20px_#06b6d4] transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                VIEW WORK <ArrowRight size={16} />
              </span>
              <div className="liquid" />
            </button>

            <button 
              onClick={() => scrollToSection('contact')}
              className="px-8 py-4 bg-gradient-to-r from-magenta-glow/20 to-violet-glow/20 border border-magenta-glow/40 hover:border-magenta-glow text-white font-space font-medium tracking-wider rounded-full cursor-pointer hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] hover:scale-105 transition-all duration-300"
            >
              LET'S TALK
            </button>
          </div>
        </div>

        {/* Scroll Indicator Icon */}
        <button 
          onClick={() => scrollToSection('about')}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          <span className="font-space text-[10px] tracking-widest uppercase">SCROLL</span>
          <div className="w-6 h-10 border border-white/20 rounded-full p-1">
            <div className="w-1.5 h-3 bg-cyan-glow rounded-full mx-auto animate-bounce" />
          </div>
        </button>
      </section>

      {/* Gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-glow to-transparent opacity-40" />

      {/* 2. ABOUT SECTION */}
      <section id="about" className="relative max-w-7xl mx-auto px-6 py-28 sm:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left side portrait */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {/* Outer spinning glowing framing borders */}
              <div className="absolute inset-0 border border-dashed border-cyan-glow/50 rounded-full animate-[spin_40s_linear_infinite]" />
              <div className="absolute -inset-4 border border-violet-glow/30 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
              
              {/* Radial gradient background aura shadow */}
              <div className="absolute -inset-8 bg-gradient-to-tr from-violet-glow/20 via-cyan-glow/10 to-transparent rounded-full filter blur-3xl pointer-events-none group-hover:scale-105 transition-transform duration-700" />
              
              {/* Profile Image container inside glowing ring */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-glow p-2 bg-bg-navy/80 backdrop-blur-md">
                <img 
                  src="/santu_portrait.png" 
                  alt="Santu Manna Portrait" 
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 duration-700 transition-transform filter brightness-95 contrast-105"
                />
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-[#0d0d1a] border border-cyan-glow/30 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full absolute" />
                <span className="font-jetbrains text-[10px] tracking-widest text-cyan-glow font-bold uppercase">READY TO HIRE</span>
              </div>
            </div>
          </div>

          {/* Right side biography */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="font-jetbrains text-xs tracking-widest text-violet-glow uppercase font-bold">&gt; WHO IS SANTU</span>
              <h2 className="text-4xl sm:text-5xl font-bebas text-white tracking-wider">BRIDGING ART & ENGINEERING</h2>
            </div>

            <div className="space-y-6 text-gray-400 font-space font-light text-base sm:text-lg leading-relaxed">
              <p>
                I am a passionate <strong className="text-white font-medium">UI/UX Designer & Creative Developer</strong> based on creating intuitive, accessible, and recruiter-stopping digital platforms. Combining data-driven research insights with futuristic aesthetic animations, I build websites that leave an impact.
              </p>
              <p>
                My process centers on strategic thinking, modular design systems, and visual excellence. I thrive in clean dark systems, implementing rich glassmorphism textures, and programming interactable Three.js WebGL scenes that feel alive.
              </p>
            </div>

            {/* Quick biography data grids */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="border border-white/5 bg-white/2 p-4 rounded-xl">
                <div className="font-jetbrains text-xs text-gray-500 mb-1">NICKNAME</div>
                <div className="font-space text-white font-medium">Creative Generalist</div>
              </div>
              <div className="border border-white/5 bg-white/2 p-4 rounded-xl">
                <div className="font-jetbrains text-xs text-gray-500 mb-1">EMAIL</div>
                <a href="mailto:mrsantumanna123@gmail.com" className="font-space text-cyan-glow hover:text-white transition-colors font-medium">mrsantumanna123@gmail.com</a>
              </div>
            </div>

            {/* Floating skill tag categories */}
            <div className="space-y-3 pt-2">
              <span className="font-jetbrains text-xs text-gray-500 tracking-wider uppercase">CORE COGNITIVE DISCIPLINES</span>
              <div className="flex flex-wrap gap-2.5">
                {["UX Research", "Figma Design Systems", "3D Web Graphics", "Front-end Architecture", "Data Visualization", "Fluid Motion", "SEO & Optimization"].map((tag) => (
                  <span 
                    key={tag}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-violet-glow/10 to-cyan-glow/10 border border-violet-glow/25 hover:border-cyan-glow hover:text-white hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] rounded-full font-space text-xs text-gray-300 transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div 
          ref={statsSectionRef}
          id="stats" 
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-28 border border-violet-glow/20 bg-gradient-to-r from-violet-glow/5 via-bg-navy/50 to-cyan-glow/5 backdrop-blur rounded-2xl p-8 shadow-[0_0_30px_rgba(124,58,237,0.08)]"
        >
          <div className="text-center p-4 space-y-2">
            <div className="text-5xl font-bebas text-white tracking-widest flex items-center justify-center gap-1">
              <span>{stats.projects}</span>
              <span className="text-violet-glow text-3xl font-bold">+</span>
            </div>
            <div className="font-jetbrains text-xs text-cyan-glow tracking-widest font-bold uppercase">PROJECTS COMPLETED</div>
          </div>

          <div className="text-center p-4 space-y-2 border-y sm:border-y-0 sm:border-x border-cyan-glow/20">
            <div className="text-5xl font-bebas text-white tracking-widest flex items-center justify-center gap-1">
              <span>{stats.experience}</span>
              <span className="text-cyan-glow text-3xl font-bold">+</span>
            </div>
            <div className="font-jetbrains text-xs text-cyan-glow tracking-widest font-bold uppercase">YEARS OF EXPERIENCE</div>
          </div>

          <div className="text-center p-4 space-y-2">
            <div className="text-5xl font-bebas text-white tracking-widest flex items-center justify-center gap-1">
              <span>{stats.delivered}</span>
              <span className="text-magenta-glow text-3xl font-bold">+</span>
            </div>
            <div className="font-jetbrains text-xs text-cyan-glow tracking-widest font-bold uppercase">PROJECTS DELIVERED</div>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-glow to-transparent opacity-40" />

      {/* 3. SKILLS BENTO GRID */}
      <section id="skills" className="relative bg-gradient-to-b from-[#0c0a20] to-[#0a0a0f] border-y border-violet-glow/10 py-28 sm:py-36">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3">
            <span className="font-jetbrains text-xs tracking-widest text-cyan-glow uppercase font-bold">&gt; DISCIPLINARY STACK</span>
            <h2 className="text-4xl sm:text-5xl font-bebas text-white tracking-wider">SKILLS BENTO CORE</h2>
            <p className="max-w-md mx-auto text-gray-400 font-space font-light text-sm">
              Hover over each bento node to flip and inspect my engineering proficiency level in 3D perspective.
            </p>
          </div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[450px]">
            
            {/* Box 1 (2 Columns span) - Frontend Development */}
            <div className="md:col-span-2 group flip-card relative rounded-2xl h-[220px] md:h-full cursor-pointer">
              <div className="flip-card-inner absolute inset-0 w-full h-full">
                
                {/* Front Side */}
                <div className="flip-card-front absolute inset-0 glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-violet-glow/20 group-hover:border-violet-glow/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-violet-glow/10 text-violet-glow rounded-xl border border-violet-glow/20 shadow-[0_0_15px_rgba(124,58,237,0.1)]">
                      <Code2 size={24} />
                    </div>
                    <span className="font-jetbrains text-xs text-gray-500 tracking-wider">NODE 01</span>
                  </div>
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-widest mb-2">FRONT-END SYSTEMS ARCHITECTURE</h3>
                    <p className="text-gray-400 text-xs sm:text-sm font-space font-light leading-relaxed">
                      Crafting clean logic grids, state machines, and components. Expertise in React, Vite, Tailwind CSS, component systems, and semantic responsive page scaling.
                    </p>
                  </div>
                </div>

                {/* Back Side */}
                <div className="flip-card-back absolute inset-0 bg-bg-navy border border-violet-glow/50 rounded-2xl p-6 sm:p-8 flex items-center justify-between shadow-[0_0_30px_rgba(124,58,237,0.15)]">
                  <div className="space-y-4">
                    <h3 className="font-bebas text-xl text-violet-glow tracking-widest">ENGINEERING STATS</h3>
                    <div className="space-y-2.5 font-space text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-violet-glow" /> React & Vite: Advanced (Hook Systems, Context)
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-violet-glow" /> Tailwind Utility Configuration
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-violet-glow" /> Responsive Grid Frameworking
                      </div>
                    </div>
                  </div>
                  
                  {/* Skill Circular Progress Ring */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                      <circle cx="56" cy="56" r="46" stroke="#7c3aed" strokeWidth="8" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - 0.95)} 
                        strokeLinecap="round" className="drop-shadow-[0_0_8px_#7c3aed]"
                      />
                    </svg>
                    <span className="absolute font-space font-bold text-lg text-white">95%</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Box 2 (1 Column) - Interaction & 3D */}
            <div className="group flip-card relative rounded-2xl h-[220px] md:h-full cursor-pointer">
              <div className="flip-card-inner absolute inset-0 w-full h-full">
                
                {/* Front Side */}
                <div className="flip-card-front absolute inset-0 glass-card rounded-2xl p-6 flex flex-col justify-between border-cyan-glow/20 group-hover:border-cyan-glow/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-cyan-glow/10 text-cyan-glow rounded-xl border border-cyan-glow/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                      <Sparkles size={24} />
                    </div>
                    <span className="font-jetbrains text-xs text-gray-500 tracking-wider">NODE 02</span>
                  </div>
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-widest mb-2">3D GRAPHICS & MOTION</h3>
                    <p className="text-gray-400 text-xs font-space font-light leading-relaxed">
                      Programming high-performance WebGL renders, Three.js shaders, magnetic cursors, and GSAP scrolling.
                    </p>
                  </div>
                </div>

                {/* Back Side */}
                <div className="flip-card-back absolute inset-0 bg-bg-navy border border-cyan-glow/50 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                  <h3 className="font-bebas text-xl text-cyan-glow tracking-widest">INTERACTION TECH</h3>
                  <div className="space-y-2.5 font-space text-xs text-gray-300">
                    <div className="flex items-center gap-2"><Check size={14} className="text-cyan-glow" /> Three.js Scene Nodes</div>
                    <div className="flex items-center gap-2"><Check size={14} className="text-cyan-glow" /> GSAP Stagger Timelines</div>
                    <div className="flex items-center gap-2"><Check size={14} className="text-cyan-glow" /> Custom Math WebGL Vectors</div>
                  </div>
                  
                  {/* Glowing progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-space font-medium text-gray-400">
                      <span>PROFICIENCY</span>
                      <span>90%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-glow shadow-[0_0_8px_#06b6d4] rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[450px]">
            
            {/* Box 3 (1 Column) - UI/UX Research */}
            <div className="group flip-card relative rounded-2xl h-[220px] md:h-full cursor-pointer">
              <div className="flip-card-inner absolute inset-0 w-full h-full">
                
                {/* Front Side */}
                <div className="flip-card-front absolute inset-0 glass-card rounded-2xl p-6 flex flex-col justify-between border-magenta-glow/20 group-hover:border-magenta-glow/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-magenta-glow/10 text-magenta-glow rounded-xl border border-magenta-glow/20 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                      <Layers size={24} />
                    </div>
                    <span className="font-jetbrains text-xs text-gray-500 tracking-wider">NODE 03</span>
                  </div>
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-widest mb-2">PRODUCT DESIGN SYSTEMS</h3>
                    <p className="text-gray-400 text-xs font-space font-light leading-relaxed">
                      Figma design layouts, color palettes, spacing typography grids, and structured case studies.
                    </p>
                  </div>
                </div>

                {/* Back Side */}
                <div className="flip-card-back absolute inset-0 bg-bg-navy border border-magenta-glow/50 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(236,72,153,0.15)]">
                  <h3 className="font-bebas text-xl text-magenta-glow tracking-widest">PRODUCT TOOLKIT</h3>
                  <div className="space-y-2.5 font-space text-xs text-gray-300">
                    <div className="flex items-center gap-2"><Check size={14} className="text-magenta-glow" /> Figma Component Variants</div>
                    <div className="flex items-center gap-2"><Check size={14} className="text-magenta-glow" /> Auto Layout Prototypes</div>
                    <div className="flex items-center gap-2"><Check size={14} className="text-magenta-glow" /> Accessibility Audits</div>
                  </div>
                  
                  {/* Glowing progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-space font-medium text-gray-400">
                      <span>PROFICIENCY</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-magenta-glow shadow-[0_0_8px_#ec4899] rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Box 4 (2 Columns) - Performance & Optimization */}
            <div className="md:col-span-2 group flip-card relative rounded-2xl h-[220px] md:h-full cursor-pointer">
              <div className="flip-card-inner absolute inset-0 w-full h-full">
                
                {/* Front Side */}
                <div className="flip-card-front absolute inset-0 glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-white/5 group-hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 text-gray-300 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                      <Cpu size={24} />
                    </div>
                    <span className="font-jetbrains text-xs text-gray-500 tracking-wider">NODE 04</span>
                  </div>
                  <div>
                    <h3 className="font-bebas text-2xl text-white tracking-widest mb-2">PERFORMANCE & METRICS</h3>
                    <p className="text-gray-400 text-xs sm:text-sm font-space font-light leading-relaxed">
                      Optimized layout paint workflows, GPU layer rendering transitions, structural SEO meta indexes, and fast caching loaders. Ensuring 60fps responsive experiences.
                    </p>
                  </div>
                </div>

                {/* Back Side */}
                <div className="flip-card-back absolute inset-0 bg-bg-navy border border-white/30 rounded-2xl p-6 sm:p-8 flex items-center justify-between shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  <div className="space-y-4">
                    <h3 className="font-bebas text-xl text-white tracking-widest">METRICS SUMMARY</h3>
                    <div className="space-y-2.5 font-space text-xs text-gray-300">
                      <div className="flex items-center gap-2"><Check size={14} className="text-white" /> Core Web Vitals optimization</div>
                      <div className="flex items-center gap-2"><Check size={14} className="text-white" /> SEO Indexing structure</div>
                      <div className="flex items-center gap-2"><Check size={14} className="text-white" /> Asset image bundle compressions</div>
                    </div>
                  </div>
                  
                  {/* Skill Circular Progress Ring */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                      <circle cx="56" cy="56" r="46" stroke="#f3f4f6" strokeWidth="8" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - 0.88)} 
                        strokeLinecap="round" className="drop-shadow-[0_0_8px_#ffffff]"
                      />
                    </svg>
                    <span className="absolute font-space font-bold text-lg text-white">88%</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-magenta-glow to-transparent opacity-40" />

      {/* 4. PROJECTS SECTION */}
      <section id="projects" className="relative max-w-7xl mx-auto px-6 py-28 sm:py-36 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="font-jetbrains text-xs tracking-widest text-magenta-glow uppercase font-bold">&gt; CASE STUDIES</span>
            <h2 className="text-4xl sm:text-5xl font-bebas text-white tracking-wider">SELECTED CREATIVE WORKS</h2>
          </div>
          <p className="max-w-md text-gray-400 font-space font-light text-sm">
            Interactive grid layout featuring custom mouse 3D tilt effects. Move cursor over project cards to explore depth.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 tilt-card-wrap">
          {projects.map((project) => (
            <TiltCard 
              key={project.id} 
              className="group glass-card rounded-2xl overflow-hidden border-white/5 hover:border-cyan-glow/40 cursor-pointer flex flex-col justify-between"
            >
              {/* Radial color aura on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none`} />

              {/* Hero Image */}
              <div className="relative overflow-hidden border-b border-white/5">
                <img 
                  src={project.image} 
                  alt={`${project.title} hero screenshot`}
                  className="w-full h-48 sm:h-52 object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60" />
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full font-jetbrains text-[10px] text-cyan-glow tracking-wider">{project.year}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6 relative z-10 tilt-card-content flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-jetbrains text-xs text-cyan-glow tracking-wider">{project.category}</span>
                  </div>
                  
                  <h3 className="font-bebas text-3xl text-white tracking-wider group-hover:text-cyan-glow transition-colors duration-300">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm font-space font-light leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/5 mt-6">
                  {/* Floating tags */}
                  <div>
                    <div className="font-jetbrains text-[10px] text-gray-500 tracking-wider mb-2">TOOLS USED</div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tools.map((tool) => (
                        <span key={tool} className="px-2.5 py-1 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded font-space text-[10px] text-gray-200 hover:border-cyan-glow/40 transition-colors">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Impact highlights */}
                  <div>
                    <div className="font-jetbrains text-[10px] text-gray-500 tracking-wider mb-2">KEY IMPACT</div>
                    <div className="space-y-1.5">
                      {project.impact.map((imp) => (
                        <div key={imp} className="flex items-start gap-2 font-space text-xs text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: project.accentColor }} />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons footer inside glass */}
              <div className="p-6 bg-black/20 border-t border-white/5 relative z-10 flex justify-between items-center">
                <span className="font-space text-xs text-gray-400 group-hover:text-white transition-colors">
                  {project.role}
                </span>
                
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:border-cyan-glow/50 rounded-full font-space text-xs text-white cursor-pointer transition-colors shadow-lg"
                >
                  Figma UI <ExternalLink size={12} />
                </a>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-violet-glow to-transparent opacity-40" />

      {/* 5. EXPERIENCE / TIMELINE */}
      <section id="timeline" className="relative bg-gradient-to-b from-[#07101a] to-[#0a0a0f] border-y border-cyan-glow/10 py-28 sm:py-36">
        <div className="max-w-5xl mx-auto px-6 space-y-20">
          <div className="text-center space-y-3">
            <span className="font-jetbrains text-xs tracking-widest text-violet-glow uppercase font-bold">&gt; HISTORY LOG</span>
            <h2 className="text-4xl sm:text-5xl font-bebas text-white tracking-wider">EXPERIENCE TIMELINE</h2>
            <p className="max-w-md mx-auto text-gray-400 font-space font-light text-sm">
              Watch the vertical neon connector line draw and glow dynamically as you scroll down the page.
            </p>
          </div>

          {/* Timeline container */}
          <div ref={timelineRef} className="relative mt-12 pl-8 md:pl-0">
            
            {/* Background absolute path line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2" />
            
            {/* Glowing scroll-drawn line */}
            <div 
              style={{ height: `${timelineProgress}%` }}
              className="absolute left-0 md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-violet-glow via-cyan-glow to-magenta-glow -translate-x-1/2 shadow-[0_0_10px_#06b6d4] transition-all duration-100 ease-out" 
            />

            <div className="space-y-12 relative">
              {experienceTimeline.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={index} className="flex flex-col md:flex-row items-stretch">
                    
                    {/* Left node (for even indexes in desktop) */}
                    <div className="hidden md:block w-1/2 pr-12 text-right">
                      {isEven && (
                        <div className="space-y-3">
                          <span className="inline-block px-3 py-1 bg-violet-glow/10 border border-violet-glow/30 text-violet-glow font-space text-xs rounded-full font-bold">
                            {item.year}
                          </span>
                          <h3 className="font-bebas text-2xl text-white tracking-widest">{item.role}</h3>
                          <h4 className="font-space text-sm text-cyan-glow font-medium">{item.company}</h4>
                          <p className="text-gray-400 text-sm font-space font-light leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Timeline Node Point Ring */}
                    <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-bg-deep border-2 border-white/20 z-10 flex items-center justify-center">
                      <div 
                        className={`w-1.5 h-1.5 rounded-full transition-transform duration-300 ${
                          timelineProgress > (index / experienceTimeline.length) * 100 
                            ? 'scale-110 bg-cyan-glow shadow-[0_0_8px_#06b6d4]' 
                            : 'bg-white/10'
                        }`} 
                      />
                    </div>

                    {/* Right node (for odd indexes, or mobile) */}
                    <div className="w-full md:w-1/2 pl-6 md:pl-12 md:text-left text-left">
                      {(!isEven || window.innerWidth < 768) ? (
                        <div className="space-y-3">
                          <span className="inline-block px-3 py-1 bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow font-space text-xs rounded-full font-bold">
                            {item.year}
                          </span>
                          <h3 className="font-bebas text-2xl text-white tracking-widest">{item.role}</h3>
                          <h4 className="font-space text-sm text-violet-glow font-medium">{item.company}</h4>
                          <p className="text-gray-400 text-sm font-space font-light leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      ) : (
                        <div className="hidden md:block" /> // Empty space for spacing grid alignment
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-glow to-transparent opacity-40" />

      {/* 6. TESTIMONIALS (INFINITE MARQUEE) */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-b from-[#0d0818] to-[#0a0a0f] border-b border-magenta-glow/10">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="space-y-2 text-center">
            <span className="font-jetbrains text-xs text-magenta-glow tracking-widest font-bold uppercase">&gt; CLIENT TRUST</span>
            <h2 className="text-3xl font-bebas text-white tracking-wider">RECRUITER & CLIENT REVIEWS</h2>
          </div>
        </div>

        {/* Double-buffered marquee track scrolling from right to left */}
        <div className="flex overflow-x-hidden no-scrollbar relative w-full py-4 bg-gradient-to-r from-violet-glow/5 via-transparent to-magenta-glow/5 border-y border-magenta-glow/10">
          <div className="marquee-track flex whitespace-nowrap">
            
            {/* Set 1 */}
            {[
              { text: "Santu designs like an artist and builds like an engineer. Absolutely elite.", author: "Product Lead @ TechCorp" },
              { text: "The 3D interactive dashboard blew our stakeholders away. Recruiter-stopping work!", author: "Venture Partner" },
              { text: "An exceptional eye for glassmorphic layouts and micro-interactions. Highly recommend.", author: "Senior Designer" },
              { text: "Fast, reliable, and pushes the boundary of what's possible in web UI.", author: "Founder, Cypher Labs" }
            ].map((t, idx) => (
              <div key={idx} className="inline-block glass-card rounded-xl p-6 mx-4 w-[350px] sm:w-[450px] whitespace-normal border-white/5 hover:border-cyan-glow/30">
                <p className="font-space text-sm italic text-gray-300 mb-4">
                  "{t.text}"
                </p>
                <div className="font-jetbrains text-[10px] tracking-widest text-cyan-glow font-bold uppercase">
                  — {t.author}
                </div>
              </div>
            ))}

            {/* Set 2 (Duplicates for seamless loop) */}
            {[
              { text: "Santu designs like an artist and builds like an engineer. Absolutely elite.", author: "Product Lead @ TechCorp" },
              { text: "The 3D interactive dashboard blew our stakeholders away. Recruiter-stopping work!", author: "Venture Partner" },
              { text: "An exceptional eye for glassmorphic layouts and micro-interactions. Highly recommend.", author: "Senior Designer" },
              { text: "Fast, reliable, and pushes the boundary of what's possible in web UI.", author: "Founder, Cypher Labs" }
            ].map((t, idx) => (
              <div key={`dup-${idx}`} className="inline-block glass-card rounded-xl p-6 mx-4 w-[350px] sm:w-[450px] whitespace-normal border-white/5 hover:border-cyan-glow/30">
                <p className="font-space text-sm italic text-gray-300 mb-4">
                  "{t.text}"
                </p>
                <div className="font-jetbrains text-[10px] tracking-widest text-cyan-glow font-bold uppercase">
                  — {t.author}
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* 7. CONTACT SECTION */}
      <section id="contact" className="relative max-w-4xl mx-auto px-6 py-28 sm:py-36">
        {/* Decorative gradient glow behind contact */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-glow/10 via-cyan-glow/5 to-magenta-glow/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-12">
          
          <div className="text-center space-y-3">
            <span className="font-jetbrains text-xs tracking-widest text-cyan-glow uppercase font-bold">&gt; TRANSMIT INPUT</span>
            <h2 className="text-4xl sm:text-5xl font-bebas text-white tracking-wider">START A PROJECT</h2>
            <p className="max-w-md mx-auto text-gray-400 font-space font-light text-sm">
              Use the minimalist console below to transmit your message or connect on social hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* Form card */}
            <div className="md:col-span-8 glass-card rounded-2xl p-6 sm:p-8 border-cyan-glow/10 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
              {formSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 bg-cyan-glow/10 border border-cyan-glow rounded-full flex items-center justify-center text-cyan-glow animate-bounce">
                    <Check size={32} />
                  </div>
                  <h3 className="font-bebas text-2xl text-white tracking-widest">TRANSMISSION SECURED</h3>
                  <p className="font-space text-sm text-gray-400">
                    Your request was sent. Santu Manna will touch base within 24 standard cycles.
                  </p>
                  <button 
                    onClick={() => setFormSubmitted(false)}
                    className="mt-4 text-xs font-jetbrains text-cyan-glow hover:underline tracking-widest"
                  >
                    SEND ANOTHER TRANSMISSION
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  
                  {/* Name Input */}
                  <div className="relative border-b border-white/10 focus-within:border-cyan-glow py-2 transition-colors">
                    <input 
                      type="text" 
                      name="name"
                      required
                      placeholder="YOUR NAME"
                      value={formState.name}
                      onChange={handleFormChange}
                      className="w-full bg-transparent border-none outline-none text-white font-space placeholder-gray-600 focus:placeholder-transparent text-sm tracking-wider"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative border-b border-white/10 focus-within:border-cyan-glow py-2 transition-colors">
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="EMAIL ADDRESS"
                      value={formState.email}
                      onChange={handleFormChange}
                      className="w-full bg-transparent border-none outline-none text-white font-space placeholder-gray-600 focus:placeholder-transparent text-sm tracking-wider"
                    />
                  </div>

                  {/* Message Area */}
                  <div className="relative border-b border-white/10 focus-within:border-cyan-glow py-2 transition-colors">
                    <textarea 
                      name="message"
                      required
                      rows="4"
                      placeholder="TRANSMIT MESSAGE DETAILS..."
                      value={formState.message}
                      onChange={handleFormChange}
                      className="w-full bg-transparent border-none outline-none text-white font-space placeholder-gray-600 focus:placeholder-transparent text-sm tracking-wider resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="btn-liquid w-full py-4 bg-transparent border border-cyan-glow hover:shadow-[0_0_20px_#06b6d4] text-white font-space font-medium tracking-widest text-xs rounded-lg cursor-pointer transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      TRANSMIT <Send size={12} />
                    </span>
                    <div className="liquid" />
                  </button>
                </form>
              )}
            </div>

            {/* Social hubs / Magnetic side */}
            <div className="md:col-span-4 flex flex-col justify-between gap-6">
              
              <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-between flex-grow">
                <div className="space-y-4">
                  <h3 className="font-bebas text-lg text-white tracking-widest">EMAIL ACCESS</h3>
                  <p className="font-space text-xs text-gray-400">Direct link to default client terminal.</p>
                </div>
                <a 
                  href="mailto:mrsantumanna123@gmail.com"
                  className="mt-6 flex items-center justify-between p-3 bg-white/3 hover:bg-white/10 border border-white/5 hover:border-violet-glow/40 rounded-xl transition-all group cursor-pointer"
                >
                  <span className="font-jetbrains text-[10px] text-white tracking-wider">mrsantumanna123@gmail.com</span>
                  <Mail size={16} className="text-gray-400 group-hover:text-violet-glow transition-colors" />
                </a>
              </div>

              {/* Social Channels grid */}
              <div className="glass-card rounded-2xl p-6 border-white/5 space-y-4">
                <h3 className="font-bebas text-lg text-white tracking-widest">NETWORKS</h3>
                <div className="flex gap-4">
                  <a 
                    href="https://github.com/santu567" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-white/3 hover:bg-white/10 border border-white/5 hover:border-cyan-glow/50 rounded-xl flex items-center justify-center text-white cursor-pointer transition-all group"
                  >
                    <Github size={18} className="group-hover:scale-110 group-hover:text-cyan-glow transition-all" />
                  </a>
                  
                  <a 
                    href="https://www.linkedin.com/in/santu-manna-4b92aa253/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-white/3 hover:bg-white/10 border border-white/5 hover:border-magenta-glow/50 rounded-xl flex items-center justify-center text-white cursor-pointer transition-all group"
                  >
                    <Linkedin size={18} className="group-hover:scale-110 group-hover:text-magenta-glow transition-all" />
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 8. FOOTER */}
      {/* Gradient divider */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-magenta-glow to-transparent opacity-40" />

      <footer className="relative border-t border-magenta-glow/10 bg-gradient-to-b from-[#0d0818] to-[#05050a] py-16 overflow-hidden">
        
        {/* Massive faded background signature typography */}
        <div className="absolute inset-x-0 bottom-0 text-center font-bebas text-[15vw] bg-gradient-to-t from-violet-glow/[0.04] to-transparent bg-clip-text text-transparent tracking-widest leading-none select-none pointer-events-none">
          SANTU MANNA
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="font-space font-bold text-lg text-white">SANTU MANNA</h3>
            <p className="font-jetbrains text-[10px] text-gray-500 tracking-wider">CREATIVE DEVELOPMENT PLATFORM // © 2026 ALL RIGHTS RESERVED</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 font-space text-xs text-gray-400">
            <div className="flex items-center gap-1.5 font-jetbrains text-[10px]">
              <Award size={12} className="text-cyan-glow" /> SECURE CONSOLE READY
            </div>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">BACK TO TOP</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
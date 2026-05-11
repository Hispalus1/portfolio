// ── Navbar toggle (mobile) ──────────────────────────────────────
const toggler = document.getElementById('navToggler');
const navLinks = document.getElementById('navLinks');

toggler?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Active nav link on scroll ───────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 80;
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      navItems.forEach(a => {
        a.classList.toggle('active-nav', a.getAttribute('href') === '#' + sec.id);
      });
    }
  });
}, { passive: true });

// ── Scroll-triggered fade-up ────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // Staggered delay based on sibling index
      const siblings = [...e.target.parentElement.children];
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = (idx * 60) + 'ms';
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── Animated stat numbers ───────────────────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCount(e.target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => statObserver.observe(el));

// ── PCB Background Animation ────────────────────────────────────
(function() {
  const canvas = document.getElementById('pcbBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let traces = [];
  let components = [];
  let packets = [];
  let silkscreen = [];

  const ACCENT_COLOR = '#e8ff47';
  const TRACE_COLOR = '#ffffff15';
  const COMPONENT_BG = '#ffffff0a';
  const COMPONENT_BORDER = '#ffffff25';
  const SILK_COLOR = '#ffffff20';
  const PAD_COLOR = '#ffffff30';

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initPCB();
  }

  function initPCB() {
    traces = [];
    components = [];
    packets = [];
    silkscreen = [];

    const gridSize = 40;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);
    
    // Track occupied cells to prevent overlaps
    const occupied = Array.from({ length: cols }, () => Array(rows).fill(false));

    // 1. Create IC Components (Chips) in structured zones
    const zoneSize = 6; // 6x6 grid cells per potential component zone
    for (let zi = 0; zi < cols; zi += zoneSize) {
      for (let zj = 0; zj < rows; zj += zoneSize) {
        if (Math.random() > 0.5) { // 50% chance to place a chip in this zone
          const w = 2 + Math.floor(Math.random() * 2);
          const h = 2 + Math.floor(Math.random() * 3);
          
          // Random offset within the zone
          const ox = Math.floor(Math.random() * (zoneSize - w));
          const oy = Math.floor(Math.random() * (zoneSize - h));
          
          const gx = zi + ox;
          const gy = zj + oy;

          const comp = { 
            x: gx * gridSize, 
            y: gy * gridSize, 
            w: w * gridSize, 
            h: h * gridSize, 
            label: `U${components.length + 1}` 
          };
          components.push(comp);

          // Mark occupied
          for(let ix=0; ix<w; ix++) {
            for(let iy=0; iy<h; iy++) {
              if (gx+ix < cols && gy+iy < rows) occupied[gx+ix][gy+iy] = true;
            }
          }

          // 2. Start Buses from this component's pins
          const numBusesFromComp = 1 + Math.floor(Math.random() * 2);
          for(let bIdx = 0; bIdx < numBusesFromComp; bIdx++) {
            const side = Math.random() > 0.5 ? 'top' : 'bottom';
            const busWidth = 2 + Math.floor(Math.random() * 2);
            const busGap = 10;
            
            let startX = comp.x + 10 + Math.random() * (comp.w - 20 - busWidth * busGap);
            let startY = side === 'top' ? comp.y : comp.y + comp.h;
            let dir = side === 'top' ? {dx:0, dy:-1} : {dx:0, dy:1};

            for (let b = 0; b < busWidth; b++) {
              let points = [{x: startX + b * busGap, y: startY}];
              let curX = points[0].x, curY = points[0].y;
              let lastD = dir, segLen = 3 + Math.floor(Math.random() * 4);

              for(let s = 0; s < 2; s++) {
                const nextX = curX + lastD.dx * segLen * gridSize;
                const nextY = curY + lastD.dy * segLen * gridSize;
                if (nextX >= 0 && nextX <= width && nextY >= 0 && nextY <= height) {
                  points.push({x: nextX, y: nextY});
                  curX = nextX; curY = nextY;
                  // 90 degree turn away from component
                  lastD = (Math.random() > 0.5) ? {dx: 1, dy: 0} : {dx: -1, dy: 0};
                  segLen = 4 + Math.floor(Math.random() * 8);
                } else break;
              }
              if (points.length > 1) traces.push({ points, width: 1 });
            }
          }
        }
      }
    }

    // 3. Add background "Power Rails"
    for (let i = 2; i < rows; i += 8) {
        traces.push({
            points: [{x: 0, y: i * gridSize}, {x: width, y: i * gridSize}],
            width: 0.5
        });
    }

    // 4. Add extra silkscreen labels in unoccupied areas
    for(let i=0; i<40; i++) {
        const rx = Math.floor(Math.random() * cols);
        const ry = Math.floor(Math.random() * rows);
        if (!occupied[rx][ry]) {
            silkscreen.push({
                x: rx * gridSize + 5,
                y: ry * gridSize + 15,
                type: 'text',
                val: ['R','C','L','J'][Math.floor(Math.random()*4)] + Math.floor(Math.random()*100)
            });
        }
    }
  }

  function createPulse() {
    if (traces.length === 0) return;
    const trace = traces[Math.floor(Math.random() * traces.length)];
    const numPackets = 4 + Math.floor(Math.random() * 8);
    const speed = 0.02 + Math.random() * 0.02;
    
    for (let i = 0; i < numPackets; i++) {
      setTimeout(() => {
        packets.push({
          trace: trace,
          segment: 0,
          progress: 0,
          speed: speed
        });
      }, i * 140);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Silkscreen
    ctx.font = '8px "JetBrains Mono"';
    ctx.fillStyle = SILK_COLOR;
    silkscreen.forEach(s => {
        if(s.type === 'text') ctx.fillText(s.val, s.x, s.y);
        else {
            ctx.beginPath();
            ctx.arc(s.x, s.y, 0.5, 0, Math.PI*2);
            ctx.fill();
        }
    });

    // 2. Draw IC Components
    components.forEach(c => {
      // Solid Body
      ctx.fillStyle = COMPONENT_BG;
      ctx.fillRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4);
      
      // Border
      ctx.strokeStyle = COMPONENT_BORDER;
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4);
      
      // Designator
      ctx.fillStyle = SILK_COLOR;
      ctx.fillText(c.label, c.x + 6, c.y + 12);

      // Pins (SMD style)
      ctx.fillStyle = PAD_COLOR;
      for(let px = 8; px < c.w - 8; px += 12) {
        ctx.fillRect(c.x + px, c.y - 1, 4, 3);
        ctx.fillRect(c.x + px, c.y + c.h - 2, 4, 3);
      }
    });

    // 3. Draw Traces
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = TRACE_COLOR;
    traces.forEach(t => {
      ctx.lineWidth = t.width;
      ctx.beginPath();
      ctx.moveTo(t.points[0].x, t.points[0].y);
      for(let i = 1; i < t.points.length; i++) {
        ctx.lineTo(t.points[i].x, t.points[i].y);
      }
      ctx.stroke();

      // Solder Pads / Vias
      ctx.fillStyle = PAD_COLOR;
      const start = t.points[0];
      const end = t.points[t.points.length-1];
      
      // Start Pad
      ctx.beginPath(); ctx.arc(start.x, start.y, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000'; // Hole
      ctx.beginPath(); ctx.arc(start.x, start.y, 0.8, 0, Math.PI*2); ctx.fill();
      
      // End Pad
      ctx.fillStyle = PAD_COLOR;
      ctx.beginPath(); ctx.arc(end.x, end.y, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000'; // Hole
      ctx.beginPath(); ctx.arc(end.x, end.y, 0.8, 0, Math.PI*2); ctx.fill();
    });

    // 4. Update & Draw Packets
    packets.forEach((p, index) => {
      p.progress += p.speed;
      if (p.progress >= 1) {
        p.progress = 0;
        p.segment++;
        if (p.segment >= p.trace.points.length - 1) {
          packets.splice(index, 1);
          return;
        }
      }

      const p1 = p.trace.points[p.segment];
      const p2 = p.trace.points[p.segment + 1];
      const x = p1.x + (p2.x - p1.x) * p.progress;
      const y = p1.y + (p2.y - p1.y) * p.progress;

      ctx.fillStyle = ACCENT_COLOR;
      ctx.shadowBlur = 12;
      ctx.shadowColor = ACCENT_COLOR;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    if (Math.random() < 0.08 && packets.length < 200) {
      createPulse();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

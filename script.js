// ── State
let current = 0;
const TOTAL = 7;
let isScrolling = false;
let isMobile = false;

// ── Panel IDs in order
const PANEL_IDS = ['p-hero','p-about','p-skills','p-projects','p-experience','p-certs','p-contact'];

// ── Elements
const track    = document.getElementById('track');
const idxDots  = document.getElementById('idx-dots');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

// ── Detect mobile
function checkMobile() {
  isMobile = window.innerWidth <= 768;
}
checkMobile();
window.addEventListener('resize', checkMobile);

// ── Build index dots
for (let i = 0; i < TOTAL; i++) {
  const d = document.createElement('div');
  d.className = 'idx-dot' + (i === 0 ? ' active' : '');
  d.onclick = () => goTo(i);
  idxDots.appendChild(d);
}

// ── Core navigation
function goTo(n) {
  current = Math.max(0, Math.min(TOTAL - 1, n));

  if (isMobile) {
    // Mobile: scroll to panel vertically
    const panel = document.getElementById(PANEL_IDS[current]);
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    // Desktop: horizontal transform
    track.style.transform = `translateX(-${current * 100}vw)`;
  }

  // Update dots
  document.querySelectorAll('.idx-dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });

  // Update nav active state
  updateNavActive();

  // Close mobile drawer if open
  closeMobileNav();
}

function updateNavActive() {
  document.querySelectorAll('[data-panel]').forEach(link => {
    const idx = parseInt(link.getAttribute('data-panel'));
    link.classList.toggle('active', idx === current);
  });
}

// ── Hamburger toggle
function closeMobileNav() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
}

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
});

// ── Mouse wheel (desktop only)
window.addEventListener('wheel', (e) => {
  if (isMobile) return;
  e.preventDefault();
  if (isScrolling) return;
  isScrolling = true;
  if (e.deltaY > 30 || e.deltaX > 30) goTo(current + 1);
  else if (e.deltaY < -30 || e.deltaX < -30) goTo(current - 1);
  setTimeout(() => { isScrolling = false; }, 800);
}, { passive: false });

// ── Keyboard (desktop only)
window.addEventListener('keydown', (e) => {
  if (isMobile) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(current + 1); }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goTo(current - 1); }
});

// ── Touch swipe (desktop horizontal panels)
let touchStartX = 0;
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (isMobile) return; // mobile uses native scroll
  const dx = touchStartX - e.changedTouches[0].clientX;
  const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
  if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
    goTo(dx > 0 ? current + 1 : current - 1);
  }
}, { passive: true });

// ── Custom cursor (desktop only)
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
if (cursor && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animCursor() {
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
}

// ── Mobile: update active dot on scroll
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    if (!isMobile) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = PANEL_IDS.indexOf(entry.target.id);
        if (idx !== -1) {
          current = idx;
          document.querySelectorAll('.idx-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
          });
          updateNavActive();
        }
      }
    });
  }, { threshold: 0.5 });

  PANEL_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

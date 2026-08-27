/* ============================================================
   YOJAN MANOSALVA — SCRIPT COMPARTIDO
   Menú móvil + navbar en scroll + animaciones de aparición
   variadas + parallax de mouse optimizado (más fluido y rápido).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAVBAR: efecto al hacer scroll ---------- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- MENÚ MÓVIL ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-open');
      links.classList.toggle('is-open');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      links.classList.remove('is-open');
    }));
  }

  /* ---------- REVEAL AL HACER SCROLL (animaciones variadas) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (!el.style.getPropertyValue('--reveal-delay')) {
              const idx = Array.from(el.parentElement.children).indexOf(el);
              el.style.setProperty('--reveal-delay', `${Math.min(idx * 90, 360)}ms`);
            }
            el.classList.add('is-visible');
            io.unobserve(el);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ---------- PARALLAX DE MOUSE OPTIMIZADO ---------- */
  // Usa requestAnimationFrame + interpolación (lerp) para que el
  // movimiento sea inmediato y fluido en vez de sentirse "lento".
  const parallaxTargets = document.querySelectorAll('[data-parallax]');
  if (parallaxTargets.length && !reduceMotion) {
    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;
    let rafId = null;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    function tick() {
      // Lerp con factor alto = respuesta más rápida al mouse.
      curX += (mouseX - curX) * 0.35;
      curY += (mouseY - curY) * 0.35;

      parallaxTargets.forEach(el => {
        const strength = parseFloat(el.dataset.parallax) || 14;
        el.style.transform = `translate3d(${curX * strength}px, ${curY * strength}px, 0)`;
      });

      if (Math.abs(mouseX - curX) > 0.001 || Math.abs(mouseY - curY) > 0.001) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }
  }

  /* ---------- CARGA DIFERIDA DE ESCENAS 3D (SPLINE) ----------
     Evita que el visor 3D bloquee la primera pintura de la página.
     Se agrega solo después de que la página ya cargó y únicamente
     en pantallas grandes, sin quitar la animación en desktop. */
  const splineViewers = document.querySelectorAll('spline-viewer[data-src]');
  if (splineViewers.length) {
    const isSmallScreen = window.innerWidth < 760;
    const loadAll = () => {
      if (isSmallScreen) { splineViewers.forEach(v => v.remove()); return; }
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@splinetool/viewer@1.10.89/build/spline-viewer.js';
      document.head.appendChild(script);
      splineViewers.forEach(v => v.setAttribute('url', v.dataset.src));
    };
    const schedule = () => (window.requestIdleCallback ? requestIdleCallback(loadAll, { timeout: 1200 }) : setTimeout(loadAll, 300));
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule);
  }

  /* ---------- BOTÓN VOLVER (páginas de proyecto) ----------
     Si hay historial dentro del sitio, regresa; si no, va a proyectos.html */
  document.querySelectorAll('[data-go-back]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (document.referrer && document.referrer.includes(location.host) && history.length > 1) {
        history.back();
      } else {
        window.location.href = btn.getAttribute('href') || 'projects.html';
      }
    });
  });
});

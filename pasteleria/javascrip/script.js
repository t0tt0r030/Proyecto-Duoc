// ==============================
// CARGA DE PARCIALES (fetch)
// ==============================
async function includePartials() {
    const holders = document.querySelectorAll('[data-include]');
    for (const el of holders) {
      const url = el.getAttribute('data-include');
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        el.innerHTML = await res.text();
        // console.log('[include OK]', url);
      } catch (err) {
        console.error('[include ERROR]', url, err);
        el.innerHTML = `<div style="padding:8px;background:#fee;color:#900">
          No se pudo cargar <b>${url}</b>. Revisa la ruta y mayúsculas/minúsculas.
        </div>`;
      }
    }
  }
  
  // Forzar visibilidad por si hay CSS que ocultan .animate-on-scroll antes del observer
  function forceVisibleFallback() {
    const style = document.createElement('style');
    style.textContent = `
      .animate-on-scroll { opacity: 1 !important; transform: none !important; }
      .visible { opacity: 1 !important; transform: none !important; }
    `;
    document.head.appendChild(style);
  }
  
  // ==============================
  // TUS FUNCIONES (no cambian lógica)
  // ==============================
  
  // Smooth scroll en anchors con offset de navbar
  function initAnchorsSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
  
        const targetId = this.getAttribute('href');
  
        // Enlaces "#"/"#top"
        if (targetId === '#' || targetId === '#top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
  
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const navbar = document.querySelector('.navbar');
          const navbarHeight = navbar ? navbar.offsetHeight : 0;
          const offset = 20; // espacio extra
          const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
          const targetPosition = elementPosition - navbarHeight - offset;
  
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  // FAQ Accordion
  function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;
      question.addEventListener('click', () => {
        const currentlyActive = document.querySelector('.faq-item.active');
        if (currentlyActive && currentlyActive !== item) {
          currentlyActive.classList.remove('active');
        }
        item.classList.toggle('active');
      });
    });
  }
  
  // Mobile Navigation (Hamburger Menu)
  function initMobileNav() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.querySelector('body');
    if (!hamburger || !navLinks) return;
  
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      body.classList.toggle('no-scroll');
    });
  
    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          body.classList.remove('no-scroll');
        }
      });
    });
  }
  
  // Scroll-based UI Changes (back-to-top, navbar shrink, scrollspy)
  function initScrollUI() {
    const backToTopButton = document.querySelector('.back-to-top-btn');
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('main section[id]');
    const navLinksForSpy = document.querySelectorAll('.nav-links a[href^="#"]');
  
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
  
      // Mostrar/Ocultar "Volver Arriba"
      if (backToTopButton) {
        if (scrollY > 300) backToTopButton.classList.add('show');
        else backToTopButton.classList.remove('show');
      }
  
      // Cambiar tamaño del logo en el navbar
      if (navbar) {
        if (scrollY > 50) navbar.classList.add('navbar-scrolled');
        else navbar.classList.remove('navbar-scrolled');
      }
  
      // Scrollspy
      let currentSectionId = '';
      const navHeight = navbar ? navbar.offsetHeight : 0;
  
      sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 21; 
        if (scrollY >= sectionTop) {
          currentSectionId = section.getAttribute('id');
        }
      });
  
      navLinksForSpy.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    });
  }
  
  // Scroll Animations (IntersectionObserver)
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target); // Animate only once
        }
      });
    }, {
      threshold: 0.1 // 10% visible
    });
  
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
  }
  
  // Dark Mode Toggle
  function initThemeToggle() {
    const themeSwitcher = document.querySelector('.theme-switcher');
    const bodyEl = document.querySelector('body');
  
    if (localStorage.getItem('theme') === 'dark') {
      bodyEl.classList.add('dark-mode');
    }
  
    themeSwitcher?.addEventListener('click', () => {
      bodyEl.classList.toggle('dark-mode');
      const theme = bodyEl.classList.contains('dark-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
    });
  }
  
  // Animación de entrada para el logo (una vez)
  function initLogoAnimation() {
    const logoImg = document.getElementById('brand-logo-img');
    if (logoImg) {
      logoImg.classList.add('logo-animate');
    }
  }
  
  // ==============================
  // SECUENCIA DE ARRANQUE
  // ==============================
  // 1) Forzar visibilidad (evita "pantalla en blanco" si el observer o CSS no cargan aún)
  // 2) Inyectar parciales
  // 3) Inicializar tus features
  // 4) Inicializar carrusel si existe (javascrip/carrucel.js define window.initCarrucel)
  document.addEventListener('DOMContentLoaded', async () => {
    forceVisibleFallback();        // 1
    await includePartials();       // 2
  
    initAnchorsSmoothScroll();     // 3
    initFAQAccordion();
    initMobileNav();
    initScrollUI();
    initScrollAnimations();
    initThemeToggle();
    initLogoAnimation();
  
    if (window.initCarrucel) {     // 4
      try { window.initCarrucel(); } 
      catch (e) { console.error('initCarrucel error', e); }
    }
  });
  
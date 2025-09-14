// === Cargar parciales con fetch ===
async function includePartials() {
    const nodes = document.querySelectorAll('[data-include]');
    await Promise.all(
      Array.from(nodes).map(async (el) => {
        const url = el.getAttribute('data-include');
        try {
          const resp = await fetch(url);
          const html = await resp.text();
          el.innerHTML = html;
        } catch (e) {
          el.innerHTML = `<p style="color:#c00">No se pudo cargar ${url}</p>`;
        }
      })
    );
  }
  
  // === Carrusel simple (sin librerías) ===
  function initCarousel() {
    const root = document.querySelector('#hero-carousel');
    if (!root) return;
  
    const track = root.querySelector('.carousel-track');
    const slides = Array.from(root.querySelectorAll('.slide'));
    const prevBtn = root.querySelector('.prev');
    const nextBtn = root.querySelector('.next');
    const dotsWrap = root.querySelector('.carousel-dots');
  
    let index = 0;
    let auto;
  
    // Dots
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', `Ir al slide ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });
  
    const dots = Array.from(root.querySelectorAll('.dot'));
  
    function update() {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
      track.style.transform = `translateX(-${index * 100}%)`;
    }
  
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
      restartAuto();
    }
  
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }
  
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
  
    function startAuto() { auto = setInterval(next, 5000); }
    function stopAuto() { clearInterval(auto); }
    function restartAuto() { stopAuto(); startAuto(); }
  
    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);
  
    // Init
    update();
    startAuto();
  }
  
  // === Iniciar todo ===
  document.addEventListener('DOMContentLoaded', async () => {
    await includePartials();   // carga los parciales
    initCarousel();            // cuando ya existe en el DOM
  });
  
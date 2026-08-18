const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .trust-item, .slide-in').forEach((el) => io.observe(el));

if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${py * -6}deg) rotateY(${px * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

function animateCount(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const val = Math.round(target * easeOutExpo(p));
    el.textContent = prefix + val + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const trustSection = document.querySelector('.trust');
if (trustSection) {
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        trustSection.querySelectorAll('.count').forEach(animateCount);
        countIO.disconnect();
      }
    });
  }, { threshold: 0.4 });
  countIO.observe(trustSection);
}

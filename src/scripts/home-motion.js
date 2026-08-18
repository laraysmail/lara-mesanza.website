const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroBg = document.getElementById('heroBg');
const heroContent = document.getElementById('heroContent');
const heroPin = document.querySelector('.hero-pin');
const stepsPin = document.querySelector('.steps-pin');
const stepsTrack = document.getElementById('stepsTrack');
const interludePin = document.querySelector('.interlude-pin');
const interludeMark = document.getElementById('interludeMark');
const line = document.getElementById('line1');
const shopBlob = document.getElementById('shopBlob');

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function onScroll() {
  if (prefersReduced) return;

  if (heroPin && heroContent && heroBg) {
    const hr = heroPin.getBoundingClientRect();
    const heroProgress = clamp(-hr.top / (hr.height - window.innerHeight), 0, 1);
    const scale = 1 - heroProgress * 0.35;
    heroContent.style.transform = `scale(${scale}) translateY(${heroProgress * -40}px)`;
    heroContent.style.opacity = 1 - heroProgress * 1.1;
    heroBg.style.transform = `scale(${1 + heroProgress * 0.15}) translateY(${heroProgress * 30}px)`;
  }

  if (stepsPin && stepsTrack) {
    const sr = stepsPin.getBoundingClientRect();
    const stepsProgress = clamp(-sr.top / (sr.height - window.innerHeight), 0, 1);
    const maxTranslate = stepsTrack.scrollWidth - window.innerWidth + 64;
    stepsTrack.style.transform = `translateX(${-stepsProgress * maxTranslate}px)`;
  }

  if (interludePin && interludeMark && line) {
    const ir = interludePin.getBoundingClientRect();
    const ip = clamp(-ir.top / (ir.height - window.innerHeight), 0, 1);
    interludeMark.style.transform = `translate(${ip * -40}px, ${ip * 30}px)`;
    let opacity, ty, scale;
    if (ip < 0.3) { opacity = ip / 0.3; ty = 40 * (1 - opacity); scale = 0.92 + 0.08 * opacity; }
    else if (ip < 0.7) { opacity = 1; ty = 0; scale = 1; }
    else { opacity = 1 - (ip - 0.7) / 0.3; ty = -40 * (1 - opacity); scale = 0.92 + 0.08 * opacity; }
    line.style.opacity = opacity;
    line.style.transform = `translateY(${ty}px) scale(${scale})`;
  }

  if (shopBlob) {
    const tienda = document.getElementById('tienda-teaser');
    if (tienda) {
      const sbr = tienda.getBoundingClientRect();
      shopBlob.style.transform = `translateY(${sbr.top * -0.06}px)`;
    }
  }

}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

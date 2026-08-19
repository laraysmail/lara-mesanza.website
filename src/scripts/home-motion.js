const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroBg = document.getElementById('heroBg');
const heroContent = document.getElementById('heroContent');
const heroPin = document.querySelector('.hero-pin');
const stepsPin = document.querySelector('.steps-pin');
const stepsTrack = document.getElementById('stepsTrack');
const shopBlob = document.getElementById('shopBlob');

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// The pin needs exactly as much scroll room as the horizontal track needs to travel.
// A fixed vh guess (e.g. 340vh) only matches one screen width — on narrower screens the
// cards are narrower too, the horizontal scroll finishes early, and the rest of that fixed
// height becomes "dead" scroll where the last card just sits there before the next section
// appears underneath it. Computing it from the actual track width fixes that at every width.
function updateStepsPinHeight() {
  if (!stepsPin || !stepsTrack) return;
  const maxTranslate = Math.max(0, stepsTrack.scrollWidth - window.innerWidth + 64);
  stepsPin.style.height = `${maxTranslate + window.innerHeight}px`;
}

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

  if (shopBlob) {
    const tienda = document.getElementById('tienda-teaser');
    if (tienda) {
      const sbr = tienda.getBoundingClientRect();
      shopBlob.style.transform = `translateY(${sbr.top * -0.06}px)`;
    }
  }

}

updateStepsPinHeight();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { updateStepsPinHeight(); onScroll(); });
onScroll();

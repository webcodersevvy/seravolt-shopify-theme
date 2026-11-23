/**
 * SERAVOLT GSAP Architectural Reveal Choreography
 * Respects prefers-reduced-motion and Shopify Theme Editor section reloads.
 */
function initSeravoltMotion(scope = document) {
  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.documentElement.dataset.gsapEnabled === 'false') return;

  if (window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  const reveals = scope.querySelectorAll('[data-sv-reveal]');
  reveals.forEach((el, idx) => {
    window.gsap.fromTo(
      el,
      { y: 22, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
        delay: Math.min(idx * 0.04, 0.24),
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: window.ScrollTrigger
          ? { trigger: el, start: 'top 88%', once: true }
          : undefined
      }
    );
  });
}

document.addEventListener('DOMContentLoaded', () => initSeravoltMotion(document));
document.addEventListener('shopify:section:load', (e) => initSeravoltMotion(e.target));

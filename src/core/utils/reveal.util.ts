/**
 * Observes DOM elements with a given selector and adds active class when entering viewport.
 * Adapted from MELO Angular Architecture Blueprint.
 */
export function initRevealObserver(selector: string = '.reveal', activeClass: string = 'revealed') {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(activeClass);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll(selector).forEach((el) => observer.observe(el));
  return observer;
}


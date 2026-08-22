// reset scroll position via lenis and native fallbacks
export function scrollToTop(lenis) {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  }

  if (typeof window === "undefined") return;

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

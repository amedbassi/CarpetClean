/**
 * Mobile utility functions for better UX
 */

/**
 * Blur active input when scrolling to dismiss keyboard on mobile
 */
export function setupScrollBlur() {
  let scrollTimeout: NodeJS.Timeout;
  
  const handleScroll = () => {
    // Clear previous timeout
    clearTimeout(scrollTimeout);
    
    // Set new timeout to blur after scroll stops
    scrollTimeout = setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT')
      ) {
        activeElement.blur();
      }
    }, 100);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(scrollTimeout);
  };
}

/**
 * Prevent body scroll (useful for modals)
 */
export function lockBodyScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;
}

/**
 * Re-enable body scroll
 */
export function unlockBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return window.innerWidth < 768;
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(element: HTMLElement, offset = 0) {
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

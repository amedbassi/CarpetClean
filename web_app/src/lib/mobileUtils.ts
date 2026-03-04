/**
 * Mobile utility functions for better UX
 */

/**
 * Blur active input when scrolling to dismiss keyboard on mobile
 * This helps prevent the keyboard from staying on screen
 */
export function setupScrollBlur() {
  if (typeof window === 'undefined') return () => {};
  
  let scrollTimeout: NodeJS.Timeout;
  let lastScrollTime = 0;
  
  const handleScroll = () => {
    const now = Date.now();
    lastScrollTime = now;
    
    clearTimeout(scrollTimeout);
    
    // Wait for scroll to stop before blurring
    scrollTimeout = setTimeout(() => {
      // Only blur if we actually scrolled (not just a touch)
      if (Date.now() - lastScrollTime >= 200) {
        const activeElement = document.activeElement as HTMLElement;
        if (
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT')
        ) {
          activeElement.blur();
        }
      }
    }, 200);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(scrollTimeout);
  };
}

/**
 * Prevent input blur on first tap (fixes double-tap issue)
 * This is the key fix for iOS keyboard issues
 */
export function preventInputBlurOnScroll() {
  if (typeof window === 'undefined') return () => {};
  
  // Prevent iOS from requiring double-tap
  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    ) {
      // Don't prevent default - let native behavior work
      // Just ensure the element is focusable
      if (!target.hasAttribute('readonly') && !target.hasAttribute('disabled')) {
        target.focus();
      }
    }
  };
  
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  
  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
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

/**
 * Setup all mobile utilities at once
 * This is the main function to call in components
 */
export function setupMobileUtils() {
  const cleanupScrollBlur = setupScrollBlur();
  const cleanupInputFix = preventInputBlurOnScroll();
  
  return () => {
    cleanupScrollBlur();
    cleanupInputFix();
  };
}

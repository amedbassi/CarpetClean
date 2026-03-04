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
  let isScrolling = false;
  
  const handleScrollStart = () => {
    isScrolling = true;
    clearTimeout(scrollTimeout);
  };
  
  const handleScrollEnd = () => {
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      const activeElement = document.activeElement as HTMLElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT')
      ) {
        activeElement.blur();
      }
    }, 150);
  };

  window.addEventListener('scroll', handleScrollStart, { passive: true });
  window.addEventListener('scroll', handleScrollEnd, { passive: true });
  window.addEventListener('touchmove', handleScrollStart, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScrollStart);
    window.removeEventListener('scroll', handleScrollEnd);
    window.removeEventListener('touchmove', handleScrollStart);
    clearTimeout(scrollTimeout);
  };
}

/**
 * Prevent input blur on first tap (fixes double-tap issue)
 * Call this in form components to improve mobile input behavior
 */
export function preventInputBlurOnScroll() {
  if (typeof window === 'undefined') return () => {};
  
  let lastTouchTime = 0;
  
  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    ) {
      lastTouchTime = Date.now();
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
 * Fix iOS input focus issues
 * Prevents the need for double-tap on inputs
 */
export function fixIOSInputFocus() {
  if (typeof window === 'undefined') return () => {};
  
  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (!isIOS) return () => {};
  
  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    ) {
      // Prevent default to avoid iOS quirks
      // Then manually focus
      setTimeout(() => {
        target.focus();
      }, 0);
    }
  };
  
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  
  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
  };
}

/**
 * Setup all mobile utilities at once
 */
export function setupMobileUtils() {
  const cleanupScrollBlur = setupScrollBlur();
  const cleanupIOSFix = fixIOSInputFocus();
  
  return () => {
    cleanupScrollBlur();
    cleanupIOSFix();
  };
}

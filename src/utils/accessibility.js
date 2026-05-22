/**
 * TierPilot - Accessibility Utilities
 * 
 * Focus management and ARIA helpers for keyboard and screen reader users.
 */

/**
 * Manages focus when transitioning between wizard steps.
 * Moves focus to the first focusable element or heading in the container.
 * @param {HTMLElement} container - The container element to manage focus within
 */
export function manageFocus(container) {
  if (!container) return;

  // Small delay to ensure DOM is updated
  requestAnimationFrame(() => {
    // First, try to find a heading to announce the new section
    const heading = container.querySelector('h1, h2, [role="heading"]');
    if (heading) {
      // Make heading focusable temporarily for screen reader announcement
      const originalTabIndex = heading.getAttribute('tabindex');
      heading.setAttribute('tabindex', '-1');
      heading.focus();
      
      // Restore original tabindex after focus
      if (originalTabIndex === null) {
        heading.removeAttribute('tabindex');
      } else {
        heading.setAttribute('tabindex', originalTabIndex);
      }
      return;
    }

    // Fallback: focus first interactive element
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    }
  });
}

/**
 * Announces a message to screen readers using a live region
 * @param {string} message - The message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announce(message, priority = 'polite') {
  // Find or create live region
  let liveRegion = document.getElementById('sr-announcer');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'sr-announcer';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }

  // Clear and set message (triggers announcement)
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

/**
 * Traps focus within a container (for modal-like behavior)
 * @param {HTMLElement} container - The container to trap focus within
 * @returns {Function} Cleanup function to remove the trap
 */
export function trapFocus(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

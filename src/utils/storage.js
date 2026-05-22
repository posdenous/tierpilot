/**
 * TierPilot - localStorage Utilities
 * 
 * Handles persistent storage for user preferences like explainer dismissal.
 */

const STORAGE_KEYS = {
  EXPLAINER_SEEN: 'tierpilot_explainer_seen'
};

/**
 * Checks if the user has seen the explainer screen
 * @returns {boolean}
 */
export function hasSeenExplainer() {
  try {
    return localStorage.getItem(STORAGE_KEYS.EXPLAINER_SEEN) === 'true';
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
    return false;
  }
}

/**
 * Marks the explainer as seen
 */
export function setExplainerSeen() {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPLAINER_SEEN, 'true');
  } catch {
    // Silently fail if localStorage unavailable
  }
}

/**
 * Clears the explainer seen flag (for testing)
 */
export function clearExplainerSeen() {
  try {
    localStorage.removeItem(STORAGE_KEYS.EXPLAINER_SEEN);
  } catch {
    // Silently fail if localStorage unavailable
  }
}

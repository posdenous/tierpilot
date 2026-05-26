/**
 * TierPilot - localStorage Utilities
 * 
 * Handles persistent storage for user preferences and wizard progress.
 */

const STORAGE_KEYS = {
  EXPLAINER_SEEN: 'tierpilot_explainer_seen',
  WIZARD_STATE: 'tierpilot_wizard_state'
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

/**
 * Saves wizard progress (stage, step, and answers)
 * @param {Object} state - Current wizard state
 */
export function saveWizardState(state) {
  try {
    const toSave = {
      currentStage: state.currentStage,
      currentWizardStep: state.currentWizardStep,
      answers: state.answers,
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.WIZARD_STATE, JSON.stringify(toSave));
  } catch {
    // Silently fail if localStorage unavailable
  }
}

/**
 * Loads saved wizard progress
 * @returns {Object|null} Saved state or null if none/expired
 */
export function loadWizardState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WIZARD_STATE);
    if (!saved) return null;
    
    const state = JSON.parse(saved);
    
    // Expire after 24 hours
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (Date.now() - state.savedAt > ONE_DAY) {
      clearWizardState();
      return null;
    }
    
    return state;
  } catch {
    return null;
  }
}

/**
 * Clears saved wizard progress
 */
export function clearWizardState() {
  try {
    localStorage.removeItem(STORAGE_KEYS.WIZARD_STATE);
  } catch {
    // Silently fail if localStorage unavailable
  }
}

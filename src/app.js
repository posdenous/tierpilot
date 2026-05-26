/**
 * TierPilot - Main App Orchestration
 * 
 * Manages wizard state, navigation, and component rendering.
 */

import { renderExplainer } from './components/explainer.js';
import { renderTaskSelector, initTaskSearch } from './components/taskSelector.js';
import { renderWizard } from './components/wizard.js';
import { renderVerdict } from './components/verdict.js';
import { hasSeenExplainer, setExplainerSeen, saveWizardState, loadWizardState, clearWizardState } from './utils/storage.js';
import { manageFocus } from './utils/accessibility.js';

// Application state
const state = {
  currentStage: 0, // 0: explainer, 1: task, 2: wizard, 3: verdict
  currentWizardStep: 0,
  answers: {
    task: null,
    dataSensitivity: null,
    outputStakes: null,
    volumeFrequency: null,
    hardware: null,
    toolingComfort: null,
    costSensitivity: null,
    structuredOutput: null
  },
  verdict: null,
  models: null,
  modelsError: false
};

// Total wizard steps (7 context questions)
const TOTAL_WIZARD_STEPS = 7;

/**
 * Fetches the model registry from public/models.json
 */
async function fetchModels() {
  try {
    const response = await fetch('/models.json');
    if (!response.ok) throw new Error('Failed to fetch models');
    const data = await response.json();
    state.models = data.models;
    state.modelsError = false;
  } catch (error) {
    console.error('Error fetching models:', error);
    state.models = null;
    state.modelsError = true;
  }
}

/**
 * Calculates progress percentage for the progress bar
 */
function getProgress() {
  if (state.currentStage === 0) return 0;
  if (state.currentStage === 1) return 10;
  if (state.currentStage === 2) {
    // Wizard steps: 10% base + up to 80% for wizard
    return 10 + ((state.currentWizardStep + 1) / TOTAL_WIZARD_STEPS) * 80;
  }
  return 100;
}

/**
 * Renders the current stage with transition animation
 */
function render() {
  const container = document.getElementById('main-content');
  if (!container) return;

  // Add exit animation
  container.classList.add('wizard-step-exit');
  
  setTimeout(() => {
    container.classList.remove('wizard-step-exit');
    
    let content = '';
    
    switch (state.currentStage) {
      case 0:
        content = renderExplainer();
        break;
      case 1:
        content = renderTaskSelector(state.answers.task, getProgress());
        break;
      case 2:
        content = renderWizard(state.currentWizardStep, state.answers, getProgress());
        break;
      case 3:
        content = renderVerdict(state.verdict, state.models, state.modelsError, state.answers);
        break;
    }
    
    container.innerHTML = content;
    container.classList.add('wizard-step');
    
    // Manage focus for accessibility
    manageFocus(container);
    
    // Attach event listeners
    attachEventListeners();
    
    // Initialize task search if on task selector stage
    if (state.currentStage === 1) {
      initTaskSearch();
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
      container.classList.remove('wizard-step');
    }, 300);
  }, 200);
}

/**
 * Attaches event listeners based on current stage
 */
function attachEventListeners() {
  // Explainer stage
  const getStartedBtn = document.getElementById('get-started-btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      setExplainerSeen();
      state.currentStage = 1;
      render();
    });
  }

  // Task selector
  const taskButtons = document.querySelectorAll('[data-task]');
  taskButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.answers.task = btn.dataset.task;
      state.currentStage = 2;
      state.currentWizardStep = 0;
      saveWizardState(state);
      render();
    });
  });

  // Wizard option buttons
  const optionButtons = document.querySelectorAll('[data-option]');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const questionKey = btn.dataset.question;
      const value = btn.dataset.option;
      state.answers[questionKey] = value;
      
      // Auto-advance to next step
      if (state.currentWizardStep < TOTAL_WIZARD_STEPS - 1) {
        state.currentWizardStep++;
        saveWizardState(state);
        render();
      } else {
        // Calculate verdict and move to results
        import('./engine/decision.js').then(({ calculateVerdict }) => {
          state.verdict = calculateVerdict(state.answers);
          state.currentStage = 3;
          clearWizardState(); // Clear saved progress on completion
          render();
        });
      }
    });
  });

  // Back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (state.currentStage === 2 && state.currentWizardStep > 0) {
        state.currentWizardStep--;
      } else if (state.currentStage === 2 && state.currentWizardStep === 0) {
        state.currentStage = 1;
      } else if (state.currentStage === 3) {
        state.currentStage = 2;
        state.currentWizardStep = TOTAL_WIZARD_STEPS - 1;
      }
      saveWizardState(state);
      render();
    });
  }

  // Start over button
  const startOverBtn = document.getElementById('start-over-btn');
  if (startOverBtn) {
    startOverBtn.addEventListener('click', () => {
      state.currentStage = 1;
      state.currentWizardStep = 0;
      state.answers = {
        task: null,
        dataSensitivity: null,
        outputStakes: null,
        volumeFrequency: null,
        hardware: null,
        toolingComfort: null,
        costSensitivity: null,
        structuredOutput: null
      };
      state.verdict = null;
      clearWizardState();
      render();
    });
  }

  // Share button
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const { copyVerdictToClipboard } = await import('./utils/share.js');
      copyVerdictToClipboard(state.verdict, state.answers, shareBtn);
    });
  }

  // Footer "What is this?" link
  const footerLink = document.getElementById('footer-explainer-link');
  if (footerLink) {
    footerLink.addEventListener('click', () => {
      // Store current state to restore after viewing explainer
      const previousStage = state.currentStage;
      state.currentStage = 0;
      render();
      
      // Modify get started to return to previous state
      setTimeout(() => {
        const getStartedBtn = document.getElementById('get-started-btn');
        if (getStartedBtn) {
          getStartedBtn.textContent = 'Back to where I was';
          getStartedBtn.addEventListener('click', () => {
            state.currentStage = previousStage;
            render();
          }, { once: true });
        }
      }, 250);
    });
  }
}

/**
 * Checks for shared URL params and loads the result if valid
 * @returns {boolean} True if loaded from URL
 */
async function loadFromSharedURL() {
  const { decodeAnswersFromURL } = await import('./utils/share.js');
  const sharedAnswers = decodeAnswersFromURL();
  
  if (!sharedAnswers || !sharedAnswers.task) return false;
  
  // Check if all required answers are present
  const requiredKeys = [
    'task', 'dataSensitivity', 'outputStakes', 'volumeFrequency',
    'hardware', 'toolingComfort', 'costSensitivity', 'structuredOutput'
  ];
  
  const hasAllAnswers = requiredKeys.every(key => sharedAnswers[key] !== null);
  
  if (!hasAllAnswers) return false;
  
  // Load the shared answers and calculate verdict
  state.answers = sharedAnswers;
  
  const { calculateVerdict } = await import('./engine/decision.js');
  state.verdict = calculateVerdict(state.answers);
  state.currentStage = 3;
  
  // Clear URL params without reload
  window.history.replaceState({}, '', window.location.pathname);
  
  return true;
}

/**
 * Initializes the application
 */
export async function initApp() {
  // Fetch models in background
  await fetchModels();
  
  // Check for shared URL first
  const loadedFromURL = await loadFromSharedURL();
  
  if (!loadedFromURL) {
    // Check for saved wizard progress
    const savedState = loadWizardState();
    
    if (savedState && savedState.currentStage >= 1) {
      // Restore saved progress
      state.currentStage = savedState.currentStage;
      state.currentWizardStep = savedState.currentWizardStep || 0;
      state.answers = { ...state.answers, ...savedState.answers };
    } else if (hasSeenExplainer()) {
      state.currentStage = 1;
    } else {
      state.currentStage = 0;
    }
  }
  
  render();
}

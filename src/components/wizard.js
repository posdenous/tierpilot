/**
 * TierPilot - Wizard Component (Stage 2)
 * 
 * Seven context questions, one per screen.
 * Each question has button-select options.
 */

import { t } from '../utils/i18n.js';

// Wizard questions - keys map to translations
const WIZARD_QUESTION_KEYS = [
  {
    key: 'dataSensitivity',
    optionValues: ['not-sensitive', 'internal', 'confidential']
  },
  {
    key: 'outputStakes',
    optionValues: ['low', 'medium', 'high']
  },
  {
    key: 'volumeFrequency',
    optionValues: ['occasional', 'regular', 'high-volume']
  },
  {
    key: 'hardware',
    optionValues: ['laptop-basic', 'laptop-gpu', 'workstation', 'cloud']
  },
  {
    key: 'toolingComfort',
    optionValues: ['cli', 'gui', 'managed']
  },
  {
    key: 'costSensitivity',
    optionValues: ['not-important', 'moderate', 'critical']
  },
  {
    key: 'structuredOutput',
    optionValues: ['no', 'nice-to-have', 'required']
  }
];

// Build questions with translations
function getWizardQuestions() {
  return WIZARD_QUESTION_KEYS.map(q => {
    const questionT = t(`wizard.questions.${q.key}`);
    return {
      key: q.key,
      title: questionT?.title || q.key,
      options: q.optionValues.map(val => ({
        value: val,
        label: questionT?.options?.[val] || val
      }))
    };
  });
}

const WIZARD_QUESTIONS = WIZARD_QUESTION_KEYS;

/**
 * Renders a single wizard step
 * @param {number} stepIndex - Current step index (0-6)
 * @param {Object} answers - Current answers object
 * @param {number} progress - Current progress percentage
 * @returns {string} HTML string for the wizard step
 */
export function renderWizard(stepIndex, answers, progress) {
  const questions = getWizardQuestions();
  const question = questions[stepIndex];
  if (!question) return '';

  const currentAnswer = answers[question.key];
  
  const optionButtons = question.options.map(option => `
    <button
      class="option-button"
      data-question="${question.key}"
      data-option="${option.value}"
      aria-selected="${currentAnswer === option.value}"
      aria-label="${option.label}"
    >
      <div class="font-medium">${option.label}</div>
    </button>
  `).join('');

  const isFirstStep = stepIndex === 0;

  return `
    <div role="region" aria-labelledby="wizard-question-title">
      <!-- Progress bar -->
      <div class="progress-bar mb-6" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Wizard progress: ${Math.round(progress)}% complete">
        <div class="progress-bar-fill" style="width: ${progress}%"></div>
      </div>
      
      <!-- Step indicator -->
      <div class="text-sm text-muted mb-4 mono">
        ${stepIndex + 1} / ${questions.length}
      </div>
      
      <h1 id="wizard-question-title" class="text-2xl font-semibold mb-6">${question.title}</h1>
      
      <div class="space-y-3" role="listbox" aria-label="${question.title}">
        ${optionButtons}
      </div>
      
      <!-- Navigation -->
      <div class="wizard-nav">
        <button 
          id="back-btn" 
          class="btn-secondary"
          aria-label="Back"
        >
          ← Back
        </button>
      </div>
    </div>
  `;
}

export { WIZARD_QUESTIONS, getWizardQuestions };

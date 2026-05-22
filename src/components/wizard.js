/**
 * TierPilot - Wizard Component (Stage 2)
 * 
 * Seven context questions, one per screen.
 * Each question has button-select options.
 */

// Wizard questions configuration
const WIZARD_QUESTIONS = [
  {
    key: 'dataSensitivity',
    title: 'How sensitive is your data?',
    description: 'This affects whether sending data to external APIs is acceptable.',
    options: [
      { value: 'not-sensitive', label: 'Not sensitive', description: 'Generic content, public information' },
      { value: 'internal', label: 'Internal only', description: 'Company data, not for external sharing' },
      { value: 'confidential', label: 'Personal, regulated, or confidential', description: 'PII, HIPAA, financial, or legally protected' }
    ]
  },
  {
    key: 'outputStakes',
    title: 'What are the stakes if the output is wrong?',
    description: 'Higher stakes may require more capable models or human oversight.',
    options: [
      { value: 'low', label: 'Easy to catch and fix', description: 'Mistakes are quickly noticed and corrected' },
      { value: 'medium', label: 'Needs human review', description: 'Output should be verified before use' },
      { value: 'high', label: 'Legal, financial, or reputational risk', description: 'Errors could have serious consequences' }
    ]
  },
  {
    key: 'volumeFrequency',
    title: 'How often will you run this task?',
    description: 'Volume affects whether API costs or local setup effort makes more sense.',
    options: [
      { value: 'occasional', label: 'Occasional or one-off', description: 'A few times, then done' },
      { value: 'regular', label: 'Regular (weekly or monthly)', description: 'Ongoing but not constant' },
      { value: 'high-volume', label: 'High volume (daily or at scale)', description: 'Frequent or batch processing' }
    ]
  },
  {
    key: 'hardware',
    title: 'What hardware do you have available?',
    description: 'Local models need sufficient RAM and ideally a GPU.',
    options: [
      { value: 'laptop-basic', label: 'Laptop, no GPU, under 16GB RAM', description: 'Basic consumer hardware' },
      { value: 'laptop-gpu', label: 'GPU laptop or M-series Mac', description: 'Apple Silicon or discrete GPU' },
      { value: 'workstation', label: 'Desktop workstation with dedicated GPU', description: 'Gaming PC or workstation with 12GB+ VRAM' },
      { value: 'cloud', label: 'Cloud VM or server', description: 'AWS, GCP, Azure, or dedicated server' }
    ]
  },
  {
    key: 'toolingComfort',
    title: 'How comfortable are you with local setup?',
    description: 'This determines whether we recommend self-hosted or managed options.',
    options: [
      { value: 'cli', label: 'Comfortable with CLI and local setup', description: 'Can install Ollama, run terminal commands' },
      { value: 'gui', label: 'Prefer GUI tools (e.g. LM Studio)', description: 'Want a visual interface, minimal terminal' },
      { value: 'managed', label: 'Need managed hosting, no local setup', description: 'Prefer cloud APIs or hosted inference' }
    ]
  },
  {
    key: 'costSensitivity',
    title: 'How important is cost?',
    description: 'Local models are free after setup; APIs charge per token.',
    options: [
      { value: 'high', label: 'Cost is a real constraint', description: 'Budget is limited, prefer free options' },
      { value: 'medium', label: 'Somewhat a factor', description: 'Will pay for value, but mindful of spend' },
      { value: 'low', label: 'Not a factor', description: 'Willing to pay for best results' }
    ]
  },
  {
    key: 'structuredOutput',
    title: 'Do you need structured output?',
    description: 'JSON or schema-compliant output is harder for smaller models.',
    options: [
      { value: 'yes', label: 'Yes, needs reliable JSON or schema output', description: 'Output must parse correctly every time' },
      { value: 'no', label: 'No, free-form output is fine', description: 'Natural language or flexible format' }
    ]
  }
];

/**
 * Renders a single wizard step
 * @param {number} stepIndex - Current step index (0-6)
 * @param {Object} answers - Current answers object
 * @param {number} progress - Current progress percentage
 * @returns {string} HTML string for the wizard step
 */
export function renderWizard(stepIndex, answers, progress) {
  const question = WIZARD_QUESTIONS[stepIndex];
  if (!question) return '';

  const currentAnswer = answers[question.key];
  
  const optionButtons = question.options.map(option => `
    <button
      class="option-button"
      data-question="${question.key}"
      data-option="${option.value}"
      aria-selected="${currentAnswer === option.value}"
      aria-label="${option.label}: ${option.description}"
    >
      <div class="font-medium">${option.label}</div>
      <div class="text-sm text-muted mt-1">${option.description}</div>
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
        Question ${stepIndex + 1} of ${WIZARD_QUESTIONS.length}
      </div>
      
      <h1 id="wizard-question-title" class="text-2xl font-semibold mb-2">${question.title}</h1>
      <p class="text-foreground-secondary mb-6">${question.description}</p>
      
      <div class="space-y-3" role="listbox" aria-label="${question.title}">
        ${optionButtons}
      </div>
      
      <!-- Navigation -->
      <div class="wizard-nav">
        <button 
          id="back-btn" 
          class="btn-secondary"
          aria-label="${isFirstStep ? 'Back to task selection' : 'Previous question'}"
        >
          ← Back
        </button>
        <span class="text-sm text-muted">Select an option to continue</span>
      </div>
    </div>
  `;
}

export { WIZARD_QUESTIONS };

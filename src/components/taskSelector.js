/**
 * TierPilot - Task Selector Component (Stage 1)
 * 
 * Button grid showing all 21 task categories.
 * Each button shows the task name and a short description.
 */

import { t } from '../utils/i18n.js';

// Task categories - text pulled from translations
// These map directly to complexity levels in the decision engine
const TASK_CATEGORIES = [
  {
    id: 'summarisation',
    name: 'Summarisation',
    description: 'Condense articles, reports, or documents into key points',
    example: 'e.g., TL;DR of a research paper, meeting recap',
    complexity: 'simple'
  },
  {
    id: 'classification',
    name: 'Classification / Tagging',
    description: 'Sort content into predefined categories or labels',
    example: 'e.g., ticket routing, content moderation, lead scoring',
    complexity: 'simple'
  },
  {
    id: 'copy-editing',
    name: 'Copy Editing / Rewriting',
    description: 'Improve clarity, tone, grammar, or style',
    example: 'e.g., make this more formal, fix grammar, simplify',
    complexity: 'simple'
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Convert text between languages',
    example: 'e.g., English to Spanish, localise UI strings',
    complexity: 'simple'
  },
  {
    id: 'template-filling',
    name: 'Template / Form Filling',
    description: 'Populate structured templates with extracted data',
    example: 'e.g., fill invoice fields, extract entities to JSON',
    complexity: 'simple'
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Detect emotional tone, opinion, or intent',
    example: 'e.g., is this review positive?, customer mood detection',
    complexity: 'simple'
  },
  {
    id: 'code-explanation',
    name: 'Code Explanation',
    description: 'Explain what code does in plain language',
    example: 'e.g., what does this function do?, add inline comments',
    complexity: 'moderate'
  },
  {
    id: 'qa-provided-text',
    name: 'Q&A on Provided Text',
    description: 'Answer questions using context you supply',
    example: 'e.g., ask questions about a PDF, search docs',
    complexity: 'simple'
  },
  {
    id: 'first-draft',
    name: 'First-Draft Generation',
    description: 'Create initial drafts that humans will refine',
    example: 'e.g., blog post outline, email draft, proposal skeleton',
    complexity: 'moderate'
  },
  {
    id: 'test-generation',
    name: 'Test Case Generation',
    description: 'Generate unit tests, edge cases, or test data',
    example: 'e.g., write Jest tests for this function',
    complexity: 'moderate'
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes to Actions',
    description: 'Extract action items, decisions, and owners from notes',
    example: 'e.g., parse transcript into task list with assignees',
    complexity: 'moderate'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review code for bugs, security issues, and style',
    example: 'e.g., review this PR, find potential issues',
    complexity: 'moderate'
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Identify, evaluate, and prioritise potential risks',
    example: 'e.g., security audit, compliance gap analysis',
    complexity: 'complex'
  },
  {
    id: 'research-synthesis',
    name: 'Research Synthesis',
    description: 'Combine multiple sources into coherent analysis',
    example: 'e.g., literature review, competitive analysis, due diligence',
    complexity: 'complex'
  },
  {
    id: 'autonomous-coding',
    name: 'Autonomous Coding Agent',
    description: 'Multi-step code generation with file edits and tool use',
    example: 'e.g., build this feature end-to-end, refactor module',
    complexity: 'complex'
  },
  {
    id: 'complex-debugging',
    name: 'Complex Debugging',
    description: 'Diagnose and fix non-obvious or multi-system bugs',
    example: 'e.g., race condition, memory leak, integration failure',
    complexity: 'complex'
  },
  {
    id: 'long-form-document',
    name: 'Long-Form Document',
    description: 'Create lengthy documents requiring multiple revisions',
    example: 'e.g., technical spec, whitepaper, documentation site',
    complexity: 'complex'
  },
  {
    id: 'multi-criteria-decision',
    name: 'Multi-Criteria Decision Analysis',
    description: 'Evaluate options across multiple weighted factors',
    example: 'e.g., vendor selection, architecture trade-off analysis',
    complexity: 'complex'
  },
  {
    id: 'chatbot-conversational',
    name: 'Chatbot / Conversational Agent',
    description: 'Multi-turn dialogue with users, stateful conversations',
    example: 'e.g., customer support bot, FAQ assistant, onboarding guide',
    complexity: 'moderate'
  },
  {
    id: 'data-extraction',
    name: 'Data Extraction / Parsing',
    description: 'Pull structured data from unstructured documents',
    example: 'e.g., extract fields from invoices, parse resumes, contract analysis',
    complexity: 'moderate'
  },
  {
    id: 'creative-marketing',
    name: 'Creative / Marketing Copy',
    description: 'Generate engaging, brand-aligned creative content',
    example: 'e.g., ad copy, product descriptions, social posts, taglines',
    complexity: 'moderate'
  }
];

/**
 * Renders the task selector grid
 * @param {string|null} selectedTask - Currently selected task ID
 * @param {number} progress - Current progress percentage
 * @returns {string} HTML string for the task selector
 */
export function renderTaskSelector(selectedTask, progress) {
  const taskButtons = TASK_CATEGORIES.map(task => {
    // Get translated text, fallback to hardcoded if not found
    const taskT = t(`tasks.${task.id}`);
    const name = typeof taskT === 'object' ? taskT.name : task.name;
    const description = typeof taskT === 'object' ? taskT.description : task.description;
    const example = typeof taskT === 'object' ? taskT.example : task.example;
    
    return `
      <button
        class="task-button"
        data-task="${task.id}"
        data-complexity="${task.complexity}"
        aria-selected="${selectedTask === task.id}"
        aria-label="${name}: ${description}. ${example}"
      >
        <span class="task-button-title">${name}</span>
        <span class="task-button-description">${description}</span>
        <span class="task-button-example">${example}</span>
      </button>
    `;
  }).join('');

  return `
    <div role="region" aria-labelledby="task-selector-title">
      <!-- Progress bar -->
      <div class="progress-bar mb-6" role="progressbar" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100" aria-label="Wizard progress">
        <div class="progress-bar-fill" style="width: ${progress}%"></div>
      </div>
      
      <h1 id="task-selector-title" class="text-2xl font-semibold mb-2">${t('taskSelector.title')}</h1>
      <p class="text-foreground-secondary mb-4">${t('taskSelector.subtitle')}</p>
      
      <!-- Complexity legend -->
      <div class="complexity-legend mb-4">
        <span class="complexity-legend-item">
          <span class="complexity-dot complexity-dot--simple"></span>
          ${t('taskSelector.complexity.simple')}
        </span>
        <span class="complexity-legend-item">
          <span class="complexity-dot complexity-dot--moderate"></span>
          ${t('taskSelector.complexity.moderate')}
        </span>
        <span class="complexity-legend-item">
          <span class="complexity-dot complexity-dot--complex"></span>
          ${t('taskSelector.complexity.complex')}
        </span>
      </div>
      
      <!-- Search filter -->
      <div class="task-search-wrapper mb-4">
        <input 
          type="text" 
          id="task-search" 
          class="task-search-input" 
          placeholder="${t('taskSelector.searchPlaceholder')}"
          aria-label="${t('taskSelector.searchPlaceholder')}"
          autocomplete="off"
        />
      </div>
      
      <div id="task-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="listbox" aria-label="Task categories">
        ${taskButtons}
      </div>
      
      <div id="no-matches" class="hidden text-center py-8 text-muted">
        <p>${t('taskSelector.noMatches')}</p>
        <p class="text-sm mt-2">${t('taskSelector.noMatchesHint')}</p>
      </div>
    </div>
  `;
}

/**
 * Filters task buttons based on search input
 * Call this from app.js after rendering
 */
export function initTaskSearch() {
  const searchInput = document.getElementById('task-search');
  const taskGrid = document.getElementById('task-grid');
  const noMatches = document.getElementById('no-matches');
  
  if (!searchInput || !taskGrid) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const buttons = taskGrid.querySelectorAll('.task-button');
    let visibleCount = 0;
    
    buttons.forEach(btn => {
      const title = btn.querySelector('.task-button-title')?.textContent.toLowerCase() || '';
      const description = btn.querySelector('.task-button-description')?.textContent.toLowerCase() || '';
      const example = btn.querySelector('.task-button-example')?.textContent.toLowerCase() || '';
      
      const matches = query === '' || 
        title.includes(query) || 
        description.includes(query) || 
        example.includes(query);
      
      btn.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });
    
    // Show/hide no matches message
    if (noMatches) {
      noMatches.classList.toggle('hidden', visibleCount > 0);
      taskGrid.classList.toggle('hidden', visibleCount === 0);
    }
  });
}

/**
 * Gets task complexity by ID
 * @param {string} taskId - The task ID
 * @returns {string} Complexity level: 'simple', 'moderate', or 'complex'
 */
export function getTaskComplexity(taskId) {
  const task = TASK_CATEGORIES.find(t => t.id === taskId);
  return task ? task.complexity : 'moderate';
}

export { TASK_CATEGORIES };

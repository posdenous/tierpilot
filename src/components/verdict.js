/**
 * TierPilot - Verdict Component (Stage 3)
 * 
 * Shareable result card with verdict badge, reasoning, and model recommendations.
 */

/**
 * Gets the most recent lastVerified date from models
 * @param {Array} models - Models array
 * @returns {string} Formatted date string
 */
function getLastUpdatedDate(models) {
  if (!models || models.length === 0) return 'Unknown';
  
  const dates = models
    .map(m => m.lastVerified)
    .filter(Boolean)
    .sort()
    .reverse();
  
  if (dates.length === 0) return 'Unknown';
  
  const date = new Date(dates[0]);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Renders a model card
 * @param {Object} model - Model object from models.json
 * @returns {string} HTML string for the model card
 */
function renderModelCard(model) {
  const topStrengths = model.strengths.slice(0, 2);
  
  return `
    <div class="model-card">
      <div class="model-card-header">
        <div>
          <div class="model-card-name">${model.name}</div>
          <div class="model-card-provider">${model.provider}</div>
        </div>
        <span class="model-card-param">${model.paramSize}</span>
      </div>
      
      <div class="model-card-strengths">
        ${topStrengths.map(s => `<span class="model-card-strength">${s}</span>`).join('')}
      </div>
      
      ${model.managedAlternative ? `
        <div class="model-card-managed">
          <span class="text-foreground-secondary">Managed:</span> ${model.managedAlternative}
        </div>
      ` : ''}
      
      <a href="${model.link}" target="_blank" rel="noopener noreferrer" class="model-card-link">
        View model →
      </a>
    </div>
  `;
}

/**
 * Renders the fix hierarchy for local recommendations on complex tasks
 * @returns {string} HTML string for the fix hierarchy
 */
function renderFixHierarchy() {
  const fixes = [
    'Structured prompting and state injection',
    'Decompose into atomic single-shot steps',
    'External memory or RAG layer',
    'Human checkpoints between steps',
    'Fine-tune on task pattern'
  ];

  return `
    <div class="fix-hierarchy">
      <div class="fix-hierarchy-title">If local falls short, try these fixes (ranked by effort):</div>
      <ol class="fix-hierarchy-list">
        ${fixes.map(fix => `<li class="fix-hierarchy-item">${fix}</li>`).join('')}
      </ol>
    </div>
  `;
}

/**
 * Renders governance considerations based on verdict and answers
 * @param {string} verdict - The verdict type
 * @param {Object} answers - User's answers
 * @returns {string} HTML string for governance section
 */
function renderGovernanceGuidance(verdict, answers) {
  const items = [];
  
  // Data governance
  if (verdict === 'frontier') {
    items.push({
      icon: '🔒',
      title: 'Data Processing Agreement',
      detail: 'Ensure your API provider has a DPA in place. Review their data retention and training policies.'
    });
    if (answers.dataSensitivity === 'confidential') {
      items.push({
        icon: '⚠️',
        title: 'Compliance Review Required',
        detail: 'Confidential data + external API requires legal/compliance sign-off. Document the business justification.'
      });
    }
  }
  
  if (verdict === 'local') {
    items.push({
      icon: '🏠',
      title: 'Data Stays In-House',
      detail: 'No external data transfer. Document your local deployment for audit purposes.'
    });
  }
  
  // Risk & accountability
  if (answers.outputStakes === 'high') {
    items.push({
      icon: '👤',
      title: 'Human-in-the-Loop Required',
      detail: 'High-stakes output should have mandatory human review before action. Define who approves and document the process.'
    });
    items.push({
      icon: '📝',
      title: 'Audit Trail',
      detail: 'Log inputs, outputs, and reviewer decisions. Retain for your compliance period.'
    });
  }
  
  // Cost governance
  if (verdict === 'frontier' && answers.volumeFrequency === 'high-volume') {
    items.push({
      icon: '💰',
      title: 'Budget Controls',
      detail: 'Set up spend alerts and rate limits. High volume + API = costs can spike unexpectedly.'
    });
  }
  
  // Vendor considerations
  if (verdict === 'frontier') {
    items.push({
      icon: '🔄',
      title: 'Vendor Dependency',
      detail: 'Document fallback options. API pricing, terms, and model availability can change.'
    });
  }
  
  if (verdict === 'hybrid') {
    items.push({
      icon: '🔗',
      title: 'Integration Governance',
      detail: 'Document the data flow between local and external components. Ensure each hop is compliant.'
    });
  }
  
  // Chatbot-specific governance
  if (answers.task === 'chatbot-conversational') {
    items.push({
      icon: '💬',
      title: 'User-Facing AI Disclosure',
      detail: 'Users should know they\'re interacting with AI. Check regional requirements (EU AI Act, etc.).'
    });
    items.push({
      icon: '🛡️',
      title: 'Guardrails & Content Filtering',
      detail: 'Implement input/output filtering to prevent harmful content, prompt injection, and off-topic responses.'
    });
  }
  
  // Data extraction governance
  if (answers.task === 'data-extraction' && answers.dataSensitivity !== 'not-sensitive') {
    items.push({
      icon: '📋',
      title: 'Extraction Accuracy Validation',
      detail: 'Validate extracted data against source documents. Errors in structured data can propagate downstream.'
    });
  }

  if (items.length === 0) {
    items.push({
      icon: '✓',
      title: 'Low Governance Overhead',
      detail: 'Your combination of low sensitivity and low stakes means minimal compliance requirements.'
    });
  }

  return `
    <div class="governance-section">
      <h2 class="text-lg font-semibold mb-4">Governance Considerations</h2>
      <div class="governance-grid">
        ${items.map(item => `
          <div class="governance-item">
            <div class="governance-item-header">
              <span class="governance-icon">${item.icon}</span>
              <span class="governance-item-title">${item.title}</span>
            </div>
            <p class="governance-item-detail">${item.detail}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Renders next steps checklist based on verdict
 * @param {string} verdict - The verdict type
 * @param {Object} answers - User's answers
 * @returns {string} HTML string for next steps
 */
function renderNextSteps(verdict, answers) {
  const steps = [];
  
  if (verdict === 'local') {
    steps.push('Choose a model from recommendations above');
    if (answers.toolingComfort === 'cli') {
      steps.push('Install Ollama or llama.cpp on your target machine');
    } else if (answers.toolingComfort === 'gui') {
      steps.push('Download LM Studio or GPT4All for a visual interface');
    } else {
      steps.push('Set up managed inference via Together AI or Replicate');
    }
    steps.push('Run a pilot with representative test cases');
    steps.push('Document the deployment for your team');
  }
  
  if (verdict === 'frontier') {
    steps.push('Select an API provider from recommendations');
    steps.push('Review provider\'s terms of service and DPA');
    if (answers.dataSensitivity !== 'not-sensitive') {
      steps.push('Get compliance/legal approval for data processing');
    }
    steps.push('Set up API keys with appropriate access controls');
    steps.push('Implement rate limiting and cost monitoring');
  }
  
  if (verdict === 'hybrid') {
    steps.push('Design the architecture: which components are local vs external');
    steps.push('Document data flow and where sensitive data is processed');
    steps.push('Set up local model first, then add orchestration layer');
    steps.push('Test the full pipeline with representative data');
  }
  
  if (verdict === 'either') {
    steps.push('Try local first — lower commitment, easier to switch later');
    steps.push('If local doesn\'t meet quality bar, upgrade to frontier API');
    steps.push('Document your decision rationale for future reference');
  }
  
  if (answers.outputStakes === 'high') {
    steps.push('Define human review workflow before production use');
  }
  
  // Task-specific next steps
  if (answers.task === 'chatbot-conversational') {
    steps.push('Implement conversation state management and context window handling');
    steps.push('Add content filtering and guardrails before user-facing deployment');
  }
  
  if (answers.task === 'data-extraction') {
    steps.push('Create validation rules for extracted fields');
    steps.push('Build a sample set to measure extraction accuracy before scaling');
  }
  
  if (answers.task === 'creative-marketing') {
    steps.push('Define brand voice guidelines and review criteria');
  }

  return `
    <div class="next-steps">
      <h2 class="text-lg font-semibold mb-4">Next Steps</h2>
      <ol class="next-steps-list">
        ${steps.map((step, i) => `
          <li class="next-steps-item">
            <span class="next-steps-number">${i + 1}</span>
            <span>${step}</span>
          </li>
        `).join('')}
      </ol>
    </div>
  `;
}

/**
 * Renders a tooltip with verdict explanation
 * @param {string} verdict - The verdict type
 * @returns {string} HTML string for the tooltip
 */
function renderVerdictTooltip(verdict) {
  const explanations = {
    local: 'Run models on your own hardware. Free after setup, fully private, but limited by your compute.',
    frontier: 'Use cloud APIs like Claude or GPT-4. Best capability, but costs per token and sends data externally.',
    hybrid: 'Combine local models with external tools like RAG, agents, or fine-tuning for enhanced capability.',
    either: 'Both local and frontier approaches would work well for this use case. Choose based on preference.'
  };

  return `
    <span class="tooltip" tabindex="0" role="button" aria-label="What does ${verdict} mean?">
      ?
      <span class="tooltip-content">${explanations[verdict]}</span>
    </span>
  `;
}

/**
 * Renders the verdict card
 * @param {Object} verdict - Verdict object from decision engine
 * @param {Array} models - Models array from models.json
 * @param {boolean} modelsError - Whether models failed to load
 * @param {Object} answers - User's answers
 * @returns {string} HTML string for the verdict card
 */
export function renderVerdict(verdict, models, modelsError, answers) {
  if (!verdict) {
    return `<div class="text-center py-12 text-muted">Calculating verdict...</div>`;
  }

  const verdictClass = `verdict-badge--${verdict.verdict}`;
  
  // Filter models by verdict tier - show ALL relevant models, not a subset
  let relevantModels = [];
  let additionalModels = []; // Models that don't match hardware but user should know about
  if (models && !modelsError) {
    if (verdict.verdict === 'either') {
      // Show both local and frontier for "either" - no limit
      relevantModels = models.filter(m => m.tier === 'local' || m.tier === 'frontier');
    } else {
      relevantModels = models.filter(m => m.tier === verdict.verdict);
    }
    
    // For local models, separate into "runs on your hardware" vs "needs more resources"
    if ((verdict.verdict === 'local' || verdict.verdict === 'either') && answers.hardware) {
      const allLocalModels = relevantModels.filter(m => m.tier === 'local');
      const compatibleModels = filterModelsByHardware(allLocalModels, answers.hardware);
      const incompatibleModels = allLocalModels.filter(m => !compatibleModels.includes(m));
      
      // Keep frontier models as-is, replace local with filtered
      relevantModels = [
        ...compatibleModels,
        ...relevantModels.filter(m => m.tier === 'frontier')
      ];
      additionalModels = incompatibleModels;
    }
  }

  // Determine if we should show managed alternatives prominently
  const showManagedAlternatives = answers.toolingComfort === 'gui' || answers.toolingComfort === 'managed';
  
  // Check if we should show fix hierarchy (local + complex task)
  const isComplexTask = ['risk-assessment', 'research-synthesis', 'autonomous-coding', 
    'complex-debugging', 'long-form-document', 'multi-criteria-decision'].includes(answers.task);
  const showFixHierarchy = verdict.verdict === 'local' && isComplexTask;

  return `
    <div role="region" aria-labelledby="verdict-title" class="space-y-6">
      <!-- Verdict badge and headline -->
      <div class="text-center py-8">
        <div class="flex items-center justify-center gap-2 mb-4">
          <span class="verdict-badge ${verdictClass}" role="status">
            ${verdict.verdict.toUpperCase()}
          </span>
          ${renderVerdictTooltip(verdict.verdict)}
        </div>
        
        <h1 id="verdict-title" class="text-2xl font-semibold mb-4">${verdict.headline}</h1>
        
        <p class="text-foreground-secondary max-w-xl mx-auto leading-relaxed">
          ${verdict.reasoning}
        </p>
      </div>
      
      <!-- Model recommendations -->
      ${modelsError ? `
        <div class="p-4 bg-background-elevated border border-border rounded-lg text-center">
          <p class="text-muted">Model recommendations are temporarily unavailable.</p>
          <p class="text-sm text-muted mt-1">The verdict above is still valid based on your inputs.</p>
        </div>
      ` : relevantModels.length > 0 ? `
        <div>
          <h2 class="text-lg font-semibold mb-2">
            ${showManagedAlternatives ? 'Recommended Models & Managed Options' : 'Recommended Models'}
          </h2>
          <p class="text-sm text-muted mb-4">Based on your hardware and preferences. Each card shows the model, provider, and managed hosting options if available.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${relevantModels.map(m => renderModelCard(m)).join('')}
          </div>
        </div>
        ${additionalModels.length > 0 ? `
          <div class="mt-6">
            <h3 class="text-md font-semibold mb-2 text-foreground-secondary">Need More Capability?</h3>
            <p class="text-sm text-muted mb-4">These models require more resources than your current hardware, but offer stronger performance. Consider cloud deployment or hardware upgrade.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
              ${additionalModels.map(m => renderModelCard(m)).join('')}
            </div>
          </div>
        ` : ''}
      ` : ''}
      
      <!-- Fix hierarchy (for local + complex tasks) -->
      ${showFixHierarchy ? renderFixHierarchy() : ''}
      
      <!-- Governance considerations -->
      ${renderGovernanceGuidance(verdict.verdict, answers)}
      
      <!-- Next steps -->
      ${renderNextSteps(verdict.verdict, answers)}
      
      <!-- Metadata -->
      <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-sm text-muted">
        <span>Model registry updated: ${getLastUpdatedDate(models)}</span>
      </div>
      
      <!-- Actions -->
      <div class="flex flex-wrap gap-3 pt-4">
        <button id="share-btn" class="btn-primary">
          Share result
        </button>
        <button id="start-over-btn" class="btn-secondary">
          Start over
        </button>
      </div>
    </div>
  `;
}

/**
 * Filters models by hardware capability
 * @param {Array} models - Models to filter
 * @param {string} hardware - Hardware level
 * @returns {Array} Filtered models
 */
function filterModelsByHardware(models, hardware) {
  const hardwareCapability = {
    'laptop-basic': 1,
    'laptop-gpu': 2,
    'workstation': 3,
    'cloud': 4
  };

  const modelRequirements = {
    '3B': 1,
    '3.8B': 1,
    '4B': 1,
    '7B': 2,
    '11B': 2,
    '12B': 3,
    '14B': 3,
    'varies': 2,
    'large': 4
  };

  const userCapability = hardwareCapability[hardware] || 2;

  return models.filter(model => {
    const required = modelRequirements[model.paramSize] || 2;
    return required <= userCapability;
  });
}

/**
 * TierPilot - Explainer Component (Stage 0)
 * 
 * First-load explainer screen explaining the local vs frontier trade-off.
 * Dismissable permanently via localStorage.
 */

/**
 * Renders the explainer screen
 * @returns {string} HTML string for the explainer
 */
export function renderExplainer() {
  return `
    <div class="explainer" role="region" aria-labelledby="explainer-title">
      <h1 id="explainer-title" class="explainer-title">Choose the right LLM approach</h1>
      
      <p class="text-muted text-sm mb-6">Answer a few questions, get a recommendation in 2 minutes</p>
      
      <div class="explainer-text">
        <p>
          <strong>Local models</strong> run on your hardware — no data leaves your environment, 
          no per-token costs, but capability is limited by model size and your compute.
        </p>
        <p style="margin-top: 1rem;">
          <strong>Frontier APIs</strong> like Claude and GPT-4 offer state-of-the-art reasoning, 
          but data is processed externally and costs scale with usage.
        </p>
        <p style="margin-top: 1rem;">
          <strong>The right choice depends on:</strong> what you're building, who sees the data, 
          what happens if output is wrong, and what your org allows.
        </p>
      </div>
      
      <div class="governance-preview">
        <div class="governance-preview-item">
          <span class="governance-icon">🔒</span>
          <span>Data residency & compliance</span>
        </div>
        <div class="governance-preview-item">
          <span class="governance-icon">⚖️</span>
          <span>Risk & accountability</span>
        </div>
        <div class="governance-preview-item">
          <span class="governance-icon">💰</span>
          <span>Cost & vendor dependency</span>
        </div>
      </div>
      
      <button 
        id="get-started-btn" 
        class="btn-primary"
        aria-label="Start the decision wizard"
      >
        Get Started
      </button>
      
      <p class="text-muted text-xs mt-6">Takes about 2 minutes. No account required.</p>
    </div>
  `;
}

/**
 * TierPilot - Explainer Component (Stage 0)
 * 
 * First-load explainer screen explaining the local vs frontier trade-off.
 * Dismissable permanently via localStorage.
 */

import { t } from '../utils/i18n.js';

/**
 * Renders the explainer screen
 * @returns {string} HTML string for the explainer
 */
export function renderExplainer() {
  return `
    <div class="explainer" role="region" aria-labelledby="explainer-title">
      <h1 id="explainer-title" class="explainer-title">${t('explainer.title')}</h1>
      
      <p class="text-muted text-sm mb-6">${t('explainer.subtitle')}</p>
      
      <div class="explainer-text">
        <p>
          <strong>${t('explainer.localModels')}</strong> ${t('explainer.localDescription')}
        </p>
        <p style="margin-top: 1rem;">
          <strong>${t('explainer.frontierApis')}</strong> ${t('explainer.frontierDescription')}
        </p>
        <p style="margin-top: 1rem;">
          <strong>${t('explainer.rightChoice')}</strong> ${t('explainer.rightChoiceDescription')}
        </p>
      </div>
      
      <div class="governance-preview">
        <div class="governance-preview-item">
          <span class="governance-icon">🔒</span>
          <span>${t('explainer.governance.dataResidency')}</span>
        </div>
        <div class="governance-preview-item">
          <span class="governance-icon">⚖️</span>
          <span>${t('explainer.governance.risk')}</span>
        </div>
        <div class="governance-preview-item">
          <span class="governance-icon">💰</span>
          <span>${t('explainer.governance.cost')}</span>
        </div>
      </div>
      
      <button 
        id="get-started-btn" 
        class="btn-primary"
        aria-label="${t('explainer.getStarted')}"
      >
        ${t('explainer.getStarted')}
      </button>
      
      <p class="text-muted text-xs mt-6">${t('explainer.duration')}</p>
    </div>
  `;
}

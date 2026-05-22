/**
 * TierPilot - Share Utilities
 * 
 * Handles copying verdict summary to clipboard in a structured format.
 */

import { announce } from './accessibility.js';

/**
 * Formats the verdict for sharing as plain text.
 * Format:
 * - Line 1: Verdict in capitals
 * - Line 2: One-sentence reasoning
 * - Line 3: Top two model recommendations with provider names
 * - Line 4: TierPilot URL
 * 
 * @param {Object} verdict - The verdict object from the decision engine
 * @param {Array} models - The models array from models.json
 * @returns {string} Formatted plain text for sharing
 */
export function formatVerdictForShare(verdict, models) {
  if (!verdict) return '';

  const lines = [];

  // Line 1: Verdict in capitals
  lines.push(verdict.verdict.toUpperCase());

  // Line 2: One-sentence reasoning (headline)
  lines.push(verdict.headline);

  // Line 3: Top two model recommendations
  if (models && models.length > 0) {
    const relevantModels = models
      .filter(m => m.tier === verdict.verdict || verdict.verdict === 'either')
      .slice(0, 2);
    
    if (relevantModels.length > 0) {
      const modelNames = relevantModels
        .map(m => `${m.name} (${m.provider})`)
        .join(', ');
      lines.push(`Recommended: ${modelNames}`);
    }
  }

  // Line 4: TierPilot URL
  lines.push(window.location.origin);

  return lines.join('\n');
}

/**
 * Copies the verdict summary to clipboard and provides feedback.
 * 
 * @param {Object} verdict - The verdict object from the decision engine
 * @param {Array} models - The models array from models.json
 * @param {HTMLElement} button - The share button element for visual feedback
 */
export async function copyVerdictToClipboard(verdict, models, button) {
  const text = formatVerdictForShare(verdict, models);

  try {
    await navigator.clipboard.writeText(text);
    
    // Visual feedback
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.disabled = true;
    
    // Screen reader announcement
    announce('Verdict copied to clipboard');
    
    // Reset button after delay
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    
    // Fallback: show error state
    const originalText = button.textContent;
    button.textContent = 'Copy failed';
    
    announce('Failed to copy to clipboard');
    
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }
}

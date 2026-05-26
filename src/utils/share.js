/**
 * TierPilot - Share Utilities
 * 
 * Handles generating shareable URLs with encoded answers and copying to clipboard.
 */

import { announce } from './accessibility.js';

/**
 * Encodes answers into URL-safe query parameters
 * @param {Object} answers - User's answers object
 * @returns {string} Query string (without leading ?)
 */
export function encodeAnswersToURL(answers) {
  const params = new URLSearchParams();
  
  // Only include non-null answers
  Object.entries(answers).forEach(([key, value]) => {
    if (value !== null) {
      params.set(key, value);
    }
  });
  
  return params.toString();
}

/**
 * Decodes URL query parameters back into answers object
 * @returns {Object|null} Answers object or null if no valid params
 */
export function decodeAnswersFromURL() {
  const params = new URLSearchParams(window.location.search);
  
  if (params.size === 0) return null;
  
  const validKeys = [
    'task', 'dataSensitivity', 'outputStakes', 'volumeFrequency',
    'hardware', 'toolingComfort', 'costSensitivity', 'structuredOutput'
  ];
  
  const answers = {
    task: null,
    dataSensitivity: null,
    outputStakes: null,
    volumeFrequency: null,
    hardware: null,
    toolingComfort: null,
    costSensitivity: null,
    structuredOutput: null
  };
  
  let hasValidAnswer = false;
  
  validKeys.forEach(key => {
    const value = params.get(key);
    if (value) {
      answers[key] = value;
      hasValidAnswer = true;
    }
  });
  
  return hasValidAnswer ? answers : null;
}

/**
 * Generates a shareable URL with the user's answers encoded
 * @param {Object} answers - User's answers object
 * @returns {string} Full shareable URL
 */
export function generateShareURL(answers) {
  const queryString = encodeAnswersToURL(answers);
  const baseURL = window.location.origin + window.location.pathname;
  return queryString ? `${baseURL}?${queryString}` : baseURL;
}

/**
 * Formats the verdict for sharing as plain text with URL
 * @param {Object} verdict - The verdict object from the decision engine
 * @param {Object} answers - User's answers object
 * @returns {string} Formatted plain text for sharing
 */
export function formatVerdictForShare(verdict, answers) {
  if (!verdict) return '';

  const lines = [];

  // Line 1: Verdict in capitals
  lines.push(`🎯 ${verdict.verdict.toUpperCase()}`);

  // Line 2: Task
  if (answers.task) {
    const taskName = answers.task.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    lines.push(`Task: ${taskName}`);
  }

  // Line 3: One-sentence reasoning (headline)
  lines.push(verdict.headline);

  // Line 4: Shareable URL
  lines.push('');
  lines.push(`See my result: ${generateShareURL(answers)}`);

  return lines.join('\n');
}

/**
 * Copies the verdict summary to clipboard and provides feedback.
 * 
 * @param {Object} verdict - The verdict object from the decision engine
 * @param {Object} answers - User's answers object
 * @param {HTMLElement} button - The share button element for visual feedback
 */
export async function copyVerdictToClipboard(verdict, answers, button) {
  const text = formatVerdictForShare(verdict, answers);

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

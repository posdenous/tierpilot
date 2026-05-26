/**
 * TierPilot - Main Entry Point
 * 
 * Initializes the application and handles offline detection.
 */

import './styles/main.css';
import { initApp } from './app.js';
import { initI18n, renderLanguageSwitcher, initLanguageSwitcher, t } from './utils/i18n.js';

// Offline detection
function updateOnlineStatus() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.classList.toggle('hidden', navigator.onLine);
    if (!navigator.onLine) {
      banner.textContent = t('offline.banner');
    }
  }
}

// Update header tagline with current language
function updateHeaderTagline() {
  const tagline = document.getElementById('header-tagline');
  if (tagline) {
    tagline.textContent = t('header.tagline');
  }
}

// Initialize language switcher in header
function setupLanguageSwitcher() {
  const container = document.getElementById('language-switcher-container');
  if (container) {
    container.innerHTML = renderLanguageSwitcher();
    initLanguageSwitcher(() => {
      // Re-render app when language changes
      updateHeaderTagline();
      initApp();
    });
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize i18n first
  initI18n();
  
  // Setup language switcher
  setupLanguageSwitcher();
  updateHeaderTagline();
  
  updateOnlineStatus();
  initApp();
});

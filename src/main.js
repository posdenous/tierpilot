/**
 * TierPilot - Main Entry Point
 * 
 * Initializes the application and handles offline detection.
 */

import './styles/main.css';
import { initApp, resetApp } from './app.js';
import { initI18n, renderLanguageSwitcher, initLanguageSwitcher, t } from './utils/i18n.js';
import { initTheme, renderThemeToggle, initThemeToggle } from './utils/theme.js';

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

// Update header tagline and footer with current language
function updateStaticText() {
  const tagline = document.getElementById('header-tagline');
  if (tagline) {
    tagline.textContent = t('header.tagline');
  }
  
  const footerText = document.getElementById('footer-text');
  if (footerText) {
    footerText.textContent = t('footer.whatIsThis');
  }
}

// Initialize theme toggle in header
function setupThemeToggle() {
  const container = document.getElementById('theme-toggle-container');
  if (container) {
    container.innerHTML = renderThemeToggle();
    initThemeToggle();
  }
}

// Initialize language switcher in header
function setupLanguageSwitcher() {
  const container = document.getElementById('language-switcher-container');
  if (container) {
    container.innerHTML = renderLanguageSwitcher();
    initLanguageSwitcher(() => {
      // Re-render app when language changes
      updateStaticText();
      initApp();
    });
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme first (prevents flash)
  initTheme();
  setupThemeToggle();
  
  // Initialize i18n
  initI18n();
  setupLanguageSwitcher();
  updateStaticText();
  
  updateOnlineStatus();
  initApp();
  
  // Logo click - go back to start
  const logoLink = document.getElementById('logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      resetApp();
    });
  }
});

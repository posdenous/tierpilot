/**
 * TierPilot - Main Entry Point
 * 
 * Initializes the application and handles offline detection.
 */

import './styles/main.css';
import { initApp } from './app.js';

// Offline detection
function updateOnlineStatus() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.classList.toggle('hidden', navigator.onLine);
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateOnlineStatus();
  initApp();
});

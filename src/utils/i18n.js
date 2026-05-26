/**
 * TierPilot - Internationalization (i18n) Utility
 * 
 * Handles language loading, switching, and string retrieval.
 * Supports: English, German, Spanish, French, Italian
 */

import en from '../locales/en.json';
import de from '../locales/de.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import it from '../locales/it.json';

const STORAGE_KEY = 'tierpilot-language';

const locales = { en, de, es, fr, it };

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

let currentLanguage = 'en';
let currentStrings = en;

/**
 * Initialize i18n - load saved language or detect from browser
 */
export function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY);
  
  if (saved && locales[saved]) {
    setLanguage(saved);
  } else {
    // Try to detect from browser
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang && locales[browserLang]) {
      setLanguage(browserLang);
    } else {
      setLanguage('en');
    }
  }
  
  return currentLanguage;
}

/**
 * Set the current language
 * @param {string} langCode - Language code (en, de, es, fr, it)
 */
export function setLanguage(langCode) {
  if (!locales[langCode]) {
    console.warn(`Language ${langCode} not supported, falling back to English`);
    langCode = 'en';
  }
  
  currentLanguage = langCode;
  currentStrings = locales[langCode];
  localStorage.setItem(STORAGE_KEY, langCode);
  
  // Update HTML lang attribute
  document.documentElement.lang = langCode;
  
  return currentLanguage;
}

/**
 * Get current language code
 * @returns {string} Current language code
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Get a translated string by path
 * @param {string} path - Dot-notation path to string (e.g., 'explainer.title')
 * @param {Object} params - Optional parameters for interpolation
 * @returns {string} Translated string or path if not found
 */
export function t(path, params = {}) {
  const keys = path.split('.');
  let value = currentStrings;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Translation not found: ${path}`);
      return path;
    }
  }
  
  if (typeof value !== 'string') {
    return value; // Return object/array as-is
  }
  
  // Simple interpolation: replace {key} with params[key]
  return value.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}

/**
 * Get all supported languages
 * @returns {Array} Array of language objects
 */
export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Get current language info
 * @returns {Object} Current language object
 */
export function getCurrentLanguageInfo() {
  return SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
}

/**
 * Render the language switcher dropdown
 * @returns {string} HTML string for language switcher
 */
export function renderLanguageSwitcher() {
  const current = getCurrentLanguageInfo();
  
  return `
    <div class="language-switcher">
      <button 
        id="language-toggle" 
        class="language-toggle"
        aria-expanded="false"
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span class="language-flag">${current.flag}</span>
        <span class="language-code">${current.code.toUpperCase()}</span>
        <svg class="language-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <ul id="language-menu" class="language-menu hidden" role="listbox" aria-label="Available languages">
        ${SUPPORTED_LANGUAGES.map(lang => `
          <li 
            class="language-option ${lang.code === currentLanguage ? 'language-option--active' : ''}"
            role="option"
            aria-selected="${lang.code === currentLanguage}"
            data-lang="${lang.code}"
          >
            <span class="language-flag">${lang.flag}</span>
            <span>${lang.name}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

/**
 * Initialize language switcher event listeners
 * @param {Function} onLanguageChange - Callback when language changes
 */
export function initLanguageSwitcher(onLanguageChange) {
  const toggle = document.getElementById('language-toggle');
  const menu = document.getElementById('language-menu');
  
  if (!toggle || !menu) return;
  
  // Toggle menu
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    menu.classList.toggle('hidden');
  });
  
  // Handle option selection
  menu.addEventListener('click', (e) => {
    const option = e.target.closest('.language-option');
    if (!option) return;
    
    const langCode = option.dataset.lang;
    if (langCode && langCode !== currentLanguage) {
      setLanguage(langCode);
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      
      if (onLanguageChange) {
        onLanguageChange(langCode);
      }
    }
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', () => {
    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  });
  
  // Keyboard navigation
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

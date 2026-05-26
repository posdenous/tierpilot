/**
 * TierPilot - Theme Utility
 * 
 * Handles light/dark mode switching and persistence.
 */

const STORAGE_KEY = 'tierpilot-theme';

const THEMES = {
  light: { icon: '☀️', label: 'Light' },
  dark: { icon: '🌙', label: 'Dark' }
};

let currentTheme = 'dark';

/**
 * Apply theme to document
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update meta theme-color for mobile browsers
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#0a0a0b' : '#ffffff');
  }
}

/**
 * Initialize theme - load saved preference or default to dark
 */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  
  if (saved && THEMES[saved]) {
    currentTheme = saved;
  } else {
    currentTheme = 'dark';
  }
  
  applyTheme(currentTheme);
  
  return currentTheme;
}

/**
 * Set the current theme
 * @param {string} theme - 'light' or 'dark'
 */
export function setTheme(theme) {
  if (!THEMES[theme]) {
    console.warn(`Theme ${theme} not supported`);
    return;
  }
  
  currentTheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  
  return currentTheme;
}

/**
 * Get current theme setting
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getTheme() {
  return currentTheme;
}

/**
 * Toggle between light and dark
 * @returns {string} New theme
 */
export function toggleTheme() {
  return setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

/**
 * Render the theme toggle button
 * @returns {string} HTML string for theme toggle
 */
export function renderThemeToggle() {
  const theme = THEMES[currentTheme];
  
  return `
    <button 
      id="theme-toggle" 
      class="theme-toggle"
      aria-label="Toggle theme (current: ${theme.label})"
      title="Toggle theme"
    >
      <span class="theme-icon">${theme.icon}</span>
    </button>
  `;
}

/**
 * Initialize theme toggle event listener
 */
export function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  toggle.addEventListener('click', () => {
    const newTheme = toggleTheme();
    const icon = toggle.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = THEMES[newTheme].icon;
    }
    toggle.setAttribute('aria-label', `Toggle theme (current: ${THEMES[newTheme].label})`);
  });
}

/**
 * TierPilot - Theme Utility
 * 
 * Handles light/dark mode switching and persistence.
 */

const STORAGE_KEY = 'tierpilot-theme';

const THEMES = {
  light: { icon: '☀️', label: 'Light' },
  dark: { icon: '🌙', label: 'Dark' },
  system: { icon: '💻', label: 'System' }
};

let currentTheme = 'system';

/**
 * Get the system's preferred color scheme
 * @returns {string} 'light' or 'dark'
 */
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to document
 * @param {string} theme - 'light', 'dark', or 'system'
 */
function applyTheme(theme) {
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', effectiveTheme);
  
  // Update meta theme-color for mobile browsers
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', effectiveTheme === 'dark' ? '#0a0a0b' : '#ffffff');
  }
}

/**
 * Initialize theme - load saved preference or detect system
 */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  
  if (saved && THEMES[saved]) {
    currentTheme = saved;
  } else {
    currentTheme = 'system';
  }
  
  applyTheme(currentTheme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });
  
  return currentTheme;
}

/**
 * Set the current theme
 * @param {string} theme - 'light', 'dark', or 'system'
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
 * @returns {string} Current theme ('light', 'dark', or 'system')
 */
export function getTheme() {
  return currentTheme;
}

/**
 * Cycle to next theme (light → dark → system → light)
 * @returns {string} New theme
 */
export function cycleTheme() {
  const order = ['light', 'dark', 'system'];
  const currentIndex = order.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % order.length;
  return setTheme(order[nextIndex]);
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
    const newTheme = cycleTheme();
    const icon = toggle.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = THEMES[newTheme].icon;
    }
    toggle.setAttribute('aria-label', `Toggle theme (current: ${THEMES[newTheme].label})`);
  });
}

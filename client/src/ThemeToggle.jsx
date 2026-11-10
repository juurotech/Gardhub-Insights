import { Moon, Sun } from 'lucide-react'

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      className="theme-toggle"
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={onToggle}
    >
      <Sun className="theme-icon theme-icon-sun" size={14} aria-hidden="true" />
      <Moon className="theme-icon theme-icon-moon" size={14} aria-hidden="true" />
      <span className="theme-toggle-thumb" aria-hidden="true" />
    </button>
  )
}

export default ThemeToggle
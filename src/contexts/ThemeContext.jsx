import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './theme-context'

const THEME_MODE_STORAGE_KEY = 'wasabi-theme-mode'
const DARK_THEME_STORAGE_KEY = 'wasabi-dark-theme-variant'

function getSystemPreference() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readInitialMode() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)
  return storedMode === 'dark' || storedMode === 'light' ? storedMode : getSystemPreference()
}

function readInitialDarkThemeVariant() {
  if (typeof window === 'undefined') {
    return 'default'
  }

  const storedVariant = window.localStorage.getItem(DARK_THEME_STORAGE_KEY)
  return storedVariant === 'blue' || storedVariant === 'default' ? storedVariant : 'default'
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(readInitialMode)
  const [darkThemeVariant, setDarkThemeVariant] = useState(readInitialDarkThemeVariant)
  const isDarkMode = themeMode === 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.documentElement.dataset.darkVariant = darkThemeVariant
    document.documentElement.classList.toggle('dark', themeMode === 'dark')
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode)
    window.localStorage.setItem(DARK_THEME_STORAGE_KEY, darkThemeVariant)
  }, [darkThemeVariant, themeMode])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function handleChange(event) {
      const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY)

      if (storedMode === 'dark' || storedMode === 'light') {
        return
      }

      setThemeMode(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  const value = useMemo(
    () => ({
      darkThemeVariant,
      isDarkMode,
      setDarkThemeVariant,
      setThemeMode,
      themeMode,
      toggleThemeMode: () => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [darkThemeVariant, isDarkMode, themeMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

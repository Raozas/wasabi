import { createContext } from 'react'

export const ThemeContext = createContext({
  darkThemeVariant: 'default',
  isDarkMode: false,
  setDarkThemeVariant: () => {},
  setThemeMode: () => {},
  themeMode: 'light',
  toggleThemeMode: () => {},
})

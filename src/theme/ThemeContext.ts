import { createContext, useContext } from 'react'
import type { ThemeMode } from './ThemeProvider'

export type ThemeContextValue = {
  mode: ThemeMode
  toggleMode: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

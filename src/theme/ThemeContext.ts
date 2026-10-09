import { createContext } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = Exclude<ThemeMode, 'system'>

export type ThemeContextValue = {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

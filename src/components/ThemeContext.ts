import { createContext } from 'react'

export type ThemeMode =
  | 'system'
  | 'light'
  | 'dark'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'pink'
  | 'rainbow'

type ThemeContextValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

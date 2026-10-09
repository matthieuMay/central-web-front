import { createContext, useContext } from 'react'

export type ColorMode = 'light' | 'dark'
export type ColorModePreference = ColorMode | 'system'

export const DARK_QUERY = '(prefers-color-scheme: dark)'

export type ColorModeContextValue = {
  preference: ColorModePreference
  colorMode: ColorMode
  setPreference: (preference: ColorModePreference) => void
}

export const ColorModeContext = createContext<ColorModeContextValue | null>(null)

export function useColorMode() {
  const context = useContext(ColorModeContext)
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider')
  }
  return context
}
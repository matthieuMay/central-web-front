import { createContext, useContext } from 'react'

export type ColorMode = 'light' | 'dark'

const DARK_QUERY = '(prefers-color-scheme: dark)'

export function getSystemColorMode(): ColorMode {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

export function subscribeToSystemColorMode(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function applyColorMode(mode: ColorMode) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(mode)
  root.style.colorScheme = mode
}

type ColorModeContextValue = {
  colorMode: ColorMode
  toggleColorMode: () => void
}

export const ColorModeContext = createContext<ColorModeContextValue | null>(null)

export function useColorMode() {
  const context = useContext(ColorModeContext)
  if (!context) throw new Error('useColorMode must be used within ColorModeProvider')
  return context
}

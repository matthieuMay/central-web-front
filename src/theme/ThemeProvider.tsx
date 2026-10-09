import { type ReactNode, useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext'

export type ThemeMode = 'light' | 'dark'

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = mode
  }
}

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(getSystemTheme)
  const [hasManuallyToggled, setHasManuallyToggled] = useState(false)

  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (!hasManuallyToggled) {
        setMode(event.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [hasManuallyToggled])

  const toggleMode = () => {
    setHasManuallyToggled(true)
    setMode((currentMode) => currentMode === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

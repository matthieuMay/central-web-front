import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './ThemeContext'

export type Theme = 'light' | 'dark'

export type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
  isOverridden: boolean
}

function getSystemTheme(): Theme {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getSystemTheme)
  const [isOverridden, setIsOverridden] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (!isOverridden) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [isOverridden])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const toggleTheme = () => {
    setIsOverridden(true)
    setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isOverridden }}>
      {children}
    </ThemeContext.Provider>
  )
}

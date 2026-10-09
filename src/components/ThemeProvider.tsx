import { useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext, type ThemeMode } from './ThemeContext'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')

  useLayoutEffect(() => {
    if (mode === 'system') {
      document.documentElement.removeAttribute('data-theme')
      return
    }

    document.documentElement.dataset.theme = mode
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ColorModeContext, type ColorMode } from './color-mode-context.ts'

const STORAGE_KEY = 'mini-trello-color-mode'

function getInitialColorMode(): ColorMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>(getInitialColorMode)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', colorMode === 'dark')
    root.style.colorScheme = colorMode
    window.localStorage.setItem(STORAGE_KEY, colorMode)
  }, [colorMode])

  const toggleColorMode = useCallback(() => {
    setColorMode((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ colorMode, toggleColorMode }), [colorMode, toggleColorMode])

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
}

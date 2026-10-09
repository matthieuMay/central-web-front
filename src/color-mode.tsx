import { useEffect, useState, type ReactNode } from 'react'
import {
  ColorModeContext,
  DARK_QUERY,
  type ColorMode,
  type ColorModePreference,
} from './color-mode-context'

function systemColorMode(): ColorMode {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ColorModePreference>('system')
  const [systemMode, setSystemMode] = useState<ColorMode>(systemColorMode)

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? 'dark' : 'light')
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const colorMode = preference === 'system' ? systemMode : preference

  useEffect(() => {
    document.documentElement.classList.toggle('dark', colorMode === 'dark')
  }, [colorMode])

  return (
    <ColorModeContext value={{ preference, colorMode, setPreference }}>
      {children}
    </ColorModeContext>
  )
}
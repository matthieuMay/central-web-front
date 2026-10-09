import { useLayoutEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { applyColorMode, ColorModeContext, getSystemColorMode, subscribeToSystemColorMode, type ColorMode } from './colorMode'

// The manual override lives only in React state: a reload starts from the OS preference again.
export function ColorModeProvider({ children }: { children: ReactNode }) {
  const systemMode = useSyncExternalStore(subscribeToSystemColorMode, getSystemColorMode)
  const [override, setOverride] = useState<ColorMode | null>(null)
  const colorMode = override ?? systemMode

  useLayoutEffect(() => {
    applyColorMode(colorMode)
  }, [colorMode])

  const toggleColorMode = () => setOverride(colorMode === 'dark' ? 'light' : 'dark')

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  )
}

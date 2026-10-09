import { useEffect, useState } from 'react'

export type ColorMode = 'light' | 'dark'

// Media query that tells us whether the OS prefers a dark theme
const darkSchemeQuery = '(prefers-color-scheme: dark)'

function getOsColorMode(): ColorMode {
  const osPrefersDark = window.matchMedia(darkSchemeQuery).matches
  return osPrefersDark ? 'dark' : 'light'
}

// Light/dark theme that starts from the OS preference.
// Nothing is saved: on reload, we start again from the OS preference.
export function useColorMode() {
  // Step 1: the initial theme comes from the OS
  const [colorMode, setColorMode] = useState<ColorMode>(getOsColorMode)

  // Step 2: remember (in memory only) if the user clicked the toggle during this visit
  const [userHasToggled, setUserHasToggled] = useState(false)

  // Step 3: apply the theme to <html> so Chakra and our CSS use the right colors
  useEffect(() => {
    const htmlElement = document.documentElement
    htmlElement.classList.remove('light', 'dark')
    htmlElement.classList.add(colorMode)
    htmlElement.style.colorScheme = colorMode
  }, [colorMode])

  // Step 4: follow OS changes, but only while the user has not used the toggle
  useEffect(() => {
    const osQuery = window.matchMedia(darkSchemeQuery)

    function handleOsChange(event: MediaQueryListEvent) {
      if (userHasToggled) return
      setColorMode(event.matches ? 'dark' : 'light')
    }

    osQuery.addEventListener('change', handleOsChange)
    return () => osQuery.removeEventListener('change', handleOsChange)
  }, [userHasToggled])

  // Called by the Header button: switch the theme and stop following the OS
  function toggleColorMode() {
    setColorMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'))
    setUserHasToggled(true)
  }

  return { colorMode, toggleColorMode }
}

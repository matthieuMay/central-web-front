import { useLayoutEffect, useState, useSyncExternalStore } from 'react'

const systemThemeQuery = '(prefers-color-scheme: dark)'

function subscribe(onChange: () => void) {
  const preference = window.matchMedia(systemThemeQuery)
  preference.addEventListener('change', onChange)
  return () => preference.removeEventListener('change', onChange)
}

function isSystemDark() {
  return window.matchMedia(systemThemeQuery).matches
}

export function useTheme() {
  const systemDark = useSyncExternalStore(subscribe, isSystemDark)
  // null follows the system; any manual choice lasts until page reload.
  const [manualDark, setManualDark] = useState<boolean | null>(null)
  const dark = manualDark ?? systemDark

  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
    root.style.colorScheme = dark ? 'dark' : 'light'
  }, [dark])

  return {
    dark,
    toggleTheme: () => setManualDark((previous) => !(previous ?? systemDark)),
  }
}

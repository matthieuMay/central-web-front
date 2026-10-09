import { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router'
import { Header } from './Header'

const darkModeMediaQuery = '(prefers-color-scheme: dark)'

export function Layout() {
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia(darkModeMediaQuery).matches,
  )
  const [themeOverride, setThemeOverride] = useState<boolean | null>(null)
  const isDarkMode = themeOverride ?? systemPrefersDark

  useEffect(() => {
    const mediaQuery = window.matchMedia(darkModeMediaQuery)
    const updateSystemPreference = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches)
    }

    mediaQuery.addEventListener('change', updateSystemPreference)
    return () => mediaQuery.removeEventListener('change', updateSystemPreference)
  }, [])

  return (
    <Box
      className="app-shell"
      data-color-mode={isDarkMode ? 'dark' : 'light'}
      minH="100dvh"
      bg="var(--app-background)"
      color="var(--app-text)"
    >
      <Header
        isDarkMode={isDarkMode}
        onToggleColorMode={() => setThemeOverride(!isDarkMode)}
      />
      <Box as="main" px={{ base: 4, md: 8 }} py={8}>
        <Outlet />
      </Box>
    </Box>
  )
}

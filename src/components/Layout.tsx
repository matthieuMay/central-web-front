import { Box } from '@chakra-ui/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from './Header'

type Theme = 'light' | 'dark'

export function Layout() {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const manualOverride = useRef(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateFromSystem = (event: MediaQueryListEvent) => {
      if (!manualOverride.current) setTheme(event.matches ? 'dark' : 'light')
    }

    if (!manualOverride.current) setTheme(mediaQuery.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', updateFromSystem)
    return () => mediaQuery.removeEventListener('change', updateFromSystem)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function toggleTheme() {
    manualOverride.current = true
    setTheme((current) => current === 'dark' ? 'light' : 'dark')
  }

  return (
    <Box minH="100dvh" bg="var(--app-page-bg)" color="var(--app-text)">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <Box as="main" px={{ base: 4, md: 8 }} py={8}>
        <Outlet />
      </Box>
    </Box>
  )
}

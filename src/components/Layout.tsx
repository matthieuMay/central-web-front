import { Box } from '@chakra-ui/react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from './Header'

type Theme = 'light' | 'dark'

const colorSchemeQuery = '(prefers-color-scheme: dark)'

function getSystemTheme(): Theme {
  return window.matchMedia?.(colorSchemeQuery).matches ? 'dark' : 'light'
}

export function Layout() {
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)
  const [manualTheme, setManualTheme] = useState<Theme | null>(null)
  const theme = manualTheme ?? systemTheme

  useEffect(() => {
    if (!window.matchMedia) return

    const media = window.matchMedia(colorSchemeQuery)
    const updateSystemTheme = () => setSystemTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', updateSystemTheme)
    updateSystemTheme()

    return () => media.removeEventListener('change', updateSystemTheme)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  return (
    <Box minH="100dvh" bg="bg.subtle" color="fg">
      <Header theme={theme} onToggleTheme={() => setManualTheme(theme === 'dark' ? 'light' : 'dark')} />
      <Box as="main" px={{ base: 4, md: 8 }} py={8}>
        <Outlet />
      </Box>
    </Box>
  )
}

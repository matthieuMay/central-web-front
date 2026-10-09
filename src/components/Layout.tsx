import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router'
import { Header } from './Header'
import { useTheme } from '../hooks/useTheme'

export function Layout() {
  const { dark, toggleTheme } = useTheme()
  return (
    <Box minH="100dvh" bg="bg.subtle" color="fg">
      <Header dark={dark} onToggleTheme={toggleTheme} />
      <Box as="main" px={{ base: 4, md: 8 }} py={8}>
        <Outlet />
      </Box>
    </Box>
  )
}

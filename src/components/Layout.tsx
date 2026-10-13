import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router'
import { Header } from './Header'
import { useTheme } from '../hooks/useTheme'

export function Layout() {
  const { dark, toggleTheme } = useTheme()
  return (
    <Box
      className="app-shell"
      minH="100dvh"
      bg="bg.subtle"
      color="fg"
      colorPalette="brand"
    >

      <Header dark={dark} onToggleTheme={toggleTheme} />
      <Box
        as="main"
        id="main-content"
        tabIndex={-1}
        maxW="1600px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={{ base: 6, md: 10 }}
      >

        <Outlet />
      </Box>
    </Box>
  )
}

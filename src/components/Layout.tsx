import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router'
import { Header } from './Header'

export function Layout() {
  return (
    <Box minH="100dvh" bg="var(--app-background)" color="var(--text-primary)">
      <Header />
      <Box as="main" px={{ base: 4, md: 8 }} py={8}>
        <Outlet />
      </Box>
    </Box>
  )
}

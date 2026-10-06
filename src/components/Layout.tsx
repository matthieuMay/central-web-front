import { Box, Container } from '@chakra-ui/react'
import { Outlet } from 'react-router'
import { Header } from './Header'

export function Layout() {
  return (
    <Box minH="100dvh" bg="gray.50">
      <Header />
      <Container as="main" maxW="7xl" px={{ base: 4, md: 8 }} py={8}>
        <Outlet />
      </Container>
    </Box>
  )
}

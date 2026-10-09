import { Box, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'
import { ColorModeToggle } from './ColorModeToggle'

export function Header() {
  return (
    <Box as="header" borderBottomWidth="1px" bg="bg.panel">
      <Flex
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Heading as="span" size="lg">Mini-Trello</Heading>
        <Flex align="center" gap={2}>
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end>Accueil</NavLink>
            <NavLink className="nav-link" to="/board">Tableau</NavLink>
          </Flex>
          <ColorModeToggle />
        </Flex>
      </Flex>
    </Box>
  )
}

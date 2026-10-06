import { Box, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'

export function Header() {
  return (
    <Box as="header" borderBottomWidth="1px" bg="white">
      <Flex
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Heading as="span" size="lg">Mini-Trello</Heading>
        <Flex as="nav" aria-label="Navigation principale" gap={2}>
          <NavLink className="nav-link" to="/" end>Accueil</NavLink>
          <NavLink className="nav-link" to="/board">Tableau</NavLink>
        </Flex>
      </Flex>
    </Box>
  )
}

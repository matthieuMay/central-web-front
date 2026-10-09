import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'
import { useColorMode } from '../hooks/useColorMode'

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode()

  // The button label describes the theme the user will switch to
  const isDark = colorMode === 'dark'
  const toggleLabel = isDark ? '☀️ Mode clair' : '🌙 Mode sombre'
  const toggleAriaLabel = isDark ? 'Passer au thème clair' : 'Passer au thème sombre'

  return (
    <Box as="header" borderBottomWidth="1px" bg="bg">
      <Flex
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Heading as="span" size="lg">Mini-Trello</Heading>
        <Flex align="center" gap={4} wrap="wrap">
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end>Accueil</NavLink>
            <NavLink className="nav-link" to="/board">Tableau</NavLink>
          </Flex>
          <Button variant="outline" size="sm" onClick={toggleColorMode} aria-label={toggleAriaLabel}>
            {toggleLabel}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

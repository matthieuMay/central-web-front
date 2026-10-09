import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'
import { useTheme } from '../theme-context'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Box as="header" borderBottomWidth="1px" borderColor="var(--color-border)" bg="var(--color-surface)">
      <Flex
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Heading as="span" size="lg">Mini-Trello</Heading>
        <Flex align="center" gap={3} wrap="wrap">
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end>Accueil</NavLink>
            <NavLink className="nav-link" to="/board">Tableau</NavLink>
          </Flex>
          <Flex gap={2} align="center">
            <Button
              size="sm"
              variant="outline"
              className="theme-toggle"
              color="var(--color-foreground)"
              borderColor="var(--color-border)"
              aria-label={`Passer au thème ${theme === 'dark' ? 'clair' : 'sombre'}`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Clair' : 'Sombre'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

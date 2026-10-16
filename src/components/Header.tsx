import { Box, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'

type HeaderProps = { theme: 'light' | 'dark'; onToggleTheme: () => void }

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <Box as="header" borderBottomWidth="1px" borderColor="var(--app-border)" bg="var(--app-surface)">
      <Flex
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Heading as="span" size="lg">Mini-Trello</Heading>
        <Flex align="center" gap={2} wrap="wrap">
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end>Accueil</NavLink>
            <NavLink className="nav-link" to="/board">Tableau</NavLink>
          </Flex>
          <button
            type="button"
            className="theme-toggle"
            aria-label={`Passer au thème ${theme === 'dark' ? 'clair' : 'sombre'}`}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
          </button>
        </Flex>
      </Flex>
    </Box>
  )
}

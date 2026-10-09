import { Box, Flex, Heading, IconButton } from '@chakra-ui/react'
import { Moon, Sun } from 'lucide-react'
import { NavLink } from 'react-router'

type HeaderProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <Box as="header" className="app-header">
      <Flex
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Heading as="span" size="xl" className="brand">Mini-Trello</Heading>
        <Flex align="center" gap={4} wrap="wrap">
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end>Accueil</NavLink>
            <NavLink className="nav-link" to="/board">Tableau</NavLink>
          </Flex>
          <IconButton
            type="button" variant="ghost" size="sm" className="theme-button" onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </IconButton>
        </Flex>
      </Flex>
    </Box>
  )
}

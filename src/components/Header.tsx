import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'
import { useTheme } from '../theme/ThemeContext'

export function Header() {
  const { mode, toggleMode } = useTheme()

  return (
    <Box as="header" borderBottomWidth="1px" bg="var(--app-surface)">
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
          <Button
            aria-label={mode === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'}
            aria-pressed={mode === 'dark'}
            onClick={toggleMode}
            size="sm"
            variant="outline"
          >
            {mode === 'dark' ? '☀ Clair' : '☾ Sombre'}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'
import { useTheme } from '../theme/useTheme'

export function Header() {
  const { theme, toggleTheme, isOverridden } = useTheme()
  const nextTheme = theme === 'light' ? 'dark' : 'light'

  return (
    <Box as="header" borderBottomWidth="1px" bg="var(--surface-bg)" borderColor="var(--border-color)">
      <Flex
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Heading as="span" size="lg">Mini-Trello</Heading>
        <Flex align="center" gap={3}>
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end>Accueil</NavLink>
            <NavLink className="nav-link" to="/board">Tableau</NavLink>
          </Flex>
          <Button
            className="theme-toggle"
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Passer au thème ${nextTheme}`}
            aria-pressed={isOverridden}
            title={`Passer au thème ${nextTheme}`}
            onClick={toggleTheme}
          >
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

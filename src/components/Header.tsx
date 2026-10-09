import { Box, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'

type HeaderProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <Box as="header" borderBottomWidth="1px" bg="bg" borderColor="border">
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
          <label className="theme-toggle">
            <input type="checkbox" role="switch" checked={theme === 'dark'} onChange={onToggleTheme} />
            <span>Mode sombre</span>
          </label>
        </Flex>
      </Flex>
    </Box>
  )
}

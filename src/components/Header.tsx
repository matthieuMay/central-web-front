import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'

type HeaderProps = {
  isDarkMode: boolean
  onToggleColorMode: () => void
}

export function Header({ isDarkMode, onToggleColorMode }: HeaderProps) {
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
        <Flex as="nav" aria-label="Navigation principale" gap={2}>
          <NavLink className="nav-link" to="/" end>Accueil</NavLink>
          <NavLink className="nav-link" to="/board">Tableau</NavLink>
        </Flex>
        <Button
          aria-label={isDarkMode ? 'Activer le thème clair' : 'Activer le thème sombre'}
          onClick={onToggleColorMode}
          size="sm"
          variant="outline"
          color="var(--app-text)"
          borderColor="var(--app-border)"
          _hover={{ bg: 'var(--app-muted-surface)' }}
        >
          {isDarkMode ? 'Thème clair' : 'Thème sombre'}
        </Button>
      </Flex>
    </Box>
  )
}

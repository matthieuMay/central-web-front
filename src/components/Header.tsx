import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'

type HeaderProps = { dark: boolean; onToggleTheme: () => void }

export function Header({ dark, onToggleTheme }: HeaderProps) {
  return (
    <Box as="header" borderBottomWidth="1px" borderColor="fg.muted" bg="bg">
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
          variant="outline"
          color="fg"
          borderColor="fg.muted"
          _hover={{ bg: 'bg.muted' }}
          _focusVisible={{ outlineColor: 'blue.focusRing' }}
          onClick={onToggleTheme}
        >
          {dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        </Button>
      </Flex>
    </Box>
  )
}

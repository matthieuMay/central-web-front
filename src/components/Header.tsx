import { Box, Flex, Heading, NativeSelect } from '@chakra-ui/react'
import { NavLink } from 'react-router'
import { useTheme } from '../theme'

export function Header() {
  const { mode, setMode } = useTheme()

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
        <Flex align="center" gap={4} wrap="wrap">
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end>Accueil</NavLink>
            <NavLink className="nav-link" to="/board">Tableau</NavLink>
          </Flex>
          <NativeSelect.Root width="auto" size="sm">
            <NativeSelect.Field
              aria-label="Thème"
              value={mode}
              onChange={(event) => setMode(event.target.value as typeof mode)}
              bg="var(--app-surface)"
              borderColor="var(--app-border)"
            >
              <option value="system">Système</option>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Flex>
      </Flex>
    </Box>
  )
}

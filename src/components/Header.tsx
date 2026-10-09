import { Box, Flex, Heading, Switch } from '@chakra-ui/react'
import { NavLink } from 'react-router'
import { useColorMode } from '../theme/colorMode'

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box as="header" borderBottomWidth="1px" bg="bg.panel">
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
          <Switch.Root checked={colorMode === 'dark'} onCheckedChange={toggleColorMode} colorPalette="blue">
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>Mode sombre</Switch.Label>
          </Switch.Root>
        </Flex>
      </Flex>
    </Box>
  )
}

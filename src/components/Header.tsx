import { Box, Flex, Heading, IconButton } from '@chakra-ui/react'
import { DashboardIcon, HomeIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { NavLink } from 'react-router'

type HeaderProps = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <Box as="header" borderBottomWidth="1px" bg="var(--app-surface)" borderColor="var(--app-border)">
      <Flex
        px={{ base: 4, md: 8, xl: 10 }}
        py={3}
        maxW="1600px" mx="auto"
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Flex align="center" gap={3}>
          <Box p={2} bg="bg.info" color="fg.info" borderRadius="md"><DashboardIcon width={20} height={20} aria-hidden="true" /></Box>
          <Heading as="span" size="md" letterSpacing="-0.02em">Mini-Trello</Heading>
        </Flex>
        <Flex align="center" gap={{ base: 2, md: 5 }} wrap="wrap">
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end><HomeIcon aria-hidden="true" />Accueil</NavLink>
            <NavLink className="nav-link" to="/board"><DashboardIcon aria-hidden="true" />Tableau</NavLink>
          </Flex>
          <IconButton variant="ghost" size="sm" role="switch" aria-checked={theme === 'dark'} aria-label="Mode sombre" title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'} onClick={onToggleTheme}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </IconButton>
        </Flex>
      </Flex>
    </Box>
  )
}

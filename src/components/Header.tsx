import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'

type HeaderProps = {
  dark: boolean
  onToggleTheme: () => void
}

export function Header({ dark, onToggleTheme }: HeaderProps) {
  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg"
      className="app-header"
    >

      <a className="skip-link" href="#main-content">Aller au contenu</a>
      <Flex
        px={{ base: 4, md: 8 }}
        py={5}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >

        <Flex align="center" gap={3}>

          <Flex
            aria-hidden="true"
            align="start"
            gap="4px"
            p="9px"
            bg="brand.solid"
            borderRadius="xl"
            boxShadow="card"
          >

            <Box
              w="5px"
              h="20px"
              borderRadius="full"
              bg="brand.contrast"
            />
            <Box
              w="5px"
              h="14px"
              borderRadius="full"
              bg="brand.contrast"
            />
            <Box
              w="5px"
              h="17px"
              borderRadius="full"
              bg="brand.contrast"
            />
          </Flex>
          <Heading as="span" size="lg" letterSpacing="tight">Mini-Trello</Heading>
        </Flex>
        <Flex
          as="nav"
          aria-label="Navigation principale"
          gap={2}
          wrap="wrap"
        >

          <NavLink className="nav-link" to="/" end>Accueil</NavLink>
          <NavLink className="nav-link" to="/board">Tableau</NavLink>
          <NavLink className="nav-link" to="/analytics">Analytics</NavLink>
        </Flex>
        <Button
          variant="outline"
          color="fg"
          borderColor="border.emphasized"
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

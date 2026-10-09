import { Box, Button, Flex, Heading, Menu, Portal } from '@chakra-ui/react'
import type { ReactElement } from 'react'
import { NavLink } from 'react-router'
import { useColorMode, type ColorModePreference } from '../color-mode-context'
import { LOCALE_NAMES, LOCALES, useLocale } from '../locale-context'

const NEXT_PREFERENCE: Record<ColorModePreference, ColorModePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

function SunIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}

const PREFERENCE_ICONS: Record<ColorModePreference, ReactElement> = {
  system: <MonitorIcon />,
  light: <SunIcon />,
  dark: <MoonIcon />,
}

export function Header() {
  const { preference, setPreference } = useColorMode()
  const { locale, setLocale } = useLocale()

  const preferenceLabels: Record<ColorModePreference, string> = {
    system: 'Système',
    light: 'Clair',
    dark: 'Sombre',
  }

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
        <Flex align="center" gap={4}>
          <Flex as="nav" aria-label="Navigation principale" gap={2}>
            <NavLink className="nav-link" to="/" end>Accueil</NavLink>
            <NavLink className="nav-link" to="/board">Tableau</NavLink>
          </Flex>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm" aria-label="Changer de langue">
                {LOCALE_NAMES[locale]}
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {LOCALES.map((code) => (
                    <Menu.Item key={code} value={code} onClick={() => setLocale(code)}>
                      <Menu.ItemText>{LOCALE_NAMES[code]}</Menu.ItemText>
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Mode de couleur : ${preferenceLabels[preference]}`}
            onClick={() => setPreference(NEXT_PREFERENCE[preference])}
          >
            {PREFERENCE_ICONS[preference]}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

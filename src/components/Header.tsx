import { Box, Flex, Heading } from '@chakra-ui/react'
import { NavLink } from 'react-router'
import type { ThemeMode } from './ThemeContext'
import { useThemeMode } from './useThemeMode'

export function Header() {
  const { mode, setMode } = useThemeMode()
  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: 'Système' },
    { value: 'light', label: 'Clair' },
    { value: 'dark', label: 'Sombre' },
    { value: 'red', label: 'Rouge' },
    { value: 'green', label: 'Vert' },
    { value: 'yellow', label: 'Jaune' },
    { value: 'blue', label: 'Bleu' },
    { value: 'pink', label: 'Rose' },
    { value: 'rainbow', label: 'Arc-en-ciel' },
  ]

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="var(--border-color)"
      bg="var(--surface-header)"
    >
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
        <fieldset className="theme-picker">
          <legend className="theme-picker__legend">Thème</legend>
          {modes.map(({ value, label }) => (
            <label className="theme-option" key={value}>
              <input
                type="radio"
                name="theme-mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </Flex>
    </Box>
  )
}

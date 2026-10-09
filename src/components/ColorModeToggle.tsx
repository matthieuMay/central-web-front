import { IconButton } from '@chakra-ui/react'
import { useColorMode } from '../use-color-mode.ts'

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <IconButton
      aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      title={isDark ? 'Thème clair' : 'Thème sombre'}
      variant="ghost"
      onClick={toggleColorMode}
    >
      {isDark ? '☀️' : '🌙'}
    </IconButton>
  )
}

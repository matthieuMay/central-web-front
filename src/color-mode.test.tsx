import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { ColorModeProvider } from './color-mode'
import { DARK_QUERY, useColorMode } from './color-mode-context'

function MediaQueryController() {
  let matches = false
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  const setDark = (isDark: boolean) => {
    matches = isDark
    for (const listener of listeners) {
      listener({ matches } as MediaQueryListEvent)
    }
  }

  const matchMedia = vi.fn((query: string) => ({
    matches: query === DARK_QUERY ? matches : false,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
  }))

  return { matchMedia, setDark }
}

function Consumer() {
  const { preference, colorMode, setPreference } = useColorMode()
  return (
    <div>
      <span data-testid="preference">{preference}</span>
      <span data-testid="color-mode">{colorMode}</span>
      <button onClick={() => setPreference('dark')}>set dark</button>
      <button onClick={() => setPreference('light')}>set light</button>
    </div>
  )
}

let media: ReturnType<typeof MediaQueryController>

beforeEach(() => {
  media = MediaQueryController()
  vi.stubGlobal('matchMedia', media.matchMedia)
  document.documentElement.className = ''
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ColorModeProvider', () => {
  it('follows the system preference by default', () => {
    media.setDark(true)

    render(
      <ColorModeProvider>
        <Consumer />
      </ColorModeProvider>,
    )

    expect(screen.getByTestId('preference').textContent).toBe('system')
    expect(screen.getByTestId('color-mode').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('resolves to light when the system prefers light', () => {
    media.setDark(false)

    render(
      <ColorModeProvider>
        <Consumer />
      </ColorModeProvider>,
    )

    expect(screen.getByTestId('color-mode').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('applies a manual dark override even when the system prefers light', () => {
    media.setDark(false)

    render(
      <ColorModeProvider>
        <Consumer />
      </ColorModeProvider>,
    )

    act(() => screen.getByText('set dark').click())

    expect(screen.getByTestId('preference').textContent).toBe('dark')
    expect(screen.getByTestId('color-mode').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('applies a manual light override even when the system prefers dark', () => {
    media.setDark(true)

    render(
      <ColorModeProvider>
        <Consumer />
      </ColorModeProvider>,
    )

    act(() => screen.getByText('set light').click())

    expect(screen.getByTestId('color-mode').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('reacts to system changes while following the system', () => {
    media.setDark(false)

    render(
      <ColorModeProvider>
        <Consumer />
      </ColorModeProvider>,
    )

    act(() => media.setDark(true))

    expect(screen.getByTestId('color-mode').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('ignores system changes once the user has overridden the mode', () => {
    media.setDark(false)

    render(
      <ColorModeProvider>
        <Consumer />
      </ColorModeProvider>,
    )

    act(() => screen.getByText('set light').click())
    act(() => media.setDark(true))

    expect(screen.getByTestId('color-mode').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { Header } from './components/Header'
import { ColorModeProvider } from './color-mode'
import { LocaleProvider } from './locale'
import { DEFAULT_LOCALE, formatDateTime, LOCALE_STORAGE_KEY, useLocale } from './locale-context'

function Consumer() {
  const { locale, setLocale } = useLocale()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <button onClick={() => setLocale('en')}>set en</button>
      <button onClick={() => setLocale('es')}>set es</button>
    </div>
  )
}

function renderWithLocale(children: React.ReactNode) {
  return render(
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        <LocaleProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </LocaleProvider>
      </ColorModeProvider>
    </ChakraProvider>,
  )
}

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.lang = ''
})

describe('LocaleProvider', () => {
  it('uses the stored Active Locale and reflects it on the document', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'es')

    renderWithLocale(<Consumer />)

    expect((await screen.findByTestId('locale')).textContent).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('persists the chosen Active Locale to localStorage', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, DEFAULT_LOCALE)

    renderWithLocale(<Consumer />)
    await screen.findByTestId('locale')

    fireEvent.click(screen.getByText('set en'))

    await waitFor(() => expect(screen.getByTestId('locale').textContent).toBe('en'))
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('renders the app only once the Catalog is ready', async () => {
    renderWithLocale(<Consumer />)

    expect((await screen.findByTestId('locale')).textContent).toBe(DEFAULT_LOCALE)
  })
})

describe('Header language switcher', () => {
  it('shows the endonym of the Active Locale and switches it, persisting the choice', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, DEFAULT_LOCALE)

    renderWithLocale(<Header />)

    const trigger = await screen.findByRole('button', { name: 'Changer de langue' })
    expect(trigger.textContent).toBe('Français')

    fireEvent.click(trigger)

    fireEvent.click(await screen.findByRole('menuitem', { name: 'English' }))

    await waitFor(() => expect(trigger.textContent).toBe('English'))
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    // A translated Message re-renders in the new Active Locale.
    expect(await screen.findByRole('button', { name: 'Color mode: System' })).toBeTruthy()
  })
})

describe('formatDateTime', () => {
  it('formats a timestamp in the given Locale', () => {
    const iso = '2026-01-02T12:00:00.000Z'

    const french = formatDateTime('fr', iso)
    const english = formatDateTime('en', iso)

    expect(french).not.toBe(english)
    expect(french.toLowerCase()).toContain('janv')
    expect(english.toLowerCase()).toContain('jan')
  })
})

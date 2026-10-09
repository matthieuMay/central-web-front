import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from './locale'
import { LOCALE_STORAGE_KEY, useLocale } from './locale-context'

vi.mock('wuchale/load-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('wuchale/load-utils')>()
  return {
    ...actual,
    loadLocale: vi.fn(async (locale: string) => {
      if (locale === 'es') throw new Error('Catalog unavailable')
      return actual.loadLocale(locale)
    }),
  }
})

function Consumer() {
  const { locale } = useLocale()
  return <span data-testid="locale">{locale}</span>
}

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.lang = ''
})

describe('LocaleProvider fallback', () => {
  it('falls back to the Source Locale when the Active Locale Catalog cannot load', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'es')

    render(
      <ChakraProvider value={defaultSystem}>
        <LocaleProvider>
          <Consumer />
        </LocaleProvider>
      </ChakraProvider>,
    )

    expect((await screen.findByTestId('locale')).textContent).toBe('fr')
    expect(document.documentElement.lang).toBe('fr')
  })
})

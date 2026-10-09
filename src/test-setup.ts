import { beforeAll, beforeEach } from 'vitest'
import { loadLocale } from 'wuchale/load-utils'
import './locales/main.loader.js'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from './locale-context'

beforeAll(async () => {
  await loadLocale(DEFAULT_LOCALE)

  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
  }

  const globalWithResizeObserver = window as unknown as { ResizeObserver?: unknown }
  if (!globalWithResizeObserver.ResizeObserver) {
    globalWithResizeObserver.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
})

beforeEach(() => {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, DEFAULT_LOCALE)
})

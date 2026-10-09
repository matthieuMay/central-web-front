import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Spinner } from '@chakra-ui/react'
import { loadLocale } from 'wuchale/load-utils'
import './locales/main.loader.js'
import {
  DEFAULT_LOCALE,
  LocaleContext,
  resolveInitialLocale,
  storeLocale,
  type Locale,
} from './locale-context'

/**
 * LocaleProvider — owns the Active Locale and loads its Catalog.
 *
 * On first load it resolves the Active Locale (stored choice → browser
 * preference → Source Locale) and loads that Catalog before rendering the app,
 * so there is no flash of the wrong language. If a Catalog cannot be loaded it
 * falls back to the Source Locale. Changing the Active Locale persists the
 * choice and loads the new Catalog; the wuchale runtime updates the interface
 * reactively.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(resolveInitialLocale)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function load(): Promise<Locale> {
      try {
        await loadLocale(locale)
        return locale
      } catch {
        if (locale !== DEFAULT_LOCALE) {
          try {
            await loadLocale(DEFAULT_LOCALE)
          } catch {
            // Even the Source Locale failed to load; render rather than hang.
          }
        }
        return DEFAULT_LOCALE
      }
    }

    void load().then((loaded) => {
      if (!active) return
      if (loaded !== locale) setLocaleState(loaded)
      setReady(true)
    })

    return () => {
      active = false
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    storeLocale(next)
    setLocaleState(next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  if (!ready) {
    return <Spinner aria-label="Chargement de la langue" />
  }

  return <LocaleContext value={{ locale, setLocale }}>{children}</LocaleContext>
}

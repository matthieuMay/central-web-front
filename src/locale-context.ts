import { createContext, useContext } from 'react'

export const LOCALES = ['fr', 'en', 'es'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

export const LOCALE_STORAGE_KEY = 'mini-trello.locale'

/**
 * Language names are shown in their own language (endonyms), so they are
 * deliberately not translatable Messages.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(stored) ? stored : null
  } catch {
    return null
  }
}

function browserLocale(): Locale | null {
  const languages = navigator.languages ?? [navigator.language]
  for (const language of languages) {
    const base = language?.toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return null
}

/**
 * The Active Locale on first load: the stored choice, else the browser
 * preference, else the Source Locale.
 */
export function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? browserLocale() ?? DEFAULT_LOCALE
}

export function storeLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage may be unavailable (private mode); the choice is then session-only.
  }
}

/**
 * Formats a timestamp in the Active Locale, so dates agree with the rest of
 * the interface rather than with the browser's locale.
 */
export function formatDateTime(locale: Locale, value: string | number | Date): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

export type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

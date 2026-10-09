"use client"

import type { IconButtonProps, SpanProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Skeleton, Span } from "@chakra-ui/react"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"
import { Tooltip } from "./tooltip"

// next-themes always persists the theme in localStorage. A fresh key per page
// load makes a manual choice last only until refresh and stay local to its tab.
// See docs/adr/0001-dark-mode.md.
const STORAGE_PREFIX = "theme-"
const STALE_KEY_AGE_MS = 7 * 24 * 60 * 60 * 1000

function createPageLoadStorageKey() {
  const now = Date.now()
  try {
    for (const key of Object.keys(localStorage)) {
      const createdAt = Number(key.slice(STORAGE_PREFIX.length).split("-")[0])
      if (key.startsWith(STORAGE_PREFIX) && now - createdAt > STALE_KEY_AGE_MS) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // Storage unavailable: next-themes falls back to in-memory state.
  }
  const key = `${STORAGE_PREFIX}${now}-${crypto.randomUUID()}`
  window.addEventListener("pagehide", () => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Storage unavailable: nothing to clean up.
    }
  })
  return key
}

const pageLoadStorageKey = createPageLoadStorageKey()

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      storageKey={pageLoadStorageKey}
      {...props}
    />
  )
}

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme()
  const colorMode = forcedTheme || resolvedTheme
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  return {
    colorMode: colorMode as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { colorMode, toggleColorMode } = useColorMode()
  const label =
    colorMode === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
  return (
    <ClientOnly fallback={<Skeleton boxSize="9" />}>
      <Tooltip content={label}>
        <IconButton
          onClick={toggleColorMode}
          variant="ghost"
          aria-label={label}
          size="sm"
          ref={ref}
          {...props}
          css={{
            _icon: {
              width: "5",
              height: "5",
            },
          }}
        >
          <ColorModeIcon />
        </IconButton>
      </Tooltip>
    </ClientOnly>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    )
  },
)

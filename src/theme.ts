import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const adaptive = (light: string, dark: string) => ({ value: { _light: light, _dark: dark } })

export const system = createSystem(defaultConfig, defineConfig({
  theme: {
    tokens: {
      colors: {
        identity: {
          turquoise: { value: '#0D9488' },
          violet: { value: '#7C3AED' },
          sky: { value: '#38BDF8' },
          lavender: { value: '#C4B5FD' },
        }
      },
      fonts: {
        body: { value: "'Segoe UI', system-ui, sans-serif" },
        heading: { value: "'Segoe UI', system-ui, sans-serif" }
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: adaptive('#FFFFFF', '#182235'),
          subtle: adaptive('#F4F6FA', '#0D1422'),
          muted: adaptive('#EDF1F7', '#222F44'),
          panel: adaptive('#FFFFFF', '#182235')
        },
        fg: {
          DEFAULT: adaptive('#1E293B', '#EDF2FA'),
          muted: adaptive('#526078', '#B4C2D6'),
          error: adaptive('#B91C1C', '#FCA5A5')
        },
        border: { DEFAULT: adaptive('#DCE3EE', '#34435A'), emphasized: adaptive('#64748B', '#91A4BE') },
        brand: {
          solid: adaptive('#0F766E', '#71DED0'),
          contrast: adaptive('#FFFFFF', '#0D2527'),
          fg: adaptive('#0F766E', '#71DED0'),
          subtle: adaptive('#E1F5F0', '#183A3B'),
          muted: adaptive('#C7EBE3', '#235054'),
          emphasized: adaptive('#B4E3D7', '#316468'),
          focusRing: adaptive('#6D28D9', '#C4B5FD'),
        },
        blue: {
          fg: adaptive('#6D28D9', '#C4B5FD'),
          subtle: adaptive('#F0EAFE', '#32274A'),
          focusRing: adaptive('#6D28D9', '#C4B5FD')
        },
        green: { fg: adaptive('#0F766E', '#71DED0') },
        orange: { fg: adaptive('#9A3412', '#FDBA74') },
        tone: {
          sky: {
            surface: adaptive('#E9F5FC', '#162C3E'),
            accent: adaptive('#0369A1', '#7DD3FC'),
            badge: adaptive('#CDEAF9', '#203E55')
          },
          violet: {
            surface: adaptive('#F0EBFC', '#27213D'),
            accent: adaptive('#6D28D9', '#C4B5FD'),
            badge: adaptive('#E2D6FC', '#3B2D5B')
          },
          orange: {
            surface: adaptive('#FFF1E7', '#33271F'),
            accent: adaptive('#9A3412', '#FDBA74'),
            badge: adaptive('#FFE0C5', '#4D3423')
          },
          teal: {
            surface: adaptive('#E4F5EF', '#183333'),
            accent: adaptive('#0B625B', '#71DED0'),
            badge: adaptive('#C5EADF', '#24494A')
          },
        },
      },
      shadows: {
        card: adaptive('0 3px 12px rgb(30 41 59 / 5%)', '0 3px 12px rgb(0 0 0 / 18%)'),
        elevated: adaptive('0 10px 24px rgb(30 41 59 / 10%)', '0 10px 24px rgb(0 0 0 / 28%)')
      },
    },
    recipes: {
      button: {
        base: {
          borderRadius: 'xl',
          fontWeight: 'semibold',
          transitionProperty: 'box-shadow, border-color'
        },
        variants: {
          variant: {
            outline: { borderColor: 'border.emphasized' },
          }
        }
      },
      input: { base: { transitionProperty: 'box-shadow, border-color' } },
      textarea: { base: { transitionProperty: 'box-shadow, border-color' } },
    },
  },
}))

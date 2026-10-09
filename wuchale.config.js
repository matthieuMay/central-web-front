// @ts-check
import { adapter as jsx, jsxDefaultHeuristic } from '@wuchale/jsx'
import { defineConfig } from 'wuchale'
import { openrouterAi } from './wuchale.ai.js'

// Keyboard `event.key` values are not user-facing text.
const KEY_NAMES =
  /^(Arrow(Up|Down|Left|Right)|Enter|Escape|Tab|Backspace|Delete|Shift|Control|Alt|Meta|CapsLock|Home|End|PageUp|PageDown)$/

export default defineConfig({
  locales: ['fr', 'en', 'es'],
  localesDir: 'src/locales',
  adapters: {
    main: jsx({
      loader: 'react',
      files: {
        include: 'src/**/*.{js,ts,jsx,tsx}',
        ignore: ['**/*.d.ts', '**/*.test.{js,ts,jsx,tsx}', '**/test-setup.ts'],
      },
      heuristic: (txt, file) => {
        const body = typeof txt.body === 'string' ? txt.body : txt.body.join('')
        if (KEY_NAMES.test(body)) return false
        return jsxDefaultHeuristic(txt, file)
      },
    }),
  },
  ai: openrouterAi(),
})

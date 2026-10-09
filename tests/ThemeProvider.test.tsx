import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Header } from '../src/components/Header'
import { ThemeProvider } from '../src/components/ThemeProvider'

function renderThemePicker() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </ThemeProvider>
    </ChakraProvider>,
  )
}

describe('theme picker', () => {
  it('keeps System as the initial selection and exposes all themes', () => {
    renderThemePicker()

    expect(screen.getByRole('radio', { name: 'Système' })).toBeChecked()
    expect(document.documentElement).not.toHaveAttribute('data-theme')

    for (const label of ['Clair', 'Sombre', 'Rouge', 'Vert', 'Jaune', 'Bleu', 'Rose', 'Arc-en-ciel']) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    }
  })

  it('switches between color themes and restores the unchanged System option', async () => {
    const user = userEvent.setup()
    renderThemePicker()

    for (const [label, theme] of [
      ['Rouge', 'red'],
      ['Vert', 'green'],
      ['Jaune', 'yellow'],
      ['Bleu', 'blue'],
      ['Rose', 'pink'],
      ['Arc-en-ciel', 'rainbow'],
    ]) {
      const option = screen.getByRole('radio', { name: label })
      await user.click(option)
      expect(option).toBeChecked()
      expect(document.documentElement).toHaveAttribute('data-theme', theme)
    }

    await user.click(screen.getByRole('radio', { name: 'Système' }))
    expect(screen.getByRole('radio', { name: 'Système' })).toBeChecked()
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })

  it('continues to apply the existing explicit Light and Dark selections', async () => {
    const user = userEvent.setup()
    renderThemePicker()

    await user.click(screen.getByRole('radio', { name: 'Clair' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    await user.click(screen.getByRole('radio', { name: 'Sombre' }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })
})

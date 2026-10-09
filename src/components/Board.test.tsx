import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Board } from './Board'
import { applyMove } from '../board/move'
import type { BoardData } from '../types/board'

const seed: BoardData = {
  id: 'mini-trello',
  title: 'Sprint board',
  columns: [
    {
      id: 'todo',
      title: 'Todo',
      cards: [
        { id: 'c1', title: 'One' },
        { id: 'c2', title: 'Two' },
      ],
    },
    { id: 'done', title: 'Done', cards: [] },
  ],
}

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as unknown as Response
}

function renderBoard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>
        <Board boardId="mini-trello" />
      </QueryClientProvider>
    </ChakraProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Board', () => {
  it('renders the board it fetches from the API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(seed)))

    renderBoard()

    expect(await screen.findByText('One')).toBeTruthy()
    expect(screen.getByText('Two')).toBeTruthy()
  })

  it('moves the selected card to the next column with an arrow key and celebrates', async () => {
    let server = structuredClone(seed)
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        const body = JSON.parse(String(init.body)) as { column: string; position?: number }
        const cardId = String(input).split('/').pop()!
        server = applyMove(server, cardId, body.column, body.position)
        return jsonResponse(server)
      }
      return jsonResponse(server)
    })
    vi.stubGlobal('fetch', fetchMock)

    renderBoard()
    fireEvent.click(await screen.findByText('One'))
    fireEvent.keyDown(screen.getByText('One'), { key: 'ArrowRight' })

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/cards/c1'),
        expect.objectContaining({ method: 'PUT' }),
      ),
    )
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'Board announcements' }).textContent).toBe('One completed!'),
    )
  })

  it('selects a card with the keyboard and then moves it', async () => {
    let server = structuredClone(seed)
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PUT') {
        const body = JSON.parse(String(init.body)) as { column: string; position?: number }
        const cardId = String(input).split('/').pop()!
        server = applyMove(server, cardId, body.column, body.position)
        return jsonResponse(server)
      }
      return jsonResponse(server)
    })
    vi.stubGlobal('fetch', fetchMock)

    renderBoard()
    const card = await screen.findByText('One')
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(card.closest('[role="button"]')?.getAttribute('aria-pressed')).toBe('true')

    fireEvent.keyDown(card, { key: 'ArrowRight' })

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/cards/c1'),
        expect.objectContaining({ method: 'PUT' }),
      ),
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(document.querySelector('[data-card-id="c1"]')),
    )
  })

  it('ignores an arrow that would leave the board', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(structuredClone(seed)))
    vi.stubGlobal('fetch', fetchMock)

    renderBoard()
    fireEvent.click(await screen.findByText('One'))
    fireEvent.keyDown(screen.getByText('One'), { key: 'ArrowLeft' })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  })
})

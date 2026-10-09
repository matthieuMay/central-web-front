import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Board } from './Board'
import { replaceCard } from '../board/collections'
import { applyMove } from '../board/move'
import { LocaleProvider } from '../locale'
import type { BoardData, CardComment, CardData, CommentInput, User } from '../types/board'

const users: User[] = [
  { id: 'u1', firstname: 'Ada', lastname: 'Lovelace' },
  { id: 'u2', firstname: 'Alan', lastname: 'Turing' },
]

const seed: BoardData = {
  id: 'mini-trello',
  title: 'Sprint board',
  columns: [
    {
      id: 'todo',
      title: 'Todo',
      cards: [
        { id: 'c1', title: 'One', assignees: [], comments: [], checklistItems: [] },
        { id: 'c2', title: 'Two', assignees: [], comments: [], checklistItems: [] },
      ],
    },
    { id: 'done', title: 'Done', cards: [] },
  ],
}

type PatchBody = {
  assignees?: string[]
  comments?: (CardComment | CommentInput)[]
  checklistItems?: CardData['checklistItems']
}

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as unknown as Response
}

function applyPatch(card: CardData, changes: PatchBody): CardData {
  const { comments, ...rest } = changes
  const updated: CardData = { ...card, ...rest }
  if (Array.isArray(comments)) {
    updated.comments = comments.map((entry, index) =>
      'createdAt' in entry
        ? entry
        : { ...entry, createdAt: `2026-01-0${index + 1}T09:00:00.000Z` },
    )
  }
  return updated
}

function apiMock(server: { current: BoardData }) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/users')) return jsonResponse(users)
    if (init?.method === 'PUT') {
      const body = JSON.parse(String(init.body)) as { column: string; position?: number }
      const cardId = url.split('/').pop()!
      server.current = applyMove(server.current, cardId, body.column, body.position)
      return jsonResponse(server.current)
    }
    if (init?.method === 'PATCH') {
      const changes = JSON.parse(String(init.body)) as PatchBody
      const cardId = url.split('/').pop()!
      const card = server.current.columns.flatMap((column) => column.cards).find((entry) => entry.id === cardId)!
      const updated = applyPatch(card, changes)
      server.current = replaceCard(server.current, updated)
      return jsonResponse(updated)
    }
    return jsonResponse(server.current)
  })
}

function patchBodies(fetchMock: ReturnType<typeof vi.fn>): PatchBody[] {
  return fetchMock.mock.calls
    .filter(([, init]) => (init as RequestInit | undefined)?.method === 'PATCH')
    .map(([, init]) => JSON.parse(String((init as RequestInit).body)) as PatchBody)
}

function renderBoard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <ChakraProvider value={defaultSystem}>
      <LocaleProvider>
        <QueryClientProvider client={queryClient}>
          <Board boardId="mini-trello" />
        </QueryClientProvider>
      </LocaleProvider>
    </ChakraProvider>,
  )
}

async function openDetail(title: string) {
  fireEvent.click(await screen.findByRole('button', { name: `Ouvrir la carte ${title}` }))
  await screen.findByText('Membres')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Board', () => {
  it('renders the board it fetches from the API', async () => {
    const server = { current: structuredClone(seed) }
    vi.stubGlobal('fetch', apiMock(server))

    renderBoard()

    expect(await screen.findByText('One')).toBeTruthy()
    expect(screen.getByText('Two')).toBeTruthy()
  })

  it('moves the selected card to the next column with an arrow key and celebrates', async () => {
    const server = { current: structuredClone(seed) }
    const fetchMock = apiMock(server)
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
    const server = { current: structuredClone(seed) }
    vi.stubGlobal('fetch', apiMock(server))

    renderBoard()
    const card = await screen.findByText('One')
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(card.closest('[role="button"]')?.getAttribute('aria-pressed')).toBe('true')

    fireEvent.keyDown(card, { key: 'ArrowRight' })

    await waitFor(() =>
      expect(server.current.columns[1].cards.map((entry) => entry.id)).toEqual(['c1']),
    )
    await waitFor(() =>
      expect(document.activeElement).toBe(document.querySelector('[data-card-id="c1"]')),
    )
  })

  it('ignores an arrow that would leave the board', async () => {
    const server = { current: structuredClone(seed) }
    const fetchMock = apiMock(server)
    vi.stubGlobal('fetch', fetchMock)

    renderBoard()
    fireEvent.click(await screen.findByText('One'))
    fireEvent.keyDown(screen.getByText('One'), { key: 'ArrowLeft' })

    await waitFor(() =>
      expect(fetchMock).not.toHaveBeenCalledWith(
        expect.stringContaining('/cards/c1'),
        expect.objectContaining({ method: 'PUT' }),
      ),
    )
  })

  it('associates and removes an assignee, sending the full array', async () => {
    const server = { current: structuredClone(seed) }
    const fetchMock = apiMock(server)
    vi.stubGlobal('fetch', fetchMock)

    renderBoard()
    await openDetail('One')

    fireEvent.click(await screen.findByLabelText('Ada Lovelace'))
    await waitFor(() => expect(patchBodies(fetchMock).at(-1)?.assignees).toEqual(['u1']))

    fireEvent.click(screen.getByLabelText('Alan Turing'))
    await waitFor(() => expect(patchBodies(fetchMock).at(-1)?.assignees).toEqual(['u1', 'u2']))

    fireEvent.click(screen.getByLabelText('Ada Lovelace'))
    await waitFor(() => expect(patchBodies(fetchMock).at(-1)?.assignees).toEqual(['u2']))
  })

  it('posts a comment without a date and keeps existing dates', async () => {
    const board = structuredClone(seed)
    board.columns[0].cards[0].comments = [
      { user: 'u2', comment: 'Existing', createdAt: '2025-12-31T10:00:00.000Z' },
    ]
    const server = { current: board }
    const fetchMock = apiMock(server)
    vi.stubGlobal('fetch', fetchMock)

    renderBoard()
    await openDetail('One')

    expect(await screen.findByText('Existing')).toBeTruthy()
    await waitFor(() =>
      expect((screen.getByLabelText('Auteur du commentaire') as HTMLSelectElement).value).toBe('u1'),
    )

    fireEvent.change(screen.getByLabelText('Nouveau commentaire'), { target: { value: 'Bonjour' } })
    fireEvent.click(screen.getByRole('button', { name: 'Publier' }))

    await waitFor(() =>
      expect(patchBodies(fetchMock).at(-1)?.comments).toEqual([
        { user: 'u2', comment: 'Existing', createdAt: '2025-12-31T10:00:00.000Z' },
        { user: 'u1', comment: 'Bonjour' },
      ]),
    )
  })

  it('adds and toggles a checklist item without dropping it', async () => {
    const server = { current: structuredClone(seed) }
    const fetchMock = apiMock(server)
    vi.stubGlobal('fetch', fetchMock)

    renderBoard()
    await openDetail('One')

    fireEvent.change(screen.getByLabelText('Nouvelle tâche'), { target: { value: 'Étape' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }))

    await waitFor(() =>
      expect(patchBodies(fetchMock).at(-1)?.checklistItems).toEqual([
        { description: 'Étape', done: false },
      ]),
    )

    fireEvent.click(await screen.findByLabelText('Étape'))
    await waitFor(() =>
      expect(patchBodies(fetchMock).at(-1)?.checklistItems).toEqual([
        { description: 'Étape', done: true },
      ]),
    )
  })
})

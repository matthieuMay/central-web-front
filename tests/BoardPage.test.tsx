import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BoardPage } from '../src/pages/BoardPage'
import type { BoardData, CardData, UserData } from '../src/types/board'

const users: UserData[] = [
  { id: 'user-1', firstname: 'Alex', lastname: 'Example' },
  { id: 'user-2', firstname: 'Blair', lastname: 'Dev' },
]

const initialCard: CardData = {
  id: 'card-1',
  title: 'Prepare release',
  description: 'Check the release requirements.',
  assignees: ['user-1'],
  comments: [{
    user: 'user-1',
    comment: 'I started reviewing the checklist.',
    createdAt: '2026-10-09T10:00:00.000Z',
  }],
  checklistItems: [
    { description: 'Review requirements', done: false },
    { description: 'Notify the team', done: true },
  ],
}

const secondCard: CardData = {
  id: 'card-2',
  title: 'Write release notes',
  assignees: [],
  comments: [],
  checklistItems: [],
}

const initialBoard: BoardData = {
  id: 'mini-trello',
  title: 'Sprint board',
  columns: [
    { id: 'todo', title: 'To do', cards: [initialCard, secondCard] },
    { id: 'done', title: 'Done', cards: [] },
  ],
}

function jsonResponse(value: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => value,
  } as Response
}

function renderBoard() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <BoardPage />
    </ChakraProvider>,
  )
}

describe('BoardPage card details', () => {
  let serverBoard: BoardData
  let serverCard: CardData
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    serverBoard = structuredClone(initialBoard)
    serverCard = structuredClone(initialCard)
    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/boards/mini-trello')) return jsonResponse(serverBoard)
      if (url.endsWith('/users')) return jsonResponse(users)

      if (url.includes('/cards/') && init?.method === 'PATCH') {
        const cardId = decodeURIComponent(url.slice(url.lastIndexOf('/') + 1))
        const changes = JSON.parse(String(init.body)) as Partial<CardData>
        const existingCard = serverBoard.columns
          .flatMap((column) => column.cards)
          .find((card) => card.id === cardId)
        if (!existingCard) throw new Error(`Unknown card: ${cardId}`)
        serverCard = { ...existingCard, ...changes }
        serverBoard = {
          ...serverBoard,
          columns: serverBoard.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) => card.id === cardId ? serverCard : card),
          })),
        }
        return jsonResponse(serverCard)
      }

      if (url.includes('/cards/') && init?.method === 'PUT') {
        const body = JSON.parse(String(init.body)) as { column: string; position: number }
        const source = serverBoard.columns.find((column) =>
          column.cards.some((card) => card.id === 'card-1'),
        )!
        const destination = serverBoard.columns.find((column) => column.id === body.column)!
        source.cards = source.cards.filter((card) => card.id !== 'card-1')
        destination.cards.splice(body.position, 0, serverCard)
        return jsonResponse(serverBoard)
      }

      throw new Error(`Unexpected request: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads the board and users, then shows summaries and an editable comment', async () => {
    const user = userEvent.setup()
    renderBoard()

    expect(await screen.findByRole('heading', { name: 'Sprint board' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/boards/mini-trello')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/users')

    const card = await screen.findByRole('article', { name: /Prepare release/ })
    expect(within(card).getByText('Assignees: Alex Example')).toBeInTheDocument()
    expect(within(card).getByText('Checklist: 1/2')).toBeInTheDocument()
    expect(within(card).getByText('Comments: 1')).toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'Details' }))
    expect(within(card).getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true')
    expect(within(card).getByRole('textbox', { name: 'Comment by Alex Example' }))
      .toHaveValue('I started reviewing the checklist.')
    expect(within(card).getAllByText('Alex Example')).toHaveLength(3)
    expect(within(card).getByRole('textbox', { name: 'New comment' })).toBeInTheDocument()
  })

  it('patches only assignees and checklist items, reflecting the returned card', async () => {
    const user = userEvent.setup()
    renderBoard()

    const card = await screen.findByRole('article', { name: /Prepare release/ })
    await user.click(within(card).getByRole('button', { name: 'Details' }))
    await user.click(within(card).getByRole('checkbox', { name: 'Blair Dev' }))

    await waitFor(() => {
      const request = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(request).toBeDefined()
      expect(request?.[1]?.body).toBe(JSON.stringify({ assignees: ['user-1', 'user-2'] }))
    })
    expect(within(card).getByText('Assignees: Alex Example, Blair Dev')).toBeInTheDocument()

    await user.click(within(card).getByRole('checkbox', { name: 'Mark checklist item 1 done' }))
    await waitFor(() => {
      const requests = fetchMock.mock.calls.filter(([, init]) => init?.method === 'PATCH')
      expect(requests[1]?.[1]?.body).toBe(JSON.stringify({
        checklistItems: [
          { description: 'Review requirements', done: true },
          { description: 'Notify the team', done: true },
        ],
      }))
    })
    expect(within(card).getByText('Checklist: 2/2')).toBeInTheDocument()
  })

  it('adds, edits, and removes checklist items', async () => {
    const user = userEvent.setup()
    renderBoard()

    const card = await screen.findByRole('article', { name: /Prepare release/ })
    await user.click(within(card).getByRole('button', { name: 'Details' }))
    await user.type(within(card).getByRole('textbox', { name: 'New checklist item' }), 'Archive artifacts')
    await user.click(within(card).getByRole('button', { name: 'Add item' }))
    expect(await within(card).findByDisplayValue('Archive artifacts')).toBeInTheDocument()

    const description = within(card).getByRole('textbox', { name: 'Checklist item 1 description' })
    await user.clear(description)
    await user.type(description, 'Verify requirements')
    await user.click(within(card).getByRole('heading', { name: 'Comments' }))
    await waitFor(() => expect(serverCard.checklistItems[0]?.description).toBe('Verify requirements'))
    expect(within(card).queryByRole('button', { name: /Save checklist/ })).not.toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'Remove checklist item 1' }))
    await waitFor(() => expect(serverCard.checklistItems).toHaveLength(2))
    expect(within(card).queryByDisplayValue('Verify requirements')).not.toBeInTheDocument()
  })

  it('saves edits to comments when their textareas lose focus', async () => {
    const user = userEvent.setup()
    renderBoard()

    const card = await screen.findByRole('article', { name: /Prepare release/ })
    await user.click(within(card).getByRole('button', { name: 'Details' }))
    const textarea = within(card).getByRole('textbox', { name: 'Comment by Alex Example' })
    await user.clear(textarea)
    await user.type(textarea, 'Updated comment')
    await user.click(within(card).getByRole('heading', { name: 'Comments' }))

    await waitFor(() => {
      const request = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
      expect(request?.[1]?.body).toBe(JSON.stringify({
        comments: [{
          user: 'user-1',
          comment: 'Updated comment',
          createdAt: '2026-10-09T10:00:00.000Z',
        }],
      }))
    })
    expect(await within(card).findByText('Updated comment')).toBeInTheDocument()
    expect(within(card).queryByRole('button', { name: /Save comment|Cancel/ })).not.toBeInTheDocument()
  })

  it('lets users add a comment with an explicit author and saves it on blur', async () => {
    const user = userEvent.setup()
    renderBoard()

    const card = await screen.findByRole('article', { name: /Write release notes/ })
    await user.click(within(card).getByRole('button', { name: 'Details' }))
    expect(within(card).queryByText('No comments yet.')).not.toBeInTheDocument()

    await user.selectOptions(within(card).getByRole('combobox', { name: 'Comment author' }), 'user-2')
    const textarea = within(card).getByRole('textbox', { name: 'New comment' })
    await user.type(textarea, 'I will prepare the notes.')
    await user.click(within(card).getByRole('heading', { name: 'Comments' }))

    await waitFor(() => {
      expect(serverCard.comments).toEqual([{
        user: 'user-2',
        comment: 'I will prepare the notes.',
        createdAt: expect.any(String),
      }])
    })
    expect(within(card).queryByRole('button', { name: /Save comment|Cancel/ })).not.toBeInTheDocument()
  })

  it('keeps assignments unavailable when users fail to load', async () => {
    const user = userEvent.setup()
    const resolveRequest = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith('/users')) return jsonResponse({ error: 'Unavailable' }, 503)
      return resolveRequest(input, init)
    })
    renderBoard()

    expect(await screen.findByRole('alert')).toHaveTextContent('Assignee management is unavailable.')
    const card = await screen.findByRole('article', { name: /Prepare release/ })
    await user.click(within(card).getByRole('button', { name: 'Details' }))

    expect(within(card).getByText('Assignees unavailable.')).toBeInTheDocument()
    expect(within(card).queryByRole('checkbox', { name: 'Blair Dev' })).not.toBeInTheDocument()
  })

  it('reports failed detail updates without changing the visible assignment', async () => {
    const user = userEvent.setup()
    const resolveRequest = fetchMock.getMockImplementation()!
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'PATCH') return jsonResponse({ error: 'Unavailable' }, 503)
      return resolveRequest(input, init)
    })
    renderBoard()

    const card = await screen.findByRole('article', { name: /Prepare release/ })
    await user.click(within(card).getByRole('button', { name: 'Details' }))
    await user.click(within(card).getByRole('checkbox', { name: 'Blair Dev' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not update card details')
    expect(within(card).getByText('Assignees: Alex Example')).toBeInTheDocument()
  })

  it('continues to move cards with the existing PUT position contract', async () => {
    const user = userEvent.setup()
    renderBoard()

    const card = await screen.findByRole('article', { name: /Prepare release/ })
    await user.click(card)
    await user.keyboard('{ArrowDown}')

    await waitFor(() => {
      const request = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT')
      expect(request?.[1]?.body).toBe(JSON.stringify({ column: 'todo', position: 1 }))
    })
  })
})

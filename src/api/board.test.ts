import { afterEach, describe, expect, it, vi } from 'vitest'
import { editCard, getUsers, moveCard, updateCardChecklistItems, updateCardComments } from './board'

describe('moveCard', () => {
  afterEach(() => vi.restoreAllMocks())

  it('sends an optional destination position without changing append behavior', async () => {
    const response = { ok: true, json: () => Promise.resolve({}) }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response as Response)

    await moveCard({ cardId: 'card/1', column: 'done', position: 2 })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/cards/card%2F1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ column: 'done', position: 2 }),
    }))

    await moveCard({ cardId: 'card/1', column: 'done' })
    expect(fetchMock).toHaveBeenLastCalledWith('http://localhost:3000/cards/card%2F1', expect.objectContaining({
      body: JSON.stringify({ column: 'done' }),
    }))
  })

  it('loads users from the API response value', async () => {
    const users = [{ id: 'user-1', firstname: 'Alex', lastname: 'Chen' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: () => Promise.resolve(users) } as Response)

    await expect(getUsers()).resolves.toEqual(users)
  })

  it('supports an enveloped users response', async () => {
    const users = [{ id: 'user-1', firstname: 'Alex', lastname: 'Chen' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: () => Promise.resolve({ value: users }) } as Response)

    await expect(getUsers()).resolves.toEqual(users)
  })

  it('sends the complete selected user ID list when editing a card', async () => {
    const response = { ok: true, json: () => Promise.resolve({}) }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response as Response)

    await editCard({ cardId: 'card/1', title: 'Updated', description: null, assignees: ['user-1', 'user-2'], checklistItems: [{ description: 'Review', done: false }] })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/cards/card%2F1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated', description: null, assignees: ['user-1', 'user-2'], checklistItems: [{ description: 'Review', done: false }] }),
    }))
  })

  it('sends the complete task list when toggling a card task', async () => {
    const response = { ok: true, json: () => Promise.resolve({}) }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response as Response)
    const tasks = [{ description: 'Review', done: true }, { description: 'Deploy', done: false }]

    await updateCardChecklistItems({ cardId: 'card/1', checklistItems: tasks })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/cards/card%2F1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ checklistItems: tasks }),
    }))
  })

  it('sends the complete comments string array when adding a comment', async () => {
    const response = { ok: true, json: () => Promise.resolve({}) }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response as Response)
    const comments = [{ user: 'user-1', comment: 'blabla' }]

    await updateCardComments({ cardId: 'card/1', comments })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/cards/card%2F1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ comments }),
    }))
  })
})

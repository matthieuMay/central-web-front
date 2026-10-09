import { afterEach, describe, expect, it, vi } from 'vitest'
import { moveCard } from './board'

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
})

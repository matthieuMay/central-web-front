import { describe, expect, it } from 'vitest'
import { sortCommentsNewestFirst } from './comments'

describe('comments', () => {
  it('sorts comments newest first by the API timestamp', () => {
    const older = { user: 'user-a', createdAt: '2026-10-09T15:30:45.000Z', comment: 'older' }
    const newer = { user: 'user-b', createdAt: '2026-10-09T15:31:45.000Z', comment: 'newer' }
    expect(sortCommentsNewestFirst([older, newer])).toEqual([newer, older])
  })
})

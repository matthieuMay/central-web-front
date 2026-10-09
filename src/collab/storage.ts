import { useSyncExternalStore } from 'react'
import type { CardCollections, CommentData } from '../types/board'

// Assignees, Sub-tasks, Comments and the Current member live in this browser
// only: the API knows nothing about them.

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be full or blocked: the change still lives until reload.
  }
}

function storedValue<T>(key: string, fallback: T) {
  let value = read(key, fallback)
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  window.addEventListener('storage', (event) => {
    if (event.key !== key) return
    value = read(key, fallback)
    notify()
  })

  return {
    get: () => value,
    set(next: T) {
      value = next
      write(key, next)
      notify()
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}

const collections = storedValue<Record<string, CardCollections>>('mini-trello:card-collections', {})
const currentMember = storedValue<string | null>('mini-trello:current-member', null)

const empty: CardCollections = { assignees: [], comments: [], subtasks: [] }

export function useCardCollections(cardId: string): CardCollections {
  const all = useSyncExternalStore(collections.subscribe, collections.get)
  return all[cardId] ?? empty
}

export function saveCard(cardId: string, changes: Partial<Pick<CardCollections, 'assignees' | 'subtasks'>>) {
  const all = collections.get()
  collections.set({ ...all, [cardId]: { ...(all[cardId] ?? empty), ...changes } })
}

export function addComment(cardId: string, comment: CommentData) {
  const all = collections.get()
  const current = all[cardId] ?? empty
  collections.set({ ...all, [cardId]: { ...current, comments: [...current.comments, comment] } })
}

export function useCurrentMemberId() {
  return useSyncExternalStore(currentMember.subscribe, currentMember.get)
}

export const setCurrentMemberId = (id: string | null) => currentMember.set(id)

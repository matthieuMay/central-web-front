const STORAGE_KEY = 'mini-trello-countdowns'
const CHANGE_EVENT = 'mini-trello-countdowns-changed'

type CountdownStore = Record<string, string>

function readStore(): CountdownStore {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Countdown storage contains an invalid value')
  return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}

export function getCountdownDeadline(cardId: string) {
  return readStore()[cardId]
}

export function setCountdownDeadline(cardId: string, deadline: string | null) {
  const store = readStore()
  if (deadline) store[cardId] = deadline
  else delete store[cardId]
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function countdownChangedEvent() {
  return CHANGE_EVENT
}

import type { User } from '../types/board'

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export function getUsers() {
  return fetch(`${apiUrl}/users`).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status} ${response.statusText})`)
    }
    return response.json() as Promise<User[]>
  })
}

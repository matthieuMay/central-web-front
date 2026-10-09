import type { User } from '../types/board'

// An id that /users no longer knows still gets a label, so it stays visible and removable.
export function userName(users: User[], id: string) {
  const user = users.find((item) => item.id === id)
  return user ? `${user.firstname} ${user.lastname}` : 'Unknown user'
}

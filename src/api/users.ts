import { useQuery } from '@tanstack/react-query'
import { getUsers } from './board'

export const usersKey = ['users'] as const

export function useUsers() {
  return useQuery({ queryKey: usersKey, queryFn: getUsers, staleTime: 5 * 60_000 })
}

import { createContext, useContext, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/board'
import type { UserData } from '../types/board'

type SessionContextValue = {
  users: UserData[] | undefined
  usersPending: boolean
  usersError: Error | null
  user: UserData | null | undefined
  isAnonymous: boolean
  chooseUser: (user: UserData | null) => void
  displayName: (user: UserData) => string
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function userDisplayName(user: UserData) {
  return user.name?.trim() || user.displayName?.trim() || user.username?.trim() || user.id
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const query = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const [user, setUser] = useState<UserData | null | undefined>(undefined)
  return (
    <SessionContext.Provider value={{
      users: query.data,
      usersPending: query.isPending,
      usersError: query.error,
      user,
      isAnonymous: user === null,
      chooseUser: setUser,
      displayName: userDisplayName,
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used inside SessionProvider')
  return value
}

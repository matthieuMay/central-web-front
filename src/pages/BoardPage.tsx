import { Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { getBoard, getUsers } from '../api/cards'
import { Board } from '../components/Board'
import type { BoardData, UserData } from '../types/board'

export function BoardPage() {
  const [board, setBoard] = useState<BoardData | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoadingBoard, setIsLoadingBoard] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [boardError, setBoardError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    void getBoard()
      .then((loadedBoard) => {
        if (isActive) setBoard(loadedBoard)
      })
      .catch((error: unknown) => {
        if (isActive) {
          setBoardError(error instanceof Error ? error.message : 'Could not load the board.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingBoard(false)
      })

    void getUsers()
      .then((loadedUsers) => {
        if (isActive) setUsers(loadedUsers)
      })
      .catch((error: unknown) => {
        if (isActive) {
          setUsersError(error instanceof Error ? error.message : 'Could not load users.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingUsers(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  if (isLoadingBoard) return <Text role="status">Loading board…</Text>
  if (boardError) return <Text role="alert" color="red.600">{boardError}</Text>
  if (!board) return <Text role="alert" color="red.600">Could not load the board.</Text>

  return (
    <>
      {usersError && <Text role="alert" color="red.600" mb={4}>{usersError} Assignee management is unavailable.</Text>}
      <Board
        board={board}
        users={users}
        isLoadingUsers={isLoadingUsers}
        usersError={usersError}
      />
    </>
  )
}

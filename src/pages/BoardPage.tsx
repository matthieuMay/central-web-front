import { useQuery } from '@tanstack/react-query'
import { boardKey, getBoard, getUsers, usersKey } from '../api/board'
import { Board } from '../components/Board'

export function BoardPage() {
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const users = useQuery({ queryKey: usersKey, queryFn: getUsers })

  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>
  return (
    <>
      {users.isError && <p role="alert">Could not load members: {users.error.message}</p>}
      <Board board={data} users={users.data ?? []} usersLoading={users.isPending} />
    </>
  )
}

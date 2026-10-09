import { useQuery } from '@tanstack/react-query'
import { boardKey, getBoard } from '../api/board'
import { Board } from '../components/Board'

export function BoardPage() {
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })

  if (isPending) return <p role="status">Loading board…</p>
  if (isError && !data) return <p role="alert">Could not load board: {error.message}</p>
  return (
    <>
      {isError && <p role="alert">Actualisation impossible. Le dernier tableau disponible reste affiché.</p>}
      {data && <Board board={data} />}
    </>
  )
}

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { boardKey, getBoard } from '../api/board'
import { Board } from '../components/Board'

export function BoardPage() {
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  useEffect(() => {
    if (!selectedCardId) return
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          setSelectedCardId(null)
        }}
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }}
  , [selectedCardId])

  function selectCard(cardId: string) {
    setSelectedCardId((current) => (current === cardId ? null : cardId))
  }

  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>
  return <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} />
}

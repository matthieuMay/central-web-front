import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard } from '../api/mutations'
import { Board } from '../components/Board'

export function BoardPage() {
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const { mutate: moveCard, isPending: isMoving } = useMoveCard()
  useEffect(() => {
    if (!selectedCardId || !data) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedCardId(null)
        return
      }
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.target instanceof HTMLElement &&
          event.target.closest('input, textarea, select, button, [contenteditable="true"]')) return
      if (isMoving) return

      const columnIndex = data.columns.findIndex((column) =>
        column.cards.some((card) => card.id === selectedCardId))
      const nextColumnIndex = columnIndex + (event.key === 'ArrowLeft' ? -1 : 1)
      if (columnIndex < 0 || nextColumnIndex < 0 || nextColumnIndex >= data.columns.length) return

      event.preventDefault()
      moveCard({ cardId: selectedCardId, columnId: data.columns[nextColumnIndex].id })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [data, isMoving, moveCard, selectedCardId])

  function selectCard(cardId: string) {
    setSelectedCardId((current) => (current === cardId ? null : cardId))
  }

  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>
  return <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} />
}

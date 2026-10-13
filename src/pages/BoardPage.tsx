import { useEffect, useRef, useState } from 'react'
import { Button, Stack, Text } from '@chakra-ui/react'
import { useIsMutating, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { boardKey, getBoard, moveCardApi, movementKey, MovementRefused } from '../api/board'
import { Board } from '../components/Board'
import { getKeyboardMovement, type CardDirection, type CardMovement } from '../board-movement'

// The immediate guard also covers two events before React renders pending state.
const movingClients = new WeakSet<QueryClient>()
// Reliability belongs to the cached board, including across route changes.
const unsynchronizedClients = new WeakSet<QueryClient>()
const boardQuery = {
  queryKey: boardKey,
  queryFn: ({ signal }: { signal: AbortSignal }) => getBoard(signal),
  retry: false,
  staleTime: Infinity,
}

export function BoardPage() {
  const client = useQueryClient()
  const moving = useIsMutating({ mutationKey: movementKey }) > 0
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [readBlocked, setReadBlocked] = useState(() => client.getQueryState(boardKey)?.status === 'error')
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const query = useQuery({
    ...boardQuery,
    enabled: !moving && !readBlocked && !unsynchronizedClients.has(client),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const mutation = useMutation({
    mutationKey: movementKey,
    retry: false,
    mutationFn: async (intent: CardMovement) => {
      await client.cancelQueries({ queryKey: boardKey })
      try {
        const board = await moveCardApi(intent)
        await client.cancelQueries({ queryKey: boardKey })
        client.setQueryData(boardKey, board)
        return { resynchronized: false }
      } catch (cause) {
        if (cause instanceof MovementRefused) throw cause
        if (mounted.current) setFeedback('Résultat du déplacement incertain. Relecture du tableau en cours…')
        // An unreadable/lost response may hide a committed write: never repeat PUT.
        await client.cancelQueries({ queryKey: boardKey })
        await client.invalidateQueries({ queryKey: boardKey, refetchType: 'none' })
        try {
          await client.fetchQuery(boardQuery)
        } catch (readError) {
          unsynchronizedClients.add(client)
          throw readError
        }
        return { resynchronized: true }
      }
    },
  })

  async function moveCard(cardId: string, direction: CardDirection) {
    if (movingClients.has(client) || unsynchronizedClients.has(client) || moving || query.isError || query.isFetching || !query.data) return
    const intent = getKeyboardMovement(query.data, cardId, direction)
    if (!intent) return
    const target = query.data.columns.find(column => column.id === intent.columnId)
    if (!target) return
    movingClients.add(client)
    setError('')
    setFeedback('Enregistrement du déplacement en cours…')
    try {
      const result = await mutation.mutateAsync(intent)
      if (mounted.current) setFeedback(result.resynchronized
        ? 'Tableau resynchronisé. Le résultat du déplacement était incertain.'
        : intent.position === undefined ? `Déplacement enregistré dans « ${target.title} ».`
        : `Carte réordonnée au rang ${intent.position + 1} dans « ${target.title} ».`)
    } catch (cause) {
      if (mounted.current) {
        setFeedback('')
        if (!(cause instanceof MovementRefused)) setReadBlocked(true)
        setError(cause instanceof MovementRefused ? cause.message
          : 'Impossible de resynchroniser le tableau. Le dernier état affiché n’est pas actualisé ; déplacements bloqués.')
      }
    } finally {
      movingClients.delete(client)
    }
  }

  const unavailable = query.isError
  return (
    <Stack gap={4}>
      <Text id="board-instructions" color="fg.muted">
        Sélectionnez une carte par clic, Entrée ou Espace. Utilisez ← et → pour la déplacer vers une colonne voisine, ↑ et ↓ pour la réordonner ; Échap pour désélectionner.
      </Text>
      <Text role="status" aria-live="polite">
        {query.isFetching ? 'Chargement du tableau…' : feedback}
      </Text>
      {(unavailable || error) && <Text role="alert" color="fg">
        {error || (query.data ? 'Le tableau affiché n’est pas actualisé. Déplacements bloqués.' : 'Impossible de charger le tableau.')}
      </Text>}
      {unavailable && <Button alignSelf="start" disabled={moving || query.isFetching} onClick={async () => {
        setError('')
        setFeedback('')
        const result = await query.refetch()
        if (!result.isError) {
          unsynchronizedClients.delete(client)
          setReadBlocked(false)
        }
      }}>Réessayer la lecture</Button>}
      {query.data && <Board board={query.data} blocked={moving || unavailable || query.isFetching} onMoveCard={moveCard} />}
    </Stack>
  )
}

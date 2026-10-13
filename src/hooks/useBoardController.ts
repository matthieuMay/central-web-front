import { useEffect, useRef, useState } from 'react'
import { useIsMutating, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { boardKey, boardWriteKey, getBoard, moveCardApi, patchCardApi, WriteRefused } from '../api/board'
import { isValidMovement, type CardMovement } from '../board-movement'
import { CardEditConflict, createCardPatch, type CardEdit } from '../card-editing'
import type { BoardData, CardCollectionsPatch } from '../types/board'

type BoardWrite = { kind: 'move'; movement: CardMovement } | { kind: 'edit'; cardId: string; edit: CardEdit }
type Notice = { cardId: string; message: string; error: boolean }
const writingClients = new WeakSet<QueryClient>()
const unsynchronizedClients = new WeakSet<QueryClient>()
const boardQuery = { queryKey: boardKey, queryFn: ({ signal }: { signal: AbortSignal }) => getBoard(signal), retry: false, staleTime: Infinity }

export function useBoardController() {
  const client = useQueryClient()
  const pending = useIsMutating({ mutationKey: boardWriteKey }) > 0
  const [notice, setNotice] = useState<Notice | null>(null)
  const [readBlocked, setReadBlocked] = useState(() => client.getQueryState(boardKey)?.status === 'error')
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const query = useQuery({ ...boardQuery, enabled: !pending && !readBlocked && !unsynchronizedClients.has(client),
    refetchOnMount: 'always', refetchOnWindowFocus: false, refetchOnReconnect: false })

  const mutation = useMutation({
    mutationKey: boardWriteKey, retry: false,
    mutationFn: async (write: BoardWrite) => {
      await client.cancelQueries({ queryKey: boardKey })
      let fresh: BoardData | undefined
      let patch: CardCollectionsPatch | undefined
      if (write.kind === 'edit') {
        try { fresh = await client.fetchQuery({ ...boardQuery, staleTime: 0 }) }
        catch (cause) { unsynchronizedClients.add(client); throw cause }
        if (!fresh) throw new Error('État de la carte indisponible.')
        const card = fresh.columns.flatMap(column => column.cards).find(card => card.id === write.cardId)
        if (!card) throw new WriteRefused('La carte n’existe plus dans le tableau actualisé.')
        patch = createCardPatch(card, write.edit)
        if (!patch) return { board: fresh, reconciled: false, unchanged: true }
      }
      try {
        const board = write.kind === 'move' ? await moveCardApi(write.movement) : await (async () => {
          // The fresh board is acquired under the same lock as every PUT/PATCH.
          if (!fresh || !patch) throw new Error('État de la carte indisponible.')
          const card = await patchCardApi(write.cardId, patch)
          return { ...fresh, columns: fresh.columns.map(column => ({ ...column,
            cards: column.cards.map(existing => existing.id === card.id ? card : existing) })) }
        })()
        await client.cancelQueries({ queryKey: boardKey })
        client.setQueryData(boardKey, board)
        return { board, reconciled: false, unchanged: false }
      } catch (cause) {
        if (cause instanceof WriteRefused) throw cause
        if (mounted.current) setNotice({ cardId: write.kind === 'move' ? write.movement.cardId : write.cardId,
          message: 'Résultat incertain. Relecture du tableau en cours…', error: false })
        await client.cancelQueries({ queryKey: boardKey })
        await client.invalidateQueries({ queryKey: boardKey, refetchType: 'none' })
        try { await client.fetchQuery(boardQuery) }
        catch (readError) { unsynchronizedClients.add(client); throw readError }
        return { board: undefined, reconciled: true, unchanged: false }
      }
    },
  })

  async function execute(write: BoardWrite) {
    if (writingClients.has(client) || unsynchronizedClients.has(client) || pending || query.isError || query.isFetching || !query.data) return
    if (write.kind === 'move' && !isValidMovement(query.data, write.movement)) return
    const cardId = write.kind === 'move' ? write.movement.cardId : write.cardId
    const source = query.data.columns.find(column => column.cards.some(card => card.id === cardId))
    if (!source) return
    writingClients.add(client)
    setNotice({ cardId, message: 'Enregistrement en cours…', error: false })
    try {
      const result = await mutation.mutateAsync(write)
      if (mounted.current) setNotice({ cardId, error: false,
        message: result.reconciled ? 'Tableau resynchronisé. Vérifiez le résultat avant de renvoyer une modification.'
          : result.unchanged ? 'Aucune modification nécessaire.' : 'Modification enregistrée.' })
      const last = result.board?.columns.at(-1)
      return { confirmed: !result.reconciled, celebrate: mounted.current && write.kind === 'move' && !result.reconciled &&
        !!last && source.id !== last.id && last.cards.some(card => card.id === cardId) }
    } catch (cause) {
      if (mounted.current) {
        const refused = cause instanceof WriteRefused || cause instanceof CardEditConflict
        if (!refused) setReadBlocked(true)
        setNotice({ cardId, error: true, message: refused ? cause.message
          : 'Impossible d’actualiser le tableau. Dernier état non actualisé ; modifications bloquées. Relancez la lecture.' })
      }
    } finally { writingClients.delete(client) }
  }

  async function retry() {
    if (pending || writingClients.has(client)) return
    setNotice(null)
    const result = await query.refetch()
    if (!result.isError) { unsynchronizedClients.delete(client); setReadBlocked(false) }
  }
  const unavailable = query.isError || readBlocked || unsynchronizedClients.has(client)
  return { query, notice, pending, unavailable, blocked: pending || unavailable || query.isFetching,
    move: (movement: CardMovement) => execute({ kind: 'move', movement }),
    edit: async (cardId: string, edit: CardEdit) => (await execute({ kind: 'edit', cardId, edit }))?.confirmed ?? false,
    retry }
}

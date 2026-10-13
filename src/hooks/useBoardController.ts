import { useEffect, useRef, useState } from 'react'
import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import {
  boardKey,
  boardWriteKey,
  getBoard,
  moveCardApi,
  patchCardApi,
  WriteRefused,
} from '../api/board'
import { isValidMovement, type CardMovement } from '../board-movement'
import { findCard, isMoveIntoLastColumn, replaceCardInBoard } from '../board-state'
import { CardEditConflict, createCardPatch, type CardEdit } from '../card-editing'
import type { BoardData, CardCollectionsPatch } from '../types/board'

type BoardWrite = {
  kind: 'move'
  movement: CardMovement
} | {
  kind: 'edit'
  cardId: string
  edit: CardEdit
}

type WriteResult = {
  board: BoardData | undefined
  reconciled: boolean
  unchanged: boolean
}

type PreparedEdit = {
  board: BoardData
  patch: CardCollectionsPatch
}

type Notice = {
  cardId: string
  message: string
  error: boolean
}
// QueryClient ownership keeps the lock across page unmounts and same-frame requests.

const writingClients = new WeakSet<QueryClient>()

const unsynchronizedClients = new WeakSet<QueryClient>()

const boardQuery = {
  queryKey: boardKey,
  queryFn: ({ signal }: {
    signal: AbortSignal
  }) => getBoard(signal),
  retry: false,
  staleTime: Infinity,
}

function writeCardId(write: BoardWrite): string {
  return write.kind === 'move' ? write.movement.cardId : write.cardId
}

function successMessage(result: WriteResult): string {
  if (result.reconciled) {
    return 'Tableau resynchronisé. Vérifiez le résultat avant de renvoyer une modification.'
  }
  if (result.unchanged)
    return 'Aucune modification nécessaire.'
  return 'Modification enregistrée.'
}

export function useBoardController() {
  const client = useQueryClient()
  const pending = useIsMutating({ mutationKey: boardWriteKey }) > 0
  const [notice, setNotice] = useState<Notice | null>(null)
  const [readBlocked, setReadBlocked] = useState(() => client.getQueryState(boardKey)?.status === 'error')
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  const query = useQuery({
    ...boardQuery,
    enabled: !pending && !readBlocked && !unsynchronizedClients.has(client),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  async function prepareEdit(write: Extract<BoardWrite, {
    kind: 'edit'
  }>) {
    let freshBoard: BoardData
    try {
      freshBoard = await client.fetchQuery({ ...boardQuery, staleTime: 0 })
    }
    catch (cause) {
      unsynchronizedClients.add(client)
      throw cause
    }
    if (!freshBoard)
      throw new Error('État de la carte indisponible.')
    const card = findCard(freshBoard, write.cardId)
    if (!card) {
      throw new WriteRefused('La carte n’existe plus dans le tableau actualisé.')
    }
    return { board: freshBoard, patch: createCardPatch(card, write.edit) }
  }
  async function persistWrite(write: BoardWrite, preparedEdit?: PreparedEdit) {
    if (write.kind === 'move')
      return moveCardApi(write.movement)
    if (!preparedEdit)
      throw new Error('État de la carte indisponible.')
    const confirmedCard = await patchCardApi(write.cardId, preparedEdit.patch)
    return replaceCardInBoard(preparedEdit.board, confirmedCard)
  }
  async function reconcileWrite(write: BoardWrite): Promise<WriteResult> {
    if (mounted.current) {
      setNotice({
        cardId: writeCardId(write),
        message: 'Résultat incertain. Relecture du tableau en cours…',
        error: false,
      })
    }
    await client.cancelQueries({ queryKey: boardKey })
    await client.invalidateQueries({ queryKey: boardKey, refetchType: 'none' })
    try {
      await client.fetchQuery(boardQuery)
    }
    catch (readError) {
      unsynchronizedClients.add(client)
      throw readError
    }
    return { board: undefined, reconciled: true, unchanged: false }
  }
  async function performWrite(write: BoardWrite): Promise<WriteResult> {
    await client.cancelQueries({ queryKey: boardKey })
    let preparedEdit: PreparedEdit | undefined
    // Preparation failures precede any write and must not enter reconciliation.
    if (write.kind === 'edit') {
      const prepared = await prepareEdit(write)
      if (!prepared.patch) {
        return { board: prepared.board, reconciled: false, unchanged: true }
      }
      preparedEdit = { board: prepared.board, patch: prepared.patch }
    }
    try {
      const confirmedBoard = await persistWrite(write, preparedEdit)
      await client.cancelQueries({ queryKey: boardKey })
      client.setQueryData(boardKey, confirmedBoard)
      return { board: confirmedBoard, reconciled: false, unchanged: false }
    }
    catch (cause) {
      if (cause instanceof WriteRefused)
        throw cause
      return reconcileWrite(write)
    }
  }
  const mutation = useMutation({
    mutationKey: boardWriteKey,
    retry: false,
    mutationFn: performWrite,
  })
  async function executeWrite(write: BoardWrite) {
    const cannotWrite = writingClients.has(client) || unsynchronizedClients.has(client) ||
      pending || query.isError || query.isFetching || !query.data
    if (cannotWrite || !query.data)
      return
    if (write.kind === 'move' && !isValidMovement(query.data, write.movement))
      return
    const cardId = writeCardId(write)
    const sourceColumn = query.data.columns.find(column => column.cards.some(card => card.id === cardId))
    if (!sourceColumn)
      return
    writingClients.add(client)
    setNotice({ cardId, message: 'Enregistrement en cours…', error: false })
    try {
      const result = await mutation.mutateAsync(write)
      if (mounted.current) {
        setNotice({ cardId, error: false, message: successMessage(result) })
      }
      const celebrate = mounted.current && write.kind === 'move' && !result.reconciled &&
        isMoveIntoLastColumn(result.board, sourceColumn.id, cardId)
      return { confirmed: !result.reconciled, celebrate }
    }
    catch (cause) {
      if (mounted.current) {
        const refused = cause instanceof WriteRefused || cause instanceof CardEditConflict
        if (!refused)
          setReadBlocked(true)
        setNotice({
          cardId,
          error: true,
          message: refused ? cause.message
            : 'Impossible d’actualiser le tableau. Dernier état non actualisé ; modifications bloquées. Relancez la lecture.',
        })
      }
    }
    finally {
      writingClients.delete(client)
    }
  }
  async function retry() {
    if (pending || writingClients.has(client))
      return
    setNotice(null)
    const result = await query.refetch()
    if (!result.isError) {
      unsynchronizedClients.delete(client)
      setReadBlocked(false)
    }
  }
  const unavailable = query.isError || readBlocked || unsynchronizedClients.has(client)
  return {
    query,
    notice,
    pending,
    unavailable,
    blocked: pending || unavailable || query.isFetching,
    move: (movement: CardMovement) => executeWrite({ kind: 'move', movement }),
    edit: async (cardId: string, edit: CardEdit) =>
      (await executeWrite({ kind: 'edit', cardId, edit }))?.confirmed ?? false,
    retry,
  }
}

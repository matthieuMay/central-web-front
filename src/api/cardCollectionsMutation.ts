import type { QueryClient } from '@tanstack/query-core'
import type { BoardData, CardCollectionsPatch } from '../types/board'
import type { UserData } from '../types/user'
import { boardKey, boardWriteKey, usersKey } from './boardKeys.ts'
import { buildCardCollectionsPatch, type CardCollectionsAction } from './cardCollections.ts'
import { boardWriteState, releaseBoardWrite, setBoardRecovery } from './boardWrites.ts'

export type UpdateCardCollectionsInput = { cardId: string; action: CardCollectionsAction }
export type CollectionResult = { confirmed: true; reconciliationError?: string }
type Transport = {
  getBoard: () => Promise<BoardData>
  patchCardCollections: (cardId: string, patch: CardCollectionsPatch) => Promise<void>
}

export class CardCollectionsError extends Error {
  outcome: 'rejected' | 'uncertain' | 'read-failed'
  constructor(message: string, outcome: CardCollectionsError['outcome']) {
    super(message)
    this.outcome = outcome
  }
}

export async function refreshBoard(client: QueryClient, getBoard: Transport['getBoard']) {
  const board = await client.fetchQuery({ queryKey: boardKey, queryFn: getBoard, staleTime: 0, retry: false })
  return board
}

// The caller reserves the synchronous lock before TanStack can schedule onMutate.
export function cardCollectionsMutationOptions(client: QueryClient, transport: Transport) {
  return {
    scope: { id: 'board-writes' },
    retry: false as const,
    mutationFn: async ({ cardId, action }: UpdateCardCollectionsInput): Promise<CollectionResult> => {
      let board: BoardData
      try {
        board = await refreshBoard(client, transport.getBoard)
      } catch {
        const message = 'Lecture du tableau impossible. Actualisez avant de réessayer.'
        setBoardRecovery(client, message)
        throw new CardCollectionsError(message, 'read-failed')
      }
      const card = board.columns.flatMap((column) => column.cards).find((item) => item.id === cardId)
      if (!card) throw new CardCollectionsError('Cette carte n’existe plus. Le tableau a été actualisé.', 'rejected')
      const userId = action.type === 'add-comment' ? action.comment.user : action.type === 'set-assignee' && action.assigned ? action.userId : null
      if (userId && (client.getQueryState(usersKey)?.status === 'error' || !client.getQueryData<UserData[]>(usersKey)?.some((user) => user.id === userId))) {
        throw new CardCollectionsError('Cet utilisateur est indisponible. Choisissez une personne du catalogue.', 'rejected')
      }
      const patch = buildCardCollectionsPatch(card, action)
      try {
        await transport.patchCardCollections(cardId, patch)
      } catch (error) {
        const status = error instanceof Error && 'status' in error ? error.status : undefined
        const rejected = typeof status === 'number' && status >= 400 && status < 500
        const message = rejected
          ? 'Enregistrement refusé. Votre brouillon est conservé.'
          : 'Résultat incertain : l’action a peut-être été enregistrée. Actualisez et vérifiez la liste avant de réessayer pour éviter un doublon.'
        try { await refreshBoard(client, transport.getBoard) } catch {
          setBoardRecovery(client, 'Actualisation impossible. Actualisez avant toute nouvelle écriture.')
        }
        if (!rejected) setBoardRecovery(client, message)
        throw new CardCollectionsError(message, rejected ? 'rejected' : 'uncertain')
      }
      try {
        await refreshBoard(client, transport.getBoard)
        return { confirmed: true }
      } catch {
        const message = 'Action enregistrée, mais actualisation impossible. Ne la publiez pas à nouveau ; actualisez le tableau.'
        setBoardRecovery(client, message)
        return { confirmed: true, reconciliationError: message }
      }
    },
  }
}

export async function recoverBoard(client: QueryClient, getBoard: Transport['getBoard']) {
  if (boardWriteState(client).busy || client.isFetching({ queryKey: boardKey, exact: true })) return false
  client.setQueryData(boardWriteKey, { ...boardWriteState(client), busy: true })
  try {
    await refreshBoard(client, getBoard)
    setBoardRecovery(client, null)
    return true
  } catch {
    setBoardRecovery(client, 'Actualisation impossible. Vérifiez votre connexion et réessayez.')
    return false
  } finally { releaseBoardWrite(client) }
}

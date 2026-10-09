import type { QueryClient } from '@tanstack/query-core'
import { boardKey, boardWriteKey } from './boardKeys.ts'

export type BoardWriteState = { busy: boolean; recovery: string | null }
export const idleBoardWrite: BoardWriteState = { busy: false, recovery: null }

export function boardWriteState(client: QueryClient): BoardWriteState {
  return client.getQueryData<BoardWriteState>(boardWriteKey) ?? idleBoardWrite
}

export function reserveBoardWrite(client: QueryClient) {
  const state = boardWriteState(client)
  if (state.busy || state.recovery || client.isMutating({ predicate: (mutation) => mutation.options.scope?.id === 'board-writes' }) || client.isFetching({ queryKey: boardKey, exact: true }) || client.getQueryState(boardKey)?.status === 'error') {
    throw new Error(state.recovery ?? 'Une écriture ou une actualisation est déjà en cours. Réessayez ensuite.')
  }
  client.setQueryData<BoardWriteState>(boardWriteKey, { ...state, busy: true })
}

export function releaseBoardWrite(client: QueryClient) {
  client.setQueryData<BoardWriteState>(boardWriteKey, { ...boardWriteState(client), busy: false })
}

export function setBoardRecovery(client: QueryClient, recovery: string | null) {
  client.setQueryData<BoardWriteState>(boardWriteKey, { ...boardWriteState(client), recovery })
}

import { useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createCalendarStore, watchConfirmedBoard } from './calendar'

export function useCalendar(boardId: string) {
  const client = useQueryClient()
  const [store] = useState(() => {
    let storage: Storage | null = null
    try { storage = window.localStorage } catch { /* The store reports unavailable storage. */ }
    return createCalendarStore(boardId, storage)
  })
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  useLayoutEffect(() => {
    const unsubscribe = watchConfirmedBoard(client, store)
    const interrupt = () => store.interrupt()
    const visibility = () => { if (document.hidden) interrupt() }
    window.addEventListener('offline', interrupt)
    window.addEventListener('pagehide', interrupt)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      unsubscribe()
      window.removeEventListener('offline', interrupt)
      window.removeEventListener('pagehide', interrupt)
      document.removeEventListener('visibilitychange', visibility)
      interrupt()
    }
  }, [client, store])
  return { store, snapshot }
}

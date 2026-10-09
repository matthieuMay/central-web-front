// Comment attachments are too big for localStorage, so the files themselves
// live in IndexedDB, keyed by attachment id. Like the rest of the
// collaboration data, they exist in this browser only.

const DB_NAME = 'mini-trello'
const STORE = 'attachments'

export const MAX_FILE_SIZE = 10 * 1024 * 1024

let db: Promise<IDBDatabase> | null = null

function open() {
  db ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => { db = null; reject(request.error) }
  })
  return db
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  return open().then((database) => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE, mode)
    const request = action(transaction.objectStore(STORE))
    transaction.oncomplete = () => resolve(request.result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  }))
}

export function saveFile(id: string, file: Blob) {
  return run('readwrite', (store) => store.put(file, id)).then(() => undefined)
}

export function loadFile(id: string) {
  return run<Blob | undefined>('readonly', (store) => store.get(id))
}

const sizeFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${sizeFormat.format(bytes / 1024)} Ko`
  return `${sizeFormat.format(bytes / (1024 * 1024))} Mo`
}

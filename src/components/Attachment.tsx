import { Box, Link, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { formatSize, loadFile } from '../collab/files'
import type { AttachmentData } from '../types/board'

type State = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; url: string }

// Images get a preview; every file gets a download link.
export function Attachment({ attachment }: { attachment: AttachmentData }) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    loadFile(attachment.id).then((blob) => {
      if (cancelled) return
      if (!blob) { setState({ status: 'missing' }); return }
      url = URL.createObjectURL(blob)
      setState({ status: 'ready', url })
    }, () => { if (!cancelled) setState({ status: 'missing' }) })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [attachment.id])

  const label = `${attachment.name} (${formatSize(attachment.size)})`
  if (state.status === 'loading') return <Text fontSize="xs" color="fg.muted">📎 {label}</Text>
  if (state.status === 'missing') return <Text fontSize="xs" color="fg.muted">📎 {label} : fichier introuvable dans ce navigateur</Text>

  return (
    <Box>
      {attachment.type.startsWith('image/') && (
        <a href={state.url} target="_blank" rel="noreferrer">
          <img src={state.url} alt={attachment.name} style={{ maxHeight: '10rem', maxWidth: '100%', borderRadius: '0.375rem', display: 'block' }} />
        </a>
      )}
      <Link href={state.url} download={attachment.name} fontSize="xs" color="blue.fg">📎 {label}</Link>
    </Box>
  )
}

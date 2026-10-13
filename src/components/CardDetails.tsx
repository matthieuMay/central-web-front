import { useId, useLayoutEffect, useRef } from 'react'
import { Box, Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { CardData } from '../types/board'
import type { EditorProps, UsersProps } from './card-details/types'
import { Members } from './card-details/Members'
import { Comments } from './card-details/Comments'
import { Checklist } from './card-details/Checklist'
import { Surface } from './visual/Surface'

type CardDetailsProps = EditorProps & UsersProps & {
  card: CardData
  usersLoading: boolean
  usersError: boolean
  onRetryUsers: () => void
  notice?: {
    message: string
    error: boolean
  }
  boardUnavailable: boolean
  retrying: boolean
  onRetryBoard: () => void
  onClose: () => void
}

export function CardDetails({
  card,
  users,
  usersUnavailable,
  usersLoading,
  usersError,
  onRetryUsers,
  blocked,
  onEdit,
  notice,
  boardUnavailable,
  retrying,
  onRetryBoard,
  onClose
}: CardDetailsProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useLayoutEffect(() => {
    const element = dialog.current
    const trigger = document.activeElement
    element?.showModal()
    return () => {
      element?.close()
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className="card-dialog"
      aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); onClose() }}
    >
      <Stack gap={7}>
        <Stack
          direction="row"
          align="start"
          justify="space-between"
          gap={4}
        >
          <Box minW={0}>
            <Text
              color="brand.fg"
              fontWeight="semibold"
              fontSize="sm"
              mb={2}
            >
              Détails de la carte
            </Text>
            <Heading
              as="h2"
              size="2xl"
              id={titleId}
              overflowWrap="anywhere"
            >
              {card.title}
            </Heading>
          </Box>
          <Button variant="outline" onClick={onClose} aria-label="Fermer les détails">Fermer</Button>
        </Stack>
        {card.description && <Box bg="bg.muted" p={5} borderRadius="xl">
          <Text fontWeight="semibold" mb={2}>Description</Text>
          <Text color="fg.muted" overflowWrap="anywhere" whiteSpace="pre-wrap">{card.description}</Text>
        </Box>}
        {notice && <Text role={notice.error ? 'alert' : 'status'}>{notice.message}</Text>}
        {boardUnavailable && <Stack gap={2}>
          <Text role="alert">Tableau non actualisé. Les modifications sont bloquées.</Text>
          <Button alignSelf="start" disabled={retrying} onClick={onRetryBoard}>
            Relancer la lecture du tableau
          </Button>
        </Stack>}
        {usersLoading && <Text role="status">Chargement des utilisateurs…</Text>}
        {usersError && <Stack gap={2}>
          <Text role="alert">Impossible de charger les utilisateurs.</Text>
          <Button alignSelf="start" onClick={onRetryUsers}>Réessayer les utilisateurs</Button>
        </Stack>}
        {!usersLoading && !usersError && users.length === 0 && <Text role="status">Aucun utilisateur disponible.</Text>}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5} alignItems="start">
          <Surface tone="violet">
            <Members
              assignees={card.assignees}
              users={users}
              usersUnavailable={usersUnavailable}
              blocked={blocked}
              onEdit={onEdit}
            />
          </Surface>
          <Surface tone="teal">
            <Checklist items={card.checklistItems} blocked={blocked} onEdit={onEdit} />
          </Surface>
          <Surface gridColumn="1 / -1">
            <Comments
              comments={card.comments}
              users={users}
              usersUnavailable={usersUnavailable}
              blocked={blocked}
              onEdit={onEdit}
            />
          </Surface>
        </SimpleGrid>
      </Stack>
    </dialog>
  )
}

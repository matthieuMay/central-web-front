import { useState } from 'react'
import { Button, Box, Dialog, Heading, Portal, Spinner, Stack, Text } from '@chakra-ui/react'
import { addChecklistItem, appendComment, toggleChecklistItem } from '../board/collections'
import { usePatchCard } from '../board/useBoard'
import type { CardData, User } from '../types/board'
import { CardAssignees } from './CardAssignees'
import { CardChecklist } from './CardChecklist'
import { CardComments } from './CardComments'

/**
 * CardDetail — the Dialog where a Card's Assignees, Comments, and Checklist
 * Items are viewed and changed.
 *
 * Responsibility: orchestrate the three sections and own the transient UI
 * state (the Acting Author and draft inputs); copy no server data.
 * Props: { boardId: string; card: CardData; users: User[];
 *   isUsersLoading: boolean; isUsersError: boolean; onClose: () => void }.
 * Events: fires PATCH through usePatchCard with only the changed collection,
 *   as the full next array; calls onClose when dismissed.
 * Data owner: the board query (`useBoard`) owns every Card field; CardDetail
 *   passes slices down and routes mutations up, writing the returned Card back
 *   into the board cache.
 * Correct when: opening a Card shows its three sections; adding/removing an
 *   Assignee, posting a Comment, and adding/toggling a Checklist Item each
 *   send the full changed array, and the sections re-render from the returned
 *   Card on the next render from the board query.
 */
type CardDetailProps = {
  boardId: string
  card: CardData
  users: User[]
  isUsersLoading: boolean
  isUsersError: boolean
  onClose: () => void
}

export function CardDetail({ boardId, card, users, isUsersLoading, isUsersError, onClose }: CardDetailProps) {
  const patch = usePatchCard(boardId)
  const [authorId, setAuthorId] = useState('')
  const actingAuthorId = authorId || users[0]?.id || ''

  const cardId = card.id
  const usersUnavailable = isUsersLoading || isUsersError

  return (
    <Dialog.Root open onOpenChange={(details) => { if (!details.open) onClose() }}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{card.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={6}>
                <section>
                  <Heading as="h3" size="sm" mb={2}>Membres</Heading>
                  <Box>
                    {isUsersLoading ? (
                      <Spinner size="sm" aria-label="Chargement des personnes" />
                    ) : isUsersError ? (
                      <Text color="fg.error" fontSize="sm">Impossible de charger les personnes.</Text>
                    ) : (
                      <CardAssignees
                        assignees={card.assignees}
                        users={users}
                        onChange={(next) => patch.mutate({ cardId, changes: { assignees: next } })}
                      />
                    )}
                  </Box>
                </section>
                <section>
                  <Heading as="h3" size="sm" mb={2}>Commentaires</Heading>
                  <CardComments
                    comments={card.comments}
                    users={users}
                    authorId={actingAuthorId}
                    onAuthorChange={setAuthorId}
                    onSubmit={(input) =>
                      patch.mutate({ cardId, changes: { comments: appendComment(card.comments, input) } })
                    }
                    disabled={usersUnavailable}
                  />
                </section>
                <section>
                  <Heading as="h3" size="sm" mb={2}>Tâches à cocher</Heading>
                  <CardChecklist
                    items={card.checklistItems}
                    onAdd={(description) =>
                      patch.mutate({ cardId, changes: { checklistItems: addChecklistItem(card.checklistItems, description) } })
                    }
                    onToggle={(index) =>
                      patch.mutate({ cardId, changes: { checklistItems: toggleChecklistItem(card.checklistItems, index) } })
                    }
                  />
                </section>
                {patch.isError && (
                  <Text color="fg.error" fontSize="sm">La modification n'a pas pu être enregistrée.</Text>
                )}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onClose}>Fermer</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

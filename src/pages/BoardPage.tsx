import { useRef, useState } from 'react'
import { Box, Button, Stack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getUsers, usersKey } from '../api/board'
import { Board } from '../components/Board'
import Confetti, { type ConfettiHandle } from '../components/Confetti'
import { CardDetails } from '../components/CardDetails'
import { useBoardController } from '../hooks/useBoardController'
import type { CardMovement } from '../board-movement'
import { findCard } from '../board-state'

export function BoardPage() {
  const state = useBoardController()
  const confetti = useRef<ConfettiHandle>(null)
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const users = useQuery({
    queryKey: usersKey,
    queryFn: ({ signal }) => getUsers(signal),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false
  })
  const card = state.query.data && openCardId !== null
    ? findCard(state.query.data, openCardId)
    : undefined
  async function moveCard(intent: CardMovement) {
    if ((await state.move(intent))?.celebrate)
      confetti.current?.celebrate()
  }
  return (
    <Stack gap={4}>
      <Confetti ref={confetti} />
      <Box
        as="details"
        className="board-help"
        bg="bg"
        borderWidth="1px"
        borderColor="border"
        borderRadius="xl"
        px={4}
        py={3}
      >
        <summary>Comment déplacer une carte ?</summary>
        <Text
          id="board-instructions"
          color="fg.muted"
          mt={3}
          fontSize="sm"
        >
          Sélectionnez une carte par clic, Entrée ou Espace. Utilisez ← et → pour la déplacer vers une colonne voisine, ↑ et ↓ pour la réordonner ; Échap pour désélectionner.
          {' '}À la souris, déposez avant ou après une carte, ou en fin de colonne. Seules la colonne actuelle et ses voisines acceptent le dépôt.
        </Text>
      </Box>
      <Text role="status">
        {state.query.isFetching ? 'Chargement du tableau…' : !state.notice?.error ? state.notice?.message : ''}
      </Text>
      {state.notice?.error && <Text role="alert">{state.notice.message}</Text>}
      {state.unavailable && <Stack gap={2}>
        <Text role="alert">
          {state.query.data ? 'Tableau non actualisé. Modifications bloquées.' : 'Impossible de charger le tableau.'}
        </Text>
        <Button
          alignSelf="start"
          disabled={state.pending || state.query.isFetching}
          onClick={() => void state.retry()}
        >
          Réessayer la lecture
        </Button>
      </Stack>}
      {state.query.data && <Board
        board={state.query.data}
        blocked={state.blocked}
        onMoveCard={moveCard}
        users={users.data ?? []}
        onOpenCard={setOpenCardId}
      />}
      {card && <CardDetails
        key={card.id}
        card={card}
        users={users.data ?? []}
        usersLoading={users.isPending || users.isFetching}
        usersError={users.isError}
        usersUnavailable={users.isPending || users.isFetching || users.isError}
        onRetryUsers={() => void users.refetch()}
        blocked={state.blocked}
        boardUnavailable={state.unavailable}
        retrying={state.pending || state.query.isFetching}
        onRetryBoard={() => void state.retry()}
        onEdit={edit => state.edit(card.id, edit)}
        notice={state.notice?.cardId === card.id ? state.notice : undefined}
        onClose={() => setOpenCardId(null)}
      />}
    </Stack>
  )
}

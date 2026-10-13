import { Badge, Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import type { ColumnData, UserData } from '../types/board'
import { Card } from './Card'
import type { CardDirection, DropTarget } from '../board-movement'
import type { DragEvent } from 'react'
import type { ColumnTone } from './visual/column-tone'

type ColumnProps = {
  column: ColumnData
  tone: ColumnTone
  selectedCardId: string | null
  onSelectCard: (cardId: string) => void
  onDeselectCard: () => void
  onMoveCard: (cardId: string, direction: CardDirection) => Promise<void>
  blocked: boolean
  dropTarget: DropTarget | null
  onDragStart: (event: DragEvent, cardId: string) => void
  onDragOver: (event: DragEvent, columnId: string) => void
  onDrop: (event: DragEvent, columnId: string) => void
  onDragLeave: () => void
  users: UserData[]
  onOpenCard: (cardId: string) => void
}

function DropMarker({ edge }: {
  edge: 'top' | 'bottom'
}) {
  return <Box
    aria-hidden="true"
    data-drop-marker=""
    position="absolute"
    insetInline={0}
    top={edge === 'top' ? '-6px' : undefined}
    bottom={edge === 'bottom' ? '-6px' : undefined}
    height="4px"
    bg="brand.focusRing"
    borderRadius="full"
    pointerEvents="none"
    zIndex={1}
  />
}

export function Column({
  column,
  tone,
  selectedCardId,
  onSelectCard,
  onDeselectCard,
  onMoveCard,
  blocked,
  dropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  users,
  onOpenCard
}: ColumnProps) {
  const target = dropTarget?.intent.columnId === column.id ? dropTarget : null
  return (
    <Box
      as="section"
      aria-label={column.title}
      bg={`tone.${tone}.surface`}
      borderWidth="1px"
      borderColor="border"
      borderRadius="2xl"
      p={4}
      minW={0}
      minH={{ base: 'auto', xl: 'calc(100dvh - 16rem)' }}
      display="flex"
      flexDirection="column"
      onDragOver={event => onDragOver(event, column.id)}
      onDrop={event => onDrop(event, column.id)}
      onDragLeave={event => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget))
          onDragLeave()
      }}
    >

      <Flex
        align="center"
        justify="space-between"
        gap={3}
        mb={5}
      >

        <Flex gap={2} align="center" minW={0}>

          <Box
            aria-hidden="true"
            boxSize="9px"
            bg={`tone.${tone}.accent`}
            borderRadius="full"
            flexShrink={0}
          />
          <Heading
            as="h2"
            size="md"
            color={`tone.${tone}.accent`}
            overflowWrap="anywhere"
          >
            {column.title}
          </Heading>
        </Flex>
        <Badge
          bg={`tone.${tone}.badge`}
          color={`tone.${tone}.accent`}
          borderRadius="lg"
          px={2}
          py={1}
          aria-label={`${column.cards.length} carte${column.cards.length === 1 ? '' : 's'}`}
        >
          {column.cards.length}
        </Badge>
      </Flex>
      <Stack gap={4}>

        {column.cards.length === 0 && <Box
          textAlign="center"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="border.emphasized"
          borderRadius="xl"
          py={8}
          px={3}
        >

          <Text fontWeight="semibold">Un peu d’espace pour la suite</Text>
          <Text color="fg.muted" fontSize="sm" mt={2}>
            Aucune carte. Déposez-en une depuis une colonne voisine.
          </Text>
        </Box>}
        {column.cards.map((card) => (
          <Box key={card.id} position="relative">

            {target?.anchor?.cardId === card.id && (
              <DropMarker edge={target.anchor.side === 'before' ? 'top' : 'bottom'} />
            )}
            <Card
              card={card}
              selected={selectedCardId === card.id}
              blocked={blocked}
              onDragStart={event => onDragStart(event, card.id)}
              users={users}
              onOpen={() => onOpenCard(card.id)}
              onSelect={() => onSelectCard(card.id)}
              onDeselect={onDeselectCard}
              onMove={direction => onMoveCard(card.id, direction)}
            />
          </Box>
        ))}
      </Stack>
      <Box
        role="group"
        aria-label={`Déposer en fin de ${column.title}`}
        position="relative"
        minH="48px"
        flex={1}
        mt={4}
        pt={3}
      >

        {target && !target.anchor && <DropMarker edge="top" />}
        <Text color="fg.muted" fontSize="sm">Fin de colonne</Text>
      </Box>
    </Box>
  )
}

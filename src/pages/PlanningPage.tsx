import { Box, Button, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { boardKey, getBoard } from '../api/board'
import { useBoardWriteStatus } from '../api/mutations'
import { useCalendar } from '../calendar/useCalendar'
import { CardDragPreview } from '../components/CardDragPreview'
import { ProjectGantt } from '../components/ProjectGantt'

export function PlanningPage() {
  const calendar = useCalendar('mini-trello')
  const status = useBoardWriteStatus()
  const { data, isPending, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  if (isPending) return <Stack gap={5} role="status" aria-label="Chargement du planning"><Skeleton height={9} width="18rem" /><Skeleton height="30rem" borderRadius="xl" /></Stack>
  if (!data) return <Stack gap={3} role="alert"><Heading size="lg">Le planning est indisponible</Heading><Text color="fg.muted">{error?.message}</Text><Button width="fit-content" onClick={() => void status.refresh()}>Réessayer</Button></Stack>
  return <>
    <Box mb={5}><Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="600" letterSpacing="-0.03em">{data.title}</Heading><Text mt={2} fontSize="sm" color="fg.muted">Planifiez les cartes et suivez leurs phases, jour après jour.</Text></Box>
    {status.recovery && <Stack mb={4} role="alert" align="start"><Text color="fg.error">{status.recovery}</Text><Button size="sm" disabled={status.busy} onClick={() => void status.refresh()}>Actualiser</Button></Stack>}
    <DndProvider backend={HTML5Backend}>
      <ProjectGantt board={data} store={calendar.store} snapshot={calendar.snapshot} disabled={status.busy || status.blocked} />
      <CardDragPreview board={data} compact />
    </DndProvider>
  </>
}

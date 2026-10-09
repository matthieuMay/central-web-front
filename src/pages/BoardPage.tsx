import { Button, Spinner, Stack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getBoard } from '../api/board'
import { Board } from '../components/Board'

export function BoardPage() {
  const { data : board, isPending, isError, error, refetch } = useQuery({
    queryKey : ['board', 'mini-trello'],
    queryFn : getBoard,
  })

  if (isPending) {
    return (
      <Stack align="center" py={16}>
        <Spinner size="lg" />
        <Text> Chargement du tableau </Text>
      </Stack>
    )
  }

  if (isError) {
    return (
      <Stack align="start" gap={2} role="alert">
        <Text color = "red.600" fontWeight="semibold">
          Impossible de charger le tableau. 
        </Text>
        <Text fontSize="sm" color="gray.600">{error.message}</Text>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </Stack>
    )
  }
  return <Board board={board} />
}


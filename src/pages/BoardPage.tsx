import { Center, Spinner, Stack, Text } from '@chakra-ui/react'
import { Board } from '../components/Board'
import { useBoard } from '../lib/queries'

export function BoardPage() {
  const { data: board, status, error } = useBoard()

  if (status === 'pending') {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    )
  }

  if (status === 'error') {
    return (
      <Stack gap={2} maxW="3xl" mx="auto">
        <Text color="red.fg" fontWeight="medium">
          Unable to load the board.
        </Text>
        <Text color="fg.muted">{error.message}</Text>
      </Stack>
    )
  }

  return <Board board={board} />
}

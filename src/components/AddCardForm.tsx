import { useState, type FormEvent } from 'react'
import { Button, HStack, Input, Stack, Text } from '@chakra-ui/react'
import { useCreateCard } from '../hooks/useCreateCard'

type AddCardFormProps = {
  columnId: string
  columnTitle: string
}

export function AddCardForm({ columnId, columnTitle }: AddCardFormProps) {
  const [title, setTitle] = useState('')
  const createCard = useCreateCard(columnId)
  const trimmed = title.trim()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!trimmed) return
    createCard.mutate(trimmed, {
      onSuccess: () => setTitle(''),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={2} mt={3}>
        <HStack gap={2}>
          <Input
            size="sm"
            bg="white"
            placeholder="New card title"
            aria-label={`New card title in ${columnTitle}`}
            value={title}
            onChange={event => setTitle(event.target.value)}
            disabled={createCard.isPending}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!trimmed}
            loading={createCard.isPending}
          >
            Add card
          </Button>
        </HStack>
        {createCard.isError && (
          <Text fontSize="sm" color="red.600" role="alert">
            {createCard.error.message}
          </Text>
        )}
      </Stack>
    </form>
  )
}  
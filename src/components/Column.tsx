import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card } from './Card'

type ColumnProps = { column: ColumnData }

export function Column({ column }: ColumnProps) {
  const [title, setTitle] = useState('')
  const create = useCreateCard()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || create.isPending) return
    create.mutate({ columnId: column.id, id: uuidv7(), title: trimmed }, {
      onSuccess: () => setTitle(''),
    })
  }

  return (
    <Box as="section" aria-label={column.title} bg="gray.100" borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}>
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="gray.600">No cards yet</Text>}
        {column.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
        <form onSubmit={submit}>
          <label htmlFor={`new-card-${column.id}`}>New card title in {column.title}</label>
          <input id={`new-card-${column.id}`} value={title} onChange={(event) => setTitle(event.target.value)} required disabled={create.isPending} />
          <button type="submit" disabled={create.isPending || !title.trim()}>Add card</button>
          {create.isPending && <p role="status">Adding card…</p>}
          {create.isError && <p role="alert">Could not add card: {create.error.message}</p>}
        </form>
      </Stack>
    </Box>
  )
}

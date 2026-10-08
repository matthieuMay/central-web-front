import { Box, Heading, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { ColumnData } from '../type'

export default function Column({ column, children }: { column: ColumnData, children?: ReactNode }) {
  return (
    <Box
      p="4"
      borderWidth="1px"
      borderColor="border.disabled"
      color="fg.disabled"
    >
      <Heading as="h2" mb="4">{column.title}</Heading>
      <Stack gap={3}>{children}</Stack>
    </Box>
  )
}
import { Box, Heading } from '@chakra-ui/react'
import type { ColumnData } from '../type'

export default function Column({ column }: { column: ColumnData }) {
  return (
    <Box
      p="4"
      borderWidth="1px"
      borderColor="border.disabled"
      color="fg.disabled"
      >
    <Heading as="h2">{column.title}</Heading>
    </Box>)}
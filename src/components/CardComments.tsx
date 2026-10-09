import { Box } from '@chakra-ui/react'
import type { CommentData, User } from '../types/board'

export type CardCommentsProps = {
  comments: CommentData[]
  users: User[]
  onAdd?: (comment: Omit<CommentData, 'createdAt'>) => void
}

export function CardComments(props: CardCommentsProps) {
  return <Box data-component="card-comments" data-comment-count={props.comments.length} data-user-count={props.users.length} />
}

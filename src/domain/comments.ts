import type { CommentData } from '../types/board'

export function sortCommentsNewestFirst(comments: CommentData[]) {
  return [...comments].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
}

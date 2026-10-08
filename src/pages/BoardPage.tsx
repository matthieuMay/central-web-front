import boardJson from '../../data/board.json'
import { Board } from '../components/Board'
import type { BoardData } from '../types/board'

const board: BoardData = boardJson

export function BoardPage() {
  return <Board board={board} />
}
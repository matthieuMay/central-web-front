import board from '../../data/board.json'
import { Board } from '../components/Board'

export function BoardPage() {
  return <Board board={board} />
}

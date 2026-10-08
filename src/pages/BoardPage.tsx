import { Board } from '../components/Board'
import board from '../../data/board.json'

export function BoardPage() {
  return <Board board={board} />
}

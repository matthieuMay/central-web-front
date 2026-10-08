import board from '../../data/board.json'
import Board from '../components/BoardData'

export function BoardPage() {
  return <Board board={board} />
}

import type { CardData } from '../Types'

type CardDataProps = {
  card: CardData
}

function Card({ card }: CardDataProps) {
  return (
    <li>
      <strong>{card.title}</strong>
      {card.description && <p>{card.description}</p>}
    </li>
  )
}

export default Card
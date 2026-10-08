import { Card as ChakraCard, Text } from "@chakra-ui/react";
import { motion } from "motion/react";
import type { CardProps } from "../types/board";

function Card({ card }: { card: CardProps }) {

  return (
    <ChakraCard.Root >
      <ChakraCard.Body borderWidth="1px" borderRadius="md" p={4}>
        <Text fontWeight="bold">{card.title}</Text>
        {card.description && <Text>{card.description}</Text>}
      </ChakraCard.Body>
    </ChakraCard.Root>
  );
}

export default Card;

import { Card as ChakraCard, Text, Button } from "@chakra-ui/react";
import type { CardProps } from "../types/board";
import React from "react";

function Card({ card }: { card: CardProps }) {

  const [edit, setEdit] = React.useState(false);
  return (
    <ChakraCard.Root >
      <ChakraCard.Body borderWidth="1px" borderRadius="md" p={4}>
        {edit ? (
          <form>
            <input type="text" defaultValue={card.title} />
            <textarea defaultValue={card.description}></textarea>
            <Button type="submit">Save</Button>
          </form>
        ) : <>
          <Text fontWeight="bold">{card.title}</Text>
          {card.description && <Text>{card.description}</Text>}
          <Button onClick={() => setEdit(!edit)} mt={2}>
            {edit ? "Close" : "Edit"}
          </Button>
        </>
        }

      </ChakraCard.Body>
    </ChakraCard.Root>
  );
}

export default Card;

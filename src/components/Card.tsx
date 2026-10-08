import { Heading } from "@chakra-ui/react"
import type { BoardData, ColumnData, CardData } from "../types"



export const Card = ({card}: {card: CardData}) => {
    return ( 
        <> 
            <Heading>{card.title}</Heading> 
            {card.description && <a>{card.description}</a>} 
        </> 
    );
};
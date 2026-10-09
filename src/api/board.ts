import type { BoardData, CardData } from '../types/board'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function getBoard(): Promise<BoardData> {
    const response = await fetch(`${API_URL}/boards/mini-trello`)
    if (!response.ok){
        throw new Error(`Erreur ${response.status} en chargeant le tableau`)
    }
    return response.json()
}

type NewCard = {
    columnId : string 
    id : string
    title : string 
}

export async function createCard ({ columnId, id, title } : NewCard): Promise<CardData>{
    const response = await fetch(`${API_URL}/columns/${columnId}/cards`, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({ id, title }),
    })
    if (!response.ok) {
            throw new Error(`${response.status} en créant la carte`)
    }

    return response.json()
}


import type { BoardData } from '../types/board'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function getBoard(): Promise<BoardData> {
    const response = await fetch(`${API_URL}/boards/mini-trello`)
    if (!response.ok){
        throw new Error(`Erreur ${response.status} en chargeant le tableau`)
    }
    return response.json()
}


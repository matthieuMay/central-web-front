import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query"
import { v7 as uuidv7} from 'uuid'
import { createCard } from '../api/board'

export function useCreateCard(columnId: string){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (title: string) => createCard({ columnId, id: uuidv7(), title }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['board', 'mini-trello'] }),
    })
}


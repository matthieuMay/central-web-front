i would like to create 3 new empty components : Members, Comments, TodoTasks. We would need to create 3 new types : memberData, commentData and toDoTaskData. MemberData would have id(string), title(string), and maybe comment (commentData) (you can tell me what you think is better). commentData would have its id(string), description(string), author(memberData) probably better this way rather than comment in member. toDoTaskData would have their id(string), title(string), description(string). Tell me what you think before starting. I would also need to add :

type CardCollections = {
assignees: string[]
comments: {
user: string
comment: string
createdAt: string
}[]
checklistItems: {
description: string
done: boolean
}[]
}

 to card

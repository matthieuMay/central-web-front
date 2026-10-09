# Prompt de départ

salut, maintenant sur le projet il vas falloir implémenter de nouvelle choses dans les task / cards

On a déjà ça de disponible comme api

**GET /users**
**GET /boards/mini-trello**
**PATCH /cards/:cardId**

**GET /users** donne les personnes disponibles pour l’assignation et l’auteur.
**PATCH remplace entièrement** chacune des listes envoyées ; les listes non envoyées restent inchangées.
Pour un nouveau commentaire, ne pas envoyer **createdAt** : l’API crée sa date. Conserver les dates des commentaires existants renvoyés.
Les tâches à cocher n’ont pas d’ID fourni par l’API.
Attention à ne pas perdre d’éléments lors d’un ajout d’un commentaires ou d’un item dans la todo

le type de card

```typescript
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
  }
}
```

qui est a mettre a jour

Apres on se met en mode sdd pour préparer les interfaces, composants et type, et définir les responsabilitées et les cas à vérifier

le but **Membres** : associer et retirer des personnes parmi celles fournies par l’API.
**Commentaires** : lire l’activité et publier un commentaire avec un auteur choisi dans l’interface.
**Tâches à cocher** : créer une tâche, la cocher puis la décocher.

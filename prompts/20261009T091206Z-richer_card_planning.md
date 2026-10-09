# Une Carte plus riche — planning

Call the Skill tool twice, for "grilling" and "domain-modeling".

Command prefix: `/wayfinder /to-spec`

## Brief

Une Carte plus riche · Trois besoins

- **Membres** : associer et retirer des personnes parmi celles fournies par l'API.
- **Commentaires** : lire l'activité et publier un commentaire avec un auteur choisi dans l'interface.
- **Tâches à cocher** : créer une tâche, la cocher puis la décocher.

À vous de décider où et comment les présenter, quels composants créer et quelles props leur donner.

## Contrat fourni

- `GET /users`
- `GET /boards/mini-trello`
- `PATCH /cards/:cardId`

```ts
type CardCollections = {
  assignees: string[]
  comments: { user: string; comment: string; createdAt: string }[]
  checklistItems: { description: string; done: boolean }[]
}
```

- `GET /users` donne les personnes disponibles pour l'assignation et l'auteur.
- `PATCH` remplace entièrement chacune des listes envoyées ; les listes non envoyées restent inchangées.
- Pour un nouveau commentaire, ne pas envoyer `createdAt` : l'API crée sa date.
- Conserver les dates des commentaires existants renvoyés.
- Les tâches à cocher n'ont pas d'ID fourni par l'API.
- Attention à ne pas perdre d'éléments lors d'un ajout d'un commentaire ou d'un item dans la todo.

## Premier commit · Vos décisions, pas du code généré

Pour chaque composant choisi :

- Quelle responsabilité porte-t-il ?
- Que reçoit-il en props ?
- Quelle action déclenche-t-il, et qui détient les données ?
- Quels cas permettront de dire que son comportement est correct ?

Écrire ces réponses en commentaires dans le composant. Brancher dans l'arbre ; un rendu vide suffit.
Montrer un tableau qui compile et fonctionne encore : `npm run lint`, `npm run build`, puis premier commit.

## Constraint

Do not implement now, just everything before.

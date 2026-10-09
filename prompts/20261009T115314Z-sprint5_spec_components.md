# Sprint 5 · Spécifier avant de générer

Au Sprint 7, créez nom/sprint6 depuis votre branche Sprint 4, même inachevée. Conservez les skills,
AGENTS.md, prompts et décisions utiles.

## Sprint 5 · Spécifier avant de générer — Les composants d'abord · l'IA ensuite

Repartir de votre Sprint 4 :
1. Commitez et poussez nom/sprint4 avec l'état atteint, même incomplet.
2. Créez nom/sprint5 depuis cette branche.
3. Gardez vos skills, prompts et décisions utiles ; le travail continue sur votre propre version.

```
git switch nom/sprint4
git push -u origin nom/sprint4
git switch -c nom/sprint5
```

Aucun nouveau Tag de départ : c'est votre conception qui guidera la suite.

## Une Carte plus riche · Trois besoins

- Membres : associer et retirer des personnes parmi celles fournies par l'API.
- Commentaires : lire l'activité et publier un commentaire avec un auteur choisi dans l'interface.
- Tâches à cocher : créer une tâche, la cocher puis la décocher.

À vous de décider où et comment les présenter, quels composants créer et quelles props leur donner.

## Contrat fourni · À vous de l'exploiter

GET /users
GET /boards/mini-trello
PATCH /cards/:cardId

```ts
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
```

- GET /users donne les personnes disponibles pour l'assignation et l'auteur.
- PATCH remplace entièrement chacune des listes envoyées ; les listes non envoyées restent inchangées.
- Pour un nouveau commentaire, ne pas envoyer createdAt : l'API crée sa date. Conserver les dates des commentaires existants renvoyés.
- Les tâches à cocher n'ont pas d'ID fourni par l'API.
- Attention à ne pas perdre d'éléments lors d'un ajout d'un commentaire ou d'un item dans la todo.

## SDD · Deux états du code, deux commits

AVANT L'IA — Vous concevez :
1. Choisir les composants et leurs props typées.
2. Les placer dans l'arbre React, avec un rendu temporaire.
3. Dans chacun, commenter sa responsabilité et les cas à vérifier.
4. Faire passer lint/build, relire et commiter.

APRÈS L'IA — L'IA remplit, vous jugez :
1. Écrire un prompt à partir de ces contrats et du besoin.
2. Faire implémenter les composants.
3. Relire le diff et tester avec l'API locale.
4. Vérifier lint/build, commiter et pousser.

Le premier commit montre vos décisions avant la génération ; le second montre ce que vous avez accepté après revue.

## Premier commit · Vos décisions, pas du code généré

Pour chaque composant que vous choisissez :
- Quelle responsabilité porte-t-il ? Que reçoit-il en props ?
- Quelle action déclenche-t-il, et qui détient les données ?
- Quels cas permettront de dire que son comportement est correct ?

Écrivez ces réponses en commentaires dans le composant. Branchez-le dans l'arbre ; un rendu vide suffit.
Montrez un Tableau qui compile et fonctionne encore : npm run lint, npm run build, puis premier commit.

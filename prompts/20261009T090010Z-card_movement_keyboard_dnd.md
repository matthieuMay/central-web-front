# Prompt de spécification — déplacement de cartes au clavier et en drag-and-drop

Tu travailles sur Mini-Trello. Implémente le déplacement d'une carte dans un tableau par clavier et par drag-and-drop desktop, en respectant les comportements et le contrat ci-dessous.

## Objectif

Permettre à l'utilisateur de sélectionner une carte par clic ou par navigation clavier (`Tab`), puis :

- la déplacer avec les flèches sans perdre sa sélection ;
- la réordonner dans sa colonne avec React DnD ;
- la déposer dans une autre colonne à la position visée ;
- déposer dans une colonne vide ;
- afficher des confettis uniquement après un dépôt drag-and-drop réussi lorsque la carte arrive en dernière position de sa colonne d'arrivée.

## Règles de déplacement au clavier

1. Le focus clavier obtenu par `Tab` ou le clic sélectionne la carte et doit être visible par une indication de focus/sélection accessible.
2. Les flèches haut/bas déplacent la carte d'un rang à la fois dans sa colonne.
3. En première position, la flèche haut n'a aucun effet. En dernière position, la flèche bas n'a aucun effet.
4. Les flèches gauche/droite déplacent la carte vers la colonne voisine.
5. La position cible horizontale conserve le même rang si ce rang existe dans la colonne cible. Si la colonne cible est plus courte, placer la carte à sa dernière position. Une colonne vide accepte la carte à la position 0.
6. Aux extrémités du tableau, la flèche gauche/droite correspondante n'a aucun effet.
7. Après chaque déplacement réussi, conserver la carte sélectionnée/focalisée afin qu'une nouvelle pression de flèche poursuive le déplacement.
8. Une touche qui ne produit aucun déplacement ne doit pas appeler l'API ni déclencher de confettis.

## Règles de drag-and-drop avec React DnD

1. Utiliser React DnD et ses mécanismes de source draggable et de drop target ; ne pas créer un second système parallèle de déplacement.
2. Le drag-and-drop doit fonctionner :
   - dans la même colonne pour réordonner ;
   - vers une autre colonne ;
   - vers une colonne vide.
3. Lorsqu'une carte est survolée, calculer l'insertion selon la moitié verticale de la carte survolée :
   - moitié supérieure : insérer avant ;
   - moitié inférieure : insérer après.
4. Le dépôt doit viser la position réellement calculée, sans doublon ni décalage incorrect quand la carte est déplacée dans sa propre colonne.
5. Une colonne vide doit présenter une zone de dépôt identifiable et accepter la carte à la position 0.
6. Un dépôt sans changement de position ne doit pas appeler l'API.
7. Après un dépôt réussi qui place la carte en dernière position de la colonne d'arrivée, déclencher les confettis à la position visuelle d'arrivée. Ne pas déclencher de confettis pour les déplacements au clavier.

## Contrat API

Pour chaque déplacement accepté, appeler :

```http
PUT /cards/:cardId
Content-Type: application/json
```

avec :

```json
{
  "column": "doing",
  "position": 1
}
```

La réponse est un `BoardData`. Utiliser cette réponse comme nouvelle source de vérité pour l'état du tableau après succès, au lieu de reconstruire localement un état potentiellement divergent.

## État, erreurs et cohérence

- Centraliser clavier et drag-and-drop dans une même opération métier de déplacement, qui reçoit `cardId`, colonne cible et position cible.
- Ne pas muter directement les tableaux existants.
- Pendant la requête, empêcher les déplacements concurrents de la même carte ou définir un état de chargement clair cohérent avec les conventions existantes.
- En cas d'erreur API, conserver ou restaurer l'état précédent, informer explicitement l'utilisateur et ne pas afficher de confettis.
- Préserver les autres comportements existants du tableau et des cartes.
- Respecter les types existants (`BoardData`, carte, colonne) et les helpers/API déjà présents ; ne pas introduire de cast large.

## Accessibilité et UX

- Le focus et la carte sélectionnée doivent être perceptibles sans dépendre uniquement de la couleur.
- Les boutons, cartes et zones de dépôt doivent conserver des noms accessibles.
- Ne pas intercepter les flèches lorsqu'un champ éditable à l'intérieur de la carte possède le focus.
- Mettre à jour le focus ou la référence de carte après réception du `BoardData` afin que la sélection reste cohérente.
- Ajouter, si le projet en possède un, un retour non visuel pour annoncer le déplacement réussi ou refusé.

## Validation attendue

Ajouter ou mettre à jour les tests pertinents pour couvrir au minimum :

1. déplacement haut/bas et bornes d'une colonne ;
2. déplacement gauche/droite, bornes du tableau et colonne cible plus courte ;
3. déplacement vers une colonne vide ;
4. réordonnancement DnD avant/après une carte survolée ;
5. déplacement intra-colonne sans doublon ;
6. dépôt sans changement sans appel API ;
7. appel `PUT` avec le bon `cardId`, `column` et `position` ;
8. remplacement de l'état par le `BoardData` retourné ;
9. rollback/notification sur erreur ;
10. confettis uniquement pour un dépôt DnD réussi en dernière position.

Avant de conclure, inspecte l'architecture existante pour brancher cette fonctionnalité aux composants et au client API déjà utilisés, puis exécute les tests et le type-check/lint appropriés.

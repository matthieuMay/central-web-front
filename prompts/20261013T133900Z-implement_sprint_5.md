Je souhaite réaliser le Sprint 5 de Mini-Trello directement avec l'IA, conformément à l'autorisation donnée oralement par mon professeur.

Je t'autorise à concevoir et implémenter les composants React nécessaires, sans imposer de premier commit manuel de conception.

Utilise les skills Matt Pocock pertinents, notamment implement, ainsi que les conventions du dépôt.

## Objectif

Enrichir les cartes de Mini-Trello avec trois fonctionnalités :

1. Gestion des membres associés à une carte.
2. Historique et publication de commentaires.
3. Checklist avec création et modification des tâches.

## Contrat API

Endpoints existants :
- GET /users
- GET /boards/mini-trello
- PATCH /cards/:cardId

Structure des collections :

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
  }[]
}
```

Règles importantes :

- GET /users fournit les utilisateurs disponibles.
- PATCH remplace entièrement chaque liste envoyée.
- Les listes absentes du PATCH ne doivent pas être modifiées.
- Pour un nouveau commentaire, ne pas envoyer createdAt : le serveur génère cette date.
- Conserver les dates des commentaires existants.
- Les éléments de checklist ne possèdent pas d'identifiant fourni par l'API.
- Éviter les pertes de données lors de modifications rapprochées.

## Architecture attendue

1. Examiner les composants React et la couche API existants.
2. Concevoir une décomposition maintenable en composants typés, avec des responsabilités claires.
3. Réutiliser TanStack Query, Chakra UI et les composants existants.
4. Intégrer ces fonctionnalités dans l'interface des cartes.
5. Documenter brièvement les décisions de conception et les responsabilités des composants.
6. Implémenter directement après cette analyse, sans demander une validation intermédiaire sauf décision réellement bloquante.

## Expérience utilisateur

Membres :
- Afficher les membres affectés à une carte.
- Permettre d'ajouter et retirer un utilisateur.
- Ne jamais perdre les autres membres.

Commentaires :
- Afficher l'historique chronologique et les dates.
- Choisir l'auteur parmi les utilisateurs disponibles.
- Publier un commentaire non vide.
- Conserver les anciens commentaires après publication.

Checklist :
- Créer de nouvelles tâches.
- Cocher et décocher une tâche.
- Ne pas modifier les autres tâches.
- Afficher éventuellement une progression des tâches terminées.

Prévoir des états de chargement et des messages d'erreur accessibles. Ne pas présenter une modification refusée par l'API comme enregistrée.

## Contraintes

- Préserver intégralement les fonctionnalités des Sprints 3 et 4 : dark mode, navigation, clavier, drag-and-drop, persistance et confettis.
- Ne pas modifier le backend.
- Ne pas lancer de reset ou de migration.
- Ne pas lire les secrets de .env.
- Éviter les nouvelles dépendances inutiles.
- Respecter AGENTS.md et archiver le prompt initial.
- Ne pas lire les anciens prompts enregistrés.

## Vérifications

Utiliser Chrome DevTools MCP pour tester :
- Association et retrait de membres.
- Publication de commentaires et conservation de l'historique.
- Ajout, cochage et décochage de tâches.
- Persistance après rechargement.
- Cartes dont les listes sont vides.
- Erreurs API et modifications rapprochées.
- Non-régression des fonctionnalités précédentes.

Exécuter npm run lint, npm run build et git diff --check.

Effectuer les revues Standards et Spec.

Présente-moi les fichiers modifiés, les décisions d'architecture, les fonctionnalités validées et les éventuelles limites.

Ne fais aucun commit ni push sans mon autorisation.

Réponds en français.

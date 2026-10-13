# Contrats réels du backend — Sprint 4

Audit en lecture seule lors de la reprise du cadrage Sprint 4. Sources locales primaires : `C:/Users/hugoc/central-web-api`. Aucun secret `.env` lu, aucun démarrage, migration, test backend ou requête de mutation effectué.

## Version vérifiée

HEAD local et référence locale `origin/main` : `9ab0b4a8257a89d79978dae54adcfedabe80d78e` (`feat(api): timestamp card comments`). Aucun fetch : cela confirme la référence déjà connue localement, sans garantir l'état distant actuel. Lecture Git avec `-c safe.directory=...`, sans modifier de configuration permanente.

## Lecture et déplacement

- `GET /boards/:id` renvoie `BoardData`, 404 `{error: "Board not found"}` si absent. Le tableau fourni est `mini-trello` : `GET /boards/mini-trello`. Sources : [app.ts](C:/Users/hugoc/central-web-api/src/app.ts:72), [README](C:/Users/hugoc/central-web-api/README.md).
- `PUT /cards/:cardId` accepte exclusivement `column` et `position`. `column` est une chaîne non vide. `position`, lorsqu'elle est présente, doit être un entier sûr. Réponse HTTP 200 : tableau entier mis à jour. Source : [app.ts](C:/Users/hugoc/central-web-api/src/app.ts:101).
- L'indice est calculé après retrait de la carte. Pour la même colonne : plage 0 à longueur initiale moins 1 ; pour une autre colonne : 0 à longueur cible incluse. Position absente : ajout en fin, y compris réorganisation vers la fin de la même colonne. Colonne vide : position 0 valide. Source : [store.ts](C:/Users/hugoc/central-web-api/src/db/store.ts:158).
- Les positions hors plage renvoient 400 ; carte/colonne inconnue : 404 ; changement vers un autre tableau : 400. Corps JSON mal formé ou champs supplémentaires : 400. Les erreurs sont des objets `{error: string}`. Erreur interne : 500. Aucun middleware d'authentification trouvé dans `createApp`.
- Le serveur ne limite pas aux colonnes voisines : c'est une règle frontend du Sprint 4. Les limites et les mouvements sans effet doivent être filtrés avant le PUT.

## Persistance et données à préserver

`BoardData = {id, title, columns: [{id, title, cards: [...]}]}`. Chaque carte contient `id`, `title`, éventuellement `description`, et toujours `assignees: string[]`, `comments: {user, comment, createdAt}[]`, `checklistItems: {description, done}[]`. Les positions ne sont pas exposées comme propriété : l'ordre des tableaux exprime l'ordre métier. Source : [store.ts](C:/Users/hugoc/central-web-api/src/db/store.ts:3).

Le PUT ne touche qu'à `column_id` et `position`. Il préserve ces champs enrichis. Remplacer le cache TanStack Query par le `BoardData` complet renvoyé évite de les perdre. La lecture joint les colonnes vides et trie colonnes/cartes par leur position (puis id). Source : [store.ts](C:/Users/hugoc/central-web-api/src/db/store.ts:75).

Les mouvements sont transactionnels. PostgreSQL verrouille le tableau avant de lire et modifier l'ordre ; SQLite utilise une transaction immédiate. La réponse est relue après la transaction. Les tests source vérifient les indices, le refus atomique, la concurrence et la persistance après redémarrage ; ils n'ont pas été exécutés ici. Source : [tests/api.test.ts](C:/Users/hugoc/central-web-api/tests/api.test.ts:234).

## Configuration et démarrage

- PostgreSQL est le driver par défaut dans cette version, sur localhost:5432 ; SQLite reste une alternative explicite avec `DB_DRIVER=sqlite`, stockage fichier `./data/trello.sqlite`. Changer de driver sélectionne une autre base et ne transfère pas les données. Source : [client.ts](C:/Users/hugoc/central-web-api/src/db/client.ts:30).
- API : port par défaut 3000 (`PORT` peut le modifier). CORS : origine par défaut `http://localhost:5173` (`CORS_ORIGIN` peut la modifier). Frontend recommandé par le README : `VITE_API_URL=http://localhost:3000`. L'URL et le driver réellement actifs restent non vérifiés, car `.env` est exclu de l'audit. Sources : [index.ts](C:/Users/hugoc/central-web-api/src/index.ts:7), [app.ts](C:/Users/hugoc/central-web-api/src/app.ts:64).
- Instructions documentées : Node 22+, `npm ci`, démarrage Docker du service DB, `npm run db:migrate`, `npm run dev`. Ne pas les exécuter dans cette phase.
- **Démarrer l'API lance aussi `prepare(db)`**, donc migrations Drizzle, mise à niveau des dates des anciens commentaires, puis seed si nécessaire. `npm run dev` et `npm start` ne sont pas des opérations de lecture seule et nécessitent l'autorisation du propriétaire avant le test d'intégration. Sources : [index.ts](C:/Users/hugoc/central-web-api/src/index.ts:9), [migrate.ts](C:/Users/hugoc/central-web-api/src/db/migrate.ts:9).
- `db:reset` restaure volontairement les données seed et remplace les utilisateurs ; exclu du Sprint 4. Ne pas supprimer les volumes Docker.

## Conséquence pour le cadrage

Aucun contrat supplémentaire nécessaire : lecture via le GET existant, mutation via le PUT existant, tableau de réponse comme autorité serveur, et nouvelle lecture après rechargement. Intégration TanStack Query possible sans ajout de dépendance. Le contrat est vérifié dans le code ; la disponibilité du service et sa connexion PostgreSQL effective ne sont pas encore testées.

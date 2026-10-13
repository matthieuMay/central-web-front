# Mini-Trello

## Présentation

Mini-Trello est une application de gestion de sprint : un tableau Kanban partagé,
des cartes enrichies et un dashboard pour suivre la progression et les assignations.
Les pages sont accessibles sur `/`, `/board` et `/analytics`.

Dépôts vérifiés :

- [Frontend](https://github.com/hugocroisic/central-web-front)
- [API fournie pour le projet](https://github.com/matthieuMay/central-web-api)

## Fonctionnalités

- Tableau chargé depuis l’API, avec cartes et colonnes ordonnées.
- Sélection des cartes et déplacements au clavier dans les quatre directions.
- Drag-and-drop avant/après une carte, en fin de colonne ou dans une colonne vide.
  Les déplacements horizontaux sont limités aux colonnes immédiatement voisines.
- Fiche de carte : association/retrait de membres, commentaires datés,
  création, cochage/décochage et modification des tâches de checklist.
- Enregistrement confirmé par le serveur, verrou des écritures et reprise après erreur.
- Confettis après un déplacement confirmé vers la dernière colonne.
- Analytics : répartition par colonne, cartes terminées, progression des tâches et charge par membre.
- Design V2, responsive, thèmes clair/sombre et préférence de mouvement réduit.

## Stack technique

Versions résolues dans `package-lock.json` ; `npm ci` reproduit ce verrouillage.

| Outil | Version | Usage |
| --- | --- | --- |
| React / React DOM | 19.3.0 | Interface et rendu |
| TypeScript | 6.0.3 | Typage strict |
| Vite | 8.3.0 | Serveur de développement et build |
| Chakra UI | 3.37.0 | Composants, tokens et thèmes |
| Emotion | 11.14.0 | Styles de Chakra |
| TanStack Query | 5.104.1 | Lectures, cache et mutations |
| React Router | 8.4.0 | Navigation |
| Motion | 14.0.0 | Animation des confettis |
| Oxlint | 1.83.0 | Analyse statique React/TypeScript |
| Chrome DevTools MCP | 1.10.1 | Vérifications navigateur |

Immer et use-immer restent déclarés dans le package, mais ne sont pas importés
dans le code actuel. Le lint utilise `.oxlintrc.json`, pas ESLint.
Les tests de calcul utilisent le runner intégré à Node.js.

## Prérequis

- Node.js **>=22.22.0** et npm.
- Backend Mini-Trello accessible, normalement sur `http://localhost:3000`.
- PostgreSQL pour la configuration backend par défaut.
- Docker avec Docker Compose si PostgreSQL est fourni par le projet Compose de l’API.

Le frontend ne se connecte jamais directement à PostgreSQL. Le backend permet
aussi SQLite via sa propre configuration ; ce n’est pas une option du frontend.

## Installation

Depuis le dossier parent souhaité :

```bash
git clone https://github.com/hugocroisic/central-web-front.git
cd central-web-front
npm ci
```

Pour le backend, dans un autre dossier :

```bash
git clone https://github.com/matthieuMay/central-web-api.git
cd central-web-api
npm ci
```

Les fonctionnalités décrites correspondent à cette version du frontend.
Un clone récupère la branche par défaut publiée ; les changements locaux non
commités ne font pas partie du dépôt distant.

## Configuration

### Frontend

La seule variable d’environnement utilisée par `src/` est `VITE_API_URL`.
Elle est publique, intégrée au bundle par Vite, et ne doit contenir aucun secret.

Créer éventuellement `.env.local` à la racine (ignoré par Git) :

```dotenv
VITE_API_URL=http://localhost:3000
```

Sans cette variable, la même URL est utilisée. Redémarrer Vite après modification.
Le frontend ne possède ni proxy Vite ni configuration de connexion à la base.

### Backend

Configurer la copie locale de `.env.example` en `.env` dans le dépôt API,
avec les valeurs adaptées à la base visée. Sous PowerShell :

```powershell
Copy-Item .env.example .env
```

Cette copie est à effectuer uniquement si `.env` n’existe pas déjà.
Les variables backend pertinentes sont :

| Variable | Rôle |
| --- | --- |
| `DB_DRIVER` | Choix postgres/sqlite |
| `DATABASE_URL` | Connexion PostgreSQL ; contient des identifiants, à garder privés |
| `SQLITE_PATH` | Fichier utilisé avec SQLite |
| `PORT` | Port API, 3000 par défaut |
| `CORS_ORIGIN` | Origine frontend autorisée, `http://localhost:5173` par défaut |

Ne pas copier les valeurs privées du backend dans une variable `VITE_*`.
Les configurations et identifiants locaux ne sont pas nécessaires dans ce README.

## Démarrage

### Backend

Si le service PostgreSQL Compose du projet doit être démarré, depuis le dépôt API :

```bash
docker compose up -d db
docker compose ps
```

Puis, **après vérification de la base ciblée et sauvegarde si nécessaire** :

```bash
npm run dev
```

Ce script exécute `tsx watch src/index.ts`. Le démarrage appelle `prepare(db)` :
application des migrations en attente, ajout de dates aux anciens commentaires
qui en sont dépourvus, initialisation du tableau s’il est absent et de dix
utilisateurs si leur table est vide. Il peut donc écrire dans la base.
Un redémarrage normal ne réinitialise pas un tableau existant.

Vérifier le processus avec `GET http://localhost:3000/health`.
Le frontend utilise ensuite `GET /boards/mini-trello` et `GET /users`.
Les commandes backend `db:reset` ou la suppression des volumes Docker ne sont
pas nécessaires au démarrage normal.

### Frontend

Dans le dépôt frontend, dans un autre terminal :

```bash
npm run dev -- --port 5173 --strictPort
```

Ouvrir [http://localhost:5173](http://localhost:5173).
`--strictPort` évite un passage silencieux sur un port différent de celui autorisé
par le CORS du backend. Si 5173 est occupé, vérifier l’instance existante ou choisir
un autre port en adaptant `CORS_ORIGIN`.

Pour tester le build local :

```bash
npm run build
npm run preview
```

Le serveur preview utilise par défaut le port 4173 : autoriser cette origine
dans le backend pour les requêtes API. Il ne remplace pas un hébergement de production.
Un hébergement doit servir `index.html` pour les routes frontend inconnues du serveur.

## Architecture

```text
src/
├── api/board.ts                 # Transport HTTP, validations et clés Query
├── types/board.ts               # Contrats tableau, utilisateurs et collections
├── board-movement.ts            # Positions, flèches et ancrages de dépôt
├── board-state.ts               # Recherche, remplacement et entrée dans la dernière colonne
├── card-editing.ts              # Intentions PATCH et tri des commentaires
├── analytics.ts                 # Calculs purs du sprint et de la charge
├── hooks/
│   ├── useBoardController.ts    # Verrou, préparation, écriture et réconciliation
│   └── useTheme.ts              # Système et choix manuel temporaire
├── components/
│   ├── Board.tsx / Column.tsx / Card.tsx
│   ├── CardDetails.tsx / Confetti.tsx
│   ├── Header.tsx / Layout.tsx
│   ├── card-details/            # Membres, commentaires, checklist et édition d’une tâche
│   ├── analytics/               # KPI, barres et présentation de la charge
│   └── visual/                  # Surfaces, avatars et accents partagés
├── pages/                      # Accueil, tableau, analytics, page introuvable
├── theme.ts                    # Tokens et recettes Chakra
├── index.css                   # Contrôles natifs, focus et mouvement réduit
├── App.tsx                     # Routes
└── main.tsx                    # Providers et point d’entrée
tests/                          # Tests métier Node
docs/agents/                    # Conventions du dépôt
.scratch/                       # Spécifications et rapports locaux
```

La page compose les vues ; le contrôleur porte les effets réseau.
Les fonctions métier restent indépendantes de React. Les brouillons des
formulaires sont locaux ; les collections enregistrées proviennent du cache
confirmé. La modale native garde le focus, Échap et le retour au déclencheur.

## API utilisée

| Méthode | Route | Résultat / rôle |
| --- | --- | --- |
| GET | `/boards/mini-trello` | `BoardData` complet, colonnes/cartes dans l’ordre |
| GET | `/users` | Liste `id, firstname, lastname` |
| PUT | `/cards/:cardId` | Déplacement ; retourne le tableau complet |
| PATCH | `/cards/:cardId` | Modification ciblée ; retourne la carte complète |

Exemples de corps, à adapter aux identifiants existants :

```json
{ "column": "doing", "position": 1 }
```

La position PUT est un indice basé sur zéro **après retrait de la carte source**.
Sans position, la carte est ajoutée en fin de colonne.

```json
{
  "comments": [
    { "user": "user-id", "comment": "Ancien", "createdAt": "date-existante" },
    { "user": "user-id", "comment": "Nouveau" }
  ]
}
```

Chaque collection envoyée par PATCH (`assignees`, `comments`, `checklistItems`)
remplace entièrement la liste correspondante. Les collections absentes restent
inchangées. Les nouveaux commentaires n’envoient pas `createdAt` ; les dates des
anciens sont conservées. Les tâches n’ont pas d’identifiant serveur.

Les écritures sont sérialisées par QueryClient. Un PATCH est construit après une
lecture fraîche ; un changement de snapshot d’une tâche est refusé. Aucun
déplacement non confirmé n’est affiché comme enregistré. Une réponse incertaine
déclenche une relecture, sans renvoi automatique ; une relecture échouée bloque
les modifications jusqu’à reprise.

## Tests et qualité

Scripts présents dans `package.json` :

| Commande | Action |
| --- | --- |
| `npm run dev` | Vite |
| `npm run build` | `tsc -b` puis build Vite |
| `npm run lint` | Oxlint |
| `npm run preview` | Aperçu du build |
| `npm run mcp:chrome-devtools` | Serveur Chrome DevTools MCP |

Il n’y a pas de script `npm test`. Exécuter tous les tests Node et le contrôle Git :

```bash
node --experimental-strip-types --test tests/*.test.mjs
git diff --check
```

Les sept tests Analytics couvrent notamment multi-assignations, pondération par
tâche, données vides et immutabilité. Cinq tests ciblent aussi les transformations
de carte, conflits de checklist et commentaires datés.
Le build vérifie le typage strict. Les vérifications navigateur utilisent Chrome
DevTools MCP ; les rapports distinguent lectures réelles et écritures simulées.
Sous PowerShell, `npm.cmd` peut remplacer `npm` si la politique bloque npm.ps1.

## Accessibilité

- Tab pour naviguer ; Entrée/Espace pour sélectionner une carte.
- Sur une carte sélectionnée : ←/→ vers la colonne voisine, ↑/↓ d’un rang.
  Les mouvements impossibles ne produisent aucune requête.
- Échap désélectionne une carte ou ferme les détails.
- Les champs et boutons internes conservent leurs propres touches.
- Focus visible ; Tab reste dans la modale et la fermeture rend le focus initial.
- Thème système suivi automatiquement ; une bascule manuelle dure jusqu’au reload.
- `prefers-reduced-motion` désactive les transitions de la refonte et les confettis,
  y compris lorsqu’une animation est déjà active.
- Barres et couleurs accompagnées de valeurs textuelles ; erreurs annoncées par
  `role="alert"`, statuts par `role="status"`.

## Limites connues

- Analytics est un instantané, sans historique, vélocité, estimation d’effort ni
  temps réel multi-client. Actualisation à l’ouverture ou via le bouton dédié.
- Dernière colonne = cartes terminées. Chaque carte globale compte une fois ;
  une carte multi-assignée et ses tâches comptent pour chacun de ses membres.
  Les totaux individuels ne s’additionnent donc pas au total du tableau.
- Sans tâche, la progression est non applicable. La charge compare les cartes
  actives, sans prétendre mesurer la capacité d’une personne.
- Le verrou et la lecture fraîche protègent les écritures rapprochées locales.
  Sans version/ETag serveur, ils ne garantissent pas des modifications entre
  plusieurs clients dans l’intervalle GET→PATCH.
- Deux tâches identiques sans identifiant ne peuvent pas être distinguées après
  une réorganisation distante.
- L’interface ne fournit pas la création/suppression de cartes ni l’édition de
  leur titre/description. Elle n’ajoute pas d’authentification : l’auteur d’un
  commentaire est choisi parmi les utilisateurs disponibles.
- Le build émet actuellement un avertissement de taille de bundle (>500 kB).
  La validation navigateur a été menée sous Chrome, pas sur une matrice complète.

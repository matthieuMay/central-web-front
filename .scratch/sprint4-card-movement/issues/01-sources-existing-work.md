# Retrouver les consignes et les sources de l'existant

Type: task
Label: wayfinder:task
Mode: HITL
Status: resolved
Blocked by: None
Parent: [Préparer les déplacements persistants et leur célébration](../map.md)

## Question

Où sont les consignes du professeur, la version contenant le drag-and-drop annoncé et le backend existant ? Fournir leurs références permet de confronter le checkout aux vraies sources avant de décider des adaptations.

L'inspection locale est consignée dans [l'état des lieux](../etat-des-lieux.md) : tableau statique, aucune interaction DnD, aucun backend intégré. L'utilisateur est invité à indiquer les chemins/branches/docs manquants, puis l'agent pourra les inspecter sans modifier le code.

Preuves à réunir : règles professeur, origine de la version interactive, URL/configuration du backend de développement, mécanisme de lecture existant de BoardData et réalité de la persistance. Ne pas inventer d'endpoint de lecture.

## Comments

Question de sources envoyée lors du tracé initial ; aucun ticket revendiqué ou résolu.

## Answer

Résolu le 2026-10-09 après les informations utilisateur et inspection en lecture seule.

- Consignes professeur fournies par l'utilisateur : déplacement gauche/droite vers voisines, haut/bas interne, limites, DnD même colonne/voisine avec position précise et colonne vide, persistance, confirmation API avant célébration, reduced-motion.
- Backend local `C:/Users/hugoc/central-web-api` : HEAD et référence locale `origin/main` = `9ab0b4a8257a89d79978dae54adcfedabe80d78e`. Aucun fetch ; ce constat porte sur les refs locales.
- Contrat de lecture retrouvé : `GET /boards/:id`, donc `/boards/mini-trello`. PUT réel conforme au contrat fourni, position après retrait, réponse BoardData ; persistance transactionnelle dans la base choisie. Voisinage à contrôler dans le frontend.
- API et origine Vite autorisée par défaut : localhost:3000 et localhost:5173 ; configuration active non inspectée. PostgreSQL est le driver par défaut, port 5432 documenté et fonctionnement Docker indiqué par l'utilisateur.
- Backend non démarré : dev/start appellent prepare, donc peuvent migrer, mettre à jour les dates des anciens commentaires et seeder. Une future autorisation de tests frontend n'autorise pas à elle seule ces écritures backend.
- `hugoc/sprint2` à `5387444` contient bien l'existant DnD/clavier/API réutilisable. Le helper PUT n'est pas connecté aux mouvements locaux et doit être adapté.

Sources et détails : [contrats backend](../backend-contracts.md), [réutilisation du Sprint 2](../sprint2-reuse.md). Aucun secret .env lu, aucune migration, aucune modification backend ou applicative, aucun merge/cherry-pick.

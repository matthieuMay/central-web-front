# 08 : Déposer une carte à une position précise

Status: ready-for-agent
Blocked by: 06
Spécification : [Sprint 4 — Déplacements persistants des cartes](../spec.md)
Couverture : CA5, CA6, CA7, CA8, CA9, CA10 ; CA13–CA15 pour le drag-and-drop.
Découpage et critères : validés par l'utilisateur.

## Ce qui est livré

L'utilisateur dépose une carte avant/après une autre carte, en fin de colonne ou dans une colonne vide. Seules la colonne actuelle et ses voisines acceptent le dépôt, et seule la confirmation serveur change l'ordre enregistré.

## Critères d'acceptation

- [ ] CA5 : drag-and-drop natif réutilisé du Sprint 2 avec identifiant validé dans le tableau confirmé ; moitié supérieure = avant, inférieure = après, repère d'insertion visible.
- [ ] CA5 : réorganisation interne calculée après retrait ; dans [A,B,C], B après C produit [A,C,B] avec position 2, et B avant A produit [B,A,C] avec position 0.
- [ ] CA6 : dépôt à position précise dans une voisine, dépôt en fin via le vide de colonne et dépôt dans une colonne vide à position 0.
- [ ] CA6 : colonne distante, identifiant inconnu, dépôt sur soi-même/position actuelle, hors cible et annulation : aucune requête et aucun changement enregistré.
- [ ] CA5–CA6 : repères nettoyés au dépôt, à la sortie, à l'annulation et au démontage ; aucune interception des interactions par un décor.
- [ ] CA7–CA9 : chemin de mutation partagé, ordre inchangé pendant attente, deuxième mouvement bloqué, refus annoncé et résultat incertain resynchronisé sans retry PUT.
- [ ] CA8 : sélection et focus cohérents après confirmation, sans détourner le focus d'une commande utilisée entre-temps ; une lecture ancienne n'écrase pas le résultat.
- [ ] CA10 : ordre et colonne confirmés persistent après rechargement ; données enrichies conservées.
- [ ] CA13–CA15 : styles sémantiques du Sprint 3 préservés, repère et focus contrastés en clair/sombre, responsive et nettoyage corrects.

## Dépendance et ordre

Préalable fonctionnel : [Déplacer une carte vers une voisine et retrouver l'état serveur](06-confirmed-card-movement.md). Respecter l'ordre d'exécution demandé 06 → 07 → 08 → 09 ; le ticket clavier n'est pas ajouté comme bloqueur technique.

## Vérifications

Chrome DevTools MCP : drag réel dans les deux directions, avant/après, haut/bas de liste, colonne vide, fin, cible distante et annulation ; inspecter les positions du PUT après retrait. Réponse retardée/refusée, mouvements clavier pendant drag/attente et rechargement après succès contre PostgreSQL. Un appel programmatique au helper ne remplace pas la preuve de drag réel.

Contrôler les deux thèmes et largeurs 375/800/1440 px, absence de débordement et texte long. Exécuter npm run lint, npm run build avec typage et git diff --check ; consigner résultats et scénarios impossibles. Présenter les opérations exactes et effets PostgreSQL avant démarrage/tests d'intégration ; attendre l'autorisation explicite pour API/migrations. Aucun reset, secret .env lu ni modification backend.

## Comments

Enregistrement autorisé ; implémentation non commencée. Aucun merge/cherry-pick automatique ni dépendance supplémentaire sans justification.

Validation utilisateur enregistrée le 20261012T142619Z : numérotation, critères d'acceptation et dépendances approuvés. Exécution séquentielle 06 → 07 → 08 → 09. Cette validation autorise l'enregistrement uniquement ; aucune implémentation, aucun démarrage API, aucune migration ni réinitialisation de base. Avant les tests d'intégration, présenter les opérations exactes de démarrage et leurs effets éventuels sur PostgreSQL.

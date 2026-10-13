# 09 : Célébrer les arrivées confirmées et valider le Sprint

Status: ready-for-agent
Blocked by: 07, 08
Spécification : [Sprint 4 — Déplacements persistants des cartes](../spec.md)
Couverture : CA11, CA12, CA13, CA14, CA15 ; validation globale CA1 à CA15.
Découpage et critères : validés par l'utilisateur.

## Ce qui est livré

L'utilisateur reçoit une célébration après l'arrivée confirmée d'une carte depuis une autre colonne dans la dernière colonne. La confirmation reste accessible sans animation sous reduced-motion, et le Sprint est vérifié de bout en bout.

## Critères d'acceptation

- [ ] CA11 : comparer source confirmée avant mutation et carte dans BoardData retourné ; une arrivée externe dans la dernière colonne selon l'ordre du tableau déclenche une seule célébration, après réponse valide uniquement.
- [ ] CA11 : aucune célébration avant confirmation, sur refus/résultat incertain, réorganisation interne, limite, cancellation, dépôt sans effet, lecture/invalidation ou rechargement. Une nouvelle sortie/entrée confirmée peut célébrer à nouveau.
- [ ] CA12 : reduced-motion actif empêche génération/animation ; activation en cours arrête l'animation, désactivation ne rejoue pas un ancien événement. Annonce accessible conservée.
- [ ] CA11–CA12 : Confetti existant adapté de manière ciblée, déclencheur explicite, formes stables, timers/particules nettoyés, décoration non bloquante et sans débordement ; pas de double événement StrictMode ni d'animation tardive après navigation/démontage.
- [ ] CA13 : routes, historique, pilotage du thème système/manuellement, grille 1/2/4 colonnes à 375/800/1440 px, textes longs et colonne vide préservés.
- [ ] CA14 : mesurer sélection, focus et repères de dépôt au repos et dans les états interactifs des deux thèmes ; texte normal ≥4,5:1, grands textes/composants essentiels ≥3:1.
- [ ] CA1–CA10 : rejouer toute la matrice lecture/clavier/DnD/attente/erreurs/focus/persistance avec le backend PostgreSQL réel, préserver les données enrichies ; distinguer refus avant écriture et perte de réponse après écriture.
- [ ] CA15 : typage, npm run lint, npm run build, git diff --check et revue code-review ; aucune nouvelle régression, avertissements préexistants distingués.
- [ ] Rapport final : résultats, preuves de requêtes/ordre/focus/confettis, ratios mesurés et éventuels tests non exécutés clairement consignés. Aucun test non exécuté déclaré réussi.

## Dépendances

- [Réordonner au clavier et préserver la sélection et le focus](07-keyboard-card-ordering.md).
- [Déposer une carte à une position précise](08-precise-card-drop.md).

Le chemin API confirmé du ticket 06 est acquis transitivement. Ordre souhaité : 06 → 07 → 08 → 09.

## Vérifications

Chrome DevTools MCP : arrivée par clavier puis drag, réponse retardée, échec, réorganisation dans la dernière colonne, lecture/rechargement, sortie puis nouvelle entrée ; reduced-motion avant et pendant animation, StrictMode, navigation pendant attente. Tests de non-régression CA1 à CA15 et ratios sur styles réellement affichés, pas uniquement présence de tokens Chakra.

La persistance doit être prouvée par succès PUT puis rechargement/GET contre le PostgreSQL existant. Les tests backend sources et mocks frontend ne remplacent pas cette preuve. Pas de nouveau framework sans justification.

## Préalable backend

Avant tests d'intégration, présenter opérations/commandes exactes, base ciblée, effets de prepare et des éventuelles migrations/seed/mise à niveau des anciens commentaires. Attendre l'autorisation explicite avant démarrer API ou migrer. Aucun reset, modification backend, lecture de secrets .env ou suppression de volume.

## Comments

Enregistrement autorisé ; implémentation non commencée. Les avertissements préexistants de Confetti ne justifient pas un nettoyage général ; les adaptations nécessaires à la fonctionnalité sont dans le périmètre.

Validation utilisateur enregistrée le 20261012T142619Z : numérotation, critères d'acceptation et dépendances approuvés. Exécution séquentielle 06 → 07 → 08 → 09. Cette validation autorise l'enregistrement uniquement ; aucune implémentation, aucun démarrage API, aucune migration ni réinitialisation de base. Avant les tests d'intégration, présenter les opérations exactes de démarrage et leurs effets éventuels sur PostgreSQL.

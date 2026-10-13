# 07 : Réordonner au clavier et préserver la sélection et le focus

Status: ready-for-agent
Blocked by: 06
Spécification : [Sprint 4 — Déplacements persistants des cartes](../spec.md)
Couverture : CA2, CA3, CA4, CA7, CA8, CA9, CA10 ; CA13–CA15 pour les interactions clavier.
Découpage et critères : validés par l'utilisateur.

## Ce qui est livré

L'utilisateur manipule les cartes entièrement au clavier : sélection, déplacements horizontaux et réorganisation haut/bas persistante. Le focus lui permet de poursuivre son travail après confirmation ou erreur.

## Critères d'acceptation

- [ ] CA2 : Tab, clic, Entrée/Espace et Échap conservent une sélection accessible et un focus visible ; pas d'imbrication interactive incorrecte.
- [ ] CA2 : les flèches s'appliquent uniquement à la carte sélectionnée ayant le focus, jamais à un champ, lien, bouton interne ou autre commande.
- [ ] CA3–CA4 : gauche/droite reste en fin de voisine ; haut/bas déplace d'un rang dans la colonne actuelle, position calculée après retrait.
- [ ] CA3–CA4 : première/dernière carte, colonne unique ou carte seule, carte/cible absente et mouvement sans effet : aucune requête et focus conservé.
- [ ] CA7–CA9 : réutiliser exclusivement le chemin de mutation confirmé du ticket préalable ; commandes bloquées pendant attente/resynchronisation, sans deuxième PUT ni retry automatique.
- [ ] CA8 : après succès, garder sélection et focus sur la carte ; après refus, sur l'origine. Ne pas voler un focus déplacé volontairement. Si carte disparue après resynchronisation, effacer sélection et utiliser le focus de repli du tableau.
- [ ] CA10 : plusieurs réorganisations successives confirmées restent dans l'ordre obtenu après rechargement ; préserver les données enrichies.
- [ ] CA13–CA15 : focus/sélection lisibles dans les deux thèmes, textes et composants aux seuils de contraste ; responsive et nettoyage StrictMode préservés.

## Dépendance et ordre

Préalable : [Déplacer une carte vers une voisine et retrouver l'état serveur](06-confirmed-card-movement.md), qui fournit lecture, mutation, verrou et erreurs. Implémentation séquentielle souhaitée : terminer ce ticket avant [Déposer une carte à une position précise](08-precise-card-drop.md), sans ajouter de dépendance fonctionnelle artificielle entre les deux.

## Vérifications

Chrome DevTools MCP et API réelle PostgreSQL : sélection/désélection, toutes les flèches, début/fin, carte seule, plusieurs mouvements, focus pendant réponse retardée et après refus, champs protégés, disparition de carte simulée lors d'une relecture, corps PUT et persistance après rechargement. Vérifier les deux thèmes et grille 1/2/4 colonnes.

Exécuter npm run lint, npm run build avec typage et git diff --check ; consigner preuves et limites, distinguer avertissements préexistants. Avant tout démarrage backend, présenter les opérations exactes et leurs effets PostgreSQL puis attendre l'autorisation explicite. Aucune migration/reset, lecture de secrets .env ou modification backend autorisée implicitement.

## Comments

Enregistrement autorisé ; implémentation non commencée. Réutilisation ciblée du Sprint 2, sans merge/cherry-pick ni dépendance nouvelle sans justification.

Validation utilisateur enregistrée le 20261012T142619Z : numérotation, critères d'acceptation et dépendances approuvés. Exécution séquentielle 06 → 07 → 08 → 09. Cette validation autorise l'enregistrement uniquement ; aucune implémentation, aucun démarrage API, aucune migration ni réinitialisation de base. Avant les tests d'intégration, présenter les opérations exactes de démarrage et leurs effets éventuels sur PostgreSQL.

2026-10-13 : ticket 06 validé par l'utilisateur, puis implémentation du seul ticket 07 autorisée et réalisée. [Résultats navigateur, requêtes, persistance, revues et limites](../validation-07.md). Ordre initial restauré, lint/build/diff check réussis avec avertissements préexistants. Aucun commit/push, backend modifié, migration/reset ou traitement des tickets 08/09. Statut canonique conservé comme pour 06 ; avancement consigné ici, sans inventer de statut de clôture.

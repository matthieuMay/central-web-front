# 06 : Déplacer une carte vers une voisine et retrouver l'état serveur

Status: ready-for-agent
Blocked by: None
Spécification : [Sprint 4 — Déplacements persistants des cartes](../spec.md)
Couverture : CA1, CA2 (socle de sélection), CA3, CA7, CA8, CA9, CA10 ; CA13–CA15 pour les éléments livrés.
Découpage et critères : validés par l'utilisateur.

## Ce qui est livré

L'utilisateur charge le tableau réel, sélectionne une carte et la déplace à gauche/droite en fin de colonne voisine. Le mouvement devient visible seulement après confirmation serveur et reste enregistré après rechargement. Ce ticket fournit le chemin complet navigateur → API → tableau confirmé, réutilisable par les tickets suivants.

## Critères d'acceptation

- [ ] CA1 : GET /boards/mini-trello avec TanStack Query ; chargement et erreurs accessibles, aucun fallback silencieux vers le tableau statique.
- [ ] CA2–CA3 : cartes accessibles par Tab, sélection clic/Entrée/Espace, désélection Échap ; gauche/droite vers la voisine dans l'ordre des données, en fin ; limites sans PUT.
- [ ] CA3 : réutiliser de manière ciblée les interactions/helpers du Sprint 2, sans merge/cherry-pick. PUT /cards/:cardId envoie column et éventuellement position selon le contrat existant ; réponse BoardData complète, et non void.
- [ ] CA7 : ordre affiché inchangé pendant l'attente, statut accessible ; une mutation protégée dès l'acceptation, nouvelles intentions bloquées sans mise en file.
- [ ] CA8 : réponse serveur entière appliquée au cache, champs enrichis conservés ; une lecture ancienne ne peut pas écraser le résultat confirmé. Sélection/focus cohérents après confirmation, sans voler le focus volontairement déplacé.
- [ ] CA9 : refus explicite annoncé sans mouvement enregistré ; résultat réseau incertain resynchronisé par GET sans retry automatique du PUT. En échec de lecture, état non actualisé signalé et mouvements bloqués avec possibilité de relancer GET.
- [ ] CA10 : GET après rechargement retrouve la colonne et l'ordre confirmés ; descriptions, assignations, commentaires datés et checklists intacts.
- [ ] CA13–CA15 : préserver thèmes, navigation, responsive et contrastes du socle ; nettoyage sous StrictMode ; typage/lint/build/diff sans nouvelle régression.

## Vérifications

Chrome DevTools MCP : accès direct, GET réussi/échoué, sélection clavier, mouvements gauche/droite et limites, corps PUT, réponse retardée, double activation rapide, refus avant écriture et perte de réponse après écriture, ancienne lecture retardée, rechargement. Observer ordre, focus, statuts et HTTP, sans tester les détails privés des hooks.

Valider la persistance contre le backend PostgreSQL existant. Pas de simple simulation ou base différente présentée comme preuve de cette intégration. Exécuter npm run lint, npm run build avec typage et git diff --check ; distinguer les avertissements préexistants. Consigner les résultats et les scénarios non exécutés.

## Préalable backend

Avant les tests d'intégration, présenter les opérations exactes prévues, configuration non secrète, base ciblée et effets PostgreSQL. Dev/start appelle prepare : migrations, mise à niveau des anciens commentaires et seed si nécessaire. Attendre l'autorisation explicite avant démarrage ou migration ; aucun reset, aucune suppression de volume, aucun secret .env lu et aucune modification backend.

## Ordre et références

Commencer par ce ticket, puis [Réordonner au clavier et préserver la sélection et le focus](07-keyboard-card-ordering.md). Sources : [réutilisation Sprint 2](../sprint2-reuse.md), [contrats backend](../backend-contracts.md). Pas de dépendance nouvelle sans justification.

## Comments

Enregistrement autorisé ; implémentation non commencée. Le statut ready-for-agent n'autorise pas le démarrage de l'API.

Validation utilisateur enregistrée le 20261012T142619Z : numérotation, critères d'acceptation et dépendances approuvés. Exécution séquentielle 06 → 07 → 08 → 09. Cette validation autorise l'enregistrement uniquement ; aucune implémentation, aucun démarrage API, aucune migration ni réinitialisation de base. Avant les tests d'intégration, présenter les opérations exactes de démarrage et leurs effets éventuels sur PostgreSQL.

2026-10-13 : implémentation du ticket 06 autorisée et réalisée, tests navigateur et PUT sur API de développement opérationnelle. [Résultats, revues et limites](../validation-06.md). Lint/build/diff check réussis avec avertissements préexistants. Aucun commit/push conformément à la consigne utilisateur ; tickets 07–09 non traités. Le statut canonique existant est conservé ; ce commentaire et le rapport enregistrent l'avancement, le tracker ne définissant pas de statut de clôture des tâches.

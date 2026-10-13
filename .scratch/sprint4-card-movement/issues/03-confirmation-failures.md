# Définir la confirmation, les erreurs et les déplacements rapprochés

Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: resolved
Blocked by: 01, 02
Parent: [Préparer les déplacements persistants et leur célébration](../map.md)

## Question

Prérequis : [Retrouver les consignes et les sources de l'existant](01-sources-existing-work.md) et [Fixer les règles de déplacement et d'insertion](02-movement-rules.md).

Quand un déplacement est-il considéré confirmé, et comment préserver l'ordre et le focus en attente, en échec ou lors de plusieurs demandes rapprochées ?

S'appuyer exclusivement sur le contrat PUT fourni et les sources backend retrouvées. Discuter affichage confirmé ou optimiste, traitement d'une réponse BoardData incompatible avec l'intention, conservation du focus après déplacement, signalement accessible d'échec, retries et absence de duplication.

Recommandation provisoire : une mutation à la fois, appliquer BoardData après succès, conserver l'ancien tableau en échec et annoncer le résultat ; choix à valider avec l'utilisateur et les consignes.

## Answer

Résolu le 2026-10-09. Validations utilisateur : une seule mutation réseau à la fois et aucun refus serveur présenté comme enregistré ; intégration TanStack Query privilégiée.

Choix technique simple pour satisfaire ces exigences : GET existant via useQuery, PUT via useMutation, aucun déplacement optimiste dans le tableau confirmé. Pendant la mutation, bloquer les nouvelles intentions de déplacement plutôt que mettre en file des indices potentiellement périmés. Garder sélection/focus/drag séparés du tableau serveur.

Au succès HTTP avec BoardData exploitable, remplacer le cache par la réponse entière, préserver les champs enrichis et restaurer le focus sur la carte. Vérifier que la carte est dans la destination confirmée avant de célébrer. Annuler/neutraliser les lectures en vol susceptibles d'écraser le résultat ; aucune invalidation ne doit déclencher des confettis.

En refus explicite, conserver l'état confirmé et annoncer l'erreur de manière accessible. Aucun retry automatique du PUT : une seconde insertion pourrait agir sur un ordre changé. En perte réseau, le résultat peut être inconnu plutôt que refusé ; relire avec GET et annoncer l'incertitude, sans célébrer cette simple relecture ni réémettre automatiquement la mutation. Tant que la resynchronisation ne permet pas un état fiable, les déplacements restent bloqués.

La sérialisation concerne cette instance frontend ; elle ne promet pas de coordination entre onglets/utilisateurs. Les transactions du serveur protègent ses écritures, sans contrat de version optimiste ajouté.

Sources : [contrats backend](../backend-contracts.md), [réutilisation du Sprint 2](../sprint2-reuse.md). Les routines optimistes historiques POST/PATCH et leur ledger ne sont pas importées pour ce besoin.

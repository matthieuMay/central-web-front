# Sprint 5 — Membres, commentaires et checklist des cartes

Status: ready-for-agent
Autorisation : conception et implémentation directes par l'utilisateur ; aucun commit/push ni changement backend.

## Critères d'acceptation

- S5-CA1 : GET /users partagé, chargement/erreur accessibles et reprise ; noms disponibles dans les cartes et leur fiche.
- S5-CA2 : ajouter/retirer un membre conserve tous les autres et les autres collections ; aucune association dupliquée.
- S5-CA3 : commentaires affichés chronologiquement avec auteur et date ; nouveau commentaire non vide sans createdAt, anciennes dates conservées.
- S5-CA4 : créer une tâche, cocher/décocher et modifier sa description conserve toutes les autres tâches.
- S5-CA5 : chaque PATCH envoie seulement la collection concernée, complète ; réponse CardData validée et intégrée au BoardData confirmé.
- S5-CA6 : mutations rapprochées et mouvements partagent un verrou immédiat ; aucun retry automatique, aucun rendu optimiste. Lecture fraîche avant construction d'un PATCH. Tâche modifiée entre-temps refusée plutôt qu'appliquée à un autre indice.
- S5-CA7 : erreurs accessibles, brouillons conservés après refus/incertitude ; résultat réseau incertain relu par GET, commandes bloquées si relecture échoue.
- S5-CA8 : persistance réelle après reload, y compris dates et collections initialement vides.
- S5-CA9 : thème, navigation, sélection, quatre flèches, DnD, positions et confettis Sprint 4 préservés. Éditions de collections ne célèbrent jamais.
- S5-CA10 : labels, focus, contrôle de la fiche au clavier, responsive sans débordement ; lint/build/diff check et revues Standards/Spec.

## Architecture et responsabilités

- `api/board.ts` conserve le transport, les contrats et validations ; ajoute GET users et PATCH retournant CardData. Aucun secret lu et aucune dépendance ajoutée.
- `card-editing.ts` construit une seule liste de remplacement à partir d'une carte fraîche et d'une intention typée. Les dates existantes sont recopiées ; le nouveau commentaire n'a pas de date. Checklist sans identifiant : index + snapshot description/done, jamais identifiant inventé envoyé à l'API.
- `useBoardController` porte lecture, cache BoardData complet, verrou partagé PUT/PATCH, erreurs et réconciliation. Il produit la décision de célébrer uniquement pour un mouvement éligible confirmé.
- `BoardPage` compose les requêtes utilisateurs, le tableau, Confetti et la fiche ; elle conserve l'identifiant de la carte ouverte.
- `Card` affiche un résumé et un bouton de détails ; `Board/Column` transmettent uniquement utilisateurs et ouverture. La fiche hors de la carte évite le couplage des formulaires au drag natif et garde ses brouillons lors du remplacement des données.
- `CardDetails` utilise le dialog HTML natif avec focus modal/Échap/retour au déclencheur, et trois sections typées : membres, commentaires et checklist. Les brouillons restent locaux ; les collections enregistrées viennent exclusivement du cache confirmé.

## Vérification et limites du contrat

Point de test : application dans Chrome DevTools MCP et observation HTTP, déjà adopté dans le dépôt. Pas de nouveau framework. Tester les états vides, requêtes retardées, refus avant écriture, réponse perdue après écriture, listes rapprochées, dates et reload, puis non-régression 3/4.

Un seul client frontend sérialise ses intentions. Lecture fraîche et verrou empêchent les pertes locales ; sans version/ETag ou opération atomique backend, il reste impossible de garantir des éditions concurrentes entre clients dans l'intervalle GET→PATCH. Les tâches identiques sans ID ne peuvent pas être distinguées après une réorganisation distante. Aucun nouveau contrat backend introduit.

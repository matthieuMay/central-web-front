# Contrat HTTP et conservation des collections

Status: ready-for-agent

Spec: [Membres, commentaires et tâches à cocher](../spec.md)

## Travail

Confirmer le contrat PATCH dans la documentation/code serveur : références utilisateur et réponse/statuts, sans tester une écriture destructive. Ajouter `getUsers` et le PATCH dédié en réutilisant le transport existant. Implémenter `buildCardCollectionsPatch` et `useUpdateCardCollections` selon les contrats de la spec.

La mutation lit le tableau avant de construire une seule liste complète, puis PATCH et réconcilie. Elle bloque les écritures concurrentes locales, distingue rejet/confirmation avec échec de lecture/résultat incertain, et ne crée jamais de date de commentaire. Conserver les hooks existants et leur ledger optimiste ; la nouvelle mutation n'ajoute pas d'optimisme.

## Acceptation

- Tests de conservation/immutabilité, listes omises, dates, membres inconnus, doublons de description, indices invalides/obsolètes.
- Tests avec transport contrôlé pour lecture préalable, carte manquante, verrou, erreurs et réconciliation avant action suivante.
- Aucun réessai automatique d'un ajout ; aucune hypothèse non vérifiée sur le corps PATCH.
- Build, lint et tests existants passent.

## Comments

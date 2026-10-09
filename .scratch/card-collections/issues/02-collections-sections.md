# Préparer les sections Membres, Commentaires et Tâches à cocher

Status: ready-for-agent
Depends on: 01-collections-persistence.md

Spec: [Membres, commentaires et tâches à cocher](../spec.md)

## Travail

Implémenter `CardMembers`, `CardComments` et `CardChecklist` à partir de leurs rendus temporaires et props typées existantes. Les sections émettent des intentions via leurs callbacks ; le module partagé construit les listes PATCH. Réutiliser Chakra et les conventions de formulaire existantes.

## Acceptation

- Membres ajoutables/retirables, références inconnues visibles et conservées.
- Activité datée, auteur choisi explicitement, texte vide refusé, brouillon préservé après échec.
- Ajout d'une tâche non cochée, cocher/décocher une occurrence même si une autre a la même description.
- Pas de formulaires imbriqués, contrôles libellés et utilisables au clavier, états pending/erreur transmis par le tiroir.
- Aucun HTTP dans ces trois sections ni UUID envoyé pour une tâche.

## Comments

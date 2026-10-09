# Intégrer les collections au tiroir et vérifier les parcours

Status: ready-for-agent
Depends on: 01-collections-persistence.md, 02-collections-sections.md

Spec: [Membres, commentaires et tâches à cocher](../spec.md)

## Travail

Remplacer le catalogue vide et les callbacks temporaires dans `EditCardDrawer` par GET /users et la mutation commune, coordonner le verrou de toutes les écritures avec `BoardPage`. Les trois sections sont déjà montées hors du formulaire titre/description ; conserver cette séparation pour leurs formulaires. Expliquer l'enregistrement immédiat des collections et renommer Annuler en Fermer.

## Acceptation

- Exécuter les cas d'acceptation de la spec, dont ajouts successifs, absence de perte, dates et reload.
- Vérifier GET /users vide/en erreur, PATCH rejeté et PATCH réussi suivi d'un GET échoué avec transport intercepté avant le serveur si l'écriture doit être empêchée.
- Conserver édition du titre/description, déplacement, brouillons après refetch et focus au retour ; contrôler clavier et écran étroit.
- Documenter les résultats réels et limites dans `validation.md`, mettre à jour le README, lancer build/lint/tests.
- Utiliser des données de test identifiées ; aucune réinitialisation de base. Les commentaires ne disposent pas d'une suppression prévue : ne pas polluer une carte utilisateur pour vérifier l'ajout.

## Comments

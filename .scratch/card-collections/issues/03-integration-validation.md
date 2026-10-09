# Intégrer les collections au tiroir et vérifier les parcours

Status: ready-for-human
Implementation: complete — revue du résultat disponible
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

2026-10-09 — GET /users, mutation commune et récupération globale branchés. Création, édition et déplacement partagent le verrou ; Fermer distingue les brouillons des actions déjà enregistrées. Les résultats automatisés et navigateur, l’isolation des données et les limites sont documentés dans validation.md. Aucune dépendance ni modification de l’API. Voir [validation](../validation.md).

Validation finale — 17 tests, build, lint et diff-check réussis. Parcours réels sur API SQLite isolée, erreurs interceptées, catalogue vide/en erreur, double publication, récupération globale, clavier/mobile, création et déplacement avec collections vérifiés. Désactivation NativeSelect corrigée via Field.Root puis revérifiée dans le DOM. Voir validation.md pour les mesures et limites.

Demande complémentaire — cartes des colonnes enrichies avec toutes les tâches cochables, avatars à initiales nommés et nombre de commentaires. Réutilisation du catalogue Query et de la mutation/verrou existants, erreurs et annonces au niveau de la carte, isolation des clics des cases et libellés. Les 17 tests, build et lint passent après cette extension ; résultats navigateur consignés dans validation.md.

Correction validée — synchronisation de HiddenInput.checked dans les trois sections utilisant des cases : un rejet 400 restaure l’état natif, puis un seul clic/Espace déclenche le réessai. Vérification navigateur de Card, CardChecklist et CardMembers, sans sélection accidentelle, remount ni mélange checked/defaultChecked.

Demandes finales validées — dix couleurs distinctes et stables entre cartes/catalogues inversés ; tâches terminées masquées sur les colonnes, conservées cochées/barrées dans Modifier, réapparition après décochage. Scénarios GET/PATCH entièrement simulés, indices originaux et trois éléments préservés, aucune écriture réelle. Détails dans validation.md.

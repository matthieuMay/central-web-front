import React from 'react';

type CardMembersProps = {
  assignees: string[];
  availableUsers: string[];
  onAssign: (user: string) => void;
  onRemove: (user: string) => void;
};

/**
 * Responsabilité : Gérer l'affichage, l'assignation et le retrait des membres de la carte.
 * Cas à vérifier : 
 * - Affichage correct des avatars/noms des membres assignés.
 * - Possibilité d'ajouter un membre depuis la liste fournie par l'API (GET /users).
 * - Possibilité de retirer un membre existant.
 */
export const CardMembers: React.FC<CardMembersProps> = () => {
  return (
    <div className="card-members-stub">
      {/* Rendu temporaire */}
      <p>[TODO: Interface des membres]</p>
    </div>
  );
};
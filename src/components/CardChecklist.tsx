import React from 'react';

type ChecklistItem = {
  description: string;
  done: boolean;
};

type CardChecklistProps = {
  items: ChecklistItem[];
  onAddItem: (description: string) => void;
  onToggleItem: (index: number) => void;
};

/**
 * Responsabilité : Gérer la liste des tâches à cocher (création, cochage/décochage).
 * Cas à vérifier :
 * - Ajout d'une nouvelle tâche textuelle.
 * - Basculement de l'état (done: true / false) via une case à cocher.
 * - Attention : pas d'ID unique fourni par l'API pour les items de checklist.
 */
export const CardChecklist: React.FC<CardChecklistProps> = () => {
  return (
    <div className="card-checklist-stub">
      {/* Rendu temporaire */}
      <p>[TODO: Interface de la checklist]</p>
    </div>
  );
};
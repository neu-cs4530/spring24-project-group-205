// scavengerHuntUtils.ts

import { ScavengerHuntItem } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';

export function generateRandomInteractable(interactables: InteractableArea[]): InteractableArea {
  if (interactables.length === 0) {
    throw new Error('No interactable areas available');
  }
  const randomIndex = Math.floor(Math.random() * interactables.length);
  return interactables[randomIndex];
}

export function randomLocation(item: ScavengerHuntItem, interactables: InteractableArea[]): void {
  const area = generateRandomInteractable(interactables);
  const newRandomLocation = area.generateRandomLocation();

  item.location = newRandomLocation;
}

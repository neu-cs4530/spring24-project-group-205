// scavengerHuntUtils.ts

import { PlayerLocation, ScavengerHuntItem } from '../../types/CoveyTownSocket';
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

export function generateHint(playerLocation: PlayerLocation, itemLocation: PlayerLocation): string {
  const distance = Math.sqrt(
    (playerLocation.x - itemLocation.x) ** 2 + (playerLocation.y - itemLocation.y) ** 2,
  );

  // we can adjust this
  const closeThreshold = 100;
  const mediumThreshold = 200;

  if (distance < closeThreshold) {
    return 'You are very close to the item!';
  }
  if (distance < mediumThreshold) {
    return 'You are getting closer to the item.';
  }
  return 'You are far from the item.';
}

import { ScavengerHuntItem } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class ScavengerHuntItems extends Interactable {
  private _items: ScavengerHuntItem = [];

  getType(): KnownInteractableTypes {
    return 'ScavengerHuntItems';
  }
}

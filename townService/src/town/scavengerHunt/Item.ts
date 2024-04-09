import { ScavengerHuntItem, XY } from '../../types/CoveyTownSocket';

/**
 * A class representing an item in the scavenger hunt game.
 */
export default class Item implements ScavengerHuntItem {
  id: number;

  name: string;

  location: XY;

  hint: string;

  foundBy: string;

  /**
   * Represents an item in the scavenger hunt.
   * @param id - The unique identifier of the item.
   * @param name - The name of the item.
   * @param location - The location of the item.
   * @param hint - The hint for finding the item.
   * @param foundBy - The name of the player who found the item.
   */
  constructor(id: number, name: string, location: XY, hint: string, foundBy: string) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.hint = hint;
    this.foundBy = foundBy;
  }
}

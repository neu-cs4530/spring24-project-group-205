/**
 * This class represents the different themepacks that the player can purchase in the Scavenger Hunt game.
 * Each themepack has a different set of objects that the player needs to find in the game, all following a specific theme.
 * The themepacks are either "nature", "city", or "fantasy".
 *
 * Each themepack also has a price that the player needs to pay in order to purchase it.
 */

import Item from './Item';

export default class Themepack {
  public name: string;

  private _items: Item[] = [];

  /**
   * Creates a new themepack for the scavenger hunt game.
   * @param name the name of the themepack
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Returns the name of the themepack.
   * @returns the name of the themepack
   */
  getThemepackName() {
    return this.name;
  }

  /**
   * Returns the items of the themepack.
   * @returns the items of the themepack
   */
  getItems() {
    return this._items;
  }

  /**
   * Adds a new item to the themepack.
   * @param item the item to add to the themepack
   */
  addItem(item: Item) {
    this._items.push(item);
  }
}

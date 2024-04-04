/**
 * This class represents the different themepacks that the player can purchase in the Scavenger Hunt game.
 * Each themepack has a different set of objects that the player needs to find in the game, all following a specific theme.
 * The themepacks are either "nature", "city", or "fantasy".
 *
 * Each themepack also has a price that the player needs to pay in order to purchase it.
 */
import { ScavengerHuntThemepack } from '../../types/CoveyTownSocket';
import Item from './Item';

export default class Themepack implements ScavengerHuntThemepack {
  public name: string;

  items: Item[] = [];

  private _lowerBound = 0;

  private _upperBound = 0;

  /**
   * Creates a new themepack for the scavenger hunt game.
   * @param name the name of the themepack
   */
  constructor(name: string) {
    this.name = name;
    if (name === 'food') {
      this._lowerBound = 15053;
      this._upperBound = 15053 + 63;
    }
    if (name === 'emojis') {
      this._lowerBound = 15117;
      this._upperBound = 15117 + 63;
    }
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
    return this.items;
  }

  createItems(num: number): Item[] {
    for (let i = 0; i < num; i += 1) {
      this.items.push(new Item(this.getRandomItemId(), 'item', { x: 0, y: 0 }, 'hint'));
    }
    return this.items;
  }

  /**
   * Adds a new item to the themepack.
   * @param item the item to add to the themepack
   */
  addItem(item: Item) {
    this.items.push(item);
  }

  getRandomItemId(): number {
    return Math.floor(Math.random() * (this._upperBound - this._lowerBound + 1)) + this._lowerBound;
  }
}

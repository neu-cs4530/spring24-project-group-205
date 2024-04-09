/**
 * This class represents the different themepacks that the player can purchase in the Scavenger Hunt game.
 * Each themepack has a different set of objects that the player needs to find in the game, all following a specific theme.
 * The themepacks are either "nature", "city", or "fantasy".
 *
 * Each themepack also has a price that the player needs to pay in order to purchase it.
 */
import { ScavengerHuntItem, ScavengerHuntThemepack } from '../../types/CoveyTownSocket';
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
      this._lowerBound = 15054;
      this._upperBound = 15054 + 62;
    }
    if (name === 'emojis') {
      this._lowerBound = 15117;
      this._upperBound = 15117 + 63;
    }
    if (name === 'egg') {
      this._lowerBound = 15181;
      this._upperBound = 15181 + 49;
    }
  }

  /**
   * Initializes ScavengerHuntItems within a themepack based on the number of items requested.
   * @param num the amount of items to create.
   * @returns an array of the items.
   */
  public createItems(num: number): ScavengerHuntItem[] {
    for (let i = 0; i < num; i += 1) {
      this.items.push(new Item(this.getRandomItemId(), 'item', { x: 0, y: 0 }, 'hint', 'n/a'));
    }
    return this.items;
  }

  /**
   * Adds a new item to the themepack.
   * @param item the item to add to the themepack
   */
  public addItem(item: Item) {
    this.items.push(item);
  }

  /**
   * Computes a random item id of an item within the pack based on bounds of its tile indicies.
   * @returns the random item id.
   */
  public getRandomItemId(): number {
    return Math.floor(Math.random() * (this._upperBound - this._lowerBound + 1)) + this._lowerBound;
  }
}

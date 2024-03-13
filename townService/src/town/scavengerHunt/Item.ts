/**
 * This class represents one singlular item that is a part of the scavenger hunt.
 * Each item has a name and a location.
 */

export default class Item {
  private _name: string;

  private _location: string;

  /**
   * Creates a new item for the scavenger hunt game.
   * @param name the name of the item
   * @param location the location of the item
   */
  constructor(name: string, location: string) {
    this._name = name;
    this._location = location;
  }

  /**
   * Returns the name of the item.
   * @returns the name of the item
   */
  getItem() {
    return this._name;
  }

  /**
   * Returns the location of the item.
   * @returns the location of the item
   */
  getLocation() {
    return this._location;
  }
}

import { ScavengerHuntItem, XY } from '../../types/CoveyTownSocket';

export default class Item implements ScavengerHuntItem {
  id: number;

  name: string;

  location: XY;

  hint: string;

  foundBy: string;

  constructor(id: number, name: string, location: XY, hint: string, foundBy: string) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.hint = hint;
    this.foundBy = foundBy;
  }
}

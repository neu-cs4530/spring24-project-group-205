import { ScavengerHuntItem, XY } from '../../types/CoveyTownSocket';

export default class Item implements ScavengerHuntItem {
  id: string;

  name: string;

  location: XY;

  foundBy?: string | undefined;

  constructor(id: string, name: string, location: XY) {
    this.id = id;
    this.name = name;
    this.location = location;
  }

  public setID(id: string): void {
    this.id = id;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setLocation(location: XY): void {
    this.location = location;
  }
}

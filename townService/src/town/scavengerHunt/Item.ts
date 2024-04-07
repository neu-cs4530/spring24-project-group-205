import { ScavengerHuntItem, XY } from '../../types/CoveyTownSocket';

export default class Item implements ScavengerHuntItem {
  id: number;

  name: string;

  location: XY;

  private _foundBy?: string | undefined;

  hint: string;

  constructor(id: number, name: string, location: XY, hint: string) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.hint = hint;
  }

  public setID(id: number): void {
    this.id = id;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setLocation(location: XY): void {
    this.location = location;
  }

  public setHint(hint: string): void {
    this.hint = hint;
  }

  public set foundBy(foundBy: string | undefined) {
    this._foundBy = foundBy;
  }

  public get foundBy(): string | undefined {
    return this._foundBy;
  }
}

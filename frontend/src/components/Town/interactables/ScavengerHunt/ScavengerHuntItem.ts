import ScavengerHuntAreaController, {
  ScavengerHuntEvents,
} from '../../../../classes/interactable/ScavengerHuntAreaController';
import Interactable, { KnownInteractableTypes } from '../../Interactable';

const foodThemepack = {
  lowerBound: 15053,
  upperBound: 15053 + 64,
};

export default class ScavengerHuntItem extends Interactable {
  private _scavengerHunt?: ScavengerHuntAreaController;

  private _changeListener: ScavengerHuntEvents['itemsChanged'] = () => {};

  getType(): KnownInteractableTypes {
    return 'ScavengerHuntItem';
  }

  public addItemOnScene(): void {
    // maybe we can get the thempack directly from the controller?
    // and then change our thempack.ts to hold bounds of ids, i think thats only thing they'd need
    const randomItemId =
      Math.floor(Math.random() * (foodThemepack.upperBound - foodThemepack.lowerBound + 1)) +
      foodThemepack.lowerBound;
    this._scene.addTileOnMap(randomItemId, this.x, this.y);
    this._scavengerHunt?.addListener('itemsChanged', this._changeListener);
  }

  public removeItemOnScene(): void {
    this._scene.removeTileOnMap(this.x, this.y);
  }

  interact(): void {
    // something with contoller, emit something that calls removeItemOnScene?
    // need to update game state and remove tile from map
    // and optionally re-render next item
    // this._changeListener = items => this._scavengerHunt?.items;
  }
}

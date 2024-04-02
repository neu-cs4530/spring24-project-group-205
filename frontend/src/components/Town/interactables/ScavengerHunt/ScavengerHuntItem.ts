import ScavengerHuntAreaController, {
  ScavengerHuntEvents,
} from '../../../../classes/interactable/ScavengerHuntAreaController';
import Interactable, { KnownInteractableTypes } from '../../Interactable';
import Themepack from '../../../../../../townService/src/town/scavengerHunt/Themepack';

export default class ScavengerHuntItem extends Interactable {
  private _scavengerHunt?: ScavengerHuntAreaController;

  private _changeListener: ScavengerHuntEvents['itemsChanged'] = () => {};

  getType(): KnownInteractableTypes {
    return 'ScavengerHuntItem';
  }

  removedFromScene(): void {
    if (this._changeListener) {
      this._removeItemOnScene();
      this._scavengerHunt?.removeListener('itemsChanged', this._changeListener);
    }
  }

  addedToScene(): void {
    super.addedToScene();
    this._scavengerHunt = this.townController.getScavengerHuntController(this);
    // this._addItemOnScene(this._scavengerHunt.themepack); // get themepack from controller?
    this._scavengerHunt.addListener('itemsChanged', this._changeListener);
  }

  private _addItemOnScene(pack: Themepack): void {
    this._scene.addTileOnMap(pack.getRandomItemId(), this.x, this.y);
    this._scavengerHunt?.addListener('itemsChanged', this._changeListener);
  }

  private _removeItemOnScene(): void {
    this._scene.removeTileOnMap(this.x, this.y);
  }

  interact(): void {
    this.removedFromScene();
  }
}

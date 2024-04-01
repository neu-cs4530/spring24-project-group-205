import { ScavengerHuntGameState, ScavengerHuntItem } from '../../types/CoveyTownSocket';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export type ScavengerHuntEvents = GameEventTypes & {
  itemsChanged: (items: ScavengerHuntItem[] | undefined) => void;
};

/**
 * This class is responsible for managing the state of the Scavenger Hunt game, and for sending commands to the server
 */
export default class ScavengerHuntAreaController extends GameAreaController<
  ScavengerHuntGameState,
  ScavengerHuntEvents
> {
  /**
   * Returns true if the game is not over
   */
  public isActive(): boolean {
    return !this.isEmpty();
  }
}

import { ScavengerHuntGameState } from '../../types/CoveyTownSocket';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export type SacavengerHuntEvents = GameEventTypes;

/**
 * This class is responsible for managing the state of the Scavenger Hunt game, and for sending commands to the server
 */
export default class ScavengerHuntAreaController extends GameAreaController<
  ScavengerHuntGameState,
  SacavengerHuntEvents
> {
  /**
   * Returns true if the game is not over
   */
  public isActive(): boolean {
    return !this.isEmpty();
  }
}

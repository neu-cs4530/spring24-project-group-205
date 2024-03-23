import { GameStatus, ScavengerHuntGameState } from '../../types/CoveyTownSocket';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export type SacavengerHuntEvents = GameEventTypes;

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class ScavengerHuntAreaController extends GameAreaController<
  ScavengerHuntGameState,
  SacavengerHuntEvents
> {
  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Returns true if the game is not over
   */
  public isActive(): boolean {
    return !this.isEmpty();
  }
}

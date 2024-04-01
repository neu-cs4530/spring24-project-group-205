import _ from 'lodash';
import {
  GameMove,
  ScavengerHuntItem,
  GameArea,
  ScavengerHuntGameState,
  GameStatus,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, {
  GameEventTypes,
  NO_GAME_IN_PROGRESS_ERROR,
  NO_GAME_STARTABLE,
  PLAYER_NOT_IN_GAME_ERROR,
} from './GameAreaController';

export type ScavengerHuntEvents = GameEventTypes & {
  itemsChanged: (items: ScavengerHuntItem[]) => void;
};

export default class ScavengerHuntAreaController extends GameAreaController<
  ScavengerHuntGameState,
  ScavengerHuntEvents
> {
  protected _items: ScavengerHuntItem[] = [];

  /**
   * Returns the scavenger
   */
  get scavenger(): PlayerController | undefined {
    const scavenger = this._model.game?.state.scavenger;
    if (scavenger) {
      return this.occupants.find(eachOccupant => eachOccupant.id === scavenger);
    }
    return undefined;
  }

  /**
   * Returns the player who won the game, if there is one, or undefined otherwise
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  /**
   * Returns true if the current player is in the game, false otherwise
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) ?? false;
  }

  /**
   * Returns the status of the game
   * If there is no game, returns 'WAITING_FOR_PLAYERS'
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  /**
   * Returns true if the game is empty - no players AND no occupants in the area
   *
   */
  isEmpty(): boolean {
    return !this.scavenger && this.occupants.length === 0;
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   */
  public isActive(): boolean {
    return !this.isEmpty() && this.status !== 'WAITING_FOR_PLAYERS';
  }

  /**
   * Updates the internal state of this ConnectFourAreaController based on the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and other
   * common properties (including this._model)
   *
   * If an item has been collected, emits an itemCollected event with the new board.
   * If an item has not collected, does not emit a itemCollected event.
   */
  protected _updateFrom(newModel: GameArea<ScavengerHuntGameState>): void {
    super._updateFrom(newModel);
    const newGame = newModel.game;
    if (newGame) {
      const newItems = Array.from(newGame.state.items); // Create a mutable copy of readonly items
      if (!_.isEqual(newItems, this._items)) {
        this._items = newItems;
        this.emit('itemsChanged', this._items);
      }
    }
  }

  /**
   * Sends a request to the server to start the game.
   *
   * If the game is not in the WAITING_TO_START state, throws an error.
   *
   * @throws an error with message NO_GAME_STARTABLE if there is no game waiting to start
   */
  public async startGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'WAITING_TO_START') {
      throw new Error(NO_GAME_STARTABLE);
    }
    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'StartGame',
    });
  }
}

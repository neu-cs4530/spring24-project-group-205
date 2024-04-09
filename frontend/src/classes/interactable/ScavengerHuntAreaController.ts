import _ from 'lodash';
import {
  ScavengerHuntItem,
  GameArea,
  ScavengerHuntGameState,
  GameStatus,
  ScavengerHuntThemepack,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes, NO_GAME_STARTABLE } from './GameAreaController';
export type ScavengerHuntEvents = GameEventTypes & {
  itemsChanged: (items: ScavengerHuntItem[] | undefined) => void;
};

export default class ScavengerHuntAreaController extends GameAreaController<
  ScavengerHuntGameState,
  ScavengerHuntEvents
> {
  public items: ScavengerHuntItem[] = [];

  public requestedHint?: string;

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

  resetHint() {
    this.requestedHint = undefined;
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

  get gamemode(): string | undefined {
    return this._model.game?.state.gameMode;
  }

  get themepack(): ScavengerHuntThemepack | undefined {
    return this._model.game?.state.themepack;
  }

  /**
   * Returns the status of the game
   * If there is no game, returns 'WAITING_FOR_PLAYERS'
   */
  get hint(): string {
    if (!this.requestedHint) {
      throw new Error('No hint available');
    }
    return this.requestedHint;
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   */
  public isActive(): boolean {
    return this.status === 'IN_PROGRESS' || this.status === 'WAITING_TO_START';
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
      const newItems = Array.from(newGame.state.items);
      if (!_.isEqual(newItems, this.items)) {
        this.items = newItems;
        this.emit('itemsChanged', this.items);
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
    if (!instanceID) {
      throw new Error(NO_GAME_STARTABLE);
    }
    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'StartGame',
    });
    if (this._model.game?.state.gameMode === 'timed') {
      this._townController.ourPlayer.scene?.startTimer();
      this._townController.emitStartTimer();
    }
    this._townController.ourPlayer.scene?.updateItemsFound(true);
    this._townController.ourPlayer.scene?.resetItemsFoundCount();
  }

  public _renderInitialItems(): void {
    if (this.items) {
      for (const item of this.items) {
        this._townController.emitItemPlaced(item);
        this._townController.ourPlayer.scene?.addTileOnMap(
          item.id,
          item.location.x,
          item.location.y,
        );
      }
    } else {
      throw new Error('Start Game could not find items');
    }
  }

  /**
   * Sends a request to the server to get a hint for the next unfound item.
   *
   * @throws An error if the server rejects the request to join the game.
   */
  public async requestHint(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error(NO_GAME_STARTABLE);
    }
    if (this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error('Game is not in progress');
    }
    const { hint } = await this._townController.sendInteractableCommand(this.id, {
      type: 'RequestHint',
      gameID: instanceID,
    });

    this.requestedHint = hint;
  }

  /**
   * Sends a request to the server to leave the current game in the game area.
   */
  public async leaveGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveGame',
        gameID: instanceID,
      });
    }
    this._townController.ourPlayer.scene?.updateTimer(false, 'Null');
    this._townController.ourPlayer.scene?.updateItemsFound(false);
    this._townController.ourPlayer.scene?.clearItemsLayer();
  }

  public async endGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'EndGame',
        gameID: instanceID,
      });
    }
    this._townController.ourPlayer.scene?.updateTimer(false, 'Null');
    this._townController.ourPlayer.scene?.updateItemsFound(false);
    this._townController.ourPlayer.scene?.clearItemsLayer();
    this._townController.emitEndGame();
  }

  /**
   * Sends a request to the server to join the current timed game in the game area, or create a new one if there is no game in progress.
   *
   * @throws An error if the server rejects the request to join the game.
   */
  public async joinTimedGame(themepack: string): Promise<void> {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinTimedGame',
      themepack: themepack,
    });
    this._instanceID = gameID;
    this._townController.ourPlayer.scene?.updateTimer(true, 'Timed');
  }

  /**
   * Sends a request to the server to join the current relaxed game in the game area, or create a new one if there is no game in progress.
   *
   * @throws An error if the server rejects the request to join the game.
   */
  public async joinRelaxedGame(themepack: string): Promise<void> {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinRelaxedGame',
      themepack: themepack,
    });
    this._instanceID = gameID;
    this._townController.ourPlayer.scene?.updateTimer(true, 'relaxed');
  }
}

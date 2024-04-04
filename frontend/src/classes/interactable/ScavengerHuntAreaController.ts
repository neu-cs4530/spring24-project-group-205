import React from 'react';
import _ from 'lodash';
import {
  ScavengerHuntItem,
  GameArea,
  ScavengerHuntGameState,
  GameStatus,
  ScavengerHuntThemepack,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, {
  GameEventTypes,
  NO_GAME_IN_PROGRESS_ERROR,
  NO_GAME_STARTABLE,
  PLAYER_NOT_IN_GAME_ERROR,
} from './GameAreaController';
import ScavengerHuntItemOnMap from '../../components/Town/interactables/ScavengerHunt/ScavengerHuntItemOnMap';

export type ScavengerHuntEvents = GameEventTypes & {
  itemsChanged: (items: ScavengerHuntItem[] | undefined) => void;
};

export default class ScavengerHuntAreaController extends GameAreaController<
  ScavengerHuntGameState,
  ScavengerHuntEvents
> {
  public items: ScavengerHuntItem[] = [];

  //rivate _itemsOnMap: ScavengerHuntItemOnMap[] = [];

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
    console.log(this.items);
    this._renderInitialItems();
  }

  private _renderInitialItems(): void {
    if (this.items) {
      for (const item of this.items) {
        this._townController.globalScene?.addTileOnMap(item.id, item.location.x, item.location.y);
        console.log('attempted to put item at location', item.location.x, item.location.y);
      }
    } else {
      throw new Error('Start Game could not find items');
    }
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
    //const scene = this._townController.globalScene;
    //scene?.addTileOnMap(15053, 96, 32);
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
  }
}

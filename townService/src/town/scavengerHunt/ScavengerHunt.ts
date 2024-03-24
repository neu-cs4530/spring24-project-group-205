import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMode,
  GameMove,
  PlayerLocation,
  ScavengerHuntGameState,
  ScavengerHuntItem,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Game from '../games/Game';
import Leaderboard from './Leaderboards';
import Themepack from './Themepack';
import { generateHint, randomLocation } from './Utils';

export default abstract class ScavengerHunt extends Game<
  ScavengerHuntGameState,
  ScavengerHuntItem
> {
  // The database that holds the leaderboard for the game
  private _leaderboard = new Leaderboard();

  // All the available themepacks for the game
  private _allThemepacks: Themepack[] = [];

  // The rules of the game
  private _rules!: string;

  // INFORMATION THAT IS SPECIFIC TO THE PLAYER:
  // The game mode the player is currently in
  protected _gameMode?: GameMode;

  // The themepack the player is currently using; the default is the "nature" themepack
  private _themepack?: Themepack;

  // the time it took for the player to complete the scavenger hunt -- this is only applicable if the game mode is competitive
  private _timeInSeconds = 0;

  // The hints the player has requested
  private _hints?: string[];

  // number of items found by the player
  protected _itemsFound = 0;

  public constructor() {
    super({
      items: [],
      status: 'WAITING_TO_START',
    });
  }

  public startGame(player: Player, interactables: InteractableArea[]): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.scavenger) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
      status: 'IN_PROGRESS',
    };
    // Use the utility function to generate random locations for items
    this._assignRandomLocations(interactables);
  }

  private _assignRandomLocations(interactables: InteractableArea[]): void {
    if (this.state.items.length === 0) {
      throw new Error('No items available in the scavenger hunt');
    }
    this.state.items.forEach(item => {
      if (!item.location) {
        randomLocation(item, interactables);
      }
    });
  }

  /**
   * Apply a move to the game.
   * This method should be implemented by subclasses.
   * @param move A move to apply to the game.
   * @throws InvalidParametersError if the move is invalid.
   */
  public abstract applyMove(move: GameMove<ScavengerHuntItem>): void;

  /**
   * Adds a new item to the game.
   * @param item A scavenger hunt item to add to the game.
   */
  public addItem(item: ScavengerHuntItem): void {
    this.state = {
      ...this.state,
      items: [...this.state.items, item],
    };
  }

  /**
   * Gives the total number of items found at this point in the game.
   * @returns number of items found.
   */
  public getScore(): number {
    return this._itemsFound;
  }

  public get gameMode(): GameMode | undefined {
    return this._gameMode;
  }

  // player joins the game and the game starts immediately, assuming we will have one button anyways
  protected _join(player: Player): void {
    if (this.state.scavenger === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    } else if (!this.state.scavenger) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
        scavenger: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
  }

  protected _leave(player: Player): void {
    if (this.state.scavenger !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
      status: 'OVER',
    };
  }

  // Method to generate hint based on player location
  public generateHint(player: Player): string {
    const playerLocation = player.location;
    const closestItemLocation = this._getClosestItemLocation(playerLocation);
    if (closestItemLocation) {
      return generateHint(playerLocation, closestItemLocation);
    }
    return 'No items found.';
  }

  private _getClosestItemLocation(playerLocation: PlayerLocation): PlayerLocation | null {
    let closestItemLocation: { x: number; y: number } | null = null;
    let closestDistance = Number.MAX_SAFE_INTEGER;

    this.state.items.forEach(item => {
      if (item.location) {
        const distance = Math.sqrt(
          (playerLocation.x - item.location.x) ** 2 + (playerLocation.y - item.location.y) ** 2,
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestItemLocation = item.location;
        }
      }
    });

    return closestItemLocation;
  }
}

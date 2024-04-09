import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  GAME_OVER_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  PLAYER_UNABLE_TO_JOIN_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMode,
  GameMove,
  PlayerID,
  ScavengerHuntGameState,
  ScavengerHuntItem,
} from '../../types/CoveyTownSocket';
import Game from '../games/Game';
import Themepack from './Themepack';
import { setRandomLocationAndHint } from './HidingSpot';

const TIME_ALLOWED = 120;

const MAX_PLAYERS = 10;

/**
 * A class representing a scavenger hunt game
 */
export default abstract class ScavengerHunt extends Game<
  ScavengerHuntGameState,
  ScavengerHuntItem
> {
  protected _itemsFound = new Map<PlayerID, number>();

  protected _gameStartTime?: number;

  private _timerIntervalId?: NodeJS.Timeout;

  // takes in a themepack that represents the items in the game
  public constructor(themePack?: Themepack) {
    super({
      gameMode: undefined,
      timeLeft: TIME_ALLOWED,
      items: [],
      status: 'WAITING_TO_START',
      themepack: themePack,
      moves: [],
    });
  }

  /**
   * Starts the scavenger hunt game for a given player and starts the timer, as well as initialize the items locations.
   *
   * @param player - The player who wants to start the game.
   * @throws {InvalidParametersError} If no themepack is selected for the game, if the game is not in the 'WAITING_TO_START' status, or if the player is not in the game.
   */
  public startGame(player: Player): void {
    if (!this.state.themepack) {
      throw new InvalidParametersError('No themepack selected for the game 1');
    }
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (!this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    const items = this.state.themepack.createItems(this._players.length * 20);

    this.state = {
      ...this.state,
      items,
      status: 'IN_PROGRESS',
    };

    this._players.forEach(p => {
      this._itemsFound.set(p.id, 0);
    });

    this._assignRandomLocations();

    this._gameStartTime = Date.now();

    this._timerIntervalId = setInterval(() => {
      this._endGameIfTimesUp(player);
    }, 500);
  }

  private _assignRandomLocations(): void {
    if (this.state.items.length === 0) {
      throw new Error('No items available in the scavenger hunt');
    }
    this.state.items.forEach(item => {
      if (item.location.x === 0 && item.location.y === 0) {
        setRandomLocationAndHint(item);
      }
    });
  }

  /**
   * Updates the time left in the game
   */
  public abstract iterateClock(): void;

  /**
   * gets the time left in the game
   * @returns the time left in the game
   */
  public getTimeLeft(): number {
    return this.state.timeLeft;
  }

  /**
   * Gives the total number of items found at this point in the game.
   * @returns number of items found.
   */
  public getScoreForPlayer(player: Player): number {
    return this._itemsFound.get(player.id) || 0;
  }

  public get gameMode(): GameMode | undefined {
    return this.state.gameMode;
  }

  public get themePack(): Themepack | undefined {
    return this.state.themepack;
  }

  public set themePack(themepack: Themepack | undefined) {
    this.state.themepack = themepack;
  }

  /**
   * lets up to 10 players join and can be started with just one player
   * @param player - The player to join the game
   */
  protected _join(player: Player): void {
    if (this._players.some(p => p.id === player.id)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    } else if (this.state.status === 'IN_PROGRESS') {
      throw new InvalidParametersError(PLAYER_UNABLE_TO_JOIN_MESSAGE);
    } else if (this._players.length < MAX_PLAYERS) {
      // EDIT
      this.state = {
        ...this.state,
        status: 'WAITING_TO_START',
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
  }

  /**
   * Ends the game if the time is up
   */
  private _endGameIfTimesUp(player: Player) {
    if (!this._isTimeRemaining(Date.now())) {
      this.endGame(player);
    }
  }

  /**
   *  Method to clear the interval for testing purposes
   */
  clearTimerInterval() {
    clearInterval(this._timerIntervalId);
  }

  /**
   * Determines if the current time (within milliseconds) is within the allotted time given
   * @param currentTime the current time in milliseconds
   * @returns true if the time is within the allotted time, false otherwise
   */
  protected abstract _isTimeRemaining(currentTime: number): boolean;

  /**
   * Removes the given player from the game, and reflects the game's state accordingly.
   *
   * If the game state is 'IN_PROGRESS' and there is only one player left, the game ends.
   *
   * If the game state is 'IN_PROGRESS' and there are more than one player left, the game continues.
   * but removes the given player from the game.
   *
   * If the game state is 'WAITING_TO_START', and the only player leaves, the game state changes to 'WAITING_FOR_PLAYERS'.
   * If the game state is 'WAITING_TO_START', and there are more than one player left, the game continues.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    // 1: if player not in the game, throw error
    if (!this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    if (this.state.status === 'OVER') {
      return;
    }

    if (this.state.status === 'IN_PROGRESS') {
      this._itemsFound.set(player.id, 0);
      if (this._players.length > 1) {
        // remove the given player fron list of players, but status can stay the same
        this._players = this._players.filter(p => p.id !== player.id);
      } else if (this._players.length === 1) {
        // if there is only one player left, end the game
        this._players = this._players.filter(p => p.id !== player.id);
        this.state = {
          ...this.state,
          themepack: undefined,
          gameMode: undefined,
          status: 'OVER',
        };
        clearInterval(this._timerIntervalId);
      }
    }

    if (this.state.status === 'WAITING_TO_START') {
      if (this._players.length > 1) {
        // remove the given player fron list of players, but status can stay the same
        this._players = this._players.filter(p => p.id !== player.id);
      } else if (this._players.length === 1) {
        // if given player was the only one:
        this._players = this._players.filter(p => p.id !== player.id);
        this.state.status = 'WAITING_FOR_PLAYERS';
      }
    }
  }

  /**
   * Applies a move made by a player where if an item is found, the foundBy is updated and the items found is incremented by 1
   * @param move - The game move made by the player.
   * @throws {InvalidParametersError} If the player is not in the game, the game is over, or the game is not in progress.
   */
  public applyMove(move: GameMove<ScavengerHuntItem>): void {
    const player = this._players.find(p => p.id === move.playerID);
    if (!player) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.status === 'OVER') {
      throw new InvalidParametersError(GAME_OVER_MESSAGE);
    }
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }

    move.move.foundBy = move.playerID;
    this._itemsFound.set(move.playerID, (this._itemsFound.get(move.playerID) || 0) + 1);
    this.state = {
      ...this.state,
      items: this.state.items.map(item => (item.id === move.move.id ? move.move : item)),
    };
  }

  /**
   *
   * @returns a string with the hint associated with the next unfound item in the list
   */
  public requestHint(): string {
    const unfoundItems = this.state.items.filter(item => item.foundBy === 'n/a');
    if (unfoundItems.length === 0) {
      return 'All items found!';
    }

    const nextItem = unfoundItems[0];
    return nextItem.hint || 'No hint available';
  }

  /**
   * Adds entries of all scores from game to the leaderboard table in the database.
   */
  protected abstract _addDatabaseEntries(): void;

  /**
   * Ends the game and clears the timer
   */
  public endGame(player: Player): void {
    if (!this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    this._addDatabaseEntries();
    this._itemsFound.set(player.id, 0);

    this.state = {
      ...this.state,
      themepack: undefined,
      gameMode: undefined,
      status: 'OVER',
    };

    // go through all players and remove them from the game
    this._players.forEach(p => {
      this._players = this._players.filter(playera => playera.id !== p.id);
    });

    clearInterval(this._timerIntervalId);
    this._clearAllItems();
  }

  private _clearAllItems(): void {
    this.state = {
      ...this.state,
      items: [],
    };
  }

  public getItemByLocation(x: number, y: number): ScavengerHuntItem {
    const item = this.state.items.find(
      i => i.location.x === x && i.location.y === y,
    ) as ScavengerHuntItem;
    if (!item) {
      return {
        id: 0,
        name: 'Item not found',
        location: { x: 0, y: 0 },
        foundBy: 'n/a',
        hint: '',
      };
    }
    return item;
  }
}

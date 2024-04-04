import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
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
import { setRandomLocationAndHint } from './Utils';

const TIME_ALLOWED = 120;

const MAX_PLAYERS = 10;

export default abstract class ScavengerHunt extends Game<
  ScavengerHuntGameState,
  ScavengerHuntItem
> {
  // INFORMATION THAT IS SPECIFIC TO THE PLAYER:
  // The game mode the player is currently in
  protected _gameMode?: GameMode;

  // The themepack the player is currently using; the default is the "nature" themepack
  protected _themepack?: Themepack;

  // the time it took for the player to complete the scavenger hunt -- this is only applicable if the game mode is competitive
  private _timeInSeconds = 0;

  // number of items found by the player
  protected _itemsFound = new Map<PlayerID, number>();

  protected _gameStartTime?: number;

  private _timerIntervalId?: NodeJS.Timeout;

  public constructor(themePack?: Themepack) {
    super({
      timeLeft: TIME_ALLOWED,
      items: [],
      status: 'WAITING_TO_START',
    });

    this._themepack = themePack;
  }

  // Method to start the game
  public startGame(player: Player): void {
    if (!this._themepack) {
      throw new InvalidParametersError('No themepack selected for the game');
    }

    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }

    if (!this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    const items = this._themepack.getItems();
    this._gameStartTime = Date.now();

    this._timerIntervalId = setInterval(() => {
      this._endGameIfTimesUp();
    }, 500);
    this.state = {
      ...this.state,
      items,
      status: 'IN_PROGRESS',
    };

    this._players.forEach(p => {
      this._itemsFound.set(p.id, 0);
    });

    this._assignRandomLocations();
  }

  /**
   *
   * @returns a string with the hint associated with the next unfound item in the list
   */
  public requestHint(): string {
    const unfoundItems = this.state.items.filter(item => this._itemsFound.get(item.id) === 0);
    if (unfoundItems.length === 0) {
      return 'All items found!';
    }

    const nextItem = unfoundItems[0];
    return nextItem.hint || 'No hint available';
  }

  private _assignRandomLocations(): void {
    if (this.state.items.length === 0) {
      throw new Error('No items available in the scavenger hunt');
    }
    this.state.items.forEach(item => {
      if (!item.location) {
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
   * Apply a move to the game.
   * This method should be implemented by subclasses.
   * @param move A move to apply to the game.
   * @throws InvalidParametersError if the move is invalid.
   */
  public abstract applyMove(move: GameMove<ScavengerHuntItem>): void;

  /**
   * Gives the total number of items found at this point in the game.
   * @returns number of items found.
   */
  public getScoreForPlayer(player: Player): number {
    return this._itemsFound.get(player.id) || 0;
  }

  public get gameMode(): GameMode | undefined {
    return this._gameMode;
  }

  public getThemePack(): Themepack | undefined {
    return this._themepack;
  }

  public setThemePack(themepack: Themepack): void {
    this._themepack = themepack;
  }

  // lets up to ten people join, and can be started as soon as the first person joins
  protected _join(player: Player): void {
    if (this._players.some(p => p.id === player.id)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
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
  private _endGameIfTimesUp() {
    if (!this._isTimeRemaining(Date.now())) {
      this._endGame();
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

  protected _leave(player: Player): void {
    if (this.state.status === 'OVER') {
      return;
    }
    if (!this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
    };
    switch (this.state.status) {
      case 'WAITING_TO_START':
      case 'WAITING_FOR_PLAYERS':
        // no-ops: nothing needs to happen here
        this.state.status = 'WAITING_FOR_PLAYERS';
        break;
      case 'IN_PROGRESS':
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: Array.from(this._itemsFound.entries()).reduce((a, b) => (b[1] > a[1] ? b : a))[0],
        };
        break;
      default:
        // This behavior can be undefined :)
        throw new Error(`Unexpected game status: ${this.state.status}`);
    }
  }

  /**
   * Adds entries of all scores from game to the leaderboard table in the database.
   */
  protected abstract _addDatabaseEntries(): void;

  /**
   * Ends the game and clears the timer
   */
  private _endGame(): void {
    this.state = {
      ...this.state,
      status: 'OVER',
    };

    this._addDatabaseEntries();

    clearInterval(this._timerIntervalId);
  }
}

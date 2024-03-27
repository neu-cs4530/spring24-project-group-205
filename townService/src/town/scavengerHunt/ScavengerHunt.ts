import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMode,
  GameMove,
  ScavengerHuntGameState,
  ScavengerHuntItem,
} from '../../types/CoveyTownSocket';
import Game from '../games/Game';
import Leaderboard from './Leaderboards';
import Themepack from './Themepack';

const TIME_ALLOWED = 120;

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

  protected _gameStartTime?: number;

  private _timerIntervalId?: NodeJS.Timeout;

  public constructor() {
    super({
      timeLeft: TIME_ALLOWED,
      items: [],
      status: 'WAITING_TO_START',
    });
  }

  /**
   * Updates the time left in the game by decreasing it by 1 second
   */
  public iterateClock(): void {
    const newTimeLeft = TIME_ALLOWED - 1;
    if (newTimeLeft < TIME_ALLOWED) {
      this.state = {
        ...this.state,
        timeLeft: newTimeLeft,
      };
    }
  }


  /**
   * gets the time left in the game
   * @returns the time left in the game
   */
  public getTimeLeft(): number {
    return this.state.timeLeft;
  }

  /**
   * Updates the time left in the game
   */
  public abstract iterateClock(): void;

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

      this._gameStartTime = Date.now();

      this._timerIntervalId = setInterval(() => {
        this._endGameIfTimesUp();
      }, 500);
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
   * Determines if the current time (within milliseconds) is within the allotted time given
   * @param currentTime the current time in milliseconds
   * @returns true if the time is within the allotted time, false otherwise
   */
  protected abstract _isTimeRemaining(currentTime: number): boolean;

  protected _leave(player: Player): void {
    if (this.state.scavenger !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
      status: 'OVER',
    };
  }

  /**
   * Ends the game and clears the timer
   */
  private _endGame(): void {
    this.state = {
      ...this.state,
      status: 'OVER',
    };

    clearInterval(this._timerIntervalId);
  }
}

import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_OVER_MESSAGE,
  INVALID_MOVE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  TIME_OVER_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, ScavengerHuntGameState, ScavengerHuntItem } from '../../types/CoveyTownSocket';
import Game from '../games/Game';

const TIME_ALLOWED = 120;

export default class ScavengerHunt extends Game<ScavengerHuntGameState, ScavengerHuntItem> {
  private _gameStartTime?: number;

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

  public applyMove(move: GameMove<ScavengerHuntItem>): void {
    if (!this.state.scavenger) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (move.move.foundBy) {
      throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
    }
    if (this.state.status === 'OVER') {
      throw new InvalidParametersError(GAME_OVER_MESSAGE);
    }
    if (!this._isTimeRemaining(Date.now())) {
      throw new InvalidParametersError(TIME_OVER_MESSAGE);
    }

    move.move.foundBy = this.state.scavenger;
    this.state = {
      ...this.state,
      items: this.state.items.map(item => (item.id === move.move.id ? move.move : item)),
    };
    if (this.state.items.every(item => item.foundBy)) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.scavenger,
      };
    }
  }

  protected _join(player: Player): void {
    if (this.state.scavenger === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    } else if (!this.state.scavenger) {
      this.state = {
        ...this.state,
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
  private _isTimeRemaining(currentTime: number): boolean {
    // If the game hasn't started yet, there is no time remaining
    if (!this._gameStartTime) {
      return false;
    }

    // If the game has been running for longer than the allotted time, there is no time remaining
    if (currentTime >= (TIME_ALLOWED + this._gameStartTime) / 1000) {
      return false;
    }

    return (currentTime - this._gameStartTime) / 1000 < TIME_ALLOWED;
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

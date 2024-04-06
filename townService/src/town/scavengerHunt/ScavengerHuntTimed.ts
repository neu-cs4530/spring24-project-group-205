import InvalidParametersError, {
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_OVER_MESSAGE,
  INVALID_MOVE_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { GameMove, ScavengerHuntItem, ScavengerHuntMove } from '../../types/CoveyTownSocket';
import GameDatabase from './GameDatabase';
import ScavengerHunt from './ScavengerHunt';
import Themepack from './Themepack';

const TIME_ALLOWED = 120;

export default class ScavengerHuntTimed extends ScavengerHunt {
  public constructor(themePack?: Themepack) {
    super(themePack);
    this.state.gameMode = 'timed';
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

  public applyMove(move: GameMove<ScavengerHuntMove>): void {
    if (!this._players.some(player => player.id === move.playerID)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.status === 'OVER') {
      throw new InvalidParametersError(GAME_OVER_MESSAGE);
    }
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }

    const foundItemIndex = this.state.items.findIndex(
      item => item.location.x === move.move.col && item.location.y === move.move.row,
    );
    if (foundItemIndex === -1) {
      throw new InvalidParametersError('Not an item');
    }

    this._itemsFound.set(move.playerID, (this._itemsFound.get(move.playerID) || 0) + 1);
    const updatedItems = [...this.state.items];
    updatedItems[foundItemIndex] = {
      ...updatedItems[foundItemIndex],
      foundBy: move.playerID,
    };
    this.state = {
      ...this.state,
      moves: [...this.state.moves, move.move],
      items: updatedItems,
    };

    if (updatedItems.every(item => item.foundBy)) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: Array.from(this._itemsFound.entries()).reduce((a, b) => (b[1] > a[1] ? b : a))[0],
      };
    }
  }

  protected _isTimeRemaining(currentTime: number): boolean {
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

  /**
   * Adds entries of all scores from game to the leaderboard table in the database.
   */
  protected _addDatabaseEntries() {
    const database = new GameDatabase();
    database.addGameDetails(
      this.state.gameMode,
      this.state.themepack.name,
      this._gameStartTime,
      this._players.length,
    );
    this._players.forEach(player => {
      const score = this.getScoreForPlayer(player);
      database.addTimedLeaderboardEntry(player, score);
    });
  }

  protected leaderboard(): Promise<{ username: string; objects_found: number }[]> {
    const database = new GameDatabase();
    const results = database.top5TimedLeaderboard();
    return results;
  }
}

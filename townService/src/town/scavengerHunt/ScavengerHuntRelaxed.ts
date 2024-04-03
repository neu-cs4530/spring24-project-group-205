import InvalidParametersError, {
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_OVER_MESSAGE,
  INVALID_MOVE_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { GameMove, ScavengerHuntItem } from '../../types/CoveyTownSocket';
import ScavengerHunt from './ScavengerHunt';
import Themepack from './Themepack';
import GameDatabase from './GameDatabase';

export default class ScavengerHuntRelaxed extends ScavengerHunt {
  public constructor(themePack?: Themepack) {
    super(themePack);
    this._gameMode = 'relaxed';
  }

  public iterateClock(): void {
    this.state = {
      ...this.state,
    };
  }

  public applyMove(move: GameMove<ScavengerHuntItem>): void {
    // if (!this._players.includes(move.playerID)) {
    //   throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    // }
    if (move.move.foundBy) {
      throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
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
   * Always returns true for relaxed mode since there is no time limit
   * @param currentTime
   * @returns true if the game has been started and the game is not over
   */
  protected _isTimeRemaining(currentTime: number): boolean {
    if (!this._gameStartTime && this.state.status === 'IN_PROGRESS') {
      return false;
    }

    return true;
  }

  /**
   * Adds entries of all scores from game to the leaderboard table in the database.
   */
  protected _addDatabaseEntries() {
    const database = new GameDatabase();
    database.addGameDetails(
      this._gameMode,
      this._themepack?.name,
      this._gameStartTime,
      this._players.length,
    );
    this._players.forEach(player => {
      const score = this.getScoreForPlayer(player);
      database.addRelaxedLeaderboardEntry(player, score);
    });
  }
}

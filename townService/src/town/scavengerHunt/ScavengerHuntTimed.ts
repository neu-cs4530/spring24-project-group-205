import InvalidParametersError, {
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_OVER_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { GameMove, ScavengerHuntItem } from '../../types/CoveyTownSocket';
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
    const newTimeLeft = this.state.timeLeft - 1;
    if (newTimeLeft >= 0) {
      this.state = {
        ...this.state,
        timeLeft: newTimeLeft,
      };
    }
  }

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

  protected _isTimeRemaining(currentTime: number): boolean {
    // If the game hasn't started yet, there is no time remaining
    if (!this._gameStartTime) {
      return false;
    }

    // If the game has been running for longer than the allotted time, there is no time remaining
    if (currentTime < this._gameStartTime) {
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

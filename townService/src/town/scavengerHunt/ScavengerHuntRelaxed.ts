import ScavengerHunt from './ScavengerHunt';
import Themepack from './Themepack';
import GameDatabase from './GameDatabase';

/**
 * A class representing a relaxed scavenger hunt game
 */
export default class ScavengerHuntRelaxed extends ScavengerHunt {
  public constructor(themePack?: Themepack) {
    super(themePack);
    this.state.gameMode = 'relaxed';
  }

  public iterateClock(): void {
    this.state = {
      ...this.state,
    };
  }

  /**
   * Does not apply to relaxed mode
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
      this.state.gameMode,
      this.state.themepack?.name,
      this._gameStartTime,
      this._players.length,
    );
    this._players.forEach(player => {
      const score = this.getScoreForPlayer(player);
      database.addRelaxedLeaderboardEntry(player, score);
    });
  }
}

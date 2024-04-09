import GameDatabase from './GameDatabase';
import ScavengerHunt from './ScavengerHunt';
import Themepack from './Themepack';

const TIME_ALLOWED = 120;

/**
 * A class representing a timed scavenger hunt game
 */
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

  /**
   * Checks if there is time remaining for the scavenger hunt game.
   * @param currentTime - The current time.
   * @returns A boolean indicating whether there is time remaining.
   */
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
}

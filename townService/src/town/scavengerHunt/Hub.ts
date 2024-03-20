/**
 * This class represents the "hub" of the Scavenger Hunt game. It is responsible for:
 *   - displaying the game mode (either competitive or leisure)
 *   - displaying the leaderboard for each mode
 *   - displaying the rules of the game
 *   - allowing players to purchase new themepacks for the game
 *   - displaying the number of coins the player has to spend
 *   - displaying hints for the game if the player requests one
 *        - there may be multiple hints that the player needs to request for each time they want one
 */

import Player from '../../lib/Player';
import { GameMode } from '../../types/CoveyTownSocket';
import Leaderboard from './Leaderboards';
import Themepack from './Themepack';

export default class Hub {
  // GENERAL HUB INFORMATION:
  // The database that holds the leaderboard for the game
  private _leaderboard = new Leaderboard();

  // All the available themepacks for the game
  private _allThemepacks: Themepack[] = [];

  // The rules of the game
  private _rules!: string;

  // INFORMATION THAT IS SPECIFIC TO THE PLAYER:
  // The game mode the player is currently in
  private _gameMode: GameMode;

  // the player whose hub this belongs to
  private _player: Player;

  // The themepack the player is currently using; the default is the "nature" themepack
  private _themepack: Themepack;

  // the number of coins the player has
  private _coins = 0;

  // the time it took for the player to complete the scavenger hunt -- this is only applicable if the game mode is competitive
  private _timeInSeconds = 0;

  // The hints the player has requested
  private _hints: string[];

  public constructor(player: Player) {
    this._player = player;
    this._gameMode = 'relaxed';
    this._themepack = new Themepack('nature', 0);
    this._hints = [];
  }

  /**
   * Gets the playerID of the player
   */
  getPlayerID() {
    return this._player.id;
  }

  /**
   * Sets the game mode for the player (and the rules).
   * @param gameMode the game mode the player wants to play in
   */
  setGameMode(gameMode: GameMode) {
    this._gameMode = gameMode;

    if (gameMode === 'timed') {
      this._rules = 'Complete the scavenger hunt as fast as you can to get on the leaderboard!';
    } else if (gameMode === 'relaxed') {
      this._rules =
        'Take your time and enjoy the game! Collect as many objects as possible to get on the leaderboard!';
    }
  }

  /**
   * Displays the game mode the player is currently in.
   * @returns the game mode the player is currently in
   */
  getGameMode() {
    return this._gameMode;
  }

  /**
   * Displays the leaderboard for the game.
   * @returns the leaderboard for the game
   * @throws an error if the game mode is not found
   */
  getLeaderboard() {
    return this._leaderboard.top5ActiveLeaderboard();
  }

  /**
   * Displays the rules of the game.
   * @returns the rules of the game
   */
  getRules() {
    return this._rules;
  }

  /**
   * Allows the player to purchase a new themepack for the game and sets the
   * current themepack to the puchased one.
   * @param themepack the themepack the player wants to purchase
   * @throws an error if the player does not have enough coins to purchase the themepack
   * @throws an error if the themepack does not exist
   */
  purchaseThemepack(themepack: Themepack) {
    if (this._coins < themepack.getPrice()) {
      throw new Error('Not enough coins to purchase themepack');
    } else if (!this._allThemepacks.includes(themepack)) {
      throw new Error('Themepack does not exist');
    } else {
      this.deductCoins(themepack.getPrice());
      this._themepack = themepack;
    }
  }

  /**
   * Deducts the number of coins from the player's total.
   * @param coins the number of coins to deduct from the player's total
   */
  deductCoins(coins: number) {
    this._coins -= coins;
  }

  /**
   * Displays the number of coins the player has to spend.
   * @returns the number of coins the player has
   */
  getCoins() {
    return this._coins;
  }

  /**
   * Displays a hint for the game.
   * @returns a hint for the game
   * @throws an error if the player has already requested all the hints
   */
  showHint() {
    if (this._hints.length === 0) {
      throw new Error('No more hints available');
    } else {
      return this._hints.pop();
    }
  }

  /**
   * Adds a new hint to the list of hints the player has requested.
   * @param hint the hint the player wants to request
   */
  addHint(hint: string) {
    this._hints.push(hint);
  }

  /**
   * Adds a new entry to the leaderboard for the game, if the time makes the top 5.
   * @param player the player who completed the scavenger hunt
   * @param time_seconds the time it took for the player to complete the scavenger hunt
   */
  addLeaderboardEntry() {
    this._leaderboard.addActiveLeaderboardEntry(this._player, this._timeInSeconds);
  }

  /**
   * Gets the time it took for the player to complete the scavenger hunt.
   */
  getTime() {
    return this._timeInSeconds;
  }

  /**
   * Sets the time it took for the player to complete the scavenger hunt.
   * @param time the time it took for the player to complete the scavenger hunt
   */
  setTime(time: number) {
    this._timeInSeconds = time;
  }

  /**
   * Gets the themepacks for the game.
   * @returns the themepacks for the game
   */
  getThemepacks() {
    return this._allThemepacks;
  }

  /**
   * Gets the hints for the game.
   * @returns the hints for the game (as a copy)
   */
  getHints() {
    return this._hints.slice();
  }

  /**
   * Adds a new themepack to the list of themepacks for the game.
   * @param themepack the themepack to add to the list of themepacks
   */
  addThemepack(themepack: Themepack) {
    this._allThemepacks.push(themepack);
  }
}

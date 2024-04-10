import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  ScavengerHuntGameState,
} from '../../types/CoveyTownSocket';
import GameArea from '../games/GameArea';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntTimed from './ScavengerHuntTimed';
import ScavengerHuntRelaxed from './ScavengerHuntRelaxed';
import Themepack from './Themepack';
import GameDatabase from './GameDatabase';

/**
 * Class that represents the game area and handles the commands sent from the backend
 */
export default class ScavengerHuntGameArea extends GameArea<ScavengerHunt> {
  public get themepack(): Themepack | undefined {
    return this._game?.themePack;
  }

  protected getType(): InteractableType {
    return 'ScavengerHuntArea' as InteractableType;
  }

  private _stateUpdated(updatedState: GameInstance<ScavengerHuntGameState>) {
    if (updatedState.state.status === 'OVER') {
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { players } = updatedState;
        if (players && updatedState.state.winner) {
          const winner = this.occupants.find(player => player.id === updatedState.state.winner);
          if (winner) {
            const winnerUserName = winner.userName;
            this._history.push({
              gameID,
              scores: {
                [winnerUserName]: 1,
              },
            });
          }
        }
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handles the execution of different types of commands in the scavenger hunt game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - StartGame (indicates that the player is ready to start the game)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   * - EndGame (ends the game)
   * - ItemFound (indicates that an item has been found)
   * - RequestHint (requests a hint)
   * - TimedLeaderboard (requests the timed leaderboard)
   * - RelaxedLeaderboard (requests the relaxed leaderboard)
   *
   * @template CommandType - The type of command to be handled.
   * @param {CommandType} command - The command to be executed.
   * @param {Player} player - The player executing the command.
   * @returns {InteractableCommandReturnType<CommandType> | undefined} - The result of the command execution.
   * @throws {InvalidParametersError} - If the command or parameters are invalid.
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinTimedGame') {
      let game = this._game;
      let selectedThemepack: Themepack | undefined; // Declare themepack variable
      if (!game || game.state.status !== 'IN_PROGRESS') {
        selectedThemepack = game?.themePack || new Themepack(command.themepack); // Assign themepack if not already present
        if (!selectedThemepack) {
          throw new InvalidParametersError('No themepack selected for the game');
        }
        if (!game || game.state.status === 'OVER') {
          game = new ScavengerHuntTimed(selectedThemepack);
          this._game = game;
        }
        game.join(player); // Pass themepack to join method
      }
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinRelaxedGame') {
      let game = this._game;
      let selectedThemepack: Themepack | undefined; // Declare themepack variable
      if (!game || game.state.status !== 'IN_PROGRESS') {
        selectedThemepack = game?.themePack || new Themepack(command.themepack); // Assign themepack if not already present
        if (!selectedThemepack) {
          throw new InvalidParametersError('No themepack selected for the game');
        }
        if (!game || game.state.status === 'OVER') {
          game = new ScavengerHuntRelaxed(selectedThemepack);
          this._game = game;
        }
        game.join(player); // Pass themepack to join method
      }
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      this.removeScavengerHuntOnRefresh(player);
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'StartGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.startGame(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'EndGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.endGame(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'ItemFound') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      const item = game.getItemByLocation(command.location.x, command.location.y);
      item.foundBy = player.id;
      try {
        game.applyMove({ gameID: game.id, playerID: player.id, move: item });
      } catch (e) {
        // catch error in edge case that two players click item at same exact time
      }
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'RelaxedLeaderboard') {
      this._sendRelaxedLeaderboard();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'TimedLeaderboard') {
      this._sendTimedLeaderboard();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'RequestHint') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      this._stateUpdated(game.toModel());
      const requestedHint = game.requestHint();
      return { hint: requestedHint } as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError('INVALID_COMMAND_MESSAGE');
  }

  private async _sendTimedLeaderboard() {
    const database = new GameDatabase();
    const data = await database.top5TimedLeaderboard();
    this._townEmitter.emit('timedLeaderboard', data);
  }

  private async _sendRelaxedLeaderboard() {
    const database = new GameDatabase();
    const data = await database.top5RelaxedLeaderboard();
    this._townEmitter.emit('relaxedLeaderboard', data);
  }

  /**
   * Method to increment the timer of the game
   * @throws an error if the game is not in progress
   */
  private _incrementTimer(): void {
    const game = this._game;

    if (!game) {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }

    game.iterateClock();
    this._stateUpdated(game.toModel());
  }

  /**
   * Method to start the timer of the game.
   * Increments the timer every second if the game is in progress and there is time left
   * @throws an error if there is no game in progress
   */
  private _startTimer() {
    const intervalId = setInterval(() => {
      if (this.game && this.game.state.status === 'IN_PROGRESS' && this.game.state.timeLeft > 0) {
        this._incrementTimer();
      } else if (!this.game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      } else {
        clearInterval(intervalId);
      }
    }, 1000);
  }
}

import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
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
import InteractableArea from '../InteractableArea';

export default class ScavengerHuntGameArea extends GameArea<ScavengerHunt> {
  private _interactables: InteractableArea[] = [];

  // Method to set interactables
  public setInteractables(interactables: InteractableArea[]): void {
    this._interactables = interactables;
  }

  protected getType(): InteractableType {
    return 'ScavengerHuntArea' as InteractableType;
  }

  private _stateUpdated(updatedState: GameInstance<ScavengerHuntGameState>) {
    if (updatedState.state.status === 'OVER') {
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { scavenger } = updatedState.state;
        if (scavenger) {
          const scavengerName =
            this._occupants.find(eachPlayer => eachPlayer.id === scavenger)?.userName || scavenger;
          this._history.push({
            gameID,
            scores: {
              [scavengerName]: 1,
            },
          });
        }
      }
    }
    this._emitAreaChanged();
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress or game over, create a new one
        game = new ScavengerHunt();
        this._game = game;
      }
      game.join(player);
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
      this._stateUpdated(game.toModel());
      this._startTimer();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
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

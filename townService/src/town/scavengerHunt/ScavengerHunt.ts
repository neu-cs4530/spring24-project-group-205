import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_OVER_MESSAGE,
  INVALID_MOVE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, ScavengerHuntGameState, ScavengerHuntItem } from '../../types/CoveyTownSocket';
import Game from '../games/Game';

export default class ScavengerHunt extends Game<ScavengerHuntGameState, ScavengerHuntItem> {
  public constructor() {
    super({
      items: [],
      status: 'WAITING_TO_START',
    });
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
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
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
}

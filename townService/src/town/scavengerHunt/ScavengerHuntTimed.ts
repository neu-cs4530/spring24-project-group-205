import InvalidParametersError, {
  GAME_OVER_MESSAGE,
  INVALID_MOVE_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { GameMove, ScavengerHuntItem } from '../../types/CoveyTownSocket';
import ScavengerHunt from './ScavengerHunt';

export default class ScavengerHuntTimed extends ScavengerHunt {
  public constructor() {
    super();
    this._gameMode = 'relaxed';
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
  }
}

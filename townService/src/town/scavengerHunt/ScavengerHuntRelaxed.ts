import InvalidParametersError, {
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_OVER_MESSAGE,
  INVALID_MOVE_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { GameMove, ScavengerHuntItem } from '../../types/CoveyTownSocket';
import ScavengerHunt from './ScavengerHunt';
import Themepack from './Themepack';

export default class ScavengerHuntRelaxed extends ScavengerHunt {
  public constructor(themePack?: Themepack) {
    super(themePack);
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

    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    move.move.foundBy = this.state.scavenger;
    this._itemsFound += 1;
    this.state = {
      ...this.state,
      items: this.state.items.map(item => (item.id === move.move.id ? move.move : item)),
    };
  }
}

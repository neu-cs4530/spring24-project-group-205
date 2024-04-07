import Themepack from './Themepack';
import { GameMove, ScavengerHuntGameState, ScavengerHuntItem } from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';
import Game from '../games/Game';

export default class TestingRelaxedGame extends Game<ScavengerHuntGameState, ScavengerHuntItem> {
  public constructor(themePack?: Themepack) {
    super({
      mode: 'relaxed',
      timeLeft: 10,
      items: [],
      status: 'WAITING_TO_START',
    });
  }

  public applyMove(move: GameMove<ScavengerHuntItem>): void {}

  public endGame(): void {
    this.state = {
      ...this.state,
      status: 'OVER',
    };
  }

  public startGame(player: Player): void {}

  protected _join(player: Player): void {
    if (this.numPlayers() < 10) {
      this._players.push(player);
    }
  }

  protected _leave(player: Player): void {}
}

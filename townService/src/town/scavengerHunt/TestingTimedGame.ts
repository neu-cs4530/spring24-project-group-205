import Themepack from './Themepack';
import { GameMove, ScavengerHuntGameState, ScavengerHuntItem } from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';
import Game from '../games/Game';

export default class TestingTimedGame extends Game<ScavengerHuntGameState, ScavengerHuntItem> {
  public constructor(themePack?: Themepack) {
    super({
      gameMode: 'timed',
      timeLeft: 10,
      items: [],
      status: 'WAITING_TO_START',
    });
  }

  public iterateClock(): void {
    this.state = {
      ...this.state,
      timeLeft: this.state.timeLeft - 1,
    };
  }

  public applyMove(move: GameMove<ScavengerHuntItem>): void {}

  public endGame(): void {
    this.state = {
      ...this.state,
      status: 'OVER',
    };
  }

  public requestHint(player: Player): void {}

  public startGame(player: Player): void {
    this.state = {
      ...this.state,
      status: 'IN_PROGRESS',
    };
  }

  protected _join(player: Player): void {
    if (this.numPlayers() < 10) {
      this._players.push(player);
    }
  }

  protected _leave(player: Player): void {}
}

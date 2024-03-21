import { createPlayerForTesting } from '../../TestUtils';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntTimed from './ScavengerHuntTimed';

describe('ScavengerHunt', () => {
  let game: ScavengerHunt;

  beforeEach(() => {
    game = new ScavengerHuntTimed();
  });

  describe('_applyMove', () => {
    it('should end the game once all the items have been collected', () => {
      const player = createPlayerForTesting();
      const burger = { id: '1234', name: 'burger', location: { x: 0, y: 0 }, foundBy: undefined };
      const ball = { id: '5678', name: 'ball', location: { x: 0, y: 0 }, foundBy: undefined };
      game.addItem(burger);
      game.addItem(ball);
      game.join(player);
      expect(game.state.items.length).toBe(2);
      expect(game.state.items[0].id).toBe('1234');
      game.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      expect(game.state.scavenger).toBe(player.id);
      expect(game.state.items[0].foundBy).toBe(player.id);
      expect(game.getScore()).toBe(1);
      game.applyMove({ gameID: '1234', playerID: player.id, move: ball });
      expect(game.state.status).toBe('OVER');
      expect(game.getScore()).toBe(2);
      expect(game.state.items[1].foundBy).toBe(player.id);
    });
  });
});

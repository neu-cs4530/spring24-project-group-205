import { createPlayerForTesting } from '../../TestUtils';
import Item from './Item';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntRelaxed from './ScavengerHuntRelaxed';
import Themepack from './Themepack';

describe('ScavengerHunt', () => {
  let game: ScavengerHunt;
  let themepack: Themepack;

  beforeEach(() => {
    themepack = new Themepack('Food');
    game = new ScavengerHuntRelaxed(themepack);
  });

  describe('_applyMove', () => {
    it('should not change the number of items to collect and not end the game', () => {
      const player = createPlayerForTesting();
      const burger = new Item('1234', 'burger', { x: 0, y: 0 }, '');
      const sushi = new Item('5678', 'sushi', { x: 0, y: 0 }, '');

      themepack.addItem(burger);
      themepack.addItem(sushi);

      game.join(player);
      game.startGame(player);

      game.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      expect(game.state.items[0].foundBy).toBe(player.id);
      expect(game.getScore()).toBe(1);

      game.applyMove({ gameID: '5678', playerID: player.id, move: sushi });
      expect(game.state.items[1].foundBy).toBe(player.id);
      expect(game.getScore()).toBe(2);
    });
  });
});

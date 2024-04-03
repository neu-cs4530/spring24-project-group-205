import { createPlayerForTesting } from '../../TestUtils';
import Item from './Item';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntTimed from './ScavengerHuntTimed';
import Themepack from './Themepack';

describe('ScavengerHunt', () => {
  let game: ScavengerHunt;
  let themepack: Themepack;

  beforeEach(() => {
    themepack = new Themepack('Food');
    game = new ScavengerHuntTimed(themepack);
  });

  describe('_applyMove', () => {
    it('should end the game once all the items have been collected', () => {
      const player = createPlayerForTesting();
      const burger = new Item('1234', 'burger', { x: 0, y: 0 }, '');
      const sushi = new Item('5678', 'sushi', { x: 0, y: 0 }, '');

      themepack.addItem(burger);
      themepack.addItem(sushi);

      game.join(player);
      expect(game.state.items.length).toBe(0);
      game.startGame(player);
      expect(game.state.items.length).toBe(2);
      expect(game.state.items[0].id).toBe('1234');
      game.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      expect(game.state.items[0].foundBy).toBe(player.id);
      expect(game.getScoreForPlayer(player)).toBe(1);
      game.applyMove({ gameID: '1234', playerID: player.id, move: sushi });
      expect(game.state.status).toBe('OVER');
      expect(game.getScoreForPlayer(player)).toBe(2);
      expect(game.state.items[1].foundBy).toBe(player.id);
      expect(game.getTimeLeft()).toBe(120);
      game.iterateClock();
      expect(game.getTimeLeft()).toBe(119);
    });
    it('should declare the winner based on most items collected', () => {
      const player = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const burger = new Item('1234', 'burger', { x: 0, y: 0 }, '');
      const sushi = new Item('5678', 'sushi', { x: 0, y: 0 }, '');
      const taco = new Item('1011', 'taco', { x: 0, y: 0 }, '');

      themepack.addItem(burger);
      themepack.addItem(sushi);
      themepack.addItem(taco);

      game.join(player);
      game.join(player2);
      game.startGame(player);
      expect(game.state.items.length).toBe(3);
      game.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      game.applyMove({ gameID: '1234', playerID: player2.id, move: sushi });
      game.applyMove({ gameID: '1234', playerID: player.id, move: taco });
      expect(game.state.status).toBe('OVER');
      expect(game.getScoreForPlayer(player)).toBe(2);
      expect(game.state.winner).toBe(player.id);
      expect(game.getTimeLeft()).toBe(120);
      game.iterateClock();
      expect(game.getTimeLeft()).toBe(119);
    });
  });
});

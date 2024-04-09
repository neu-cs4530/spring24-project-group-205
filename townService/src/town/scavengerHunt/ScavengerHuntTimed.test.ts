import { createPlayerForTesting } from '../../TestUtils';
import { GameStatus } from '../../types/CoveyTownSocket';
import Item from './Item';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntTimed from './ScavengerHuntTimed';
import Themepack from './Themepack';

describe('ScavengerHunt', () => {
  let game: ScavengerHunt;
  let themepack: Themepack;
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;

  beforeEach(() => {
    themepack = new Themepack('Food');
    game = new ScavengerHuntTimed(themepack);
    setIntervalSpy = jest.spyOn(global, 'setInterval');
    clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    setIntervalSpy.mockImplementation(() => {});
    clearIntervalSpy.mockImplementation(() => {});
  });

  function testGameState(status: GameStatus, items: Item[], timeLeft?: number) {
    expect(game.state.status).toEqual(status);
    // expect(game.state.items).toEqual(items);
    if (timeLeft) {
      expect(game.state.timeLeft).toEqual(timeLeft);
    }
  }
  describe('iterateClock', () => {
    it('should update state if new time is >= 0', () => {
      testGameState('WAITING_TO_START', [], 120);
      game.iterateClock();
      testGameState('WAITING_TO_START', [], 119);
    });
    it('should not update the state if new time is < 0', () => {
      const player = createPlayerForTesting();
      game.join(player);
      testGameState('WAITING_TO_START', [], 120);
      game.startGame(player);
      testGameState('IN_PROGRESS', [], 120);

      for (let i = 1; i <= 120; i++) {
        game.iterateClock();
        testGameState('IN_PROGRESS', [], 120 - i);
      }

      // now timer should not increment
      for (let i = 1; i <= 10; i++) {
        game.iterateClock();
        testGameState('IN_PROGRESS', [], 0);
      }
    });
  });
  describe('_applyMove', () => {
    it('should end the game once all the items have been collected', () => {
      const player = createPlayerForTesting();
      const burger = new Item(1234, 'burger', { x: 0, y: 0 }, '');
      const sushi = new Item(5678, 'sushi', { x: 0, y: 0 }, '');

      themepack.addItem(burger);
      themepack.addItem(sushi);

      game.join(player);
      expect(game.state.items.length).toBe(0);
      game.startGame(player);
      expect(game.state.items.length).toBe(22);
      expect(game.state.items[0].id).toBe(1234);
      game.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      expect(game.state.items[0].foundBy).toBe(player.id);
      expect(game.getScoreForPlayer(player)).toBe(1);
      game.applyMove({ gameID: '1234', playerID: player.id, move: sushi });
      expect(game.state.status).toBe('IN_PROGRESS');
      expect(game.getScoreForPlayer(player)).toBe(2);
      expect(game.state.items[1].foundBy).toBe(player.id);
      expect(game.getTimeLeft()).toBe(120);
      game.iterateClock();
      expect(game.getTimeLeft()).toBe(119);
    });
    it('should declare the winner based on most items collected', () => {
      const player = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const burger = new Item(1234, 'burger', { x: 0, y: 0 }, '');
      const sushi = new Item(5678, 'sushi', { x: 0, y: 0 }, '');
      const taco = new Item(1011, 'taco', { x: 0, y: 0 }, '');

      themepack.addItem(burger);
      themepack.addItem(sushi);
      themepack.addItem(taco);

      game.join(player);
      game.join(player2);
      game.startGame(player);
      expect(game.state.items.length).toBe(43);
      game.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      game.applyMove({ gameID: '1234', playerID: player2.id, move: sushi });
      game.applyMove({ gameID: '1234', playerID: player.id, move: taco });
      expect(game.state.status).toBe('IN_PROGRESS');
      expect(game.getScoreForPlayer(player)).toBe(2);
      expect(game.getTimeLeft()).toBe(120);
      game.iterateClock();
      expect(game.getTimeLeft()).toBe(119);
    });
    it('should throw an error if non-present player tries to find an item', () => {
      const player = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const burger = new Item(1234, 'burger', { x: 0, y: 0 }, '');
      themepack.addItem(burger);
      game.join(player);
      game.startGame(player);
      expect(() =>
        game.applyMove({ gameID: '1234', playerID: player2.id, move: burger }),
      ).toThrow();
    });
  });
  describe('end game if time is up', () => {
    jest.useFakeTimers();
    it('ends game and sets status to over', async () => {
      const player = createPlayerForTesting();
      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
      game.join(player);
      game.startGame(player);
      testGameState('IN_PROGRESS', [], 120);
      jest.advanceTimersByTime(121000);
      testGameState('OVER', [], 0);
      jest.useRealTimers();
    });
  });
});

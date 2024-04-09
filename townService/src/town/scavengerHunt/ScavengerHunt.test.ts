import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import ScavengerHuntRelaxed from './ScavengerHuntRelaxed';
import ScavengerHuntTimed from './ScavengerHuntTimed';
import Themepack from './Themepack';
import Item from './Item';

describe('ScavengerHunt', () => {
  let gameRelaxed: ScavengerHuntRelaxed;
  let gameTimed: ScavengerHuntTimed;
  let themepack: Themepack;
  let burger: Item;
  let sushi: Item;

  beforeEach(() => {
    themepack = new Themepack('Food');
    gameRelaxed = new ScavengerHuntRelaxed(themepack);
    gameTimed = new ScavengerHuntTimed(themepack);
    burger = new Item(1234, 'burger', { x: 0, y: 0 }, '', 'n/a');
    sushi = new Item(5678, 'sushi', { x: 0, y: 0 }, '', 'n/a');

    themepack.addItem(burger);
    themepack.addItem(sushi);
  });

  afterEach(() => {
    gameRelaxed.clearTimerInterval();
    gameTimed.clearTimerInterval();
  });

  describe('_join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      gameRelaxed.join(player);
      expect(() => gameRelaxed.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });

    it('should throw an error if the game is full', () => {
      for (let i = 0; i < 10; i += 1) {
        gameRelaxed.join(createPlayerForTesting());
      }
      const player11 = createPlayerForTesting();
      expect(() => gameRelaxed.join(player11)).toThrowError(GAME_FULL_MESSAGE);
    });
    it('should throw an error if the game is already started and a player tries to join', () => {
      const player = createPlayerForTesting();
      gameRelaxed.join(player);
      gameRelaxed.startGame(player);
      expect(gameRelaxed.state.status).toEqual('IN_PROGRESS');
      expect(() => gameRelaxed.join(createPlayerForTesting())).toThrowError();
    });

    describe('When the player can be added', () => {
      it('makes the player the current scavenger and starts the game in relaxed mode', () => {
        const player = createPlayerForTesting();
        gameRelaxed.join(player);
        gameRelaxed.startGame(player);
        expect(gameRelaxed.state.status).toEqual('IN_PROGRESS');
        expect(gameRelaxed.state.winner).toBeUndefined();
      });

      it('makes the player the current scavenger and starts the game in timed mode', () => {
        const player = createPlayerForTesting();
        gameTimed.join(player);
        gameTimed.startGame(player);
        expect(gameTimed.state.status).toEqual('IN_PROGRESS');
        expect(gameTimed.state.winner).toBeUndefined();
      });
    });
  });

  describe('_leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => gameRelaxed.leave(createPlayerForTesting())).toThrowError(
        PLAYER_NOT_IN_GAME_MESSAGE,
      );
      const player = createPlayerForTesting();
      gameRelaxed.join(player);
      expect(() => gameRelaxed.leave(createPlayerForTesting())).toThrowError(
        PLAYER_NOT_IN_GAME_MESSAGE,
      );
    });

    describe('when the player is in the game', () => {
      describe('when the game is in progress, it should set the game status to OVER in relaxed mode', () => {
        test('when player leaves', () => {
          const player = createPlayerForTesting();
          gameRelaxed.join(player);
          gameRelaxed.startGame(player);
          gameRelaxed.leave(player);
          expect(gameRelaxed.state.status).toEqual('OVER');
        });
      });
      describe('if the player is the only one, it should end the game', () => {
        test('in relaxed mode', () => {
          const player = createPlayerForTesting();
          gameRelaxed.join(player);
          gameRelaxed.startGame(player);
          gameRelaxed.leave(player);
          expect(gameRelaxed.state.status).toEqual('OVER');
          expect(gameRelaxed.numPlayers()).toEqual(0);
        });

        test('in timed mode', () => {
          const player = createPlayerForTesting();
          gameTimed.join(player);
          gameTimed.startGame(player);
          gameTimed.leave(player);
          expect(gameTimed.state.status).toEqual('OVER');
          expect(gameRelaxed.numPlayers()).toEqual(0);
        });
      });

      describe('when the game is in progress, it should set the game status to OVER in timed mode', () => {
        test('when player leaves', () => {
          const player = createPlayerForTesting();
          gameTimed.join(player);
          gameTimed.startGame(player);
          gameTimed.leave(player);
          expect(gameTimed.state.status).toEqual('OVER');
        });
      });
    });
  });

  describe('Item assignment', () => {
    it('should assign random locations and generate hints when the game starts in timed mode', () => {
      const player = createPlayerForTesting();

      gameTimed.join(player);
      expect(gameTimed.state.items.length).toBe(0);
      gameTimed.startGame(player);
      expect(gameTimed.state.items.length).toBe(22);
      expect(gameTimed.state.items[0].id).toBe(1234);
      gameTimed.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      expect(gameTimed.state.items[0].foundBy).toBe(player.id);
      expect(gameTimed.getScoreForPlayer(player)).toBe(1);
      gameTimed.applyMove({ gameID: '1234', playerID: player.id, move: sushi });
      expect(gameTimed.getScoreForPlayer(player)).toBe(2);
      expect(gameTimed.state.items[1].foundBy).toBe(player.id);
    });
  });
  describe('End Game', () => {
    describe('should remove all items if the game ends', () => {
      it('in relaxed mode', () => {
        const player = createPlayerForTesting();
        gameRelaxed.join(player);
        gameRelaxed.startGame(player);
        expect(gameRelaxed.state.items.length).toBe(22);
        gameRelaxed.endGame(player);
        expect(gameRelaxed.state.items.length).toBe(0);
      });

      it('in timed mode', () => {
        const player = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        gameTimed.join(player);
        gameTimed.join(player2);
        gameTimed.startGame(player);
        expect(gameTimed.state.items.length).toBe(42);
        expect(gameTimed.hasPlayer(player)).toBe(true);
        expect(gameTimed.hasPlayer(player2)).toBe(true);
        gameTimed.endGame(player);
        expect(gameTimed.state.items.length).toBe(0);
        expect(gameTimed.numPlayers()).toEqual(0);
        expect(gameTimed.hasPlayer(player)).toBe(false);
        expect(gameTimed.hasPlayer(player2)).toBe(false);
      });
    });
    describe('should end game for both players', () => {
      it('in relaxed mode', () => {
        const player = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        gameRelaxed.join(player);
        gameRelaxed.join(player2);
        gameRelaxed.startGame(player);
        expect(gameRelaxed.state.items.length).toBe(42);
        expect(gameRelaxed.hasPlayer(player)).toBe(true);
        expect(gameRelaxed.hasPlayer(player2)).toBe(true);
        gameRelaxed.endGame(player);
        expect(gameRelaxed.state.items.length).toBe(0);
        expect(gameRelaxed.numPlayers()).toEqual(0);
        expect(gameRelaxed.hasPlayer(player)).toBe(false);
        expect(gameRelaxed.hasPlayer(player2)).toBe(false);
      });

      it('in timed mode', () => {
        const player = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        gameTimed.join(player);
        gameTimed.join(player2);
        gameTimed.startGame(player);
        expect(gameTimed.state.items.length).toBe(42);
        expect(gameTimed.hasPlayer(player)).toBe(true);
        expect(gameTimed.hasPlayer(player2)).toBe(true);
        gameTimed.endGame(player);
        expect(gameTimed.state.items.length).toBe(0);
        expect(gameTimed.numPlayers()).toEqual(0);
        expect(gameTimed.hasPlayer(player)).toBe(false);
        expect(gameTimed.hasPlayer(player2)).toBe(false);
      });

    });
  });
});

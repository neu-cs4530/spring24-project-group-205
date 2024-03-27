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
    burger = new Item('1234', 'burger', { x: 0, y: 0 }, '');
    sushi = new Item('5678', 'sushi', { x: 0, y: 0 }, '');

    themepack.addItem(burger);
    themepack.addItem(sushi);
  });

  describe('_join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      gameRelaxed.join(player);
      expect(() => gameRelaxed.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });

    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      gameRelaxed.join(player1);

      expect(() => gameRelaxed.join(player2)).toThrowError(GAME_FULL_MESSAGE);
    });

    describe('When the player can be added', () => {
      it('makes the player the current scavenger and starts the game in relaxed mode', () => {
        const player = createPlayerForTesting();
        gameRelaxed.join(player);
        gameRelaxed.startGame(player);
        expect(gameRelaxed.state.scavenger).toEqual(player.id);
        expect(gameRelaxed.state.status).toEqual('IN_PROGRESS');
        expect(gameRelaxed.state.winner).toBeUndefined();
      });

      it('makes the player the current scavenger and starts the game in timed mode', () => {
        const player = createPlayerForTesting();
        gameTimed.join(player);
        gameTimed.startGame(player);
        expect(gameTimed.state.scavenger).toEqual(player.id);
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
          expect(gameRelaxed.state.scavenger).toEqual(player.id);
          gameRelaxed.leave(player);
          expect(gameRelaxed.state.status).toEqual('OVER');
        });
      });

      describe('when the game is in progress, it should set the game status to OVER in timed mode', () => {
        test('when player leaves', () => {
          const player = createPlayerForTesting();
          gameTimed.join(player);
          gameTimed.startGame(player);
          expect(gameTimed.state.scavenger).toEqual(player.id);
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
      expect(gameTimed.state.items.length).toBe(2);
      expect(gameTimed.state.items[0].id).toBe('1234');
      gameTimed.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      expect(gameTimed.state.scavenger).toBe(player.id);
      expect(gameTimed.state.items[0].foundBy).toBe(player.id);
      expect(gameTimed.getScore()).toBe(1);
      gameTimed.applyMove({ gameID: '1234', playerID: player.id, move: sushi });
      expect(gameTimed.state.status).toBe('OVER');
      expect(gameTimed.getScore()).toBe(2);
      expect(gameTimed.state.items[1].foundBy).toBe(player.id);
    });
  });
});

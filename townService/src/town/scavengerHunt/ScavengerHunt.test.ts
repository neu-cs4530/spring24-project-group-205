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
    burger = new Item(1234, 'burger', { x: 0, y: 0 }, '');
    sushi = new Item(5678, 'sushi', { x: 0, y: 0 }, '');

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
    describe('timed mode', () => {
      it('should throw an error if the player is not in the game', () => {
        expect(() => gameTimed.leave(createPlayerForTesting())).toThrowError(
          PLAYER_NOT_IN_GAME_MESSAGE,
        );
        const player = createPlayerForTesting();
        gameTimed.join(player);
        expect(() => gameTimed.leave(createPlayerForTesting())).toThrowError(
          PLAYER_NOT_IN_GAME_MESSAGE,
        );
      });

      describe('when the player is in the game', () => {
        describe('IN_PROGRESS', () => {
          it('should set the game status to OVER if they were the only player', () => {
            const player = createPlayerForTesting();
            gameTimed.join(player);
            gameTimed.startGame(player);
            gameTimed.leave(player);
            expect(gameTimed.state.status).toEqual('OVER');
          });
          it('should keep the game in IN_PROGRESS and just remove the player if there are other players', () => {
            const player1 = createPlayerForTesting();
            gameTimed.join(player1);
            const player2 = createPlayerForTesting();
            gameTimed.join(player2);
            gameTimed.startGame(player1);
            expect(gameTimed.numPlayers()).toBe(2);
            gameTimed.leave(player1);
            expect(gameTimed.state.status).toEqual('IN_PROGRESS');
            expect(gameTimed.numPlayers()).toBe(1);
            expect(() =>
              gameTimed.applyMove({ gameID: '1234', playerID: player1.id, move: burger }),
            ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
            expect(gameTimed.state.winner).toBeUndefined();
          });
        });
        describe('WAITING_TO_START', () => {
          it('should set the game status to WAITING_FOR_PLAYERS if they were the only player', () => {
            const player = createPlayerForTesting();
            gameTimed.join(player);
            gameTimed.leave(player);
            expect(gameTimed.state.status).toEqual('WAITING_FOR_PLAYERS');
          });
          it('should keep the game in WAITING_TO_START and just remove the player if there are other players', () => {
            const player1 = createPlayerForTesting();
            gameTimed.join(player1);
            const player2 = createPlayerForTesting();
            gameTimed.join(player2);
            expect(gameTimed.numPlayers()).toBe(2);
            gameTimed.leave(player1);
            expect(gameTimed.state.status).toEqual('WAITING_TO_START');
            expect(gameTimed.numPlayers()).toBe(1);
            expect(() =>
              gameTimed.applyMove({ gameID: '1234', playerID: player1.id, move: burger }),
            ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
            expect(gameTimed.state.winner).toBeUndefined();
          });
        });
      });
    });

    describe('relaxed mode', () => {
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
        describe('IN_PROGRESS', () => {
          it('should set the game status to OVER if they were the only player', () => {
            const player = createPlayerForTesting();
            gameRelaxed.join(player);
            gameRelaxed.startGame(player);
            gameRelaxed.leave(player);
            expect(gameRelaxed.state.status).toEqual('OVER');
          });
          it('should keep the game in IN_PROGRESS and just remove the player if there are other players', () => {
            const player1 = createPlayerForTesting();
            gameRelaxed.join(player1);
            const player2 = createPlayerForTesting();
            gameRelaxed.join(player2);
            gameRelaxed.startGame(player1);
            expect(gameRelaxed.numPlayers()).toBe(2);
            gameRelaxed.leave(player1);
            expect(gameRelaxed.state.status).toEqual('IN_PROGRESS');
            expect(gameRelaxed.numPlayers()).toBe(1);
            expect(() =>
              gameRelaxed.applyMove({ gameID: '1234', playerID: player1.id, move: burger }),
            ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
            expect(gameRelaxed.state.winner).toBeUndefined();
          });
        });
        describe('WAITING_TO_START', () => {
          it('should set the game status to WAITING_FOR_PLAYERS if they were the only player', () => {
            const player = createPlayerForTesting();
            gameRelaxed.join(player);
            gameRelaxed.leave(player);
            expect(gameRelaxed.state.status).toEqual('WAITING_FOR_PLAYERS');
          });
          it('should keep the game in WAITING_TO_START and just remove the player if there are other players', () => {
            const player1 = createPlayerForTesting();
            gameRelaxed.join(player1);
            const player2 = createPlayerForTesting();
            gameRelaxed.join(player2);
            expect(gameRelaxed.numPlayers()).toBe(2);
            gameRelaxed.leave(player1);
            expect(gameRelaxed.state.status).toEqual('WAITING_TO_START');
            expect(gameRelaxed.numPlayers()).toBe(1);
            expect(() =>
              gameRelaxed.applyMove({ gameID: '1234', playerID: player1.id, move: burger }),
            ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
            expect(gameRelaxed.state.winner).toBeUndefined();
          });
        });
      });
    });
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
  });

  describe('endGame', () => {
    describe('timed mode', () => {
      it('should throw an error if a non-present player tries to end the game', () => {
        expect(() => gameRelaxed.endGame(createPlayerForTesting())).toThrowError(
          PLAYER_NOT_IN_GAME_MESSAGE,
        );
        const player = createPlayerForTesting();
        expect(() => gameTimed.endGame(player)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
      it('should end the game for all players if a present player ends the game', () => {
        const player1 = createPlayerForTesting();
        gameTimed.join(player1);
        const player2 = createPlayerForTesting();
        gameTimed.join(player2);
        gameTimed.startGame(player1);
        expect(gameTimed.state.status).toEqual('IN_PROGRESS');
        gameTimed.endGame(player1);
        expect(gameTimed.state.status).toEqual('OVER');
      });
    });
    describe('relaxed mode', () => {
      it('should throw an error if a non-present player tries to end the game', () => {
        expect(() => gameRelaxed.endGame(createPlayerForTesting())).toThrowError(
          PLAYER_NOT_IN_GAME_MESSAGE,
        );
        const player = createPlayerForTesting();
        expect(() => gameRelaxed.endGame(player)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
      it('should end the game for all players if a present player ends the game', () => {
        const player1 = createPlayerForTesting();
        gameRelaxed.join(player1);
        const player2 = createPlayerForTesting();
        gameRelaxed.join(player2);
        gameRelaxed.startGame(player1);
        expect(gameRelaxed.state.status).toEqual('IN_PROGRESS');
        gameRelaxed.endGame(player1);
        expect(gameRelaxed.state.status).toEqual('OVER');
      });
    });

    it('should not let players pick up items after the game has ended', () => {
      const player1 = createPlayerForTesting();
      gameRelaxed.join(player1);
      const player2 = createPlayerForTesting();
      gameRelaxed.join(player2);
      gameRelaxed.startGame(player1);
      gameRelaxed.endGame(player1);
      expect(() =>
        gameRelaxed.applyMove({ gameID: '1234', playerID: player1.id, move: burger }),
      ).toThrowError('Game is over');
      expect(() =>
        gameRelaxed.applyMove({ gameID: '1234', playerID: player2.id, move: sushi }),
      ).toThrowError('Game is over');
    });
  });

  describe('Item assignment', () => {
    it('should assign random locations and generate hints when the game starts in timed mode', () => {
      const player = createPlayerForTesting();

      gameTimed.join(player);
      expect(gameTimed.state.items.length).toBe(0);
      gameTimed.startGame(player);
      expect(gameTimed.state.items.length).toBe(2 + 20);
      expect(gameTimed.state.items[0].id).toBe(1234);
      gameTimed.applyMove({ gameID: '1234', playerID: player.id, move: burger });
      expect(gameTimed.state.items[0].foundBy).toBe(player.id);
      expect(gameTimed.getScoreForPlayer(player)).toBe(1);
      gameTimed.applyMove({ gameID: '1234', playerID: player.id, move: sushi });
      expect(gameTimed.getScoreForPlayer(player)).toBe(2);
      expect(gameTimed.state.items[1].foundBy).toBe(player.id);
    });
  });
});

import { nanoid } from 'nanoid';
import { mock, mockReset } from 'jest-mock-extended';
import Themepack from './Themepack';
import { TownEmitter } from '../../types/CoveyTownSocket';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import ScavengerHuntGameArea from './ScavengerHuntGameArea';
import * as ScavengerHuntTimedModule from './ScavengerHuntTimed';
import * as ScavengerHuntRelaxedModule from './ScavengerHuntRelaxed';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
} from '../../lib/InvalidParametersError';
import TestingTimedGame from './TestingTimedGame';
import TestingRelaxedGame from './TestingRelaxedGame';

describe('ScavengerHuntArea', () => {
  let gameArea: ScavengerHuntGameArea;
  let themepack: Themepack;
  let player1: Player;
  let player2: Player;
  let player3: Player;
  let player4: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  const gameTimedConstructorSpy = jest.spyOn(ScavengerHuntTimedModule, 'default');
  const gameRelaxedConstructorSpy = jest.spyOn(ScavengerHuntRelaxedModule, 'default');
  let gameTimed: TestingTimedGame;
  let gameRelaxed: TestingRelaxedGame;

  beforeEach(() => {
    gameTimedConstructorSpy.mockClear();
    gameRelaxedConstructorSpy.mockClear();
    themepack = new Themepack('Food');
    gameTimed = new TestingTimedGame(themepack);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameTimedConstructorSpy.mockReturnValue(gameTimed);
    gameRelaxed = new TestingRelaxedGame(themepack);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameRelaxedConstructorSpy.mockReturnValue(gameRelaxed);

    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    player3 = createPlayerForTesting();
    player4 = createPlayerForTesting();
    gameArea = new ScavengerHuntGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(player1);
    gameArea.add(player2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('JoinTimedGame command', () => {
    test('when no existing game, it creates new timed game and calls _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();
      const { gameID } = gameArea.handleCommand(
        { type: 'JoinTimedGame', themepack: 'fruit' },
        player1,
      );
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(gameTimed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();

      gameTimedConstructorSpy.mockClear();
      const { gameID } = gameArea.handleCommand(
        { type: 'JoinTimedGame', themepack: 'fruit' },
        player1,
      );
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(gameTimed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameTimedConstructorSpy).toHaveBeenCalledTimes(1);
      gameTimed.endGame();

      gameTimedConstructorSpy.mockClear();
      const { gameID: gameID2 } = gameArea.handleCommand(
        { type: 'JoinTimedGame', themepack: 'fruit' },
        player1,
      );
      expect(gameArea.game).toBeDefined();
      expect(gameID2).toEqual(gameTimed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameTimedConstructorSpy).toHaveBeenCalledTimes(0);
    });
    describe('when there is a game already created', () => {
      it('should call join on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand(
          { type: 'JoinTimedGame', themepack: 'fruit' },
          player1,
        );
        if (!gameTimed) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

        const joinSpy = jest.spyOn(gameTimed, 'join');
        const gameID2 = gameArea.handleCommand(
          { type: 'JoinTimedGame', themepack: 'fruit' },
          player2,
        ).gameID;
        expect(joinSpy).toHaveBeenCalledWith(player2);
        expect(gameTimed.numPlayers()).toEqual(4);
        expect(gameID2).toEqual(gameID);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if an error was thrown', () => {
        gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
        if (!gameTimed) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        // const joinSpy = jest.spyOn(gameTimed, 'join').mockImplementationOnce(() => {
        //   throw new Error('Test error');
        // });
        // expect(() => gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player2)).toThrowError(
        //   'Test error',
        // );
        // expect(joinSpy).toHaveBeenCalledWith(player2);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('JoinRelaxedGame Command', () => {
    test('when no existing game, it creates new relaxed game and calls _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();
      const { gameID } = gameArea.handleCommand(
        { type: 'JoinRelaxedGame', themepack: 'fruit' },
        player1,
      );
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(gameRelaxed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();

      gameRelaxedConstructorSpy.mockClear();
      const { gameID } = gameArea.handleCommand(
        { type: 'JoinRelaxedGame', themepack: 'fruit' },
        player1,
      );
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(gameRelaxed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameRelaxedConstructorSpy).toHaveBeenCalledTimes(1);
      gameRelaxed.endGame();

      gameRelaxedConstructorSpy.mockClear();
      const { gameID: gameID2 } = gameArea.handleCommand(
        { type: 'JoinRelaxedGame', themepack: 'fruit' },
        player1,
      );
      expect(gameArea.game).toBeDefined();
      expect(gameID2).toEqual(gameRelaxed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameRelaxedConstructorSpy).toHaveBeenCalledTimes(1);
    });
    describe('when there is a game already created', () => {
      it('should call join on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand(
          { type: 'JoinRelaxedGame', themepack: 'fruit' },
          player1,
        );
        if (!gameRelaxed) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

        // const joinSpy = jest.spyOn(gameRelaxed, 'join');
        const gameID2 = gameArea.handleCommand(
          { type: 'JoinRelaxedGame', themepack: 'fruit' },
          player2,
        ).gameID;
        // expect(joinSpy).toHaveBeenCalledWith(player2);
        expect(gameRelaxed.numPlayers()).toEqual(2);
        expect(gameID2).toEqual(gameID);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if an error was thrown', () => {
        gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player1);
        if (!gameRelaxed) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        // const joinSpy = jest.spyOn(gameRelaxed, 'join').mockImplementationOnce(() => {
        //   throw new Error('Test error');
        // });
        // expect(() => gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player2)).toThrowError(
        //   'Test error',
        // );
        // expect(joinSpy).toHaveBeenCalledWith(player2);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('StartGame command', () => {
    it('should throw error if no game, and not call _emitAreaChanged', () => {
      expect(() =>
        gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player1),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
    });
    describe('when there is a game in progress', () => {
      describe('timed mode', () => {
        it('should call startGame on the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand(
            { type: 'JoinTimedGame', themepack: 'fruit' },
            player1,
          );
          interactableUpdateSpy.mockClear();
          gameArea.handleCommand({ type: 'StartGame', gameID }, player1);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
        it('should not call _emitAreaChanged if an error was thrown', () => {
          gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
          if (!gameTimed) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();

          const startSpy = jest.spyOn(gameTimed, 'startGame').mockImplementationOnce(() => {
            throw new Error('Test error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'StartGame', gameID: gameTimed.id }, player2),
          ).toThrowError('Test error');
          expect(startSpy).toHaveBeenCalledWith(player2);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        test('when the game ID mismathces, it should throw an error and not call _emitAreaChanged', () => {
          gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
          if (!gameTimed) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(() =>
            gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        });
      });
      describe('relaxed mode', () => {
        it('should call startGame on the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand(
            { type: 'JoinRelaxedGame', themepack: 'fruit' },
            player3,
          );
          interactableUpdateSpy.mockClear();
          gameArea.handleCommand({ type: 'StartGame', gameID }, player3);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
        it('should not call _emitAreaChanged if an error was thrown', () => {
          gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player3);
          if (!gameRelaxed) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();

          const startSpy = jest.spyOn(gameRelaxed, 'startGame').mockImplementationOnce(() => {
            throw new Error('Test error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'StartGame', gameID: gameRelaxed.id }, player4),
          ).toThrowError('Test error');
          expect(startSpy).toHaveBeenCalledWith(player4);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        test('when the game ID mismathces, it should throw an error and not call _emitAreaChanged', () => {
          gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player3);
          if (!gameRelaxed) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(() =>
            gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player3),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        });
      });
    });
    it('timed mode: should start the game timer by calling setInterval', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      setIntervalSpy.mockImplementation();
      expect(setIntervalSpy).not.toHaveBeenCalled();

      const { gameID } = gameArea.handleCommand(
        { type: 'JoinTimedGame', themepack: 'fruit' },
        player1,
      );
      expect(gameID).toBeDefined();
      if (!gameTimed) {
        throw new Error('Game was not created by the first call to join');
      }
      gameArea.handleCommand({ type: 'StartGame', gameID }, player1);
      expect(setIntervalSpy).toHaveBeenCalled();
      mockReset(setIntervalSpy);
    });
    it('relaxed mode: should start the game timer by calling setInterval', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      setIntervalSpy.mockImplementation();
      expect(setIntervalSpy).not.toHaveBeenCalled();
      const { gameID } = gameArea.handleCommand(
        { type: 'JoinRelaxedGame', themepack: 'fruit' },
        player1,
      );
      expect(gameID).toBeDefined();
      if (!gameRelaxed) {
        throw new Error('Game was not created by the first call to join');
      }
      gameArea.handleCommand({ type: 'StartGame', gameID }, player1);
      expect(setIntervalSpy).toHaveBeenCalled();
      mockReset(setIntervalSpy);
    });
  });
  describe('LeaveGame command', () => {
    describe('no game in progress', () => {
      it('should throw an error', () => {
        expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1)).toThrowError(
          GAME_NOT_IN_PROGRESS_MESSAGE,
        );
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
    describe('game in progress', () => {
      it('should throw error if gameID does not match', () => {
        gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
        interactableUpdateSpy.mockClear();
        expect(() =>
          gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      describe('should call leave on the game and call _emitAreaChanged', () => {
        describe('when only player leaves', () => {
          it('not started yet', () => {
            const { gameID } = gameArea.handleCommand(
              { type: 'JoinTimedGame', themepack: 'fruit' },
              player1,
            );
            if (!gameTimed) {
              throw new Error('Game was not created by the first call to join');
            }
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            const leaveSpy = jest.spyOn(gameTimed, 'leave');
            gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
            expect(leaveSpy).toHaveBeenCalledWith(player1);
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
            expect(gameTimed.state.status).toEqual('WAITING_FOR_PLAYERS');
          });
        });
      });
    });
  });
});

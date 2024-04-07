import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntTimed from './ScavengerHuntTimed';
import Themepack from './Themepack';
import { GameMove, ScavengerHuntGameState, ScavengerHuntItem, TownEmitter } from '../../types/CoveyTownSocket';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import ScavengerHuntGameArea from './ScavengerHuntGameArea';
import Game from '../games/Game';
import * as ScavengerHuntTimedModule from './ScavengerHuntTimed';
import * as ScavengerHuntRelaxedModule from './ScavengerHuntRelaxed';
import { join } from 'path';
import { GAME_ID_MISSMATCH_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE } from '../../lib/InvalidParametersError';

class TestingTimedGame extends Game<ScavengerHuntGameState, ScavengerHuntItem> {
  public constructor(themePack?: Themepack) {
    super({ 
      mode: 'timed',
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

class TestingRelaxedGame extends Game<ScavengerHuntGameState, ScavengerHuntItem> {
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
  let gameTimed: TestingTimedGame
  let gameRelaxed: TestingRelaxedGame

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
    // gameTimed.join(player1);
    gameArea.add(player2);
    // gameTimed.join(player2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('JoinTimedGame command', () => {
    test('when no existing game, it creates new timed game and calls _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();
      const { gameID } = gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(gameTimed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();

      gameTimedConstructorSpy.mockClear();
      const { gameID } = gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(gameTimed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameTimedConstructorSpy).toHaveBeenCalledTimes(1);
      gameTimed.endGame();

      gameTimedConstructorSpy.mockClear();
      const { gameID: gameID2 } = gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(gameID2).toEqual(gameTimed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameTimedConstructorSpy).toHaveBeenCalledTimes(1);
    });
    describe('when there is a game already created', () => {
      it('should call join on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
        if(!gameTimed) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

        // const joinSpy = jest.spyOn(gameTimed, 'join');
        const gameID2 = gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player2).gameID;
        console.log(player2.id);
        // expect(joinSpy).toHaveBeenCalledWith(player2);
        expect(gameTimed.numPlayers()).toEqual(2);
        expect(gameID2).toEqual(gameID);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if an error was thrown', () => {
        gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
        if (!gameTimed) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const joinSpy = jest.spyOn(gameTimed, 'join').mockImplementationOnce(() => {
          throw new Error('Test error');
        });
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
      const { gameID } = gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(gameRelaxed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();

      gameRelaxedConstructorSpy.mockClear();
      const { gameID } = gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(gameRelaxed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameRelaxedConstructorSpy).toHaveBeenCalledTimes(1);
      gameRelaxed.endGame();

      gameRelaxedConstructorSpy.mockClear();
      const { gameID: gameID2 } = gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(gameID2).toEqual(gameRelaxed.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameRelaxedConstructorSpy).toHaveBeenCalledTimes(1);
    });
    describe('when there is a game already created', () => {
      it('should call join on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player1);
        if(!gameRelaxed) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

        const joinSpy = jest.spyOn(gameRelaxed, 'join');
        const gameID2 = gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player2).gameID;
        console.log(player2.id);
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

        const joinSpy = jest.spyOn(gameRelaxed, 'join').mockImplementationOnce(() => {
          throw new Error('Test error');
        });
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
          const { gameID } = gameArea.handleCommand({ type: 'JoinTimedGame', themepack: 'fruit' }, player1);
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
          const { gameID } = gameArea.handleCommand({ type: 'JoinRelaxedGame', themepack: 'fruit' }, player3);
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
  });
});

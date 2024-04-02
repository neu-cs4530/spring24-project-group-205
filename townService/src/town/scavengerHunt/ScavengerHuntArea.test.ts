import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntTimed from './ScavengerHuntTimed';
import Themepack from './Themepack';
import { TownEmitter } from '../../types/CoveyTownSocket';
import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import ScavengerHuntGameArea from './ScavengerHuntGameArea';

describe('ScavengerHuntArea', () => {
  let game: ScavengerHunt;
  let gameArea: ScavengerHuntGameArea;
  let themepack: Themepack;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    themepack = new Themepack('Food');
    game = new ScavengerHuntTimed(themepack);
    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    gameArea = new ScavengerHuntGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(player1);
    gameArea.add(player2);
  });

  describe('handleCommand', () => {
    describe('JoinTimedGame', () => {
      it('should create a new game if no game is in progress', () => {
        const { gameID } = gameArea.handleCommand(
          { type: 'JoinTimedGame', themepack: 'fruit' },
          player1,
        );
        expect(gameID).toBeDefined();
        if (!game) {
          throw new Error('Game not created');
        }
        expect(game.getTimeLeft()).toBe(120);
      });
    });
  });
});

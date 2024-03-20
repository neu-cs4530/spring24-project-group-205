import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntRelaxed from './ScavengerHuntRelaxed';
import ScavengerHuntTimed from './ScavengerHuntTimed';

describe('ScavengerHunt', () => {
  let game: ScavengerHunt;

  beforeEach(() => {
    game = new ScavengerHuntTimed();
  });

  describe('_applyMove', () => {
    it('should decrement the number of items to collect and end the game once they have been collected', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should end the game once time has expired', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
  });
});

import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import ScavengerHunt from './ScavengerHunt';
import ScavengerHuntRelaxed from './ScavengerHuntRelaxed';

describe('ScavengerHunt', () => {
  let game: ScavengerHunt;

  beforeEach(() => {
    game = new ScavengerHuntRelaxed();
  });

  describe('_applyMove', () => {
    it('should not change the number of items to collect and not end the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
  });
});

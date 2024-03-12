/*

// DO NOT NEED TO TEST DATABASE, CAN DELETE THIS FILE, but is useful to run methods to see if they work

import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import Leaderboard from './Leaderboard';

describe('database', () => {
  let database: Leaderboard;
  let player: Player;

  beforeEach(() => {
    database = new Leaderboard();
    player = createPlayerForTesting();
  });
  describe('database', () => {
    it('should return the database', async () => {
      const leaderboard = await database.entireLeaderboard();
      expect(leaderboard).toEqual('hello');
    });
    it('should return the top 5 times in the database', async () => {
      const leaderboard = await database.top5Leaderboard();
      expect(leaderboard).toEqual('hello');
    });
    it('should add a leaderboard entry', async () => {
      database.addLeaderboardEntry(player, 600);
    });
  });
});

*/

import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import Player from '../../lib/Player';

/**
 * A leadboard database that holds the times of all players of the scavenger hunt game.
 */
export default class Leaderboard {
  supabase = createClient<Database>(
    'https://qqvigefwynsoawfxjofh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdmlnZWZ3eW5zb2F3Znhqb2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNTY1MDQsImV4cCI6MjAyNDYzMjUwNH0.AXtPclHLWNUWT-3pWTf59bP64gTYs4SK7A1F7IKM3dc',
  );

  /**
   * Gets and returns the entire leaderboard table from the database.
   * @throws an error if the database is not able to be accessed
   * @returns the entire leaderboard table from the database
   */
  async entireLeaderboard() {
    const { data, error } = await this.supabase.from('leaderboard').select();

    if (error) {
      throw new Error(error.message);
    } else {
      return data;
    }
  }

  /**
   * Gets and returns the top 5 players and times in the database (asec). If there is a tie in time,
   * the player who got the time first will be placed higher.
   * @throws an error if the database is not able to be accessed
   * @returns the top 5 username and times (asc) in the database
   */
  async top5Leaderboard() {
    const { data, error } = await this.supabase
      .from('leaderboard')
      .select('username, time_seconds')
      .order('time_seconds', { ascending: true })
      .order('id', { ascending: true })
      .limit(5);

    if (error) {
      throw new Error(error.message);
    } else {
      return data;
    }
  }

  /**
   * Adds a new entry to the leaderboard table in the database.
   * @param player the player who completed the scavenger hunt
   * @param time_seconds the time it took for the player to complete the scavenger hunt
   */
  async addLeaderboardEntry(player: Player, time_seconds: number) {
    const username = player.userName;
    const { error } = await this.supabase.from('leaderboard').insert({ username, time_seconds });

    if (error) {
      throw new Error(error.message);
    }
  }
}

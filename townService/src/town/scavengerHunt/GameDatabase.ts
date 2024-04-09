import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import Player from '../../lib/Player';

/**
 * A leadboard database that holds the times of all players of the scavenger hunt game.
 */
export default class GameDatabase {
  supabase = createClient<Database>(
    'https://qqvigefwynsoawfxjofh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdmlnZWZ3eW5zb2F3Znhqb2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNTY1MDQsImV4cCI6MjAyNDYzMjUwNH0.AXtPclHLWNUWT-3pWTf59bP64gTYs4SK7A1F7IKM3dc',
  );

  /**
   * Gets and returns the top 5 players and times in the database (asec). If there is a tie in time,
   * the player who got the time first will be placed higher.
   * @throws an error if the database is not able to be accessed
   * @returns the top 5 username and times (asc) in the database
   */
  async top5TimedLeaderboard() {
    const { data, error } = await this.supabase
      .from('timed_leaderboard')
      .select('username, objects_found')
      .order('objects_found', { ascending: false })
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
  async addTimedLeaderboardEntry(player: Player, objects_found: number) {
    const username = player.userName;
    const { error } = await this.supabase
      .from('timed_leaderboard')
      .insert({ username, objects_found });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Gets and returns the top 5 players and times in the database (asec). If there is a tie in time,
   * the player who got the time first will be placed higher.
   * @throws an error if the database is not able to be accessed
   * @returns the top 5 username and times (asc) in the database
   */
  async top5RelaxedLeaderboard() {
    const { data, error } = await this.supabase
      .from('relaxed_leaderboard')
      .select('username, objects_found')
      .order('objects_found', { ascending: false })
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
  async addRelaxedLeaderboardEntry(player: Player, objects_found: number) {
    const username = player.userName;
    const { error } = await this.supabase
      .from('relaxed_leaderboard')
      .insert({ username, objects_found });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Adds game details to the leaderboard table in the database.
   * @param player the player who completed the scavenger hunt
   * @param time_seconds the time it took for the player to complete the scavenger hunt
   */
  async addGameDetails(
    game_mode: string | undefined,
    themepack: string | undefined,
    game_start_time: number | undefined,
    player_count: number,
  ) {
    const { error } = await this.supabase
      .from('game_details')
      .insert({ game_mode, themepack, game_start_time, player_count });

    if (error) {
      throw new Error(error.message);
    }
  }
}

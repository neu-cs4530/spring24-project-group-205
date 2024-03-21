import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_OVER_MESSAGE,
  INVALID_MOVE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMove,
  PlayerLocation,
  ScavengerHuntGameState,
  ScavengerHuntItem,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Game from '../games/Game';
import { generateHint, randomLocation } from './scavengerHuntUtils';

export default class ScavengerHunt extends Game<ScavengerHuntGameState, ScavengerHuntItem> {
  public constructor() {
    super({
      items: [],
      status: 'WAITING_TO_START',
    });
  }

  public startGame(player: Player, interactables: InteractableArea[]): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.scavenger) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
      status: 'IN_PROGRESS',
    };
    // Use the utility function to generate random locations for items
    this._assignRandomLocations(interactables);
  }

  private _assignRandomLocations(interactables: InteractableArea[]): void {
    if (this.state.items.length === 0) {
      throw new Error('No items available in the scavenger hunt');
    }
    this.state.items.forEach(item => {
      if (!item.location) {
        randomLocation(item, interactables);
      }
    });
  }

  public applyMove(move: GameMove<ScavengerHuntItem>): void {
    if (!this.state.scavenger) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (move.move.foundBy) {
      throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
    }
    if (this.state.status === 'OVER') {
      throw new InvalidParametersError(GAME_OVER_MESSAGE);
    }
    move.move.foundBy = this.state.scavenger;
    this.state = {
      ...this.state,
      items: this.state.items.map(item => (item.id === move.move.id ? move.move : item)),
    };
    if (this.state.items.every(item => item.foundBy)) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.scavenger,
      };
    }
  }

  protected _join(player: Player): void {
    if (this.state.scavenger === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    } else if (!this.state.scavenger) {
      this.state = {
        ...this.state,
        scavenger: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
  }

  protected _leave(player: Player): void {
    if (this.state.scavenger !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
      status: 'OVER',
    };
  }

  // Method to generate hint based on player location
  public generateHint(player: Player): string {
    const playerLocation = player.location;
    const closestItemLocation = this._getClosestItemLocation(playerLocation);
    if (closestItemLocation) {
      return generateHint(playerLocation, closestItemLocation);
    }
    return 'No items found.';
  }

  private _getClosestItemLocation(playerLocation: PlayerLocation): PlayerLocation | null {
    let closestItemLocation: { x: number; y: number } | null = null;
    let closestDistance = Number.MAX_SAFE_INTEGER;

    this.state.items.forEach(item => {
      if (item.location) {
        const distance = Math.sqrt(
          (playerLocation.x - item.location.x) ** 2 + (playerLocation.y - item.location.y) ** 2,
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestItemLocation = item.location;
        }
      }
    });

    return closestItemLocation;
  }
}

import GameArea from '../games/GameArea';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import ScavengerHunt from './ScavengerHunt';
import Player from '../../lib/Player';

export default class ScavengerHuntGameArea extends GameArea<ScavengerHunt> {
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }

  protected getType(): InteractableType {
    return 'ScavengerHuntArea';
  }
}

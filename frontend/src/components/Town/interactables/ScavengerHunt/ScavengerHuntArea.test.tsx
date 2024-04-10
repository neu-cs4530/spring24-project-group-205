import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import PlayerController from '../../../../classes/PlayerController';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import { randomLocation } from '../../../../TestUtils';
import { GameArea, ScavengerHuntGameState, GameStatus } from '../../../../types/CoveyTownSocket';
import PhaserGameArea from '../GameArea';
import ScavengerHuntAreaController from '../../../../classes/interactable/ScavengerHuntAreaController';
import ScavengerHuntArea from './ScavengerHuntArea';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockGameArea = mock<PhaserGameArea>();
mockGameArea.getData.mockReturnValue('ScavengerHunt');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

class MockScavengerHuntAreaController extends ScavengerHuntAreaController {
  public constructor() {
    super(nanoid(), mock<GameArea<ScavengerHuntGameState>>(), mock<TownController>());
  }

  get gamemode() {
    return 'timed';
  }

  get themepack() {
    return { name: 'food', items: [] };
  }

  get status(): GameStatus {
    return 'WAITING_FOR_PLAYERS';
  }
}
describe('Scavenger Hunt Area', () => {
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  const gameAreaController = new MockScavengerHuntAreaController();

  function renderScavengerHuntArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <ScavengerHuntArea interactableID={nanoid()} />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  beforeEach(() => {
    ourPlayer = new PlayerController('player x', 'player x', randomLocation());
    mockGameArea.name = nanoid();
    mockReset(townController);
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    mockToast.mockClear();
  });
  describe('Render UI', () => {
    it('shows game modes', () => {
      renderScavengerHuntArea();
      expect(screen.queryByText('Game Mode:')).toBeInTheDocument();
    });
    it('shows leaderboard', () => {
      renderScavengerHuntArea();
      expect(screen.queryByText('Timed Leaderboard')).toBeInTheDocument();
      expect(screen.queryByText('Relaxed Leaderboard')).toBeInTheDocument();
    });
    it('shows themes', () => {
      renderScavengerHuntArea();
      expect(screen.queryByText('Food')).toBeInTheDocument();
      expect(screen.queryByText('Emojis')).toBeInTheDocument();
      expect(screen.queryByText('Egg')).toBeInTheDocument();
    });
    it('shows players', () => {
      renderScavengerHuntArea();
      expect(screen.queryByText('Current Players:')).toBeInTheDocument();
      expect(screen.queryByText('Currently no players have joined the game.')).toBeInTheDocument();
    });
    it('shows start and end game buttons', () => {
      renderScavengerHuntArea();
      expect(screen.queryByText('Start Game')).toBeInTheDocument();
      expect(screen.queryByText('End Game')).toBeInTheDocument();
    });
  });
});

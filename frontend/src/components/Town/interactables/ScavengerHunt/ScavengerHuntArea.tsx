import { Button, Flex, Heading, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ScavengerHuntAreaController from '../../../../classes/interactable/ScavengerHuntAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';

/**
 * The ScavengerHuntArea component renders the Scavenger Hunt game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the ScavengerHuntAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A radio button picker for choosing the game mode (timed or relaxed)
 * - A leaderboard of the game results for the selected game mode
 * - A radio button picker for choosing the theme (fruit, dessert, or animals)
 * - A button to request a hint
 * - A list of hints that the player has requested
 * - A button to start the game
 * - A button to end the game
 *
 */
export default function ScavengerHuntArea({
  interactableID,
  mode,
}: {
  interactableID: InteractableID;
  mode: string;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<ScavengerHuntAreaController>(interactableID);
  const townController = useTownController();
  const toast = useToast();

  // Placeholder data for the leaderboard
  const leaderboardData = [
    { username: 'Player1', count: 10 },
    { username: 'Player2', count: 9 },
    { username: 'Player3', count: 8 },
    { username: 'Player4', count: 7 },
    { username: 'Player5', count: 6 },
  ];

  const [selectedOptionTheme, setSelectedOptionTheme] = useState('');

  const handleOptionChangeTheme = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSelectedOptionTheme(event.target.value);
  };

  useEffect(() => {}, [townController, gameAreaController, toast]);

  return (
    <>
      <Flex>
        <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px', marginBottom: '10px' }}>
          Game Mode: {mode === 'timed' ? 'Timed' : 'Relaxed'}
        </Heading>
      </Flex>
      <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px' }}>
        Leaderboard:
      </Heading>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '10px' }}>
        <thead>
          <tr>
            <th style={{ width: '33%' }}>Rank</th>
            <th style={{ width: '33%' }}>Username</th>
            <th style={{ width: '33%' }}>Objects Collected</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((player, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ textAlign: 'center' }}>{index + 1}</td>
              <td style={{ textAlign: 'center' }}>{player.username}</td>
              <td style={{ textAlign: 'center' }}>{player.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Flex>
        <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px', marginBottom: '10px' }}>
          Theme:
        </Heading>
        {mode === 'timed' ? (
          <div className='radio-group'>
            <label style={{ marginRight: '10px', fontSize: '20px' }}>
              <input
                type='radio'
                name='theme'
                value='fruit'
                checked={selectedOptionTheme === 'fruit'}
                onChange={handleOptionChangeTheme}
              />{' '}
              Fruit
            </label>
            <label style={{ marginRight: '10px', fontSize: '20px' }}>
              <input
                type='radio'
                name='theme'
                value='dessert'
                checked={selectedOptionTheme === 'dessert'}
                onChange={handleOptionChangeTheme}
              />{' '}
              Dessert
            </label>
            <label style={{ marginRight: '10px', fontSize: '20px' }}>
              <input
                type='radio'
                name='theme'
                value='animals'
                checked={selectedOptionTheme === 'animals'}
                onChange={handleOptionChangeTheme}
              />{' '}
              Animals
            </label>
          </div>
        ) : (
          <div className='radio-group'>
            <label style={{ marginRight: '10px', fontSize: '20px' }}>
              <input
                type='radio'
                name='theme'
                value='sushi'
                checked={selectedOptionTheme === 'sushi'}
                onChange={handleOptionChangeTheme}
              />{' '}
              Sushi
            </label>
            <label style={{ marginRight: '10px', fontSize: '20px' }}>
              <input
                type='radio'
                name='theme'
                value='vegetables'
                checked={selectedOptionTheme === 'vegetables'}
                onChange={handleOptionChangeTheme}
              />{' '}
              Vegetables
            </label>
            <label style={{ marginRight: '10px', fontSize: '20px' }}>
              <input
                type='radio'
                name='theme'
                value='fish'
                checked={selectedOptionTheme === 'fish'}
                onChange={handleOptionChangeTheme}
              />{' '}
              Fish
            </label>
          </div>
        )}
      </Flex>
      <Flex alignItems='center'>
        <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px' }}>
          Hints:
        </Heading>
        <Button>Request Hint</Button>
      </Flex>
      <>
        Your hints will be here. Please begin the game and request a hint if you would like one. All
        players will be able to see your requested hint and will be notified of the hint.{' '}
      </>
      <Flex>
        <Button style={{ marginRight: '10px', marginTop: '10px' }}>Join Game</Button>
      </Flex>
      <Flex>
        {' '}
        <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px' }}>
          Current Players:
        </Heading>
        Currently no players have joined the game.
      </Flex>
      <Flex>
        <Button style={{ marginRight: '10px', marginTop: '10px' }}>Start Game</Button>
        <Button style={{ marginTop: '10px' }}>End Game</Button>
      </Flex>
    </>
  );
}

import { Button, Container, Flex, Heading, List, ListItem, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ScavengerHuntAreaController from '../../../../classes/interactable/ScavengerHuntAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';

export default function ScavengerHuntArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<ScavengerHuntAreaController>(interactableID);
  const townController = useTownController();
  const toast = useToast();

  // Placeholder data for the leaderboard
  const leaderboardData = [
    { username: 'Player1', time: 100 },
    { username: 'Player2', time: 90 },
    { username: 'Player3', time: 80 },
    { username: 'Player4', time: 70 },
    { username: 'Player5', time: 60 },
  ];

  const [selectedOption, setSelectedOption] = useState('timed');

  const handleOptionChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSelectedOption(event.target.value);
  };

  const [selectedOptionTheme, setSelectedOptionTheme] = useState('fruit');

  const handleOptionChangeTheme = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSelectedOptionTheme(event.target.value);
  };

  useEffect(() => {}, [townController, gameAreaController, toast]);

  return (
    <>
      <Flex>
        <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px', marginBottom: '10px' }}>
          Game Mode:
        </Heading>
        <div className='radio-group'>
          <label style={{ marginRight: '10px', fontSize: '20px' }}>
            <input
              type='radio'
              name='gameMode'
              value='timed'
              checked={selectedOption === 'timed'}
              onChange={handleOptionChange}
            />{' '}
            Timed
          </label>
          <label style={{ marginRight: '10px', fontSize: '20px' }}>
            <input
              type='radio'
              name='gameMode'
              value='relaxed'
              checked={selectedOption === 'relaxed'}
              onChange={handleOptionChange}
            />{' '}
            Relaxed
          </label>
        </div>
      </Flex>
      <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px' }}>
        Leaderboard:
      </Heading>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '10px' }}>
        <thead>
          <tr>
            <th style={{ width: '33%' }}>Rank</th>
            <th style={{ width: '33%' }}>Username</th>
            <th style={{ width: '33%' }}>Time (Seconds)</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((player, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ textAlign: 'center' }}>{index + 1}</td>
              <td style={{ textAlign: 'center' }}>{player.username}</td>
              <td style={{ textAlign: 'center' }}>{player.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Flex>
        <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px', marginBottom: '10px' }}>
          Theme:
        </Heading>
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
      </Flex>
      <Flex alignItems='center'>
        <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px' }}>
          Hints:
        </Heading>
        <Button>Request Hint</Button>
      </Flex>
      <>Your hints will be here. Please begin the game and request a hint if you would like one.</>
      <Flex>
        <Button style={{ marginRight: '10px', marginTop: '10px' }}>Start Game</Button>
        <Button style={{ marginTop: '10px' }}>End Game</Button>
      </Flex>
    </>
  );
}

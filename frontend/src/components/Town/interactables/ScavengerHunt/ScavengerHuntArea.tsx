import React, { useEffect, useState } from 'react';
import { Button, Flex, Heading, useToast } from '@chakra-ui/react';
import { InteractableID, ScavengerHuntItem } from '../../../../types/CoveyTownSocket';
import ScavengerHuntAreaController from '../../../../classes/interactable/ScavengerHuntAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';

export default function ScavengerHuntArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<ScavengerHuntAreaController>(interactableID);
  const townController = useTownController();
  const toast = useToast();

  const [selectedOption, setSelectedOption] = useState('timed');
  const [selectedOptionTheme, setSelectedOptionTheme] = useState('fruit');
  const [items, setItems] = useState<ScavengerHuntItem[]>(gameAreaController.items);

  useEffect(() => {
    if (gameAreaController) {
      gameAreaController.addListener('itemsChanged', setItems);
    }

    return () => {
      gameAreaController.removeListener('itemsChanged', setItems);
    };
  }, [gameAreaController]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleOptionChangeTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOptionTheme(event.target.value);
  };

  const handleStartGame = () => {
    // Call startGame method on controller
    gameAreaController?.startGame().catch(error => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });
  };

  const handleEndGame = () => {
    // Call endGame method on controller (if available)
    // gameAreaController?.endGame();
  };

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
          {/* Placeholder leaderboard data */}
          <tr>
            <td style={{ textAlign: 'center' }}>1</td>
            <td style={{ textAlign: 'center' }}>Player1</td>
            <td style={{ textAlign: 'center' }}>100</td>
          </tr>
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
        <Button style={{ marginRight: '10px', marginTop: '10px' }} onClick={handleStartGame}>
          Start Game
        </Button>
        <Button style={{ marginTop: '10px' }} onClick={handleEndGame}>
          End Game
        </Button>
      </Flex>
    </>
  );
}

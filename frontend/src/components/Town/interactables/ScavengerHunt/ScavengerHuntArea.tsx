import React, { useEffect, useState } from 'react';
import { Button, Flex, Heading, useToast } from '@chakra-ui/react';
import { GameStatus, InteractableID, ScavengerHuntItem } from '../../../../types/CoveyTownSocket';
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
  const [scavenger, setScavenger] = useState(gameAreaController.scavenger);
  const [items, setItems] = useState<ScavengerHuntItem[]>(gameAreaController.items);
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [joiningGame, setJoiningGame] = useState(false); // Define joiningGame state

  useEffect(() => {
    if (gameAreaController) {
      const updateGameState = () => {
        setScavenger(gameAreaController.scavenger);
        setItems(gameAreaController.items);
        setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      };
      gameAreaController.addListener('gameUpdated', updateGameState);
      return () => {
        gameAreaController.removeListener('gameUpdated', updateGameState);
      };
    }
  }, [gameAreaController]);

  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = <>Game in progress, {items} collected</>;
  }

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleOptionChangeTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOptionTheme(event.target.value);
  };

  const handleStartGame = async () => {
    setJoiningGame(true);
    try {
      await gameAreaController.startGame();
    } catch (err) {
      toast({
        title: 'Error starting game',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
    setJoiningGame(false);
  };

  const handleEndGame = () => {
    const onGameEnd = () => {
      const winner = gameAreaController.winner;
      if (winner === townController.ourPlayer) {
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost :(`,
          status: 'error',
        });
      }
      gameAreaController.addListener('gameEnd', onGameEnd);
    };
    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
    };
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
        <Button
          style={{ marginRight: '10px', marginTop: '10px' }}
          onClick={handleStartGame}
          isLoading={joiningGame}
          disabled={joiningGame}>
          Start Game
        </Button>
        <Button style={{ marginTop: '10px' }} onClick={handleEndGame}>
          End Game
        </Button>
      </Flex>
    </>
  );
}

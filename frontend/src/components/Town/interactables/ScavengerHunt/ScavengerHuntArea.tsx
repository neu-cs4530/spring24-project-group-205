import {
  Alert,
  AlertIcon,
  Text,
  Image,
  Button,
  VStack,
  Center,
  HStack,
  Heading,
  ChakraProvider,
  TabPanel,
  TabPanels,
  Tabs,
  TabList,
  Tab,
  TableContainer,
  Table,
  Box,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ScavengerHuntAreaController from '../../../../classes/interactable/ScavengerHuntAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import theme from './theme';

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
 * - A radio button picker for choosing the theme (food, dessert, or animals)
 * - A button to request a hint
 * - A list of hints that the player has requested
 * - A button to start the game
 * - A button to end the game
 *
 */
export default function ScavengerHuntArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<ScavengerHuntAreaController>(interactableID);
  const toast = useToast();

  const [joiningGame, setJoiningGame] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]);

  useEffect(() => {
    // Add event listeners or any other necessary setup here
    return () => {
      // Clean up event listeners or any other teardown here
    };
  }, [gameAreaController]);

  const handleJoinGame = async () => {
    setJoiningGame(true);
    try {
      await gameAreaController.joinTimedGame('food');
    } catch (err) {
      toast({
        title: 'Error joining game',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
    setJoiningGame(false);
  };

  const handleStartGame = async () => {
    setStartingGame(true);
    try {
      await gameAreaController.startGame();
    } catch (err) {
      toast({
        title: 'Error starting game',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
    setStartingGame(false);
  };

  const handleEndGame = async () => {
    try {
      await gameAreaController.leaveGame();
    } catch (err) {
      toast({
        title: 'Error ending game',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
  };

  const modeSet = false;

  // Placeholder data for the leaderboard
  const leaderboardData = [
    { username: 'Player1', count: 10 },
    { username: 'Player2', count: 9 },
    { username: 'Player3', count: 8 },
    { username: 'Player4', count: 7 },
    { username: 'Player5', count: 6 },
  ];

  return (
    <ChakraProvider theme={theme}>
      <Tabs variant='soft-rounded' colorScheme='orange'>
        <TabList>
          <Tab>Details</Tab>
          <Tab>Mode & Theme</Tab>
          <Tab>Game</Tab>
          <Tab>Leaderboards</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Image src='/logo.png' alt='Scavenger Hunt' />
            <Box boxSize='20px'> </Box>
            <Text fontSize='lg'>
              Welcome to Scavenge, a scavanger hunt game in covey.town! During this game you will
              walk around the town picking up items. ... explain what a scavnegr hunt is. Describe
              tabs, modes, themes, how only first player to join can select the mode and theme, and
              how to start and join the game.
            </Text>
          </TabPanel>
          <TabPanel>
            {modeSet ? (
              <Text>
                Another player has already picked the game mode and theme. Please proceed to the
                next tab to join the game!
              </Text>
            ) : (
              <>
                <Center>
                  <VStack>
                    <Heading as='h2' size='lg'>
                      Game Mode: ...
                    </Heading>
                    <HStack>
                      <VStack>
                        <Image src='/timed.png' alt='Scavenger Hunt' boxSize='100px' />
                        <Button>Timed</Button>
                      </VStack>
                      <VStack>
                        <Image src='/relaxed.png' alt='Scavenger Hunt' boxSize='100px' />
                        <Button>Relaxed</Button>
                      </VStack>
                    </HStack>
                  </VStack>
                </Center>
                <Box boxSize='20px'> </Box>
                <Center>
                  <VStack>
                    <Heading as='h2' size='lg'>
                      Theme: ...
                    </Heading>
                    <HStack>
                      <VStack>
                        <Image src='/relaxed.png' alt='Scavenger Hunt' boxSize='100px' />
                        <Button>Food</Button>
                      </VStack>
                      <VStack>
                        <Image src='/relaxed.png' alt='Scavenger Hunt' boxSize='100px' />
                        <Button>Ghosts</Button>
                      </VStack>
                      <VStack>
                        <Image src='/relaxed.png' alt='Scavenger Hunt' boxSize='100px' />
                        <Button>Animals</Button>
                      </VStack>
                    </HStack>
                  </VStack>
                </Center>
              </>
            )}
          </TabPanel>
          <TabPanel>
            <Center>
              <HStack>
                <VStack>
                  <Image src='/relaxed.png' alt='Scavenger Hunt' boxSize='100px' />
                  <Heading as='h3' size='md'>
                    Timed Game
                  </Heading>
                </VStack>
                <Box boxSize='20px'> </Box>
                <VStack>
                  <Image src='/relaxed.png' alt='Scavenger Hunt' boxSize='100px' />
                  <Heading as='h3' size='md'>
                    Food Theme
                  </Heading>
                </VStack>
              </HStack>
            </Center>
            <Box boxSize='20px'> </Box>
            <HStack>
              <Button onClick={handleJoinGame} isLoading={joiningGame} disabled={joiningGame}>
                {joiningGame ? 'Joining Game...' : 'Join Game'}{' '}
              </Button>
              <Button onClick={handleStartGame} disabled={startingGame}>
                {startingGame ? 'Starting Game...' : 'Start Game'}
              </Button>
              <Button>Leave Game</Button>
              <Button onClick={handleEndGame}>End Game</Button>
              <Button>Request Hint</Button>
            </HStack>
            <Box boxSize='20px'> </Box>
            <VStack>
              <Heading as='h1' style={{ marginRight: '10px', fontSize: '25px' }}>
                Current Players:
              </Heading>
              {joinedPlayers.length > 0 ? (
                <ul>
                  {joinedPlayers.map(player => (
                    <li key={player}>{player}</li>
                  ))}
                </ul>
              ) : (
                <span>Currently no players have joined the game.</span>
              )}
            </VStack>
            <Box boxSize='20px'> </Box>
            <Alert status='info'>
              <AlertIcon />
              This is a hint. This box should only appear when a hint is requested.
            </Alert>
          </TabPanel>
          <TabPanel>
            <Tabs isFitted variant='enclosed'>
              <TabList mb='1em'>
                <Tab>Timed Leaderboard</Tab>
                <Tab>Relaxed Leaderboard</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <TableContainer>
                    <Table variant='simple'>
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
                    </Table>
                  </TableContainer>
                </TabPanel>
                <TabPanel>
                  <TableContainer>
                    <Table variant='simple'>
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
                    </Table>
                  </TableContainer>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ChakraProvider>
  );
}

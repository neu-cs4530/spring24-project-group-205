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
 * - A radio button picker for choosing the theme (food, emojis, or egg)
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

  const [themepack, setThemepack] = useState('');
  const [mode, setMode] = useState('');

  useEffect(() => {
    const selectedGameMode = gameAreaController.gamemode;
    if (selectedGameMode) {
      setMode(selectedGameMode);
    }
  }, [gameAreaController.gamemode]);

  useEffect(() => {
    const selectedThemepack = gameAreaController.themepack;
    if (selectedThemepack) {
      setThemepack(selectedThemepack.name);
    }
  }, [gameAreaController.themepack]);

  const handleClick = (newThemepack: string) => {
    if (!themepack) {
      setThemepack(newThemepack);
    }
  };

  const handleClickMode = (newMode: string) => {
    if (!mode) {
      setMode(newMode);
    }
  };

  const [joiningGame, setJoiningGame] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]);

  useEffect(() => {
    const playersJoined = gameAreaController.players.map(player => player.userName);
    if (playersJoined) {
      setJoinedPlayers(playersJoined);
    }
  }, [gameAreaController.players]);

  useEffect(() => {
    // Add event listeners or any other necessary setup here
    return () => {
      // Clean up event listeners or any other teardown here
    };
  }, [gameAreaController]);

  const handleJoinGame = async () => {
    setJoiningGame(true);
    try {
      if (mode === '' || themepack === '') {
        throw new Error('Please select a game mode and theme before joining the game.');
      }
      if (mode === 'timed') {
        await gameAreaController.joinTimedGame(themepack);
      } else if (mode === 'relaxed') {
        await gameAreaController.joinRelaxedGame(themepack);
      } else {
        throw new Error('Please select a game mode before joining the game.');
      }
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
      await gameAreaController._renderInitialItems();
    } catch (err) {
      toast({
        title: 'Error starting game',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
    setStartingGame(false);
  };

  const handleLeaveGame = async () => {
    try {
      await gameAreaController.leaveGame();
    } catch (err) {
      toast({
        title: 'Error leaving game',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
  };

  const handleEndGame = async () => {
    try {
      await gameAreaController.endGame();
    } catch (err) {
      toast({
        title: 'Error ending game',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
  };

  const handleRequestHint = async () => {
    try {
      await gameAreaController.requestHint();
    } catch (err) {
      toast({
        title: 'Error requesting hint',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
  };

  // Placeholder data for the leaderboard
  const leaderboardData = [
    { username: 'Player1', count: 10 },
    { username: 'Player2', count: 9 },
    { username: 'Player3', count: 8 },
    { username: 'Player4', count: 7 },
    { username: 'Player5', count: 6 },
  ];

  return (
    <ChakraProvider>
      <Tabs variant='soft-rounded' colorScheme='orange'>
        <TabList>
          <Tab>Details</Tab>
          <Tab>Mode & Theme</Tab>
          <Tab>Game</Tab>
          <Tab>Leaderboards</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Image src='/logo.png' alt='Scavenge logo' />
            <Box boxSize='20px'> </Box>
            <Text fontSize='lg'>
              Welcome to Scavenge, a scavanger hunt game in covey.town! During this game you will
              walk be able to explore the town by competing against players to see who can pick up
              the most items. There are two different game modes to choose from: Timed and Relaxed.
              In the timed mode, you have four minutes to pick up as many items as you can. In the
              relaxed mode, you can take your time and pick up as many items as you can before
              someone ends the game. You can also choose from different themes, such as food,
              animals. Only the first player to join the game can choose the game mode and theme. If
              you are the first player, please select a game mode and theme and then join the game.
              As many as 10 players can join the game, but you can also play by yourself. Once all
              players have joined the game, the first player can start the game. Good luck!
            </Text>
          </TabPanel>
          <TabPanel>
            {joinedPlayers.length > 0 ? (
              <Text>
                Another player has already picked the game mode and theme. Please proceed to the
                next tab to join the game!
              </Text>
            ) : (
              <>
                <Center>
                  <VStack>
                    <Heading as='h2' size='lg'>
                      Game Mode: {mode}
                    </Heading>
                    <HStack>
                      <VStack>
                        <Image src='/timed.png' alt='timed' boxSize='100px' />
                        <Button
                          onClick={() => handleClickMode('timed')}
                          colorScheme={mode === 'timed' ? 'orange' : 'gray'}>
                          Timed
                        </Button>
                      </VStack>
                      <VStack>
                        <Image src='/relaxed.png' alt='relaxed' boxSize='100px' />
                        <Button
                          onClick={() => handleClickMode('relaxed')}
                          colorScheme={mode === 'relaxed' ? 'orange' : 'gray'}>
                          Relaxed
                        </Button>
                      </VStack>
                    </HStack>
                  </VStack>
                </Center>
                <Box boxSize='20px'> </Box>
                <Center>
                  <VStack>
                    <Heading as='h2' size='lg'>
                      Theme: {themepack}
                    </Heading>
                    <HStack>
                      <VStack>
                        <Image src='/food.png' alt='food' boxSize='100px' />
                        <Button
                          onClick={() => handleClick('food')}
                          colorScheme={themepack === 'food' ? 'orange' : 'gray'}>
                          Food
                        </Button>
                      </VStack>
                      <VStack>
                        <Image src='/emojis.png' alt='emoji' boxSize='100px' />
                        <Button
                          onClick={() => handleClick('emojis')}
                          colorScheme={themepack === 'emojis' ? 'orange' : 'gray'}>
                          Emojis
                        </Button>
                      </VStack>
                      <VStack>
                        <Image src='/egg.png' alt='egg' boxSize='100px' />
                        <Button
                          onClick={() => handleClick('egg')}
                          colorScheme={themepack === 'egg' ? 'orange' : 'gray'}>
                          Egg
                        </Button>
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
                  {mode ? (
                    <Image src={`/${mode}.png`} alt='mode image' boxSize='100px' />
                  ) : (
                    <Image src={'/blank.png'} alt='Scavenger Hunt' boxSize='100px' />
                  )}
                  <Heading as='h3' size='md'>
                    {mode} Game
                  </Heading>
                </VStack>
                <Box boxSize='20px'> </Box>
                <VStack>
                  {themepack ? (
                    <Image src={`/${themepack}.png`} alt='theme image' boxSize='100px' />
                  ) : (
                    <Image src={'/blank.png'} alt='Blank' boxSize='100px' />
                  )}
                  <Heading as='h3' size='md'>
                    {themepack} Theme
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
              <Button onClick={handleLeaveGame}>Leave Game</Button>
              <Button onClick={handleEndGame}>End Game</Button>
              <Button onClick={handleRequestHint}>Request Hint</Button>
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
            {gameAreaController.requestedHint && (
              <Alert status='info'>
                <AlertIcon />
                <span>{gameAreaController.requestedHint}</span>
              </Alert>
            )}
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

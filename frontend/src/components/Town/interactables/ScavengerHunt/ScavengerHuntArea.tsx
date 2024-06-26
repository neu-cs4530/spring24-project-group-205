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
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
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
  const [relaxedLeaderboardData, setRelaxedLeaderboardData] = useState<
    { username: string; objects_found: number }[]
  >([]);
  const [timedLeaderboardData, setTimedLeaderboardData] = useState<
    { username: string; objects_found: number }[]
  >([]);

  const townController = useTownController();

  useEffect(() => {
    townController.addListener('relaxedLeaderboard', setRelaxedLeaderboardData);
  }, [townController]);

  useEffect(() => {
    townController.addListener('timedLeaderboard', setTimedLeaderboardData);
  }, [townController]);

  useEffect(() => {
    const selectedGameMode = gameAreaController.gamemode;
    if (selectedGameMode) {
      setMode(selectedGameMode);
    }
  }, [gameAreaController.gamemode]);

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

  // if no players in an ongoing game, unlock the mode and themepack and reset the state
  useEffect(() => {
    if (gameAreaController.players.length === 0) {
      setMode('');
      setThemepack('');
    }
  }, [gameAreaController.players]);

  const [joiningGame, setJoiningGame] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]);
  const [requestedHint, setRequestedHint] = useState('');

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
        toast({
          title: 'Joined Timed Game!',
          description: 'Succesfully joined timed game!',
          status: 'success',
        });
      } else if (mode === 'relaxed') {
        await gameAreaController.joinRelaxedGame(themepack);
        toast({
          title: 'Joined Relaxed Game!',
          description: 'Succesfully joined relaxed game!',
          status: 'success',
        });
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
      await gameAreaController.renderInitialItems();
      toast({
        title: 'Game Started!',
        description: 'Succesfully started the game!',
        status: 'success',
      });
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
      gameAreaController.resetHint();
      toast({
        title: 'Left Game!',
        description: 'Succesfully left the relaxed game!',
        status: 'success',
      });
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
      gameAreaController.resetHint();
      toast({
        title: 'Ended Game!',
        description: 'Succesfully ended the game!',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Error ending game',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
  };

  const handleRequestRelaxedLeaderboard = async () => {
    try {
      await gameAreaController.getRelaxedLeaderboard();
    } catch (err) {
      toast({
        title: 'Error getting relaxed leaderboard',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
  };

  const handleRequestHint = async () => {
    try {
      await gameAreaController.requestHint();
      if (gameAreaController.requestedHint) {
        setRequestedHint(gameAreaController.requestedHint);
      }
    } catch (err) {
      toast({
        title: 'Error requesting hint',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
  };

  const handleRequestTimedLeaderboard = async () => {
    try {
      await gameAreaController.getTimedLeaderboard();
    } catch (err) {
      toast({
        title: 'Error getting timed leaderboard',
        description: (err as Error).toString(),
        status: 'error',
      });
    }
  };

  return (
    <ChakraProvider>
      <Tabs variant='soft-rounded' colorScheme='orange'>
        <TabList>
          <Tab>Details</Tab>
          <Tab>Mode & Theme</Tab>
          <Tab>Game</Tab>
          <Tab onClick={handleRequestTimedLeaderboard}>Leaderboards</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Image src='/logo.png' alt='Scavenge logo' />
            <Box boxSize='20px'> </Box>
            <Text fontSize='lg'>
              Welcome to Scavenge, a scavenger hunt game in Covey.Town! During this game, you will
              be able to explore the town by competing against players to see who can pick up the
              most items. There are two different game modes to choose from: Timed and Relaxed. In
              the timed mode, you have 2 minutes to pick up as many items as you can. In the relaxed
              mode, you can take your time and pick up as many items as you can before someone ends
              the game. You can also choose from different themes, such as food, emojis, and eggs.
              Only the first player to join the game can choose the game mode and theme. If you are
              the first player, please select a game mode and theme and then join the game. As many
              as 10 players can join the game, but you can also play by yourself. Once all players
              have joined the game, anyone may start the game. Once the game starts, pick up as many
              items as you can by clicking on items you find. Good luck!
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
                      Game Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}
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
                      Theme: {themepack.charAt(0).toUpperCase() + themepack.slice(1)}
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
                    {mode.charAt(0).toUpperCase() + mode.slice(1)} Game
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
                    {themepack.charAt(0).toUpperCase() + themepack.slice(1)} Theme
                  </Heading>
                </VStack>
              </HStack>
            </Center>
            <Box boxSize='20px'> </Box>
            {gameAreaController.status === 'IN_PROGRESS' && gameAreaController.isPlayer && (
              <Alert status='info' colorScheme='green' variant='left-accent'>
                <AlertTitle fontSize='md'>Game Started!</AlertTitle>
                <AlertDescription fontSize='md'>{'Go find some items!'}</AlertDescription>
              </Alert>
            )}
            {gameAreaController.status === 'IN_PROGRESS' && !gameAreaController.isPlayer && (
              <Alert status='info' colorScheme='green' variant='left-accent'>
                <AlertTitle fontSize='md'>Game Started!</AlertTitle>
                <AlertDescription fontSize='md'>{'Join the next game!'}</AlertDescription>
              </Alert>
            )}
            {gameAreaController.status === 'WAITING_TO_START' && !gameAreaController.isPlayer && (
              <Alert status='info' colorScheme='orange' variant='left-accent'>
                <AlertTitle fontSize='md'>Game Not Started!</AlertTitle>
                <AlertDescription fontSize='md'>
                  {'If you would like to play, please join!'}
                </AlertDescription>
              </Alert>
            )}
            {gameAreaController.status === 'WAITING_TO_START' && gameAreaController.isPlayer && (
              <Alert status='info' colorScheme='orange' variant='left-accent'>
                <AlertTitle fontSize='md'>Game Not Started!</AlertTitle>
                <AlertDescription fontSize='md'>
                  {'Start the game if all players have joined!'}
                </AlertDescription>
              </Alert>
            )}
            {gameAreaController.status === 'WAITING_FOR_PLAYERS' && (
              <Alert status='info' colorScheme='orange' variant='left-accent'>
                <AlertTitle fontSize='md'>Game has not started!</AlertTitle>
                <AlertDescription fontSize='md'>
                  {'If you would like to play, please join!'}
                </AlertDescription>
              </Alert>
            )}
            {gameAreaController.status === 'OVER' && !gameAreaController.isPlayer && (
              <Alert status='info' colorScheme='orange' variant='left-accent'>
                <AlertTitle fontSize='md'>Game has not started!</AlertTitle>
                <AlertDescription fontSize='md'>
                  {'If you would like to play, please join!'}
                </AlertDescription>
              </Alert>
            )}
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
            {requestedHint && (
              <Alert status='info' variant='left-accent'>
                <AlertIcon />
                <AlertTitle>Hint:</AlertTitle>
                <AlertDescription>{requestedHint}</AlertDescription>
              </Alert>
            )}
          </TabPanel>
          <TabPanel>
            <Tabs isFitted variant='enclosed'>
              <TabList mb='1em'>
                <Tab onClick={handleRequestTimedLeaderboard}>Timed Leaderboard</Tab>
                <Tab onClick={handleRequestRelaxedLeaderboard}>Relaxed Leaderboard</Tab>
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
                        {timedLeaderboardData.map((player, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ textAlign: 'center' }}>{player.username}</td>
                            <td style={{ textAlign: 'center' }}>{player.objects_found}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
                <TabPanel>
                  {
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
                          {relaxedLeaderboardData.map((player, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                              <td style={{ textAlign: 'center' }}>{index + 1}</td>
                              <td style={{ textAlign: 'center' }}>{player.username}</td>
                              <td style={{ textAlign: 'center' }}>{player.objects_found}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableContainer>
                  }
                </TabPanel>
              </TabPanels>
            </Tabs>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ChakraProvider>
  );
}

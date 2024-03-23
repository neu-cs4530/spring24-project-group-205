import { Container, List, ListItem, useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import ScavengerHuntAreaController from '../../../../classes/interactable/ScavengerHuntAreaController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';

export default function TicTacToeArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<ScavengerHuntAreaController>(interactableID);
  const townController = useTownController();
  const toast = useToast();

  useEffect(() => {}, [townController, gameAreaController, toast]);

  return (
    <Container>
      <List aria-label='Hi'>
        <ListItem>X:</ListItem>
        <ListItem>O:</ListItem>
      </List>
    </Container>
  );
}

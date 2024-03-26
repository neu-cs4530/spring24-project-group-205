import { ScavengerHuntItem, XY } from '../../types/CoveyTownSocket';

interface HidingSpot {
  topLeft: [number, number];
  topRight: [number, number];
  bottomLeft: [number, number];
  bottomRight: [number, number];
  hint: string;
}

const HIDING_SPOTS: HidingSpot[] = [
  {
    topLeft: [7, 26],
    topRight: [77, 26],
    bottomLeft: [7, 28],
    bottomRight: [77, 28],
    hint: 'above trophy cases',
  },
  {
    topLeft: [7, 32],
    topRight: [59, 32],
    bottomLeft: [7, 33],
    bottomRight: [59, 33],
    hint: 'above foyer tables',
  },
  // Add more hiding spots here
];

export function pickRandomHidingSpot(boxes: HidingSpot[]): HidingSpot {
  if (boxes.length === 0) {
    throw new Error('No hiding spots available');
  }
  const randomIndex = Math.floor(Math.random() * boxes.length);
  return boxes[randomIndex];
}

export function setRandomLocationAndHint(item: ScavengerHuntItem): XY {
  const box = pickRandomHidingSpot(HIDING_SPOTS);
  const minX = Math.min(box.topLeft[0], box.bottomLeft[0]);
  const maxX = Math.max(box.topRight[0], box.bottomRight[0]);
  const minY = Math.min(box.topLeft[1], box.topRight[1]);
  const maxY = Math.max(box.bottomLeft[1], box.bottomRight[1]);

  const randomX = Math.random() * (maxX - minX) + minX;
  const randomY = Math.random() * (maxY - minY) + minY;

  item.hint = box.hint;
  item.location = { x: randomX, y: randomY };

  return item.location;
}

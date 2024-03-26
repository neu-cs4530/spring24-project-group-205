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
  {
    topLeft: [7, 39],
    topRight: [76, 39],
    bottomLeft: [7, 40],
    bottomRight: [76, 40],
    hint: 'below foyer tables',
  },
  {
    topLeft: [56, 29],
    topRight: [59, 29],
    bottomLeft: [56, 40],
    bottomRight: [59, 40],
    hint: 'near foyer table 7',
  },
  {
    topLeft: [61, 31],
    topRight: [74, 31],
    bottomLeft: [61, 33],
    bottomRight: [74, 33],
    hint: 'gated area',
  },
  {
    topLeft: [84, 12],
    topRight: [104, 12],
    bottomLeft: [84, 15],
    bottomRight: [104, 15],
    hint: 'butterfly room',
  },
  {
    topLeft: [107, 28],
    topRight: [115, 28],
    bottomLeft: [107, 32],
    bottomRight: [115, 32],
    hint: 'under basement TV',
  },
  {
    topLeft: [61, 14],
    topRight: [75, 14],
    bottomLeft: [61, 21],
    bottomRight: [75, 21],
    hint: 'lecture hall',
  },
  {
    topLeft: [22, 14],
    topRight: [30, 14],
    bottomLeft: [22, 17],
    bottomRight: [30, 17],
    hint: 'vases room',
  },
  {
    topLeft: [9, 6],
    topRight: [51, 6],
    bottomLeft: [9, 8],
    bottomRight: [51, 8],
    hint: 'dino room',
  },
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

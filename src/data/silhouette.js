/**
 * The figure drawn behind the hotspots.
 *
 * The body is drawn as a left-hand half that is mirrored across the centre
 * line, so the figure is always symmetrical and there is only one set of curves
 * to edit. The arm is a separate shape from the torso; if they were one path
 * the space between arm and body would fill in. The arms hang slightly away
 * from the body — the stance someone actually stands in to be measured, and the
 * only way the armhole and side-seam points stay clickable.
 *
 * All measurement coordinates in data/measurements.js live in this same viewBox
 * space. To swap in a different figure (a dress form, a child, a side view)
 * replace the paths below and re-point the markers.
 */

export const VIEWBOX = { width: 400, height: 1000 };

/** The vertical mirror line of the figure. */
export const CENTRE_X = 200;

/**
 * Landmark heights, kept here so the figure and the measurement guides cannot
 * drift apart. Descriptive only — nothing reads these at runtime.
 */
export const LANDMARKS = {
  headTop: 42,
  chin: 158,
  napeLevel: 198,
  shoulderTip: 214,
  armpit: 272,
  chestLevel: 320,
  waistLevel: 382,
  hipLevel: 470,
  crotch: 492,
  kneeLevel: 690,
  ankleLevel: 880,
  floor: 928,
};

export const HEAD = { cx: 200, cy: 104, rx: 38, ry: 50 };

export const NECK_PATH = 'M 183,140 L 217,140 L 222,200 L 178,200 Z';

/**
 * Left half of the torso and leg — no arm. Runs from the neck out over the
 * shoulder, down the armscye into the armpit, down the side of the body and the
 * leg, around the foot, back up the inside of the leg to the crotch, then
 * closes straight up the centre line.
 */
export const TORSO_HALF_PATH = [
  'M 200,196',
  'L 178,198', // neck point
  'C 160,202 132,206 105,212', // shoulder slope out to the shoulder tip
  'C 113,238 120,254 126,272', // down the armscye into the armpit
  'C 127,296 130,336 140,382', // chest down to the waist
  'C 138,412 128,442 126,470', // waist out to the hip
  'C 124,486 123,496 126,510', // hip into the thigh
  'C 131,580 134,640 139,690', // outer thigh to knee
  'C 144,760 148,830 152,880', // calf to ankle
  'C 152,902 146,914 146,928', // ankle to floor
  'L 182,928', // across the foot
  'C 182,912 178,900 178,880', // up to the inner ankle
  'C 176,830 173,760 171,690', // inner calf to inner knee
  'C 175,630 183,550 192,506', // inner thigh
  'L 200,492', // crotch
  'Z', // straight back up the centre line
].join(' ');

/**
 * The left arm, as its own closed shape so daylight shows between arm and body.
 * It starts at the shoulder tip — the same point the torso reaches — and its
 * top edge closes back inside the torso, where the overlap is invisible.
 */
export const ARM_HALF_PATH = [
  'M 105,212', // shoulder tip, shared with the torso
  'C 96,226 90,242 88,262', // over the deltoid
  'C 85,285 81,302 79,320', // outside of the upper arm
  'C 74,350 70,378 68,400', // down to the elbow
  'C 64,425 62,450 60,470', // outside of the forearm
  'C 58,490 56,516 55,530', // to the wrist
  'C 53,548 52,566 55,578', // outside of the hand
  'C 58,590 72,590 76,578', // round the fingers
  'C 78,564 77,545 77,530', // inside of the hand
  'C 80,510 84,490 88,470', // inside of the forearm
  'C 92,447 96,422 100,400', // up to the elbow
  'C 104,375 110,348 114,320', // inside of the upper arm
  'C 119,298 125,264 130,228', // up into the armpit
  'Z', // closing edge, hidden under the shoulder
].join(' ');

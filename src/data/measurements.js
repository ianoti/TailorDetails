/**
 * The measurement catalogue.
 *
 * These are the sixteen measurements in the Michael Tailors measurement guide
 * (https://michaeltailors.com/measurements/); `ref` is that guide's chart
 * number, so a sheet printed here can be read alongside it.
 *
 * This file is the main extension point: add an entry here and it automatically
 * gains a hotspot on the silhouette, a row in the list, a slot in local storage
 * and a line in the exported PDF. Nothing else needs to change.
 *
 * Entry shape
 * -----------
 *   key         unique, stable id — this is the localStorage key, so never rename
 *               one without writing a migration in lib/storage.js
 *   label       what the tailor sees
 *   ref         number in the reference chart (optional)
 *   group       id of a group in MEASUREMENT_GROUPS
 *   unitType    'length' (stored in mm) | 'mass' (stored in grams)
 *   kind        'girth' | 'width' | 'length' — drives the guide styling
 *   how         one-line instruction for taking the measurement
 *   tip         optional extra note shown in the dialog
 *   range       [min, max] in canonical units; outside this you get a soft warning
 *   marker      {x, y} hotspot on the silhouette viewBox, or null for list-only
 *   guide       overlay drawn while the measurement is active:
 *                 {type:'ellipse', cx, cy, rx, ry}
 *                 {type:'polyline', points: [[x, y], ...]}
 *
 * Coordinates are in the silhouette viewBox space (see data/silhouette.js).
 */

export const MEASUREMENT_GROUPS = [
  { id: 'jacket', label: 'Jacket & Shirt', blurb: 'Taken from the neck down, arms relaxed at the sides.' },
  { id: 'trousers', label: 'Trousers', blurb: 'Taken standing straight, feet slightly apart.' },
];

export const MEASUREMENTS = [
  /* -------------------------------------------------------- Jacket & shirt */
  {
    key: 'neck',
    label: 'Neck',
    ref: 15,
    group: 'jacket',
    unitType: 'length',
    kind: 'girth',
    how: 'Around the base of the neck, plus a small allowance of about 1–2 cm for comfort.',
    tip: 'The tape should touch the skin comfortably — never tight.',
    range: [250, 600],
    marker: { x: 200, y: 176 },
    guide: { type: 'ellipse', cx: 200, cy: 180, rx: 27, ry: 10 },
  },
  {
    key: 'shoulder',
    label: 'Shoulder',
    ref: 1,
    group: 'jacket',
    unitType: 'length',
    kind: 'width',
    how: 'Straight across the back from the tip of one shoulder to the tip of the other.',
    tip: 'Stand upright with the shoulders relaxed and keep the tape level.',
    range: [300, 650],
    marker: { x: 150, y: 206 },
    guide: { type: 'polyline', points: [[105, 212], [200, 196], [295, 212]] },
  },
  {
    key: 'backChest',
    label: 'Back Chest',
    ref: 7,
    group: 'jacket',
    unitType: 'length',
    kind: 'width',
    how: 'Shoulder to shoulder across the back, letting the tape follow the natural curve.',
    range: [250, 600],
    marker: { x: 150, y: 250 },
    guide: { type: 'polyline', points: [[134, 250], [266, 250]] },
  },
  {
    key: 'frontChest',
    label: 'Front Chest',
    ref: 6,
    group: 'jacket',
    unitType: 'length',
    kind: 'width',
    how: 'Across the front of the chest from one armpit to the other, at the fullest part.',
    range: [220, 560],
    marker: { x: 250, y: 288 },
    guide: { type: 'polyline', points: [[146, 288], [254, 288]] },
  },
  {
    key: 'chest',
    label: 'Chest',
    ref: 3,
    group: 'jacket',
    unitType: 'length',
    kind: 'girth',
    how: 'Around the fullest part of the chest, under the armpits and level across the back.',
    tip: 'Arms by the sides, breathing normally. Snug but not tight — do not puff the chest out.',
    range: [600, 1600],
    marker: { x: 200, y: 320 },
    guide: { type: 'ellipse', cx: 200, cy: 320, rx: 72, ry: 16 },
  },
  {
    key: 'bicep',
    label: 'Bicep',
    ref: 14,
    group: 'jacket',
    unitType: 'length',
    kind: 'girth',
    how: 'Around the fullest part of the upper arm.',
    tip: 'Keep the tape loose enough not to press into the arm.',
    range: [180, 600],
    marker: { x: 96, y: 320 },
    guide: { type: 'ellipse', cx: 96, cy: 320, rx: 20, ry: 9 },
  },
  {
    key: 'sleeve',
    label: 'Sleeve',
    ref: 2,
    group: 'jacket',
    unitType: 'length',
    kind: 'length',
    how: 'From the outer edge of the shoulder, down the outside of the arm, to the wrist bone.',
    tip: 'Keep the arm slightly bent while measuring.',
    range: [400, 850],
    marker: { x: 310, y: 430 },
    guide: { type: 'polyline', points: [[295, 212], [316, 400], [334, 530]] },
  },
  {
    key: 'waist',
    label: 'Waist',
    ref: 4,
    group: 'jacket',
    unitType: 'length',
    kind: 'girth',
    how: 'Around the narrowest part of the waist, usually just above the belly button.',
    tip: 'Keep the tape level and snug, and do not hold the stomach in.',
    range: [500, 1800],
    marker: { x: 200, y: 382 },
    guide: { type: 'ellipse', cx: 200, cy: 382, rx: 64, ry: 14 },
  },
  {
    key: 'hips',
    label: 'Hips',
    ref: 5,
    group: 'jacket',
    unitType: 'length',
    kind: 'girth',
    how: 'Feet together, around the fullest part of the hips and seat.',
    range: [600, 1900],
    marker: { x: 200, y: 470 },
    guide: { type: 'ellipse', cx: 200, cy: 470, rx: 76, ry: 17 },
  },
  {
    key: 'jacketLength',
    label: 'Jacket Length',
    ref: 8,
    group: 'jacket',
    unitType: 'length',
    kind: 'length',
    how: 'From the base of the neck, straight down the back, to where the jacket should finish.',
    range: [500, 1000],
    marker: { x: 166, y: 440 },
    guide: { type: 'polyline', points: [[194, 198], [194, 500]] },
  },

  /* -------------------------------------------------------------- Trousers */
  {
    key: 'pantsWaist',
    label: 'Pants Waist',
    ref: 9,
    group: 'trousers',
    unitType: 'length',
    kind: 'girth',
    how: 'Around the natural waistline, typically just above the belly button.',
    tip: 'Expect a larger number than the size on shop-bought trousers — those labels run small.',
    range: [500, 1900],
    marker: { x: 152, y: 400 },
    guide: { type: 'ellipse', cx: 200, cy: 396, rx: 65, ry: 14 },
  },
  {
    key: 'lowHip',
    label: 'Low Hip',
    ref: 10,
    group: 'trousers',
    unitType: 'length',
    kind: 'girth',
    how: 'Around the fullest part of the hips and seat, tape level and snug but not tight.',
    range: [600, 1900],
    marker: { x: 250, y: 486 },
    guide: { type: 'ellipse', cx: 200, cy: 482, rx: 78, ry: 17 },
  },
  {
    key: 'crotch',
    label: 'Crotch',
    ref: 12,
    group: 'trousers',
    unitType: 'length',
    kind: 'length',
    how: 'From the front waistline, between the legs, up to the back waistline, following the body.',
    range: [500, 1000],
    marker: { x: 236, y: 520 },
    guide: { type: 'polyline', points: [[194, 384], [196, 440], [200, 492], [204, 440], [206, 384]] },
  },
  {
    key: 'thigh',
    label: 'Thigh',
    ref: 11,
    group: 'trousers',
    unitType: 'length',
    kind: 'girth',
    how: 'Around the fullest part of the thigh, tape level and snug but not tight.',
    range: [300, 900],
    marker: { x: 150, y: 550 },
    guide: { type: 'ellipse', cx: 156, cy: 550, rx: 32, ry: 12 },
  },
  {
    key: 'pantLength',
    label: 'Pant Length',
    ref: 13,
    group: 'trousers',
    unitType: 'length',
    kind: 'length',
    how: 'Down the outside of the leg from the waist to the bottom of the ankle.',
    tip: 'Stand straight with the feet slightly apart and keep the tape straight.',
    range: [700, 1400],
    marker: { x: 146, y: 660 },
    guide: { type: 'polyline', points: [[141, 386], [126, 470], [139, 690], [152, 880]] },
  },
  {
    key: 'cuffs',
    label: 'Cuffs',
    ref: 16,
    group: 'trousers',
    unitType: 'length',
    kind: 'girth',
    how: 'Around the narrowest part of the ankle, where the trouser cuff will sit.',
    tip: 'Leave it comfortable — this is not a tight measurement.',
    range: [150, 450],
    marker: { x: 244, y: 872 },
    guide: { type: 'ellipse', cx: 235, cy: 872, rx: 17, ry: 7 },
  },
];

/* ------------------------------------------------------------------ *
 * Derived lookups — computed once, imported everywhere.
 * ------------------------------------------------------------------ */

export const MEASUREMENT_BY_KEY = Object.fromEntries(MEASUREMENTS.map((m) => [m.key, m]));

export const MEASUREMENTS_WITH_MARKERS = MEASUREMENTS.filter((m) => m.marker);

/** [{ ...group, items: [...] }] in catalogue order, skipping empty groups. */
export const GROUPED_MEASUREMENTS = MEASUREMENT_GROUPS.map((group) => ({
  ...group,
  items: MEASUREMENTS.filter((m) => m.group === group.id),
})).filter((group) => group.items.length > 0);

export function getMeasurement(key) {
  return MEASUREMENT_BY_KEY[key] ?? null;
}

/** Soft plausibility check — warns, never blocks. */
export function isOutOfRange(measurement, canonicalValue) {
  if (canonicalValue == null || !measurement?.range) return false;
  const [min, max] = measurement.range;
  return canonicalValue < min || canonicalValue > max;
}

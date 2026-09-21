import {
  ARM_HALF_PATH,
  CENTRE_X,
  HEAD,
  NECK_PATH,
  TORSO_HALF_PATH,
  VIEWBOX,
} from '../data/silhouette.js';
import { MEASUREMENTS_WITH_MARKERS } from '../data/measurements.js';
import MeasurementMarker from './MeasurementMarker.jsx';

/** Draws the overlay that shows where a measurement is taken. */
function Guide({ guide, kind }) {
  if (!guide) return null;

  if (guide.type === 'ellipse') {
    return (
      <ellipse
        className={`guide guide--${kind}`}
        cx={guide.cx}
        cy={guide.cy}
        rx={guide.rx}
        ry={guide.ry}
      />
    );
  }

  if (guide.type === 'polyline') {
    const points = guide.points.map(([x, y]) => `${x},${y}`).join(' ');
    const [first] = guide.points;
    const last = guide.points[guide.points.length - 1];
    const horizontal = Math.abs(last[0] - first[0]) > Math.abs(last[1] - first[1]);
    const capLength = 7;

    // End ticks, drawn across the direction of travel, like a tape measure.
    const cap = ([x, y]) =>
      horizontal
        ? { x1: x, y1: y - capLength, x2: x, y2: y + capLength }
        : { x1: x - capLength, y1: y, x2: x + capLength, y2: y };

    return (
      <g className={`guide guide--${kind}`}>
        <polyline className="guide__line" points={points} />
        <line className="guide__cap" {...cap(first)} />
        <line className="guide__cap" {...cap(last)} />
      </g>
    );
  }

  return null;
}

export default function SilhouetteFigure({
  values,
  activeKey,
  hoveredKey,
  onSelect,
  onHoverChange,
  formatFor,
}) {
  const mirror = `translate(${CENTRE_X * 2},0) scale(-1,1)`;
  const focusKey = hoveredKey ?? activeKey;
  const focused = focusKey
    ? MEASUREMENTS_WITH_MARKERS.find((m) => m.key === focusKey)
    : null;

  return (
    <svg
      className="silhouette"
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      role="group"
      aria-label="Body silhouette with measurement points"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--figure-top)" />
          <stop offset="100%" stopColor="var(--figure-bottom)" />
        </linearGradient>
      </defs>

      <g className="figure" fill="url(#bodyFill)" stroke="var(--figure-edge)" strokeWidth="1.5">
        <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} />
        <path d={NECK_PATH} />
        {/* Arms first, so the torso's shoulder covers where they join. */}
        <path d={ARM_HALF_PATH} />
        <path d={ARM_HALF_PATH} transform={mirror} />
        <path d={TORSO_HALF_PATH} />
        <path d={TORSO_HALF_PATH} transform={mirror} />
      </g>

      {/* Centre line, drawn over the body so it reads as a construction line. */}
      <line className="figure__centreline" x1={CENTRE_X} y1={160} x2={CENTRE_X} y2={496} />

      {focused && <Guide guide={focused.guide} kind={focused.kind} />}

      <g className="markers">
        {MEASUREMENTS_WITH_MARKERS.map((measurement) => (
          <MeasurementMarker
            key={measurement.key}
            measurement={measurement}
            filled={values?.[measurement.key] != null}
            active={measurement.key === focusKey}
            dimmed={Boolean(focusKey) && measurement.key !== focusKey}
            valueLabel={formatFor(measurement)}
            onSelect={onSelect}
            onHoverChange={onHoverChange}
          />
        ))}
      </g>
    </svg>
  );
}

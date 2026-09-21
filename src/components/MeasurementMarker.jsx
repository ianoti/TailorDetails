/**
 * A single hotspot on the silhouette. Rendered inside the SVG, so it is a <g>
 * rather than a <button> — the keyboard/ARIA behaviour is wired up by hand.
 */
export default function MeasurementMarker({
  measurement,
  filled,
  active,
  dimmed,
  valueLabel,
  onSelect,
  onHoverChange,
}) {
  const { x, y } = measurement.marker;

  const classes = [
    'marker',
    filled ? 'marker--filled' : 'marker--empty',
    active ? 'is-active' : '',
    dimmed ? 'is-dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(measurement.key);
    }
  }

  return (
    <g
      className={classes}
      role="button"
      tabIndex={0}
      aria-label={
        valueLabel ? `${measurement.label}, ${valueLabel}` : `${measurement.label}, not measured`
      }
      onClick={() => onSelect(measurement.key)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHoverChange(measurement.key)}
      onMouseLeave={() => onHoverChange(null)}
      onFocus={() => onHoverChange(measurement.key)}
      onBlur={() => onHoverChange(null)}
    >
      {/* Generous invisible hit area — fingers are bigger than 11px. */}
      <circle className="marker__hit" cx={x} cy={y} r={20} />
      <circle className="marker__pulse" cx={x} cy={y} r={16} />
      <circle className="marker__dot" cx={x} cy={y} r={11} />
      {filled && <path className="marker__tick" d={`M ${x - 4.5},${y} l 3,3.4 l 6,-6.8`} />}
    </g>
  );
}

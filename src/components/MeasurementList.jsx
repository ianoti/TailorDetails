import { useMemo, useState } from 'react';
import { GROUPED_MEASUREMENTS } from '../data/measurements.js';
import { formatValue, unitLabel } from '../lib/units.js';

/**
 * The written record beside the figure. Every measurement appears here —
 * including the handful that have no sensible point on a front-view figure.
 */
export default function MeasurementList({
  values,
  fieldNotes,
  unit,
  fractionalInches,
  activeKey,
  hoveredKey,
  onSelect,
  onHoverChange,
}) {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return GROUPED_MEASUREMENTS;
    return GROUPED_MEASUREMENTS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(needle) || item.how.toLowerCase().includes(needle),
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <section className="list" aria-label="All measurements">
      <div className="list__search">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search measurements…"
          aria-label="Search measurements"
        />
      </div>

      {groups.length === 0 && <p className="list__empty">Nothing matches “{query}”.</p>}

      {groups.map((group) => {
        const done = group.items.filter((item) => values?.[item.key] != null).length;
        return (
          <div className="list__group" key={group.id}>
            <div className="list__group-head">
              <h3>{group.label}</h3>
              <span className="list__count">
                {done}/{group.items.length}
              </span>
            </div>
            <p className="list__blurb">{group.blurb}</p>

            <ul className="list__items">
              {group.items.map((item) => {
                const value = values?.[item.key];
                const note = fieldNotes?.[item.key];
                const classes = [
                  'row',
                  value != null ? 'row--filled' : '',
                  item.key === activeKey ? 'is-active' : '',
                  item.key === hoveredKey ? 'is-hovered' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={classes}
                      onClick={() => onSelect(item.key)}
                      onMouseEnter={() => onHoverChange(item.key)}
                      onMouseLeave={() => onHoverChange(null)}
                      onFocus={() => onHoverChange(item.key)}
                      onBlur={() => onHoverChange(null)}
                    >
                      <span className="row__label">
                        <span className="row__name">
                          {item.ref && <span className="row__ref">{item.ref}</span>}
                          {item.label}
                        </span>
                        {note && <span className="row__note">{note}</span>}
                      </span>
                      <span className="row__value">
                        {value == null ? (
                          <span className="row__placeholder">add</span>
                        ) : (
                          <>
                            {formatValue(value, item.unitType, unit, { fractionalInches })}
                            <span className="row__unit">{unitLabel(item.unitType, unit)}</span>
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

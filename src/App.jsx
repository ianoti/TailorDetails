import { useCallback, useState } from 'react';
import ExportMenu from './components/ExportMenu.jsx';
import MeasurementDialog from './components/MeasurementDialog.jsx';
import MeasurementList from './components/MeasurementList.jsx';
import ProfileBar from './components/ProfileBar.jsx';
import SilhouetteFigure from './components/SilhouetteFigure.jsx';
import UnitToggle from './components/UnitToggle.jsx';
import { MEASUREMENTS, getMeasurement } from './data/measurements.js';
import { useMeasurementStore } from './hooks/useMeasurementStore.js';
import { formatWithUnit } from './lib/units.js';

export default function App() {
  const { state, profile, unit, actions } = useMeasurementStore();
  const [activeKey, setActiveKey] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [fractionalInches, setFractionalInches] = useState(true);

  const activeMeasurement = activeKey ? getMeasurement(activeKey) : null;
  const captionKey = hoveredKey ?? activeKey;
  const caption = captionKey ? getMeasurement(captionKey) : null;

  const filledCount = Object.keys(profile.values).length;

  /** Used for the marker's accessible name and the caption under the figure. */
  const formatFor = useCallback(
    (measurement) => {
      const value = profile.values[measurement.key];
      if (value == null) return '';
      return formatWithUnit(value, measurement.unitType, unit, { fractionalInches });
    },
    [profile.values, unit, fractionalInches],
  );

  function handleImport(parsed) {
    const confirmed = window.confirm(
      'Restoring a backup replaces every record currently in this browser. Continue?',
    );
    if (confirmed) actions.replaceState(parsed);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__mark" aria-hidden="true">
            ✂
          </span>
          <div>
            <h1>TailorDetails</h1>
            <p>Bespoke measurements, kept in this browser.</p>
          </div>
        </div>

        <div className="topbar__tools">
          <UnitToggle unit={unit} onChange={actions.setUnit} />
          <ExportMenu
            profile={profile}
            state={state}
            unit={unit}
            fractionalInches={fractionalInches}
            onToggleFractions={setFractionalInches}
            onImport={handleImport}
          />
        </div>
      </header>

      <ProfileBar
        state={state}
        profile={profile}
        actions={actions}
        filledCount={filledCount}
        totalCount={MEASUREMENTS.length}
      />

      <main className="layout">
        <section className="figure-panel" aria-label="Measurement points">
          <div className="figure-panel__stage">
            <SilhouetteFigure
              values={profile.values}
              activeKey={activeKey}
              hoveredKey={hoveredKey}
              onSelect={setActiveKey}
              onHoverChange={setHoveredKey}
              formatFor={formatFor}
            />
          </div>

          <div className="figure-panel__caption" aria-live="polite">
            {caption ? (
              <>
                <strong>{caption.label}</strong>
                <span>{formatFor(caption) || 'not measured yet'}</span>
              </>
            ) : (
              <span className="figure-panel__hint">
                Tap a point on the figure — or a row in the list — to enter a measurement.
              </span>
            )}
          </div>

          <ul className="legend">
            <li>
              <span className="legend__dot legend__dot--empty" aria-hidden="true" /> not measured
            </li>
            <li>
              <span className="legend__dot legend__dot--filled" aria-hidden="true" /> recorded
            </li>
          </ul>
        </section>

        <MeasurementList
          values={profile.values}
          fieldNotes={profile.fieldNotes}
          unit={unit}
          fractionalInches={fractionalInches}
          activeKey={activeKey}
          hoveredKey={hoveredKey}
          onSelect={setActiveKey}
          onHoverChange={setHoveredKey}
        />
      </main>

      <footer className="footer">
        <p>
          Everything is saved in this browser only — nothing is uploaded. Use{' '}
          <strong>Export PDF ▾ → Save a JSON backup</strong> before clearing your browser data.
        </p>
      </footer>

      <MeasurementDialog
        measurement={activeMeasurement}
        value={activeMeasurement ? profile.values[activeMeasurement.key] : null}
        note={activeMeasurement ? profile.fieldNotes[activeMeasurement.key] : ''}
        unit={unit}
        fractionalInches={fractionalInches}
        onChangeValue={actions.setValue}
        onChangeNote={actions.setFieldNote}
        onNavigate={setActiveKey}
        onClose={() => setActiveKey(null)}
      />
    </div>
  );
}

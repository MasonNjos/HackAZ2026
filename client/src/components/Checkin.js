import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Checkin.css';

const MOODS = ['Great', 'Good', 'Okay', 'Not great', 'Poor'];

const getReadingStatus = (value) => {
  if (value < 70) return { label: 'Low', className: 'reading--low' };
  if (value <= 140) return { label: 'Normal', className: 'reading--normal' };
  return { label: 'High', className: 'reading--high' };
};

const formatTime = (date) =>
  date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const CheckInDashboard = () => {
  const { user } = useAuth0();

  // ── Daily Check-In state ──
  const [mood, setMood] = useState('');
  const [exercised, setExercised] = useState(false);
  const [tookMedication, setTookMedication] = useState(false);
  const [notes, setNotes] = useState('');
  const [checkInSaved, setCheckInSaved] = useState(false);

  // ── Glucose state ──
  const [glucoseInput, setGlucoseInput] = useState('');
  const [readings, setReadings] = useState([
    { id: 1, value: 110, date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: 2, value: 145, date: new Date(Date.now() - 1000 * 60 * 60 * 18) },
    { id: 3, value: 98,  date: new Date(Date.now() - 1000 * 60 * 60 * 20) },
  ]);
  const [glucoseError, setGlucoseError] = useState('');

  const handleCheckIn = (e) => {
    e.preventDefault();
    setCheckInSaved(true);
    setTimeout(() => setCheckInSaved(false), 3000);
  };

  const handleAddReading = (e) => {
    e.preventDefault();
    const val = parseInt(glucoseInput, 10);
    if (!glucoseInput || isNaN(val) || val < 20 || val > 600) {
      setGlucoseError('Please enter a valid glucose reading (20–600 mg/dL).');
      return;
    }
    setGlucoseError('');
    setReadings([{ id: Date.now(), value: val, date: new Date() }, ...readings]);
    setGlucoseInput('');
  };

  return (
    <div className="ci-page">

      {/* ── Header ── */}
      <header className="ci-header">
        <div className="ci-header-inner">
          <div>
            <h1>Saguaro Link</h1>

          </div>
          {user && <span className="ci-welcome">Welcome, {user.given_name || user.name}</span>}
        </div>
      </header>

      <main className="ci-main">

        {/* ── Daily Check-In ── */}
        <section className="ci-card">
          <h2 className="ci-card-title">Daily Check-In</h2>

          <form onSubmit={handleCheckIn} className="ci-form">

            <div className="ci-field">
              <label htmlFor="mood">How are you feeling today?</label>
              <select
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                required
              >
                <option value="" disabled>Select your mood</option>
                {MOODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="ci-checkbox-group">
              <label className="ci-checkbox-label">
                <input
                  type="checkbox"
                  checked={exercised}
                  onChange={(e) => setExercised(e.target.checked)}
                />
                <span className="ci-checkbox-box" />
                I exercised today
              </label>
            </div>

            <div className="ci-checkbox-group">
              <label className="ci-checkbox-label">
                <input
                  type="checkbox"
                  checked={tookMedication}
                  onChange={(e) => setTookMedication(e.target.checked)}
                />
                <span className="ci-checkbox-box" />
                I took my medication
              </label>
            </div>

            <div className="ci-field">
              <label htmlFor="notes">Additional Notes <span className="ci-optional">(optional)</span></label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any symptoms, concerns, or observations..."
                rows={4}
              />
            </div>

            <button type="submit" className="ci-btn ci-btn--blue">
              Save Check-In
            </button>

            {checkInSaved && (
              <p className="ci-success">✓ Check-in saved successfully!</p>
            )}
          </form>
        </section>

        {/* ── Log Glucose ── */}
        <section className="ci-card">
          <h2 className="ci-card-title">Log Glucose Reading</h2>

          <form onSubmit={handleAddReading} className="ci-form">
            <div className="ci-field">
              <label htmlFor="glucose">Blood Glucose (mg/dL)</label>
              <input
                id="glucose"
                type="number"
                value={glucoseInput}
                onChange={(e) => setGlucoseInput(e.target.value)}
                placeholder="Enter reading"
                min={20}
                max={600}
              />
              {glucoseError && <span className="ci-error">{glucoseError}</span>}
            </div>

            <button type="submit" className="ci-btn ci-btn--green">
              Add Reading
            </button>
          </form>
        </section>

        {/* ── Recent Readings ── */}
        <section className="ci-card">
          <h2 className="ci-card-title">Recent Readings</h2>

          {readings.length === 0 ? (
            <p className="ci-empty">No readings yet. Add your first one above.</p>
          ) : (
            <div className="ci-readings">
              {readings.map((r) => {
                const status = getReadingStatus(r.value);
                return (
                  <div key={r.id} className={`ci-reading-row ${status.className}`}>
                    <div className="ci-reading-value">
                      <span className="ci-reading-number">{r.value}</span>
                      <span className="ci-reading-unit">mg/dL</span>
                    </div>
                    <div className="ci-reading-meta">
                      <span className="ci-reading-time">{formatTime(r.date)}</span>
                      <span className="ci-reading-label">{status.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Daily Tip ── */}
        <div className="ci-tip">
          <span className="ci-tip-icon">ℹ</span>
          <div>
            <strong>Daily Tip</strong>
            <p>Log your glucose at least 3 times a day to track patterns and maintain better health.</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CheckInDashboard;
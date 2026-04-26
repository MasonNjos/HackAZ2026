import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import './Checkin.css';
import axios from 'axios';

const MOODS = ['Great', 'Good', 'Okay', 'Not great', 'Poor'];

const CheckInDashboard = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    mood: '',
    // Activity
    hasActivity: false,
    activityDetails: '',
    // Symptoms (Now a text-based reveal)
    hasSymptoms: false,
    symptomsText: '',
    // Vitals
    systolic: '',
    diastolic: '',
    glucose: '',
    notes: ''
  });

  const query = new URLSearchParams(window.location.search);
  const mode = query.get('mode');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPictureMode, setIsPictureMode] = useState(mode === 'images');

  // Microphone state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleListening = () => {
    if (isListening) {
      if (window.recognitionInstance) {
        window.recognitionInstance.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support the Web Speech API.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    let currentFinalTranscript = transcript;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalUpdate = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalUpdate += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalUpdate) {
        currentFinalTranscript += finalUpdate;
      }
      setTranscript(currentFinalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    window.recognitionInstance = recognition;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const newState = { ...prev, [name]: type === 'checkbox' ? checked : value };

      // Auto-reset values if the user unchecks the "has" box
      if (name === 'hasActivity' && !checked) newState.activityDetails = '';
      if (name === 'hasSymptoms' && !checked) newState.symptomsText = '';

      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/checkins', {
        blood_sugar: parseInt(form.glucose) || null,
        insulin_taken: null,
        medications_taken: null,
        symptoms: form.hasSymptoms ? form.symptomsText : '',
        mood: form.mood,
        systolic: parseInt(form.systolic) || null,
        diastolic: parseInt(form.diastolic) || null,
        activity_done: form.hasActivity,
        activity_details: form.activityDetails || null,
        notes: form.notes || null,
      });

      setSubmitting(false);
      setSuccess(true);
    } catch (err) {
      if (err.response?.status === 400) {
        alert(err.response?.data?.error?.message || t('Please check your inputs.'));
      } else if (err.response?.status === 409) {
        alert(t("You've already submitted a check-in for today."));
      } else {
        alert(t('Something went wrong. Please try again.'));
      }
      console.error('Check-in error:', err.response?.data);
      setSubmitting(false);
    }
  };

  return (
    <div className="ci-page">
      <header className="ci-header">
        <div className="ci-header-inner">
          <div>
            <h1>{t("Saguaro Link")}</h1>
            <p>{t("Daily Health Monitor")}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LanguageToggle />
            {user && <span className="ci-welcome">{t("Welcome")}, {user.given_name || user.name}</span>}
          </div>
        </div>
      </header>

      <main className="ci-main">
        <form onSubmit={handleSubmit} className="ci-form">

          {/* MOOD SECTION */}
          <section className="ci-card">
            <h2 className="ci-card-title">{t("General Wellbeing")}</h2>
            <div className="ci-field">
              <label>{t("How are you feeling today?")}</label>
              {isPictureMode ? (
                <div className="ci-mood-emojis">
                  {[
                    { label: 'Great', emoji: '😁' },
                    { label: 'Good', emoji: '🙂' },
                    { label: 'Okay', emoji: '😐' },
                    { label: 'Not great', emoji: '🙁' },
                    { label: 'Poor', emoji: '🤒' }
                  ].map(m => (
                    <button
                      type="button"
                      key={m.label}
                      className={`ci-emoji-btn ${form.mood === m.label ? 'selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, mood: m.label }))}
                      title={t(m.label)}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <select name="mood" value={form.mood} onChange={handleChange} required>
                  <option value="" disabled>{t("Select mood...")}</option>
                  {MOODS.map(m => <option key={m} value={m}>{t(m)}</option>)}
                </select>
              )}
            </div>
          </section>

          {/* ACTIVITY SECTION */}
          <section className="ci-card">
            <h2 className="ci-card-title">{t("Daily Activity")}</h2>
            {isPictureMode ? (
              <div className="ci-picture-grid">
                {[
                  { label: 'Walking', emoji: '🚶‍♂️' },
                  { label: 'Chores', emoji: '🧹' },
                  { label: 'Biking', emoji: '🚲' },
                  { label: 'Resting', emoji: '🛌' }
                ].map(act => (
                  <button
                    type="button"
                    key={act.label}
                    className={`ci-pic-btn ${form.hasActivity && form.activityDetails === act.label ? 'selected' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, hasActivity: true, activityDetails: act.label }))}
                  >
                    <span className="ci-pic-emoji">{act.emoji}</span>
                    <span className="ci-pic-label">{t(act.label)}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`ci-pic-btn ${!form.hasActivity ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, hasActivity: false, activityDetails: '' }))}
                >
                  <span className="ci-pic-emoji">❌</span>
                  <span className="ci-pic-label">{t("None")}</span>
                </button>
              </div>
            ) : (
              <>
                <div className="ci-checkbox-group">
                  <label className="ci-checkbox-label">
                    <input type="checkbox" name="hasActivity" checked={form.hasActivity} onChange={handleChange} />
                    <span className="ci-checkbox-box" />
                    {t("I was physically active today")}
                  </label>
                </div>
                {form.hasActivity && (
                  <div className="ci-field" style={{ marginTop: '1rem' }}>
                    <label>{t("Details")} <span className="ci-optional">{t("(e.g. 30 min walk)")}</span></label>
                    <input
                      type="text"
                      name="activityDetails"
                      value={form.activityDetails}
                      onChange={handleChange}
                      placeholder={t("What activity did you do?")}
                    />
                  </div>
                )}
              </>
            )}
          </section>

          {/* SYMPTOMS SECTION */}
          <section className="ci-card">
            <h2 className="ci-card-title">{t("Symptoms")}</h2>
            {isPictureMode ? (
              <div className="ci-picture-grid">
                {[
                  { label: 'Headache', emoji: '🤕' },
                  { label: 'Nausea', emoji: '🤢' },
                  { label: 'Chest Pain', emoji: '🫀' },
                  { label: 'Muscle Aches', emoji: '🦵' },
                  { label: 'Cough', emoji: '🤧' }
                ].map(sym => (
                  <button
                    type="button"
                    key={sym.label}
                    className={`ci-pic-btn ${form.hasSymptoms && form.symptomsText.includes(sym.label) ? 'selected' : ''}`}
                    onClick={() => {
                      setForm(prev => {
                        let newSymptoms = prev.symptomsText ? prev.symptomsText.split(', ').filter(Boolean) : [];
                        if (newSymptoms.includes(sym.label)) {
                          newSymptoms = newSymptoms.filter(s => s !== sym.label);
                        } else {
                          newSymptoms.push(sym.label);
                        }
                        return {
                          ...prev,
                          hasSymptoms: newSymptoms.length > 0,
                          symptomsText: newSymptoms.join(', ')
                        };
                      });
                    }}
                  >
                    <span className="ci-pic-emoji">{sym.emoji}</span>
                    <span className="ci-pic-label">{t(sym.label)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="ci-checkbox-group">
                  <label className="ci-checkbox-label">
                    <input type="checkbox" name="hasSymptoms" checked={form.hasSymptoms} onChange={handleChange} />
                    <span className="ci-checkbox-box" />
                    {t("I am experiencing symptoms today")}
                  </label>
                </div>
                {form.hasSymptoms && (
                  <div className="ci-field" style={{ marginTop: '1rem' }}>
                    <label>{t("Please describe your symptoms:")}</label>
                    <textarea
                      name="symptomsText"
                      value={form.symptomsText}
                      onChange={handleChange}
                      placeholder={t("e.g. Mild headache since morning, slight dizziness...")}
                      rows={3}
                    />
                  </div>
                )}
              </>
            )}
          </section>

          {/* VITALS SECTION */}
          <section className="ci-card">
            <h2 className="ci-card-title">{t("Vitals & Readings")}</h2>
            <div className="ci-fields">
              <div className="ci-field">
                <label>
                  {isPictureMode && <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>💓</span>}
                  {t("Blood Pressure (Systolic / Diastolic)")}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input name="systolic" type="number" placeholder="120" value={form.systolic} onChange={handleChange} />
                  <input name="diastolic" type="number" placeholder="80" value={form.diastolic} onChange={handleChange} />
                </div>
              </div>
              <div className="ci-field" style={{ marginTop: '1rem' }}>
                <label>
                  {isPictureMode && <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🩸</span>}
                  {t("Blood Glucose (mg/dL)")} <span className="ci-req">*</span>
                </label>
                <input name="glucose" type="number" placeholder="100" value={form.glucose} onChange={handleChange} required min="20" max="600" />
              </div>
            </div>
          </section>

          {/* NOTES SECTION */}
          <section className="ci-card">
            <h2 className="ci-card-title">{t("Additional Notes")}</h2>
            <div className="ci-field">
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder={t("Any other observations or concerns...")}
                rows={3}
              />
            </div>
          </section>

          {/* MICROPHONE TRANSCRIPT SECTION */}
          {mode === 'speech' && (
            <section className="ci-card">
              <h2 className="ci-card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎤 {t("Voice Input (Testing)")}
                  {isListening && <span style={{ color: 'red', fontSize: '0.8rem', animation: 'pulse 1.5s infinite' }}>● Recording...</span>}
                </span>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`ci-btn ${isListening ? 'ci-btn--red' : 'ci-btn--blue'}`}
                  style={{ padding: '0.4rem 0.8rem', width: 'auto', minHeight: 'auto', fontSize: '0.9rem' }}
                >
                  {isListening ? '🛑 Stop Mic' : '🎤 Start Mic'}
                </button>
              </h2>
              <p className="ci-step-subtitle" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                {t("This section displays what the microphone hears. You can use this to verify the speech-to-text works before Eleven Labs integration.")}
              </p>
              <div className="ci-field">
                <textarea
                  name="transcript"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={t("Your voice input will appear here...")}
                  rows={4}
                  style={{ backgroundColor: isListening ? '#fff3f3' : '#fff' }}
                />
              </div>
            </section>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="ci-btn ci-btn--blue" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? t('Saving Check-In...') : t('Save Daily Check-In')}
            </button>
            <button
              type="button"
              className="ci-btn"
              onClick={() => navigate('/')}
              style={{ flex: 1 }}
            >
              {t("Done")}
            </button>
          </div>

          {success && <p className="ci-success" style={{ textAlign: 'center' }}>{t("✓ Check-in saved successfully!")}</p>}
        </form>

        <div className="ci-tip">
          <span className="ci-tip-icon">ℹ</span>
          <div>
            <strong>{t("Daily Tip")}</strong>
            <p>{t("Recording your symptoms in detail helps your care provider understand triggers and patterns in your health.")}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckInDashboard;
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

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
      await axios.post('http://localhost:5001/api/checkins', {
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
              <select name="mood" value={form.mood} onChange={handleChange} required>
                <option value="" disabled>{t("Select mood...")}</option>
                {MOODS.map(m => <option key={m} value={m}>{t(m)}</option>)}
              </select>
            </div>
          </section>

          {/* ACTIVITY SECTION */}
          <section className="ci-card">
            <h2 className="ci-card-title">{t("Daily Activity")}</h2>
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
          </section>

          {/* SYMPTOMS SECTION */}
          <section className="ci-card">
            <h2 className="ci-card-title">{t("Symptoms")}</h2>
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
          </section>

          {/* VITALS SECTION */}
          <section className="ci-card">
            <h2 className="ci-card-title">{t("Vitals & Readings")}</h2>
            <div className="ci-fields">
              <div className="ci-field">
                <label>{t("Blood Pressure (Systolic / Diastolic)")}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input name="systolic" type="number" placeholder="120" value={form.systolic} onChange={handleChange} />
                  <input name="diastolic" type="number" placeholder="80" value={form.diastolic} onChange={handleChange} />
                </div>
              </div>
              <div className="ci-field" style={{ marginTop: '1rem' }}>
                <label>{t("Blood Glucose (mg/dL)")} <span className="ci-req">*</span></label>
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
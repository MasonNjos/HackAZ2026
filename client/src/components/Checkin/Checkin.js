import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import './Checkin.css';

const MOODS = ['Great', 'Good', 'Okay', 'Not great', 'Poor'];

const CheckInDashboard = () => {
  const { user } = useAuth0();
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

    const outputJSON = {
      check_in: {
        user_id: user?.sub,
        timestamp: new Date().toISOString(),
        mood: form.mood,
        activity: {
          did_exercise: form.hasActivity,
          details: form.activityDetails || "None"
        },
        health_metrics: {
          symptoms: form.hasSymptoms ? form.symptomsText : "None reported",
          blood_pressure: {
            systolic: parseInt(form.systolic) || null,
            diastolic: parseInt(form.diastolic) || null
          },
          glucose_mgdl: parseInt(form.glucose) || null
        },
        notes: form.notes
      }
    };

    console.log('Sending Check-In Data:', JSON.stringify(outputJSON, null, 2));
    
    // Simulate API submission
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
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
                <label>Details <span className="ci-optional">(e.g. 30 min walk)</span></label>
                <input 
                  type="text" 
                  name="activityDetails" 
                  value={form.activityDetails} 
                  onChange={handleChange} 
                  placeholder="What activity did you do?"
                />
              </div>
            )}
          </section>

          {/* SYMPTOMS SECTION (Converted to Text Input) */}
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
                <label>Please describe your symptoms:</label>
                <textarea 
                  name="symptomsText" 
                  value={form.symptomsText} 
                  onChange={handleChange} 
                  placeholder="e.g. Mild headache since morning, slight dizziness..."
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
                <label>Blood Pressure (Systolic / Diastolic)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input name="systolic" type="number" placeholder="120" value={form.systolic} onChange={handleChange} />
                  <input name="diastolic" type="number" placeholder="80" value={form.diastolic} onChange={handleChange} />
                </div>
              </div>
              <div className="ci-field" style={{ marginTop: '1rem' }}>
                <label>Blood Glucose (mg/dL)</label>
                <input name="glucose" type="number" placeholder="100" value={form.glucose} onChange={handleChange} />
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
                placeholder="Any other observations or concerns..." 
                rows={3} 
              />
            </div>
          </section>

          <button type="submit" className="ci-btn ci-btn--blue" disabled={submitting}>
            {submitting ? 'Saving Check-In...' : t("Save Daily Check-In")}
          </button>

          {success && <p className="ci-success" style={{ textAlign: 'center' }}>✓ Check-in saved successfully!</p>}
        </form>

        <div className="ci-tip">
          <span className="ci-tip-icon">ℹ</span>
          <div>
            <strong>Daily Tip</strong>
            <p>Recording your symptoms in detail helps your care provider understand triggers and patterns in your health.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckInDashboard;
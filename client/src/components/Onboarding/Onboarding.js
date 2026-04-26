import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';
import axios from 'axios';

const DISEASE_OPTIONS = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension',
  'COPD', 'Asthma', 'Chronic Kidney Disease',
  'Heart Disease', 'Arthritis', 'Hyperlipidemia'
];

const Onboarding = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    sex: '',
    height_in: '',
    weight_lbs: '',
    date_of_birth: '',
    diseases: [],
    has_tobacco: false,
    tobacco_vaping_per_week: 0,
    has_alcohol: false,
    drinking_times_per_week: 0
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      let updatedValue = type === 'checkbox' ? checked : value;
      let newState = { ...prev, [name]: updatedValue };

      // Habit logic: Reset count to 0 if the habit is unchecked
      if (name === 'has_tobacco' && !checked) newState.tobacco_vaping_per_week = 0;
      if (name === 'has_alcohol' && !checked) newState.drinking_times_per_week = 0;

      return newState;
    });
  };

  const handleDiseaseToggle = (disease) => {
    setForm((prev) => ({
      ...prev,
      diseases: prev.diseases.includes(disease)
        ? prev.diseases.filter((d) => d !== disease)
        : [...prev.diseases, disease],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const outputJSON = {
      patients: [
        {
          id: user?.sub || 1, // Use Auth0 ID or fallback to 1 for your example
          name: form.name,
          sex: form.sex,
          height_in: parseInt(form.height_in) || null,
          weight_lbs: parseInt(form.weight_lbs) || null,
          date_of_birth: form.date_of_birth,
          diseases: form.diseases,
          tobacco_vaping_times_per_week: parseInt(form.tobacco_vaping_per_week) || 0,
          drinking_times_per_week: parseInt(form.drinking_times_per_week) || 0
        }
      ]
    };

    try {
      await axios.post('http://localhost:5001/api/patients', outputJSON.patients[0]);
      sessionStorage.setItem(`onboarded_${user?.sub}`, 'true');
      navigate('/', { replace: true });
    } catch (err) {
      setError('Error saving profile. Please try again.');
    }
  };

  return (
    <div className="ob-page">
      <header className="ob-header">
        <h1>Saguaro Link</h1>
        <p>Comprehensive Health Enrollment</p>
      </header>

      <main className="ob-main">
        <form onSubmit={handleSubmit}>

          {/* SECTION 1: Personal Information */}
          <div className="ob-card" style={{ marginBottom: '1.25rem' }}>
            <h2 className="ob-step-title">Personal Information</h2>
            <div className="ob-fields">
              <div className="ob-field">
                <label>Full Name <span className="ob-req">*</span></label>
                <input name="name" type="text" onChange={handleChange} placeholder="Maria Garcia" required />
              </div>

              <div className="ob-row2">
                <div className="ob-field">
                  <label>Sex <span className="ob-req">*</span></label>
                  <select name="sex" onChange={handleChange} required>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="ob-field">
                  <label>Date of Birth <span className="ob-req">*</span></label>
                  <input name="date_of_birth" type="date" onChange={handleChange} required />
                </div>
              </div>

              {/* RESTORED: Height and Weight */}
              <div className="ob-row2">
                <div className="ob-field">
                  <label>Height (inches)</label>
                  <input name="height_in" type="number" value={form.height_in} onChange={handleChange} placeholder="e.g. 65" />
                </div>
                <div className="ob-field">
                  <label>Weight (lbs)</label>
                  <input name="weight_lbs" type="number" value={form.weight_lbs} onChange={handleChange} placeholder="e.g. 150" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Medical History */}
          <div className="ob-card" style={{ marginBottom: '1.25rem' }}>
            <h2 className="ob-step-title">Medical History</h2>
            <p className="ob-step-subtitle">Check all that apply to you:</p>
            <div className="ob-goals-grid">
              {DISEASE_OPTIONS.map((disease) => (
                <button
                  key={disease}
                  type="button"
                  className={`ob-goal-btn ${form.diseases.includes(disease) ? 'ob-goal-btn--selected' : ''}`}
                  onClick={() => handleDiseaseToggle(disease)}
                >
                  {form.diseases.includes(disease) && <span className="ob-goal-check">✓ </span>}
                  {disease}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: Lifestyle & Habits */}
          <div className="ob-card">
            <h2 className="ob-step-title">Lifestyle & Habits</h2>
            <div className="ob-fields">

              {/* Tobacco frequency check */}
              <div className="ob-field" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    name="has_tobacco"
                    type="checkbox"
                    checked={form.has_tobacco}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>I use tobacco or vaping products</span>
                </label>

                {form.has_tobacco && (
                  <div style={{ marginTop: '10px', paddingLeft: '30px' }}>
                    <label style={{ fontSize: '0.85rem' }}>Times per week:</label>
                    <input
                      name="tobacco_vaping_per_week"
                      type="number"
                      min="1"
                      value={form.tobacco_vaping_per_week}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              {/* Alcohol frequency check */}
              <div className="ob-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    name="has_alcohol"
                    type="checkbox"
                    checked={form.has_alcohol}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>I consume alcohol</span>
                </label>

                {form.has_alcohol && (
                  <div style={{ marginTop: '10px', paddingLeft: '30px' }}>
                    <label style={{ fontSize: '0.85rem' }}>Times per week:</label>
                    <input
                      name="drinking_times_per_week"
                      type="number"
                      min="1"
                      value={form.drinking_times_per_week}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

          {error && <p className="ob-error">{error}</p>}

          <div className="ob-nav">
            <button type="submit" className="ob-btn ob-btn--submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Complete Enrollment'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Onboarding;
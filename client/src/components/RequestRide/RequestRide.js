import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import axios from 'axios';
import './RequestRide.css';

const RequestRide = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    wheelchair: false,
    reason: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5001/api/rides', {
        pickup: form.pickup,
        destination: form.destination,
        date: form.date,
        time: form.time,
        wheelchair: form.wheelchair,
        reason: form.reason
      });
      setSubmitting(false);
      setSuccess(true);
      setForm({
        pickup: '',
        destination: '',
        date: '',
        time: '',
        wheelchair: false,
        reason: ''
      });
    } catch (err) {
      console.error(err);
      alert(t('Something went wrong. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="rr-page">
      <header className="rr-header">
        <button
          onClick={() => navigate('/')}
          className="rr-back-btn rr-back-btn--corner"
          title={t("Go back")}
        >
          &larr; {t("Back")}
        </button>
        <div className="rr-header-inner">
          <div>
            <h1>{t("Saguaro Link")}</h1>
            <p>{t("Request a Ride")}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LanguageToggle />
            {user && <span className="rr-welcome">{t("Welcome")}, {user.given_name || user.name}</span>}
          </div>
        </div>
      </header>

      <main className="rr-main">
        <form onSubmit={handleSubmit} className="rr-form">
          {/* LOCATION SECTION */}
          <section className="rr-card">
            <h2 className="rr-card-title">{t("Ride Details")}</h2>
            <div className="rr-field">
              <label>{t("Pickup Location")} <span className="rr-req">*</span></label>
              <input
                type="text"
                name="pickup"
                value={form.pickup}
                onChange={handleChange}
                placeholder={t("Enter pickup address")}
                required
              />
            </div>
            <div className="rr-field" style={{ marginTop: '1rem' }}>
              <label>{t("Destination")} <span className="rr-req">*</span></label>
              <input
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder={t("Enter destination address or clinic name")}
                required
              />
            </div>
          </section>

          {/* DATE & TIME SECTION */}
          <section className="rr-card">
            <h2 className="rr-card-title">{t("Schedule")}</h2>
            <div className="rr-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="rr-field">
                <label>{t("Date")} <span className="rr-req">*</span></label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="rr-field">
                <label>{t("Time")} <span className="rr-req">*</span></label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* ACCESSIBILITY SECTION */}
          <section className="rr-card">
            <h2 className="rr-card-title">{t("Accessibility & Notes")}</h2>
            <div className="rr-checkbox-group">
              <label className="rr-checkbox-label">
                <input type="checkbox" name="wheelchair" checked={form.wheelchair} onChange={handleChange} />
                <span className="rr-checkbox-box" />
                {t("I require a wheelchair-accessible vehicle")}
              </label>
            </div>
            <div className="rr-field" style={{ marginTop: '1rem' }}>
              <label>{t("Reason for Visit / Additional Notes")}</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder={t("e.g. Doctor's appointment, need assistance at door...")}
                rows={3}
              />
            </div>
          </section>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="rr-btn rr-btn--yellow" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? t('Requesting...') : t('Request Ride')}
            </button>
            <button
              type="button"
              className="rr-btn rr-btn--outline"
              onClick={() => navigate('/')}
              style={{ flex: 1 }}
            >
              {t("Cancel")}
            </button>
          </div>

          {success && <p className="rr-success" style={{ textAlign: 'center' }}>{t("✓ Ride requested successfully!")}</p>}
        </form>

        <div className="rr-tip">
          <span className="rr-tip-icon">🚗</span>
          <div>
            <strong>{t("Ride Information")}</strong>
            <p>{t("Please be ready 15 minutes before your scheduled pickup time. The driver will wait up to 5 minutes.")}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestRide;

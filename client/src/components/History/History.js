import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './History.css';

const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Fetch checkins history
    axios.get('http://localhost:5001/api/checkins')
      .then(res => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching history:', err);
        setError(t('Failed to load history logs.'));
        setLoading(false);
      });
  }, [t]);

  if (loading) return <div className="history-loading">{t('Loading history...')}</div>;
  if (error) return <div className="history-error">{error}</div>;

  return (
    <div className="history-page">
      <header className="history-header-bar">
        <div className="history-header-inner">
          <button onClick={() => navigate(-1)} className="btn-back-header">
            &larr; {t('Back')}
          </button>
          <h1>{t('My History Logs')}</h1>
        </div>
      </header>

      <main className="history-main">
        {logs.length === 0 ? (
          <div className="history-empty">
            <p>{t('No check-ins found. Start logging your daily health to see history here!')}</p>
            <Link to="/checkin" className="btn-primary">{t('Log Today')}</Link>
          </div>
        ) : (
          <div className="history-list">
            {logs.map((log, index) => {
              const bloodSugar = log.blood_sugar;

              // Apply Checkin.css style classes
              let readingClass = 'reading--normal';
              if (bloodSugar < 70) {
                readingClass = 'reading--low';
              } else if (bloodSugar >= 250) {
                readingClass = 'reading--low'; // >250 is also dangerous/low-like alert
              } else if (bloodSugar >= 180 && bloodSugar <= 249) {
                readingClass = 'reading--high'; // yellow alert
              }

              return (
                <div key={log.id || index} className="history-card">
                  <div className="history-card-header">
                    <div className="history-date">
                      {new Date(log.checkin_date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {log.mood && <div className="history-mood">{t(log.mood)}</div>}
                  </div>

                  <div className="history-details">
                    <div className="history-reading">
                      <span className="history-reading-label">{t('Blood Sugar')}</span>
                      <div className={`reading-box ${readingClass}`}>
                        {bloodSugar} <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>mg/dL</span>
                      </div>
                    </div>

                    {(log.systolic && log.diastolic) && (
                      <div className="history-reading">
                        <span className="history-reading-label">{t('Blood Pressure')}</span>
                        <div className="reading-box">
                          {log.systolic}/{log.diastolic} <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>mmHg</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;

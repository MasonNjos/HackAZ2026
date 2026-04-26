import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  const handleChange = (e) => {
    if (e.target.value !== language) {
      toggleLanguage();
    }
  };

  return (
    <select
      value={language}
      onChange={handleChange}
      style={{
        padding: '0.4rem 0.8rem',
        fontSize: '0.95rem',
        fontWeight: 'bold',
        border: '2px solid #000',
        borderRadius: '4px',
        backgroundColor: '#fff',
        color: '#000',
        cursor: 'pointer',
        fontFamily: 'Arial, sans-serif'
      }}
      title={language === 'en' ? 'Select Language' : 'Seleccionar Idioma'}
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
};

export default LanguageToggle;

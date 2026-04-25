import React, { useState } from 'react';
import axios from 'axios';

const CheckInForm = () => {
  const [formData, setFormData] = useState({
    blood_sugar: '',
    insulin_taken: '',
    medications_taken: '',
    symptoms: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Format for Gemma 4 analysis
    const dataForGemma = {
      ...formData,
      timestamp: new Date().toISOString(),
      // Mock analysis
      trend: formData.blood_sugar > 200 ? 'high' : formData.blood_sugar < 70 ? 'low' : 'normal'
    };
    console.log('Data for Gemma:', dataForGemma);

    try {
      await axios.post('http://localhost:5000/api/checkins', formData);
      alert('Check-in submitted! You earned 10 credits.');
      setFormData({
        blood_sugar: '',
        insulin_taken: '',
        medications_taken: '',
        symptoms: ''
      });
    } catch (error) {
      console.error(error);
      alert('Error submitting check-in');
    }
  };

  return (
    <div>
      <h2>Daily Glucose Entry</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Blood Sugar (mg/dL):
          <input type="number" name="blood_sugar" value={formData.blood_sugar} onChange={handleChange} required />
        </label>
        <label>
          Insulin Taken (units):
          <input type="number" step="0.1" name="insulin_taken" value={formData.insulin_taken} onChange={handleChange} />
        </label>
        <label>
          Medications Taken:
          <textarea name="medications_taken" value={formData.medications_taken} onChange={handleChange} />
        </label>
        <label>
          Symptoms:
          <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} />
        </label>
        <button type="submit" className="btn-primary">Submit Check-In</button>
      </form>
    </div>
  );
};

export default CheckInForm;
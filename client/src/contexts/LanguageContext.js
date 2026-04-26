import React, { createContext, useState, useContext } from 'react';

export const LanguageContext = createContext();

const translations = {
  en: {
    "Saguaro Link": "Saguaro Link",
    "Welcome": "Welcome",
    "Get Started": "Get Started",
    "Log Out": "Log Out",
    "Manage your health. Stay connected.": "Manage your health. Stay connected.",
    "Log your vitals, track symptoms, and stay in touch with your care team — all in one place.": "Log your vitals, track symptoms, and stay in touch with your care team — all in one place.",
    "Health Check-In": "Health Check-In",
    "Record your vitals, symptoms, and daily activity.": "Record your vitals, symptoms, and daily activity.",
    "Log Today": "Log Today",
    "Doctor Chat": "Doctor Chat",
    "Directly message your care team with questions or concerns.": "Directly message your care team with questions or concerns.",
    "Open Chat": "Open Chat",
    "My Logs": "My Logs",
    "Review your check-in history and track your health progress.": "Review your check-in history and track your health progress.",
    "View History": "View History",
    "Request a Ride": "Request a Ride",
    "Schedule or request transportation to your upcoming appointments.": "Schedule or request transportation to your upcoming appointments.",
    "Get a Ride": "Get a Ride",
    "Proactive Care": "Proactive Care",
    "Daily Health Monitor": "Daily Health Monitor",
    "General Wellbeing": "General Wellbeing",
    "How are you feeling today?": "How are you feeling today?",
    "Select mood...": "Select mood...",
    "Great": "Great",
    "Good": "Good",
    "Okay": "Okay",
    "Not great": "Not great",
    "Poor": "Poor",
    "Daily Activity": "Daily Activity",
    "I was physically active today": "I was physically active today",
    "Symptoms": "Symptoms",
    "I am experiencing symptoms today": "I am experiencing symptoms today",
    "Vitals & Readings": "Vitals & Readings",
    "Additional Notes": "Additional Notes",
    "Save Daily Check-In": "Save Daily Check-In",
    "Consistent tracking helps Saguaro Link identify patterns and helps you manage your health more effectively.": "Consistent tracking helps Saguaro Link identify patterns and helps you manage your health more effectively."
  },
  es: {
    "Saguaro Link": "Saguaro Link",
    "Welcome": "Bienvenido",
    "Get Started": "Empezar",
    "Log Out": "Cerrar sesión",
    "Manage your health. Stay connected.": "Maneja tu salud. Mantente conectado.",
    "Log your vitals, track symptoms, and stay in touch with your care team — all in one place.": "Registra tus signos vitales, síntomas y mantente en contacto con tu equipo de salud, todo en un solo lugar.",
    "Health Check-In": "Chequeo de Salud",
    "Record your vitals, symptoms, and daily activity.": "Registra tus signos vitales, síntomas y actividad diaria.",
    "Log Today": "Registrar Hoy",
    "Doctor Chat": "Chat con Médico",
    "Directly message your care team with questions or concerns.": "Envía mensajes a tu equipo médico con preguntas o inquietudes.",
    "Open Chat": "Abrir Chat",
    "My Logs": "Mis Registros",
    "Review your check-in history and track your health progress.": "Revisa tu historial y sigue el progreso de tu salud.",
    "View History": "Ver Historial",
    "Request a Ride": "Pedir Transporte",
    "Schedule or request transportation to your upcoming appointments.": "Programa o pide transporte para tus próximas citas.",
    "Get a Ride": "Pedir un Viaje",
    "Proactive Care": "Cuidado Proactivo",
    "Daily Health Monitor": "Monitor de Salud Diario",
    "General Wellbeing": "Bienestar General",
    "How are you feeling today?": "¿Cómo te sientes hoy?",
    "Select mood...": "Seleccionar estado...",
    "Great": "Excelente",
    "Good": "Bien",
    "Okay": "Regular",
    "Not great": "No muy bien",
    "Poor": "Mal",
    "Daily Activity": "Actividad Diaria",
    "I was physically active today": "Estuve físicamente activo hoy",
    "Symptoms": "Síntomas",
    "I am experiencing symptoms today": "Tengo síntomas hoy",
    "Vitals & Readings": "Signos Vitales",
    "Additional Notes": "Notas Adicionales",
    "Save Daily Check-In": "Guardar Chequeo Diario",
    "Consistent tracking helps Saguaro Link identify patterns and helps you manage your health more effectively.": "El seguimiento constante ayuda a identificar patrones y a manejar tu salud más eficazmente."
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

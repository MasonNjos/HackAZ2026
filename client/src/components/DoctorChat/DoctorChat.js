import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import './DoctorChat.css';

const DoctorChat = () => {
  const { user } = useAuth0();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'doctor',
      text: "Hello! I saw your glucose readings from this morning. How are you feeling?",
      time: '10:30 AM'
    },
    {
      id: 2,
      sender: 'patient',
      text: "I'm feeling okay, just a bit tired. I think my blood pressure was a little high too.",
      time: '10:35 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'patient',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Mock Doctor Response
    setTimeout(() => {
      const docResponse = {
        id: Date.now() + 1,
        sender: 'doctor',
        text: "Thank you for letting me know. Keep monitoring it and let's check in again tomorrow morning.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, docResponse]);
    }, 2000);
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="chat-header-inner">
          <Link to="/" className="chat-back-btn">← Back</Link>
          <div className="chat-dr-info">
            <h1>Saguaro Link</h1>
            <p>Chatting with: <strong>Dr. Arispe</strong></p>
          </div>
        </div>
      </header>

      <main className="chat-container">
        <div className="chat-window">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                <p className="message-text">{msg.text}</p>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message to your doctor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="chat-send-btn">Send</button>
        </form>
      </main>
    </div>
  );
};

export default DoctorChat;
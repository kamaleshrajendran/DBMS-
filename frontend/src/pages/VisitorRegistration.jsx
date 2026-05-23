import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

export default function VisitorRegistration() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to local storage
    localStorage.setItem('visitorInfo', JSON.stringify({ name, city, role }));
    
    // Proceed to scan page
    navigate('/scan');
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Enter Details to Scan</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} required style={{
            width: '100%',
            padding: '0.8rem',
            marginBottom: '1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            background: 'var(--card-bg)'
          }}>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="others">Others</option>
          </select>
          <button type="submit">Proceed to Scan</button>
        </form>
      </div>
    </div>
  );
}

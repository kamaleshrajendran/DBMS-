import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VisitorView from './pages/VisitorView';
import ScanPage from './pages/ScanPage';
import VisitorRegistration from './pages/VisitorRegistration';
import './App.css';

function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuth(!!token);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;
  return isAuth ? children : <Navigate to="/login" />;
}

function VisitorRoute({ children }) {
  const visitorInfo = localStorage.getItem('visitorInfo');
  return visitorInfo ? children : <Navigate to="/visitor-register" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/visitor-register" element={<VisitorRegistration />} />
        <Route 
          path="/scan" 
          element={
            <VisitorRoute>
              <ScanPage />
            </VisitorRoute>
          } 
        />
        <Route path="/visitor/:buildingId" element={<VisitorView />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/scan" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

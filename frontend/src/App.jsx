import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';         // Import
import RegisterPage from './pages/RegisterPage';   // Import
import ProtectedRoute from './components/ProtectedRoute'; // Import

import './App.css';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/report" element={<ReportPage />} />

      {/* This element wraps any routes that need protection */}
      <Route element={<ProtectedRoute />}>
        {/* Any route inside here is now protected */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
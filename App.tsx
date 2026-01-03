
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import MyTrips from './pages/MyTrips';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import CitySearch from './pages/CitySearch';
import BudgetBreakdown from './pages/BudgetBreakdown';
import TripCalendar from './pages/TripCalendar';
import AdminDashboard from './pages/AdminDashboard';
import { MockDB } from './services/db';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = MockDB.getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = MockDB.getCurrentUser();
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Auth type="login" />} />
          <Route path="/signup" element={<Auth type="signup" />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><CitySearch /></ProtectedRoute>} />
          <Route path="/create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
          <Route path="/trips/:id/budget" element={<ProtectedRoute><BudgetBreakdown /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><TripCalendar /></ProtectedRoute>} />
          <Route path="/timeline/:id" element={<ProtectedRoute><TripCalendar /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;

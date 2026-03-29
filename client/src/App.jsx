import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';
import Wallet from './pages/Wallet';
import History from './pages/History';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="min-h-screen gradient-bg">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <PrivateRoute>
                  <Game />
                </PrivateRoute>
              } />
              <Route path="/wallet" element={
                <PrivateRoute>
                  <Wallet />
                </PrivateRoute>
              } />
              <Route path="/history" element={
                <PrivateRoute>
                  <History />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;

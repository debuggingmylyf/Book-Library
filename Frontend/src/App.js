import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import BookSearch from './components/BookSearch';
import IssueBook from './components/IssueBook';
import ReturnBook from './components/ReturnBook';
import Transactions from './components/Transactions';
import Admin from './components/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <div className="App">
            <Navbar />
            <main className="container">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/books" element={<BookList />} />
                <Route path="/search" element={<BookSearch />} />
                <Route path="/issue" element={
                  <ProtectedRoute>
                    <IssueBook />
                  </ProtectedRoute>
                } />
                <Route path="/return" element={
                  <ProtectedRoute>
                    <ReturnBook />
                  </ProtectedRoute>
                } />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } />
                
                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App;

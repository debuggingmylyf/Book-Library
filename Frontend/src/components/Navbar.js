import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📚 Book Library</Link>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/books" className="nav-link">Books</Link>
            <Link to="/search" className="nav-link">Search</Link>
            <Link to="/issue" className="nav-link">Issue Book</Link>
            <Link to="/return" className="nav-link">Return Book</Link>
            <Link to="/transactions" className="nav-link">Transactions</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-link admin">Admin</Link>
            )}
            <div className="user-info">
              <span>Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

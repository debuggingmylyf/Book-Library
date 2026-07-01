import React, { useEffect, useState } from 'react';
import { getAllBooks, getAllUsers, getBooksInDateRange } from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, recentTransactions: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, usersRes] = await Promise.all([getAllBooks(1, 1), getAllUsers()]);
        setStats({
          totalBooks: booksRes.data?.totalCount || 0,
          totalUsers: usersRes.data?.count || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user?.name}!</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📚 Total Books</h3>
          <p className="stat-number">{stats.totalBooks}</p>
        </div>
        <div className="stat-card">
          <h3>👥 Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>📖 Quick Actions</h3>
          <div className="quick-actions">
            <a href="/issue" className="quick-link">Issue Book</a>
            <a href="/return" className="quick-link">Return Book</a>
            <a href="/search" className="quick-link">Search Books</a>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <h3>Getting Started</h3>
        <ul>
          <li>📚 Browse all books in the <a href="/books">Books</a> section</li>
          <li>🔍 Search for books by name or rent range</li>
          <li>📝 Issue books to users (requires login)</li>
          <li>↩️ Return books and calculate rent</li>
          <li>📊 View transaction history in <a href="/transactions">Transactions</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

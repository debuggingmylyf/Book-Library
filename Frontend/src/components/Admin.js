import React, { useEffect, useState } from 'react';
import { getAllBooks, getAllUsers, getBooksInDateRange } from '../api';

const Admin = () => {
  const [stats, setStats] = useState({ books: 0, users: 0, transactions: 0, totalRent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [booksRes, usersRes] = await Promise.all([getAllBooks(1, 1), getAllUsers()]);
        setStats({
          books: booksRes.data?.totalCount || 0,
          users: usersRes.data?.count || 0,
        });
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <h2>👑 Admin Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card admin-card">
          <h3>📚 Total Books</h3>
          <p className="stat-number">{stats.books}</p>
        </div>
        <div className="stat-card admin-card">
          <h3>👥 Total Users</h3>
          <p className="stat-number">{stats.users}</p>
        </div>
      </div>

      <div className="admin-section">
        <h3>Admin Actions</h3>
        <div className="admin-actions">
          <p>To seed the database with sample data:</p>
          <code>npm run seed</code>
        </div>
      </div>
    </div>
  );
};

export default Admin;

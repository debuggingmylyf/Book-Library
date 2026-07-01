import React, { useState, useEffect } from 'react';
import { getIssuedBooksByUser, getBooksInDateRange, getTotalRent } from '../api';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [userName, setUserName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookName, setBookName] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [rentData, setRentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUserSearch = async () => {
    if (!userName.trim()) {
      setError('Please enter a user name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await getIssuedBooksByUser(userName);
      if (response.success) {
        setTransactions(response.data.issuedBooks);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await getBooksInDateRange(startDate, endDate);
      if (response.success) {
        setTransactions(response.data.issuedBooks);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleRentSearch = async () => {
    if (!bookName.trim()) {
      setError('Please enter a book name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await getTotalRent(bookName);
      if (response.success) {
        setRentData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate rent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transactions-container">
      <h2>Transactions</h2>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => { setActiveTab('user'); setTransactions([]); setError(''); }}
        >
          By User
        </button>
        <button 
          className={`tab ${activeTab === 'date' ? 'active' : ''}`}
          onClick={() => { setActiveTab('date'); setTransactions([]); setError(''); }}
        >
          By Date Range
        </button>
        <button 
          className={`tab ${activeTab === 'rent' ? 'active' : ''}`}
          onClick={() => { setActiveTab('rent'); setRentData(null); setError(''); }}
        >
          Total Rent
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'user' && (
        <div className="tab-content">
          <div className="search-form">
            <input
              type="text"
              placeholder="Enter user name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button onClick={handleUserSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {transactions.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book Name</th>
                  <th>Category</th>
                  <th>Issue Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{tx.bookName}</td>
                    <td>{tx.category}</td>
                    <td>{new Date(tx.issueDate).toLocaleDateString()}</td>
                    <td>{tx.returnDate ? new Date(tx.returnDate).toLocaleDateString() : '-'}</td>
                    <td className={`status ${tx.status.toLowerCase()}`}>{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'date' && (
        <div className="tab-content">
          <div className="search-form">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={handleDateRangeSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {transactions.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book Name</th>
                  <th>Issued To</th>
                  <th>Issue Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{tx.bookName}</td>
                    <td>{tx.issuedTo}</td>
                    <td>{new Date(tx.issueDate).toLocaleDateString()}</td>
                    <td>{tx.returnDate ? new Date(tx.returnDate).toLocaleDateString() : '-'}</td>
                    <td className={`status ${tx.status.toLowerCase()}`}>{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'rent' && (
        <div className="tab-content">
          <div className="search-form">
            <input
              type="text"
              placeholder="Enter book name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
            />
            <button onClick={handleRentSearch} disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate'}
            </button>
          </div>
          {rentData && (
            <div className="rent-result">
              <h3>{rentData.bookName}</h3>
              <p><strong>Total Transactions:</strong> {rentData.totalTransactions}</p>
              <p><strong>Total Rent Generated:</strong> ${rentData.totalRent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transactions;

import React, { useState } from 'react';
import { returnBook } from '../api';
import { useAuth } from '../context/AuthContext';

const ReturnBook = () => {
  const [bookName, setBookName] = useState('');
  const [userName, setUserName] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const handleReturn = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!bookName || !userName || !returnDate) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await returnBook(bookName, userName, returnDate);
      if (response.success) {
        setResult(response.data);
        setBookName('');
        setUserName('');
        setReturnDate('');
      } else {
        setError(response.message || 'Failed to return book');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Return a Book</h2>
        <p>Please log in to return books.</p>
      </div>
    );
  }

  return (
    <div className="return-book-container">
      <h2>Return a Book</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {result && (
        <div className="success-message">
          <h3>Book Returned Successfully!</h3>
          <p><strong>Days Rented:</strong> {result.daysRented}</p>
          <p><strong>Total Rent:</strong> ${result.totalRent}</p>
        </div>
      )}

      <form onSubmit={handleReturn} className="form">
        <div className="form-group">
          <label htmlFor="bookName">Book Name</label>
          <input
            type="text"
            id="bookName"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="Enter book name"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="userName">User Name</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter user name"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="returnDate">Return Date</label>
          <input
            type="date"
            id="returnDate"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Processing...' : 'Return Book'}
        </button>
      </form>
    </div>
  );
};

export default ReturnBook;

import React, { useState, useEffect } from 'react';
import { issueBook, getBooks, getAllUsers } from '../api';
import { useAuth } from '../context/AuthContext';

const IssueBook = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookName, setBookName] = useState('');
  const [userName, setUserName] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, usersRes] = await Promise.all([getBooks(), getAllUsers()]);
        if (booksRes.success) setBooks(booksRes.data.books);
        if (usersRes.success) setUsers(usersRes.data.users);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bookName || !userName || !issueDate) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await issueBook(bookName, userName, issueDate);
      if (response.success) {
        setSuccess(`Book "${bookName}" issued successfully to ${userName}!`);
        setBookName('');
        setUserName('');
        setIssueDate('');
      } else {
        setError(response.message || 'Failed to issue book');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Issue a Book</h2>
        <p>Please log in to issue books.</p>
      </div>
    );
  }

  return (
    <div className="issue-book-container">
      <h2>Issue a Book</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleIssue} className="form">
        <div className="form-group">
          <label htmlFor="bookName">Book Name</label>
          <input
            type="text"
            id="bookName"
            list="books-list"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="Select or enter book name"
            disabled={loading}
          />
          <datalist id="books-list">
            {books.map((book) => (
              <option key={book._id} value={book.name} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="userName">User Name</label>
          <input
            type="text"
            id="userName"
            list="users-list"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Select or enter user name"
            disabled={loading}
          />
          <datalist id="users-list">
            {users.map((user) => (
              <option key={user._id} value={user.name} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="issueDate">Issue Date</label>
          <input
            type="date"
            id="issueDate"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Issuing...' : 'Issue Book'}
        </button>
      </form>
    </div>
  );
};

export default IssueBook;

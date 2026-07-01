import React, { useState } from 'react';
import { searchBooks, filterBooksByRent } from '../api';

const BookSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('name');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      let response;
      if (searchType === 'name') {
        if (!searchTerm.trim()) {
          setError('Please enter a book name to search');
          setLoading(false);
          return;
        }
        response = await searchBooks(searchTerm);
      } else {
        if (!minRent || !maxRent) {
          setError('Please enter both min and max rent values');
          setLoading(false);
          return;
        }
        response = await filterBooksByRent(minRent, maxRent);
      }

      if (response.success) {
        setResults(response.data.books);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-search-container">
      <h2>Search Books</h2>

      <div className="search-type-tabs">
        <button 
          className={`tab ${searchType === 'name' ? 'active' : ''}`}
          onClick={() => { setSearchType('name'); setResults([]); setError(''); }}
        >
          By Name
        </button>
        <button 
          className={`tab ${searchType === 'rent' ? 'active' : ''}`}
          onClick={() => { setSearchType('rent'); setResults([]); setError(''); }}
        >
          By Rent Range
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-form">
        {searchType === 'name' ? (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter book name..."
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        ) : (
          <>
            <input
              type="number"
              value={minRent}
              onChange={(e) => setMinRent(e.target.value)}
              placeholder="Min rent"
              min="0"
            />
            <input
              type="number"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              placeholder="Max rent"
              min="0"
            />
          </>
        )}
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Rent/Day</th>
            </tr>
          </thead>
          <tbody>
            {results.map((book) => (
              <tr key={book._id}>
                <td>{book.name}</td>
                <td>{book.category}</td>
                <td>${book.rentPerDay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && results.length === 0 && searchTerm && !error && searchType === 'name' && (
        <p className="empty-state">No books found matching your search.</p>
      )}
    </div>
  );
};

export default BookSearch;

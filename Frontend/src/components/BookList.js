import React, { useState, useEffect } from 'react';
import { getAllBooks } from '../api';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchBooks = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await getAllBooks(pageNum, limit);
      if (response.success) {
        setBooks(response.data.books);
        setTotalPages(response.data.totalPages);
        setPage(response.data.page);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(1);
  }, []);

  if (loading) {
    return <div className="loading">Loading books...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="book-list-container">
      <h2>All Books</h2>
      
      {books.length === 0 ? (
        <p className="empty-state">No books found.</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Rent/Day</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>{book.name}</td>
                  <td>{book.category}</td>
                  <td>${book.rentPerDay}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button 
              onClick={() => fetchBooks(page - 1)} 
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              onClick={() => fetchBooks(page + 1)} 
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookList;

import express from 'express';
import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { issueBookSchema, returnBookSchema, validate } from '../validators/schemas.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = express.Router();

// API to get all books
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Book.countDocuments();
    const books = await Book.find().skip(skip).limit(limit);

    return successResponse(res, 'Books fetched successfully', {
      books,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    console.error('Error fetching books:', err);
    return errorResponse(res, 'Failed to fetch books', null, 500);
  }
});

// API to search books by name or term
router.get('/search', async (req, res) => {
  const { name } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const query = name ? { name: new RegExp(name, 'i') } : {};
    const totalCount = await Book.countDocuments(query);
    const books = await Book.find(query).skip(skip).limit(limit);

    return successResponse(res, 'Books searched successfully', {
      books,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    console.error('Error searching books:', err);
    return errorResponse(res, 'Failed to search books', null, 500);
  }
});

// API to get books within a rent range
router.get('/filter-by-rent', async (req, res) => {
  const { minRent, maxRent } = req.query;
  try {
    if (!minRent || !maxRent) {
      return errorResponse(res, 'minRent and maxRent are required', null, 400);
    }
    const books = await Book.find({
      rentPerDay: { $gte: Number(minRent), $lte: Number(maxRent) }
    });
    return successResponse(res, 'Books fetched successfully', { books, count: books.length });
  } catch (err) {
    console.error('Error filtering books by rent:', err);
    return errorResponse(res, 'Failed to fetch books', null, 500);
  }
});

// API to get books by category + name/term + rent range
router.get('/filter-by-category-and-rent', async (req, res) => {
  const { category, name, minRent, maxRent } = req.query;
  try {
    if (!category || !minRent || !maxRent) {
      return errorResponse(res, 'category, minRent and maxRent are required', null, 400);
    }
    const query = {
      category,
      rentPerDay: { $gte: Number(minRent), $lte: Number(maxRent) }
    };
    if (name) {
      query.name = new RegExp(name, 'i');
    }
    const books = await Book.find(query);
    return successResponse(res, 'Books fetched successfully', { books, count: books.length });
  } catch (err) {
    console.error('Error filtering books:', err);
    return errorResponse(res, 'Failed to fetch books', null, 500);
  }
});



// API to issue a book
router.post('/issue-book', authenticate, validate(issueBookSchema), async (req, res) => {
  const { bookName, userName, issueDate } = req.validatedBody;

  try {
    const book = await Book.findOne({ name: bookName });
    const user = await User.findOne({ name: userName });

    if (!book || !user) {
      return errorResponse(res, 'Book or User not found', null, 404);
    }

    const newTransaction = new Transaction({
      bookId: book._id,
      userId: user._id,
      issueDate: new Date(issueDate)
    });

    await newTransaction.save();
    return successResponse(res, 'Book issued successfully', { transaction: newTransaction }, 201);
  } catch (err) {
    console.error('Error issuing book:', err);
    return errorResponse(res, 'Failed to issue book', null, 500);
  }
});

// API to return a book and calculate rent
router.post('/return-book', authenticate, validate(returnBookSchema), async (req, res) => {
  const { bookName, userName, returnDate } = req.validatedBody;

  try {
    const book = await Book.findOne({ name: bookName });
    const user = await User.findOne({ name: userName });

    if (!book || !user) {
      return errorResponse(res, 'Book or User not found', null, 404);
    }

    const transaction = await Transaction.findOne({
      bookId: book._id,
      userId: user._id,
      returnDate: null
    });

    if (!transaction) {
      return errorResponse(res, 'No active transaction found for this book and user', null, 404);
    }

    const issueDate = new Date(transaction.issueDate);
    const returnDateObj = new Date(returnDate);
    const daysRented = Math.ceil((returnDateObj - issueDate) / (1000 * 60 * 60 * 24));
    const rent = book.rentPerDay * daysRented;

    transaction.returnDate = returnDateObj;
    await transaction.save();

    return successResponse(res, 'Book returned successfully', { daysRented, totalRent: rent });
  } catch (err) {
    console.error('Error returning book:', err);
    return errorResponse(res, 'Failed to return book', null, 500);
  }
});

// API to get users who issued a specific book and current status
router.get('/issued-users', async (req, res) => {
  const { bookName } = req.query;
  try {
    if (!bookName) {
      return errorResponse(res, 'bookName is required', null, 400);
    }
    const book = await Book.findOne({ name: new RegExp(bookName, 'i') });
    if (!book) {
      return errorResponse(res, 'Book not found', null, 404);
    }

    // Find all transactions for this book
    const transactions = await Transaction.find({ bookId: book._id }).populate('userId', 'name');
    const totalIssued = transactions.length;

    // Find the currently issued transaction (where returnDate is null)
    const currentTransaction = transactions.find(tx => !tx.returnDate);

    return successResponse(res, 'Issued users fetched successfully', {
      bookName: book.name,
      totalIssued,
      currentlyIssuedTo: currentTransaction ? currentTransaction.userId.name : 'Not issued currently',
      allUsers: transactions.map(tx => tx.userId.name)
    });
  } catch (err) {
    console.error('Error fetching issued users:', err);
    return errorResponse(res, 'Failed to fetch issued users', null, 500);
  }
});


// API to get total rent generated by a book
router.get('/total-rent', async (req, res) => {
  const { bookName } = req.query;
  try {
    if (!bookName) {
      return errorResponse(res, 'bookName is required', null, 400);
    }
    const book = await Book.findOne({ name: new RegExp(bookName, 'i') });
    if (!book) {
      return errorResponse(res, 'Book not found', null, 404);
    }

    // Find all transactions for this book
    const transactions = await Transaction.find({ bookId: book._id });

    // Calculate total rent
    let totalRent = 0;
    transactions.forEach(tx => {
      if (tx.returnDate) {
        const daysRented = Math.ceil((new Date(tx.returnDate) - new Date(tx.issueDate)) / (1000 * 60 * 60 * 24));
        totalRent += book.rentPerDay * daysRented;
      }
    });

    return successResponse(res, 'Total rent calculated successfully', {
      bookName: book.name,
      totalTransactions: transactions.length,
      totalRent
    });
  } catch (err) {
    console.error('Error calculating total rent:', err);
    return errorResponse(res, 'Failed to calculate total rent', null, 500);
  }
});


// API to get all books issued by a specific user
router.get('/issued-books', async (req, res) => {
  const { userName } = req.query;
  try {
    if (!userName) {
      return errorResponse(res, 'userName is required', null, 400);
    }
    const user = await User.findOne({ name: new RegExp(userName, 'i') });
    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Find all transactions for this user
    const transactions = await Transaction.find({ userId: user._id })
      .populate('bookId', 'name category rentPerDay')
      .sort({ issueDate: -1 });
    
    const issuedBooks = transactions.map(tx => ({
      bookName: tx.bookId?.name || 'Unknown',
      category: tx.bookId?.category || 'Unknown',
      issueDate: tx.issueDate,
      returnDate: tx.returnDate,
      status: tx.returnDate ? 'Returned' : 'Issued'
    }));

    return successResponse(res, 'Issued books fetched successfully', {
      userName: user.name,
      totalBooks: issuedBooks.length,
      issuedBooks
    });
  } catch (err) {
    console.error('Error fetching issued books:', err);
    return errorResponse(res, 'Failed to fetch issued books', null, 500);
  }
});


// API to get books issued within a date range
router.get('/issued-in-date-range', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    if (!startDate || !endDate) {
      return errorResponse(res, 'startDate and endDate are required', null, 400);
    }
    const transactions = await Transaction.find({
      issueDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .populate('bookId', 'name category rentPerDay')
      .populate('userId', 'name email')
      .sort({ issueDate: -1 });

    const issuedBooks = transactions.map(tx => ({
      bookName: tx.bookId?.name || 'Unknown',
      category: tx.bookId?.category || 'Unknown',
      issuedTo: tx.userId?.name || 'Unknown',
      issueDate: tx.issueDate,
      returnDate: tx.returnDate,
      status: tx.returnDate ? 'Returned' : 'Issued'
    }));

    return successResponse(res, 'Books fetched successfully', {
      dateRange: { startDate, endDate },
      totalTransactions: issuedBooks.length,
      issuedBooks
    });
  } catch (err) {
    console.error('Error fetching books by date range:', err);
    return errorResponse(res, 'Failed to fetch books issued in date range', null, 500);
  }
});

// API to list all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return successResponse(res, 'Users fetched successfully', { users, count: users.length });
  } catch (err) {
    console.error('Error fetching users:', err);
    return errorResponse(res, 'Failed to fetch users', null, 500);
  }
});

// API to list all books
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ name: 1 });
    return successResponse(res, 'Books fetched successfully', { books, count: books.length });
  } catch (err) {
    console.error('Error fetching books:', err);
    return errorResponse(res, 'Failed to fetch books', null, 500);
  }
});

export default router;
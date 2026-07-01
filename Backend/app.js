
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import bookRoutes from './routes/bookRoutes.js';
import Book from './models/Book.js';
import User from './models/User.js';
import { authenticate } from './middleware/auth.js';
import { registerSchema, loginSchema, validate } from './validators/schemas.js';
import { successResponse, errorResponse } from './utils/response.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
const mongoDBUrl = process.env.MONGODB_URL;
mongoose.connect(mongoDBUrl)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

// Define a simple route
app.get('/', (req, res) => {
  res.send('Welcome to Book Library API');
});

// ============ AUTH ROUTES ============

// Register route
app.post('/api/auth/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.validatedBody;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', null, 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    return successResponse(res, 'User registered successfully', {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Registration failed', null, 500);
  }
});

// Login route
app.post('/api/auth/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', null, 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', null, 401);
    }

    // Generate JWT token (1 hour expiry)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate refresh token (7 days expiry)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRY || 7}d` }
    );

    return successResponse(res, 'Login successful', {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', null, 500);
  }
});

// Refresh token route
app.post('/api/auth/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', null, 401);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'User not found', null, 404);
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return successResponse(res, 'Token refreshed successfully', {
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse(res, 'Token refresh failed', null, 401);
  }
});

// ============ SEEDING (Optional, on demand) ============

async function seedBooks() {
  try {
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.insertMany([
        { name: 'JavaScript: The Good Parts', category: 'Programming', rentPerDay: 10 },
        { name: 'Clean Code', category: 'Programming', rentPerDay: 15 },
        { name: 'The Pragmatic Programmer', category: 'Programming', rentPerDay: 12 },
        { name: 'Eloquent JavaScript', category: 'Programming', rentPerDay: 8 },
        { name: 'You Don\'t Know JS', category: 'Programming', rentPerDay: 10 },
        { name: 'Introduction to Algorithms', category: 'Computer Science', rentPerDay: 20 },
        { name: 'Cracking the Coding Interview', category: 'Interview Prep', rentPerDay: 18 },
        { name: 'Design Patterns', category: 'Software Engineering', rentPerDay: 16 },
        { name: 'Refactoring', category: 'Software Engineering', rentPerDay: 14 },
        { name: 'Head First Design Patterns', category: 'Software Engineering', rentPerDay: 13 },
        { name: 'The Mythical Man-Month', category: 'Software Engineering', rentPerDay: 17 },
        { name: 'Code Complete', category: 'Software Engineering', rentPerDay: 19 },
        { name: 'Introduction to the Theory of Computation', category: 'Computer Science', rentPerDay: 20 },
        { name: 'The Art of Computer Programming', category: 'Computer Science', rentPerDay: 22 },
        { name: 'Effective Java', category: 'Programming', rentPerDay: 11 },
        { name: 'The C Programming Language', category: 'Programming', rentPerDay: 9 },
        { name: 'Operating Systems Concepts', category: 'Computer Science', rentPerDay: 21 },
        { name: 'Computer Networks', category: 'Computer Science', rentPerDay: 18 },
        { name: 'Introduction to Machine Learning', category: 'Artificial Intelligence', rentPerDay: 23 },
        { name: 'Deep Learning with Python', category: 'Artificial Intelligence', rentPerDay: 25 }
      ]);
      console.log('20 books inserted');
    } else {
      console.log('Books already exist in database');
    }
  } catch (error) {
    console.error('Error seeding books:', error);
  }
}

async function seedUsers() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // Seed with hashed passwords
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.insertMany([
        { name: 'John Doe', email: 'john.doe@example.com', password: hashedPassword },
        { name: 'Jane Smith', email: 'jane.smith@example.com', password: hashedPassword },
        { name: 'Michael Johnson', email: 'michael.johnson@example.com', password: hashedPassword },
        { name: 'Emily Davis', email: 'emily.davis@example.com', password: hashedPassword },
        { name: 'Sarah Brown', email: 'sarah.brown@example.com', password: hashedPassword }
      ]);
      console.log('5 sample users inserted (password: password123)');
    } else {
      console.log('Users already exist in database');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Note: Seeding is now a manual script
// Run 'npm run seed' to populate the database
// seedBooks();
// seedUsers();

// Use the book routes
app.use('/api/books', bookRoutes);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

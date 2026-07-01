import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Book from '../models/Book.js';
import User from '../models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Seed Books
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      await Book.insertMany([
        { name: 'JavaScript: The Good Parts', category: 'Programming', rentPerDay: 10 },
        { name: 'Clean Code', category: 'Programming', rentPerDay: 15 },
        { name: 'The Pragmatic Programmer', category: 'Programming', rentPerDay: 12 },
        { name: 'Eloquent JavaScript', category: 'Programming', rentPerDay: 8 },
        { name: "You Don't Know JS", category: 'Programming', rentPerDay: 10 },
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
      console.log(`Books already exist (${bookCount} books in database)`);
    }

    // Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.insertMany([
        { name: 'John Doe', email: 'john.doe@example.com', password: hashedPassword, role: 'user' },
        { name: 'Jane Smith', email: 'jane.smith@example.com', password: hashedPassword, role: 'user' },
        { name: 'Michael Johnson', email: 'michael.johnson@example.com', password: hashedPassword, role: 'user' },
        { name: 'Emily Davis', email: 'emily.davis@example.com', password: hashedPassword, role: 'user' },
        { name: 'Sarah Brown', email: 'sarah.brown@example.com', password: hashedPassword, role: 'user' },
        { name: 'Admin User', email: 'admin@example.com', password: hashedPassword, role: 'admin' }
      ]);
      console.log('6 sample users inserted (password: password123)');
    } else {
      console.log(`Users already exist (${userCount} users in database)`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

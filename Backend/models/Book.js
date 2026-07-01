import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  rentPerDay: { type: Number, required: true }
});

// Add indices for frequently queried fields
bookSchema.index({ name: 1 });
bookSchema.index({ category: 1 });

const Book = mongoose.model('Book', bookSchema);
export default Book;
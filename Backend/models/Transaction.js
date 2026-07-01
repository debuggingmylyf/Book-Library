import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDate: { type: Date, required: true },
  returnDate: { type: Date }
});

// Add indices for frequently queried fields
transactionSchema.index({ bookId: 1 });
transactionSchema.index({ userId: 1 });
transactionSchema.index({ issueDate: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
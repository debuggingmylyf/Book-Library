import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// Add indices for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });

const User = mongoose.model('User', userSchema);
export default User;
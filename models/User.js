import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { Schema } = mongoose;

// User roles allowed in the system
export const USER_ROLES = ['student', 'instructor', 'admin'];

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric with underscores.'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Exclude by default
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'student',
      index: true,
    },
    solvedProblems: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: 'Problem',
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Hash password before save if modified
userSchema.pre('save', async function passwordHashing(next) {
  if (!this.isModified('password')) return next();

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function generatePasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // Hash token to store in DB
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // 1 hour expiry
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  return resetToken; // Return raw token for email
};

const User = mongoose.model('User', userSchema);
export default User;
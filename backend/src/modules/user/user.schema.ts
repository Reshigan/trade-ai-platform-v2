import * as mongoose from 'mongoose';
import { authConfig } from '../../config/auth.config';

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(authConfig.roles),
    default: authConfig.roles.EXTERNAL_USER,
  },
  accessLevel: {
    type: String,
    enum: Object.values(authConfig.accessLevels),
    default: authConfig.accessLevels.SHARED_VIEW,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
    },
    theme: {
      type: String,
      default: 'light',
    },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
});
import { Document } from 'mongoose';
import { authConfig } from '../../config/auth.config';

export interface User extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: keyof typeof authConfig.roles;
  accessLevel: keyof typeof authConfig.accessLevels;
  profilePicture?: string;
  lastLogin?: Date;
  isActive: boolean;
  preferences: {
    language: string;
    theme: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
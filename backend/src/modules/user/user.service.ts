import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string, 
    updateData: {
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
      preferences?: {
        language?: string;
        theme?: string;
      }
    }
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId, 
        { $set: updateData }, 
        { new: true }
      )
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async listUsers(
    filters: {
      role?: string;
      isActive?: boolean;
    } = {},
    pagination: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const query = this.userModel.find(filters).select('-password');

    const users = await query
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.userModel.countDocuments(filters);

    return { users, total };
  }
}
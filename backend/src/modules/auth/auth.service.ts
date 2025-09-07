import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/user.interface';
import { authConfig } from '../../config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Promise<{ user: Partial<User>; token: string }> {
    const { email, password, firstName, lastName, role } = userData;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || authConfig.roles.EXTERNAL_USER,
      accessLevel: authConfig.accessLevels.SHARED_VIEW,
    });

    await newUser.save();

    // Generate JWT token
    const payload = {
      sub: newUser._id,
      email: newUser.email,
      role: newUser.role,
      accessLevel: newUser.accessLevel,
    };
    const token = this.jwtService.sign(payload);

    // Remove sensitive information
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    };

    return { user: userResponse, token };
  }

  async login(email: string, password: string): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      accessLevel: user.accessLevel,
    };
    const token = this.jwtService.sign(payload);

    // Remove sensitive information
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return { user: userResponse, token };
  }

  async validateUser(payload: { sub: string }): Promise<Partial<User> | null> {
    const user = await this.userModel.findById(payload.sub).select('-password');
    return user || null;
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();
  }
}
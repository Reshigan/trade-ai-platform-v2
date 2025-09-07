const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// Mock users data
// Note: All users have password "password123" for demo purposes
const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    email: 'admin@tradeai.com',
    password: '$2a$10$6sTGUBPSSz/Wh079m/u.WuHq/0kLe1OXLxWuxWdmp9hI80RANh1Ge', // password: password123
    firstName: 'Admin',
    lastName: 'User',
    employeeId: 'EMP001',
    role: 'admin',
    department: 'IT',
    isActive: true,
    twoFactorEnabled: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    email: 'manager@tradeai.com',
    password: '$2a$10$6sTGUBPSSz/Wh079m/u.WuHq/0kLe1OXLxWuxWdmp9hI80RANh1Ge', // password: password123
    firstName: 'Manager',
    lastName: 'User',
    employeeId: 'EMP002',
    role: 'manager',
    department: 'Sales',
    isActive: true,
    twoFactorEnabled: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '507f1f77bcf86cd799439013',
    email: 'kam@tradeai.com',
    password: '$2a$10$6sTGUBPSSz/Wh079m/u.WuHq/0kLe1OXLxWuxWdmp9hI80RANh1Ge', // password: password123
    firstName: 'KAM',
    lastName: 'User',
    employeeId: 'EMP003',
    role: 'kam',
    department: 'Sales',
    isActive: true,
    twoFactorEnabled: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock database operations
class MockDatabase {
  constructor() {
    this.users = [...mockUsers];
    this.sessions = new Map();
  }

  // User operations
  async findUserById(id) {
    return this.users.find(user => user._id === id);
  }

  async findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  async findUserByEmployeeId(employeeId) {
    return this.users.find(user => user.employeeId === employeeId);
  }

  async findUser(query) {
    if (query._id) return this.findUserById(query._id);
    if (query.email) return this.findUserByEmail(query.email);
    if (query.employeeId) return this.findUserByEmployeeId(query.employeeId);
    
    // Handle $or queries
    if (query.$or) {
      for (const condition of query.$or) {
        const user = await this.findUser(condition);
        if (user) return user;
      }
    }
    
    return null;
  }

  async createUser(userData) {
    const newUser = {
      _id: Date.now().toString(),
      ...userData,
      password: await bcrypt.hash(userData.password, 10),
      isActive: true,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id, updates) {
    const index = this.users.findIndex(user => user._id === id);
    if (index === -1) return null;
    
    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date()
    };
    
    return this.users[index];
  }

  async deleteUser(id) {
    const index = this.users.findIndex(user => user._id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  // Session operations
  async createSession(userId, token) {
    this.sessions.set(token, {
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  async getSession(token) {
    const session = this.sessions.get(token);
    if (!session) return null;
    
    if (new Date() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }
    
    return session;
  }

  async deleteSession(token) {
    return this.sessions.delete(token);
  }

  // Helper methods
  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Mock model methods
  createUserModel(userData) {
    const user = { ...userData };
    
    // Add model methods
    user.comparePassword = async function(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    };
    
    user.select = function(fields) {
      // Mock select method - just return the user
      return this;
    };
    
    user.changedPasswordAfter = function(JWTTimestamp) {
      // Mock method - always return false (password not changed)
      return false;
    };
    
    user.generateAuthToken = function() {
      const jwt = require('jsonwebtoken');
      const config = require('../config');
      
      return jwt.sign(
        { 
          _id: this._id,
          email: this.email,
          role: this.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
    };
    
    user.save = async function() {
      // In mock mode, just update the user in the array
      const index = mockUsers.findIndex(u => u._id === this._id);
      if (index !== -1) {
        mockUsers[index] = { ...this };
      }
      return this;
    };
    
    user.toJSON = function() {
      const obj = { ...this };
      delete obj.password;
      delete obj.twoFactorSecret;
      return obj;
    };
    
    return user;
  }
}

// Create singleton instance
const mockDatabase = new MockDatabase();

// Export mock User model interface
const MockUser = {
  async findOne(query) {
    const user = await mockDatabase.findUser(query);
    return user ? mockDatabase.createUserModel(user) : null;
  },
  
  async findById(id) {
    const user = await mockDatabase.findUserById(id);
    if (!user) return null;
    
    const userModel = mockDatabase.createUserModel(user);
    
    // Create a chainable mock query object
    const mockQuery = {
      _user: userModel,
      select: function(fields) {
        // Mock select - just return self for chaining
        return this;
      },
      populate: function(field, select) {
        // Mock populate - just return self for chaining
        return this;
      },
      then: function(resolve, reject) {
        // Make it thenable to work with async/await
        resolve(this._user);
      }
    };
    
    // Return the mock query object that can be chained
    return mockQuery;
  },
  
  async create(userData) {
    const user = await mockDatabase.createUser(userData);
    return mockDatabase.createUserModel(user);
  },
  
  async findByIdAndUpdate(id, updates, options = {}) {
    const user = await mockDatabase.updateUser(id, updates);
    return user ? mockDatabase.createUserModel(user) : null;
  },
  
  async findByIdAndDelete(id) {
    const success = await mockDatabase.deleteUser(id);
    return success;
  },
  
  async findByCredentials(email, password) {
    const user = await mockDatabase.findUserByEmail(email);
    if (!user || !user.isActive) {
      throw new Error('Invalid login credentials');
    }
    
    const userModel = mockDatabase.createUserModel(user);
    const isMatch = await userModel.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid login credentials');
    }
    
    return userModel;
  }
};

module.exports = {
  mockDatabase,
  MockUser
};
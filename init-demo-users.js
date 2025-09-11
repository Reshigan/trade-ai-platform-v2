// Simple script to insert demo users
db = db.getSiblingDB('tradeai_production');

// Drop existing users and recreate with proper schema
db.users.drop();

db.users.insertMany([
  {
    employeeId: 'EMP001',
    email: 'admin@tradeai.com',
    password: '$2a$10$TIfwQbOE1JrPY32AMpyDFulCf9kAo4czVn9Au87cv1hsDjnUxDbhq', // password123
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    department: 'admin',
    isActive: true,
    permissions: [],
    assignedCustomers: [],
    assignedProducts: [],
    assignedVendors: [],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    employeeId: 'EMP002',
    email: 'manager@tradeai.com',
    password: '$2a$10$TIfwQbOE1JrPY32AMpyDFulCf9kAo4czVn9Au87cv1hsDjnUxDbhq', // password123
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
    department: 'sales',
    isActive: true,
    permissions: [],
    assignedCustomers: [],
    assignedProducts: [],
    assignedVendors: [],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    employeeId: 'EMP003',
    email: 'kam@tradeai.com',
    password: '$2a$10$TIfwQbOE1JrPY32AMpyDFulCf9kAo4czVn9Au87cv1hsDjnUxDbhq', // password123
    firstName: 'KAM',
    lastName: 'User',
    role: 'kam',
    department: 'sales',
    isActive: true,
    permissions: [],
    assignedCustomers: [],
    assignedProducts: [],
    assignedVendors: [],
    created_at: new Date(),
    updated_at: new Date()
  }
]);

print('Demo users created successfully');
print('User count:', db.users.countDocuments());
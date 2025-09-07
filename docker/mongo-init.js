// MongoDB initialization script for Trade AI - Diplomat South Africa
db = db.getSiblingDB('trade-ai');

// Create user for the application
db.createUser({
  user: 'tradeai',
  pwd: 'tradeai2024',
  roles: [
    {
      role: 'readWrite',
      db: 'trade-ai'
    }
  ]
});

// Create collections with validation
db.createCollection('users');
db.createCollection('customers');
db.createCollection('products');
db.createCollection('vendors');
db.createCollection('promotions');
db.createCollection('budgets');
db.createCollection('tradespends');
db.createCollection('campaigns');
db.createCollection('approvals');
db.createCollection('notifications');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ employeeId: 1 }, { unique: true });
db.customers.createIndex({ code: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.vendors.createIndex({ code: 1 }, { unique: true });
db.promotions.createIndex({ status: 1, startDate: 1 });
db.budgets.createIndex({ year: 1, status: 1 });

print('MongoDB initialization complete for Trade AI - Diplomat South Africa');
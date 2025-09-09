// MongoDB initialization script
db = db.getSiblingDB('admin');

// Create admin user if it doesn't exist
if (db.getUser(process.env.MONGO_INITDB_ROOT_USERNAME) == null) {
  db.createUser({
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [{ role: 'root', db: 'admin' }]
  });
}

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// Create application user if it doesn't exist
if (db.getUser(process.env.MONGO_INITDB_ROOT_USERNAME) == null) {
  db.createUser({
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [
      { role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE },
      { role: 'dbAdmin', db: process.env.MONGO_INITDB_DATABASE }
    ]
  });
}

// Create collections
db.createCollection('users');
db.createCollection('budgets');
db.createCollection('trade_spends');
db.createCollection('promotions');
db.createCollection('customers');
db.createCollection('products');
db.createCollection('audit_logs');
db.createCollection('security_logs');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.budgets.createIndex({ year: 1, customer_id: 1 });
db.trade_spends.createIndex({ budget_id: 1 });
db.promotions.createIndex({ start_date: 1, end_date: 1 });
db.customers.createIndex({ name: 1 });
db.products.createIndex({ sku: 1 }, { unique: true });
db.audit_logs.createIndex({ timestamp: 1 });
db.security_logs.createIndex({ timestamp: 1 });

// Insert demo data if the database is empty
if (db.users.countDocuments() === 0) {
  // Insert demo users
  db.users.insertMany([
    {
      email: 'admin@tradeai.com',
      password: '$2a$10$eCJJXr8U5GKh8XUsSXH5V.L2s3LYI9Iy5PfpCZ4qPCq5OEYc0NTdO', // password123
      name: 'Admin User',
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      email: 'manager@tradeai.com',
      password: '$2a$10$eCJJXr8U5GKh8XUsSXH5V.L2s3LYI9Iy5PfpCZ4qPCq5OEYc0NTdO', // password123
      name: 'Manager User',
      role: 'manager',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      email: 'kam@tradeai.com',
      password: '$2a$10$eCJJXr8U5GKh8XUsSXH5V.L2s3LYI9Iy5PfpCZ4qPCq5OEYc0NTdO', // password123
      name: 'KAM User',
      role: 'kam',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert demo customers
  const customerIds = db.customers.insertMany([
    {
      name: 'Walmart',
      type: 'Retail',
      contact_name: 'John Smith',
      contact_email: 'john.smith@walmart.com',
      contact_phone: '+1-555-123-4567',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Target',
      type: 'Retail',
      contact_name: 'Jane Doe',
      contact_email: 'jane.doe@target.com',
      contact_phone: '+1-555-987-6543',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Costco',
      type: 'Wholesale',
      contact_name: 'Bob Johnson',
      contact_email: 'bob.johnson@costco.com',
      contact_phone: '+1-555-456-7890',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).insertedIds;

  // Insert demo products
  const productIds = db.products.insertMany([
    {
      name: 'Premium Cereal',
      sku: 'PC-001',
      category: 'Breakfast',
      price: 4.99,
      cost: 1.75,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Organic Pasta',
      sku: 'OP-002',
      category: 'Pasta',
      price: 3.49,
      cost: 1.25,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Gourmet Coffee',
      sku: 'GC-003',
      category: 'Beverages',
      price: 12.99,
      cost: 5.50,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).insertedIds;

  // Insert demo budgets
  const budgetIds = db.budgets.insertMany([
    {
      year: 2025,
      customer_id: customerIds[0],
      total_amount: 1000000,
      allocated_amount: 750000,
      remaining_amount: 250000,
      status: 'approved',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      year: 2025,
      customer_id: customerIds[1],
      total_amount: 750000,
      allocated_amount: 500000,
      remaining_amount: 250000,
      status: 'approved',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      year: 2025,
      customer_id: customerIds[2],
      total_amount: 500000,
      allocated_amount: 300000,
      remaining_amount: 200000,
      status: 'approved',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).insertedIds;

  // Insert demo trade spends
  db.trade_spends.insertMany([
    {
      budget_id: budgetIds[0],
      amount: 50000,
      type: 'promotion',
      description: 'Summer Promotion',
      status: 'approved',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      budget_id: budgetIds[1],
      amount: 75000,
      type: 'listing',
      description: 'New Product Listing',
      status: 'approved',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      budget_id: budgetIds[2],
      amount: 25000,
      type: 'display',
      description: 'End Cap Display',
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Insert demo promotions
  db.promotions.insertMany([
    {
      name: 'Summer Sale',
      customer_id: customerIds[0],
      product_ids: [productIds[0], productIds[1]],
      start_date: new Date('2025-06-01'),
      end_date: new Date('2025-06-30'),
      discount_type: 'percentage',
      discount_value: 15,
      budget: 50000,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Back to School',
      customer_id: customerIds[1],
      product_ids: [productIds[1], productIds[2]],
      start_date: new Date('2025-08-01'),
      end_date: new Date('2025-08-31'),
      discount_type: 'fixed',
      discount_value: 2.00,
      budget: 75000,
      status: 'planned',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Holiday Special',
      customer_id: customerIds[2],
      product_ids: [productIds[0], productIds[2]],
      start_date: new Date('2025-12-01'),
      end_date: new Date('2025-12-31'),
      discount_type: 'percentage',
      discount_value: 20,
      budget: 100000,
      status: 'planned',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  print('Demo data inserted successfully');
}

print('MongoDB initialization completed successfully');
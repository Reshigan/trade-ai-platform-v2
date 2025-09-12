// MongoDB Initialization Script for Trade AI Platform v2
// Creates databases, users, and initial collections

// Switch to admin database
db = db.getSiblingDB('admin');

// Create application user
db.createUser({
  user: 'tradeai_admin',
  pwd: 'TradeAI_Mongo_2024_Secure_Password_123',
  roles: [
    { role: 'readWrite', db: 'trade-ai' },
    { role: 'dbAdmin', db: 'trade-ai' }
  ]
});

// Switch to application database
db = db.getSiblingDB('trade-ai');

// Create collections with validation schemas
db.createCollection('companies', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'domain', 'status', 'createdAt'],
      properties: {
        name: { bsonType: 'string', minLength: 1 },
        domain: { bsonType: 'string', pattern: '^[a-zA-Z0-9.-]+$' },
        status: { enum: ['active', 'inactive', 'suspended'] },
        settings: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'companyId', 'role', 'status', 'createdAt'],
      properties: {
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' },
        password: { bsonType: 'string', minLength: 8 },
        companyId: { bsonType: 'objectId' },
        role: { enum: ['admin', 'manager', 'user', 'viewer'] },
        status: { enum: ['active', 'inactive', 'pending'] },
        profile: { bsonType: 'object' },
        permissions: { bsonType: 'array' },
        lastLogin: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('customers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'companyId', 'status', 'createdAt'],
      properties: {
        name: { bsonType: 'string', minLength: 1 },
        companyId: { bsonType: 'objectId' },
        code: { bsonType: 'string' },
        type: { enum: ['retail', 'wholesale', 'distributor', 'online'] },
        status: { enum: ['active', 'inactive'] },
        contact: { bsonType: 'object' },
        address: { bsonType: 'object' },
        salesData: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'sku', 'companyId', 'status', 'createdAt'],
      properties: {
        name: { bsonType: 'string', minLength: 1 },
        sku: { bsonType: 'string', minLength: 1 },
        companyId: { bsonType: 'objectId' },
        category: { bsonType: 'string' },
        brand: { bsonType: 'string' },
        status: { enum: ['active', 'inactive', 'discontinued'] },
        pricing: { bsonType: 'object' },
        specifications: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('budgets', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'companyId', 'year', 'totalAmount', 'status', 'createdAt'],
      properties: {
        name: { bsonType: 'string', minLength: 1 },
        companyId: { bsonType: 'objectId' },
        year: { bsonType: 'int', minimum: 2020, maximum: 2030 },
        totalAmount: { bsonType: 'number', minimum: 0 },
        allocatedAmount: { bsonType: 'number', minimum: 0 },
        spentAmount: { bsonType: 'number', minimum: 0 },
        status: { enum: ['draft', 'approved', 'active', 'completed', 'cancelled'] },
        categories: { bsonType: 'array' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('promotions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'companyId', 'type', 'startDate', 'endDate', 'status', 'createdAt'],
      properties: {
        name: { bsonType: 'string', minLength: 1 },
        companyId: { bsonType: 'objectId' },
        type: { enum: ['discount', 'rebate', 'volume', 'display', 'listing', 'cooperative'] },
        startDate: { bsonType: 'date' },
        endDate: { bsonType: 'date' },
        status: { enum: ['draft', 'active', 'completed', 'cancelled'] },
        budget: { bsonType: 'number', minimum: 0 },
        spent: { bsonType: 'number', minimum: 0 },
        customers: { bsonType: 'array' },
        products: { bsonType: 'array' },
        terms: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('tradeSpends', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['companyId', 'customerId', 'promotionId', 'amount', 'date', 'status', 'createdAt'],
      properties: {
        companyId: { bsonType: 'objectId' },
        customerId: { bsonType: 'objectId' },
        promotionId: { bsonType: 'objectId' },
        budgetId: { bsonType: 'objectId' },
        amount: { bsonType: 'number', minimum: 0 },
        date: { bsonType: 'date' },
        status: { enum: ['pending', 'approved', 'paid', 'rejected'] },
        type: { enum: ['accrual', 'payment', 'adjustment'] },
        description: { bsonType: 'string' },
        metadata: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('salesData', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['companyId', 'customerId', 'productId', 'date', 'quantity', 'revenue', 'createdAt'],
      properties: {
        companyId: { bsonType: 'objectId' },
        customerId: { bsonType: 'objectId' },
        productId: { bsonType: 'objectId' },
        date: { bsonType: 'date' },
        quantity: { bsonType: 'number', minimum: 0 },
        revenue: { bsonType: 'number', minimum: 0 },
        unitPrice: { bsonType: 'number', minimum: 0 },
        cost: { bsonType: 'number', minimum: 0 },
        margin: { bsonType: 'number' },
        channel: { bsonType: 'string' },
        region: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for performance
db.companies.createIndex({ domain: 1 }, { unique: true });
db.companies.createIndex({ status: 1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ companyId: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });

db.customers.createIndex({ companyId: 1 });
db.customers.createIndex({ code: 1, companyId: 1 }, { unique: true });
db.customers.createIndex({ status: 1 });

db.products.createIndex({ companyId: 1 });
db.products.createIndex({ sku: 1, companyId: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ status: 1 });

db.budgets.createIndex({ companyId: 1 });
db.budgets.createIndex({ year: 1, companyId: 1 });
db.budgets.createIndex({ status: 1 });

db.promotions.createIndex({ companyId: 1 });
db.promotions.createIndex({ startDate: 1, endDate: 1 });
db.promotions.createIndex({ status: 1 });
db.promotions.createIndex({ type: 1 });

db.tradeSpends.createIndex({ companyId: 1 });
db.tradeSpends.createIndex({ customerId: 1 });
db.tradeSpends.createIndex({ promotionId: 1 });
db.tradeSpends.createIndex({ date: 1 });
db.tradeSpends.createIndex({ status: 1 });

db.salesData.createIndex({ companyId: 1 });
db.salesData.createIndex({ customerId: 1 });
db.salesData.createIndex({ productId: 1 });
db.salesData.createIndex({ date: 1 });
db.salesData.createIndex({ companyId: 1, date: 1 });

print('MongoDB initialization completed successfully!');
print('Created collections: companies, users, customers, products, budgets, promotions, tradeSpends, salesData');
print('Created indexes for optimal performance');
print('Application user "tradeai_admin" created with appropriate permissions');
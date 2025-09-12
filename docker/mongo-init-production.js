// MongoDB Production Initialization Script
// This script runs when MongoDB container starts for the first time

// Switch to admin database for user creation
db = db.getSiblingDB('admin');

// Create admin user if it doesn't exist
try {
  db.createUser({
    user: process.env.MONGO_USERNAME || 'tradeai_admin',
    pwd: process.env.MONGO_PASSWORD || 'TradeAI_Mongo_2024_Secure_Password_123',
    roles: [
      { role: 'userAdminAnyDatabase', db: 'admin' },
      { role: 'readWriteAnyDatabase', db: 'admin' },
      { role: 'dbAdminAnyDatabase', db: 'admin' },
      { role: 'clusterAdmin', db: 'admin' }
    ]
  });
  print('Admin user created successfully');
} catch (error) {
  print('Admin user already exists or error creating user: ' + error);
}

// Switch to application database
db = db.getSiblingDB(process.env.MONGO_DATABASE || 'tradeai_production');

// Create application user with read/write access to the application database
try {
  db.createUser({
    user: process.env.MONGO_USERNAME || 'tradeai_admin',
    pwd: process.env.MONGO_PASSWORD || 'TradeAI_Mongo_2024_Secure_Password_123',
    roles: [
      { role: 'readWrite', db: process.env.MONGO_DATABASE || 'tradeai_production' },
      { role: 'dbAdmin', db: process.env.MONGO_DATABASE || 'tradeai_production' }
    ]
  });
  print('Application user created successfully');
} catch (error) {
  print('Application user already exists or error creating user: ' + error);
}

// Create indexes for better performance
print('Creating indexes...');

// Companies collection indexes
db.companies.createIndex({ "domain": 1 }, { unique: true });
db.companies.createIndex({ "name": 1 });
db.companies.createIndex({ "subscription.status": 1 });

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "company": 1 });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

// Customers collection indexes
db.customers.createIndex({ "company": 1, "sapCustomerId": 1 }, { unique: true });
db.customers.createIndex({ "company": 1, "name": 1 });
db.customers.createIndex({ "company": 1, "customerType": 1 });
db.customers.createIndex({ "company": 1, "status": 1 });

// Products collection indexes
db.products.createIndex({ "company": 1, "sapMaterialId": 1 }, { unique: true });
db.products.createIndex({ "company": 1, "name": 1 });
db.products.createIndex({ "company": 1, "category": 1 });
db.products.createIndex({ "company": 1, "brand": 1 });
db.products.createIndex({ "company": 1, "status": 1 });

// Campaigns collection indexes
db.campaigns.createIndex({ "company": 1, "campaignId": 1 }, { unique: true });
db.campaigns.createIndex({ "company": 1, "campaignType": 1 });
db.campaigns.createIndex({ "company": 1, "status": 1 });
db.campaigns.createIndex({ "company": 1, "period.startDate": 1, "period.endDate": 1 });

// Trading Terms collection indexes
db.tradingterms.createIndex({ "company": 1, "termCode": 1 }, { unique: true });
db.tradingterms.createIndex({ "company": 1, "customer": 1 });
db.tradingterms.createIndex({ "company": 1, "status": 1 });
db.tradingterms.createIndex({ "company": 1, "effectivePeriod.startDate": 1, "effectivePeriod.endDate": 1 });

// Reports collection indexes
db.reports.createIndex({ "company": 1, "reportCode": 1 }, { unique: true });
db.reports.createIndex({ "company": 1, "reportType": 1 });
db.reports.createIndex({ "company": 1, "status": 1 });
db.reports.createIndex({ "company": 1, "createdAt": -1 });

// AI Chat collection indexes
db.aichats.createIndex({ "company": 1, "sessionId": 1 }, { unique: true });
db.aichats.createIndex({ "company": 1, "user": 1 });
db.aichats.createIndex({ "company": 1, "status": 1 });
db.aichats.createIndex({ "company": 1, "createdAt": -1 });

// Promotion Analysis collection indexes
db.promotionanalyses.createIndex({ "company": 1, "analysisCode": 1 }, { unique: true });
db.promotionanalyses.createIndex({ "company": 1, "analysisType": 1 });
db.promotionanalyses.createIndex({ "company": 1, "status": 1 });
db.promotionanalyses.createIndex({ "company": 1, "analysisPeriod.startDate": 1, "analysisPeriod.endDate": 1 });

// Marketing Budget Allocation collection indexes
db.marketingbudgetallocations.createIndex({ "company": 1, "allocationCode": 1 }, { unique: true });
db.marketingbudgetallocations.createIndex({ "company": 1, "allocationType": 1 });
db.marketingbudgetallocations.createIndex({ "company": 1, "status": 1 });
db.marketingbudgetallocations.createIndex({ "company": 1, "period.startDate": 1, "period.endDate": 1 });

// Combination Analysis collection indexes
db.combinationanalyses.createIndex({ "company": 1, "analysisCode": 1 }, { unique: true });
db.combinationanalyses.createIndex({ "company": 1, "analysisType": 1 });
db.combinationanalyses.createIndex({ "company": 1, "status": 1 });
db.combinationanalyses.createIndex({ "company": 1, "analysisPeriod.startDate": 1, "analysisPeriod.endDate": 1 });

print('Indexes created successfully');

// Set up database configuration
db.adminCommand({
  setParameter: 1,
  internalQueryPlannerMaxIndexedSolutions: 64
});

print('MongoDB production initialization completed successfully');
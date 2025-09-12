// Production Seed Data for Trade AI Platform
// This script creates GONXT company with proper test accounts for production
// Run this script ONLY on a clean production database

// Connect to the production database
db = db.getSiblingDB('trade_ai_production');

print('=== TRADE AI PLATFORM - PRODUCTION SEED DATA ===');
print('Creating GONXT company with test accounts...');

// Clear existing data (CAUTION: This will delete all data)
print('WARNING: Clearing existing data...');
db.companies.deleteMany({});
db.users.deleteMany({});
db.customers.deleteMany({});
db.products.deleteMany({});
db.budgets.deleteMany({});
db.promotions.deleteMany({});
db.tradeSpends.deleteMany({});
db.salesData.deleteMany({});

// 1. Create GONXT Company
print('Creating GONXT company...');
const gonxtCompanyId = new ObjectId();
db.companies.insertOne({
    _id: gonxtCompanyId,
    name: 'GONXT',
    domain: 'gonxt.tech',
    status: 'active',
    settings: {
        currency: 'AUD',
        timezone: 'Australia/Sydney',
        fiscalYearStart: 'January',
        features: {
            aiPredictions: true,
            realTimeAnalytics: true,
            multiCurrency: false,
            advancedReporting: true,
            sapIntegration: true,
            emailNotifications: true,
            mobileAccess: true,
            apiAccess: true
        }
    },
    contact: {
        email: 'admin@gonxt.tech',
        phone: '+61 2 9876 5432',
        address: {
            street: '123 Business District',
            city: 'Sydney',
            state: 'NSW',
            postcode: '2000',
            country: 'Australia'
        }
    },
    subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        maxUsers: 100,
        maxCustomers: 1000,
        maxProducts: 5000
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
});

// 2. Create Production Test Users
print('Creating production test users...');

// Super Admin Account
const superAdminId = new ObjectId();
db.users.insertOne({
    _id: superAdminId,
    email: 'superadmin@gonxt.tech',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    firstName: 'Super',
    lastName: 'Admin',
    companyId: gonxtCompanyId,
    role: 'super_admin',
    status: 'active',
    profile: {
        firstName: 'Super',
        lastName: 'Admin',
        department: 'IT Administration',
        phone: '+61 400 000 001',
        title: 'System Administrator',
        avatar: null
    },
    permissions: ['all', 'system_admin', 'user_management', 'company_settings', 'data_export', 'system_logs'],
    preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'Australia/Sydney',
        notifications: {
            email: true,
            push: true,
            sms: false
        }
    },
    lastLogin: null,
    loginAttempts: 0,
    accountLocked: false,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// Admin Account
const adminId = new ObjectId();
db.users.insertOne({
    _id: adminId,
    email: 'admin@gonxt.tech',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    firstName: 'John',
    lastName: 'Smith',
    companyId: gonxtCompanyId,
    role: 'admin',
    status: 'active',
    profile: {
        firstName: 'John',
        lastName: 'Smith',
        department: 'Administration',
        phone: '+61 400 000 002',
        title: 'Platform Administrator',
        avatar: null
    },
    permissions: ['read', 'write', 'delete', 'user_management', 'budget_management', 'promotion_management', 'reporting'],
    preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'Australia/Sydney',
        notifications: {
            email: true,
            push: true,
            sms: false
        }
    },
    lastLogin: null,
    loginAttempts: 0,
    accountLocked: false,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// Manager Account
const managerId = new ObjectId();
db.users.insertOne({
    _id: managerId,
    email: 'manager@gonxt.tech',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    firstName: 'Sarah',
    lastName: 'Johnson',
    companyId: gonxtCompanyId,
    role: 'manager',
    status: 'active',
    profile: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        department: 'Sales Management',
        phone: '+61 400 000 003',
        title: 'Sales Manager',
        avatar: null
    },
    permissions: ['read', 'write', 'budget_approval', 'promotion_approval', 'team_management', 'reporting'],
    preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'Australia/Sydney',
        notifications: {
            email: true,
            push: true,
            sms: true
        }
    },
    lastLogin: null,
    loginAttempts: 0,
    accountLocked: false,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// KAM (Key Account Manager) Account
const kamId = new ObjectId();
db.users.insertOne({
    _id: kamId,
    email: 'kam@gonxt.tech',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    firstName: 'Mike',
    lastName: 'Chen',
    companyId: gonxtCompanyId,
    role: 'kam',
    status: 'active',
    profile: {
        firstName: 'Mike',
        lastName: 'Chen',
        department: 'Key Accounts',
        phone: '+61 400 000 004',
        title: 'Key Account Manager',
        avatar: null
    },
    permissions: ['read', 'write', 'customer_management', 'promotion_create', 'spend_tracking', 'reporting'],
    preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'Australia/Sydney',
        notifications: {
            email: true,
            push: true,
            sms: true
        }
    },
    lastLogin: null,
    loginAttempts: 0,
    accountLocked: false,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// Analyst Account
const analystId = new ObjectId();
db.users.insertOne({
    _id: analystId,
    email: 'analyst@gonxt.tech',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    firstName: 'Emma',
    lastName: 'Wilson',
    companyId: gonxtCompanyId,
    role: 'analyst',
    status: 'active',
    profile: {
        firstName: 'Emma',
        lastName: 'Wilson',
        department: 'Analytics',
        phone: '+61 400 000 005',
        title: 'Business Analyst',
        avatar: null
    },
    permissions: ['read', 'reporting', 'analytics', 'data_export', 'dashboard_create'],
    preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'Australia/Sydney',
        notifications: {
            email: true,
            push: false,
            sms: false
        }
    },
    lastLogin: null,
    loginAttempts: 0,
    accountLocked: false,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// Finance User Account
const financeId = new ObjectId();
db.users.insertOne({
    _id: financeId,
    email: 'finance@gonxt.tech',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    firstName: 'David',
    lastName: 'Brown',
    companyId: gonxtCompanyId,
    role: 'finance',
    status: 'active',
    profile: {
        firstName: 'David',
        lastName: 'Brown',
        department: 'Finance',
        phone: '+61 400 000 006',
        title: 'Finance Manager',
        avatar: null
    },
    permissions: ['read', 'write', 'budget_management', 'financial_reporting', 'spend_approval', 'audit_trail'],
    preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'Australia/Sydney',
        notifications: {
            email: true,
            push: true,
            sms: false
        }
    },
    lastLogin: null,
    loginAttempts: 0,
    accountLocked: false,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// Sales Rep Account
const salesRepId = new ObjectId();
db.users.insertOne({
    _id: salesRepId,
    email: 'sales@gonxt.tech',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    firstName: 'Lisa',
    lastName: 'Davis',
    companyId: gonxtCompanyId,
    role: 'sales_rep',
    status: 'active',
    profile: {
        firstName: 'Lisa',
        lastName: 'Davis',
        department: 'Sales',
        phone: '+61 400 000 007',
        title: 'Sales Representative',
        avatar: null
    },
    permissions: ['read', 'write', 'customer_contact', 'promotion_request', 'sales_tracking'],
    preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'Australia/Sydney',
        notifications: {
            email: true,
            push: true,
            sms: true
        }
    },
    lastLogin: null,
    loginAttempts: 0,
    accountLocked: false,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// Read-only Viewer Account
const viewerId = new ObjectId();
db.users.insertOne({
    _id: viewerId,
    email: 'viewer@gonxt.tech',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    firstName: 'Tom',
    lastName: 'Wilson',
    companyId: gonxtCompanyId,
    role: 'viewer',
    status: 'active',
    profile: {
        firstName: 'Tom',
        lastName: 'Wilson',
        department: 'Operations',
        phone: '+61 400 000 008',
        title: 'Operations Viewer',
        avatar: null
    },
    permissions: ['read', 'dashboard_view'],
    preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'Australia/Sydney',
        notifications: {
            email: false,
            push: false,
            sms: false
        }
    },
    lastLogin: null,
    loginAttempts: 0,
    accountLocked: false,
    passwordChangedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// 3. Create Initial Budget for Current Year
print('Creating initial budget...');
const currentYear = new Date().getFullYear();
const budgetId = new ObjectId();
db.budgets.insertOne({
    _id: budgetId,
    name: `GONXT Annual Budget ${currentYear}`,
    companyId: gonxtCompanyId,
    year: currentYear,
    totalAmount: 1000000, // $1M AUD
    allocatedAmount: 0,
    spentAmount: 0,
    status: 'active',
    categories: [
        {
            name: 'Trade Marketing',
            budgetAmount: 400000,
            spentAmount: 0,
            remainingAmount: 400000
        },
        {
            name: 'Consumer Promotions',
            budgetAmount: 250000,
            spentAmount: 0,
            remainingAmount: 250000
        },
        {
            name: 'Retailer Support',
            budgetAmount: 200000,
            spentAmount: 0,
            remainingAmount: 200000
        },
        {
            name: 'Digital Marketing',
            budgetAmount: 100000,
            spentAmount: 0,
            remainingAmount: 100000
        },
        {
            name: 'Events & Sponsorship',
            budgetAmount: 50000,
            spentAmount: 0,
            remainingAmount: 50000
        }
    ],
    approvedBy: adminId,
    approvalDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
});

// 4. Create System Configuration
print('Creating system configuration...');
db.systemConfig.insertOne({
    _id: new ObjectId(),
    version: '2.0.0',
    environment: 'production',
    features: {
        aiPredictions: true,
        realTimeAnalytics: true,
        multiTenant: true,
        sapIntegration: true,
        emailNotifications: true,
        mobileApp: true,
        apiAccess: true,
        advancedReporting: true
    },
    limits: {
        maxUsersPerCompany: 100,
        maxCustomersPerCompany: 1000,
        maxProductsPerCompany: 5000,
        maxPromotionsPerYear: 500,
        fileUploadSizeMB: 50,
        apiRequestsPerMinute: 1000
    },
    security: {
        passwordMinLength: 8,
        passwordRequireSpecialChars: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        sessionTimeoutMinutes: 480, // 8 hours
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 30,
        requireTwoFactor: false
    },
    maintenance: {
        scheduledMaintenance: false,
        maintenanceMessage: '',
        allowedIPs: [],
        backupSchedule: '0 2 * * *', // Daily at 2 AM
        logRetentionDays: 90
    },
    createdAt: new Date(),
    updatedAt: new Date()
});

// 5. Create Audit Log Entry
print('Creating initial audit log...');
db.auditLogs.insertOne({
    _id: new ObjectId(),
    companyId: gonxtCompanyId,
    userId: superAdminId,
    action: 'SYSTEM_INITIALIZATION',
    resource: 'SYSTEM',
    resourceId: null,
    details: {
        message: 'Production system initialized with GONXT company and test accounts',
        version: '2.0.0',
        environment: 'production'
    },
    ipAddress: '127.0.0.1',
    userAgent: 'MongoDB Seed Script',
    timestamp: new Date(),
    createdAt: new Date()
});

print('=== PRODUCTION SEED DATA COMPLETE ===');
print('');
print('GONXT Company created successfully!');
print('');
print('TEST ACCOUNTS CREATED:');
print('======================');
print('Super Admin: superadmin@gonxt.tech / password123');
print('Admin:       admin@gonxt.tech / password123');
print('Manager:     manager@gonxt.tech / password123');
print('KAM:         kam@gonxt.tech / password123');
print('Analyst:     analyst@gonxt.tech / password123');
print('Finance:     finance@gonxt.tech / password123');
print('Sales Rep:   sales@gonxt.tech / password123');
print('Viewer:      viewer@gonxt.tech / password123');
print('');
print('IMPORTANT SECURITY NOTES:');
print('=========================');
print('1. CHANGE ALL DEFAULT PASSWORDS IMMEDIATELY');
print('2. Update .env files with secure secrets');
print('3. Configure proper SMTP/email settings');
print('4. Set up SSL certificates');
print('5. Configure firewall and security groups');
print('6. Enable monitoring and logging');
print('7. Set up regular backups');
print('');
print('Initial budget of $1,000,000 AUD created for ' + currentYear);
print('System ready for production use!');
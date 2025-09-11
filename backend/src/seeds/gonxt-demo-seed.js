const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const Company = require('../models/Company');
const User = require('../models/User');
const Budget = require('../models/Budget');
const Promotion = require('../models/Promotion');
const TradeSpend = require('../models/TradeSpend');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// South African retailers and FMCG data
const southAfricanRetailers = [
  { name: 'Pick n Pay', type: 'Supermarket', region: 'National' },
  { name: 'Shoprite', type: 'Supermarket', region: 'National' },
  { name: 'Checkers', type: 'Supermarket', region: 'National' },
  { name: 'Woolworths', type: 'Premium Supermarket', region: 'National' },
  { name: 'SPAR', type: 'Supermarket', region: 'National' },
  { name: 'OK Foods', type: 'Supermarket', region: 'Regional' },
  { name: 'Food Lover\'s Market', type: 'Premium Supermarket', region: 'Regional' },
  { name: 'Makro', type: 'Wholesale', region: 'National' },
  { name: 'Game', type: 'Hypermarket', region: 'National' },
  { name: 'Cambridge Food', type: 'Supermarket', region: 'Regional' }
];

const productCategories = [
  {
    category: 'Beverages',
    products: [
      { name: 'Coca-Cola 330ml', brand: 'Coca-Cola', sku: 'CC330', unitCost: 8.50, unitPrice: 12.99 },
      { name: 'Fanta Orange 330ml', brand: 'Coca-Cola', sku: 'FO330', unitCost: 8.00, unitPrice: 12.99 },
      { name: 'Sprite 330ml', brand: 'Coca-Cola', sku: 'SP330', unitCost: 8.00, unitPrice: 12.99 },
      { name: 'Appletiser 330ml', brand: 'Appletiser', sku: 'AP330', unitCost: 12.00, unitPrice: 18.99 },
      { name: 'Mageu 1L', brand: 'Clover', sku: 'MG1L', unitCost: 15.00, unitPrice: 22.99 }
    ]
  },
  {
    category: 'Dairy',
    products: [
      { name: 'Full Cream Milk 1L', brand: 'Clover', sku: 'FCM1L', unitCost: 18.00, unitPrice: 24.99 },
      { name: 'Low Fat Milk 1L', brand: 'Clover', sku: 'LFM1L', unitCost: 18.00, unitPrice: 24.99 },
      { name: 'Cheddar Cheese 200g', brand: 'Clover', sku: 'CC200', unitCost: 35.00, unitPrice: 49.99 },
      { name: 'Greek Yogurt 500g', brand: 'Clover', sku: 'GY500', unitCost: 25.00, unitPrice: 39.99 },
      { name: 'Butter 500g', brand: 'Clover', sku: 'BT500', unitCost: 45.00, unitPrice: 69.99 }
    ]
  },
  {
    category: 'Snacks',
    products: [
      { name: 'Simba Chips 120g', brand: 'Simba', sku: 'SC120', unitCost: 12.00, unitPrice: 19.99 },
      { name: 'Doritos 150g', brand: 'Simba', sku: 'DR150', unitCost: 15.00, unitPrice: 24.99 },
      { name: 'Biltong 100g', brand: 'Kalahari', sku: 'BT100', unitCost: 45.00, unitPrice: 79.99 },
      { name: 'Nuts & Raisins 200g', brand: 'Montagu', sku: 'NR200', unitCost: 25.00, unitPrice: 39.99 },
      { name: 'Rusks 500g', brand: 'Ouma', sku: 'RS500', unitCost: 20.00, unitPrice: 32.99 }
    ]
  },
  {
    category: 'Personal Care',
    products: [
      { name: 'Shampoo 400ml', brand: 'Sunsilk', sku: 'SH400', unitCost: 35.00, unitPrice: 54.99 },
      { name: 'Body Wash 500ml', brand: 'Dove', sku: 'BW500', unitCost: 40.00, unitPrice: 62.99 },
      { name: 'Toothpaste 100ml', brand: 'Colgate', sku: 'TP100', unitCost: 18.00, unitPrice: 28.99 },
      { name: 'Deodorant 150ml', brand: 'Axe', sku: 'DE150', unitCost: 25.00, unitPrice: 39.99 },
      { name: 'Soap Bar 125g', brand: 'Lux', sku: 'SB125', unitCost: 8.00, unitPrice: 14.99 }
    ]
  }
];

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomAmount = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

const seedGONXTDemo = async () => {
  try {
    console.log('🌱 Starting GONXT demo data seeding...');

    // 1. Create GONXT Company
    console.log('📊 Creating GONXT company...');
    
    const gonxtCompany = new Company({
      name: 'GONXT (Pty) Ltd',
      slug: 'gonxt',
      domain: 'gonxt',
      logo: '/assets/gonxt-logo.png',
      industry: 'FMCG',
      country: 'South Africa',
      currency: 'ZAR',
      timezone: 'Africa/Johannesburg',
      license: {
        type: 'enterprise',
        maxUsers: 100,
        maxDataRetentionMonths: 60,
        features: [
          'dashboard',
          'budgets',
          'promotions',
          'trade_spend',
          'analytics',
          'reports',
          'sap_integration',
          'api_access',
          'custom_branding',
          'advanced_analytics',
          'ml_forecasting',
          'audit_logs'
        ],
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isActive: true
      },
      sso: {
        enabled: false
      },
      settings: {
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'en-ZA',
        fiscalYearStart: 4, // April
        budgetApprovalWorkflow: true,
        promotionApprovalWorkflow: true,
        autoDataBackup: true
      },
      contactInfo: {
        primaryContact: {
          name: 'John Smith',
          email: 'john.smith@gonxt.co.za',
          phone: '+27 11 123 4567'
        },
        billingContact: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@gonxt.co.za',
          phone: '+27 11 123 4568'
        },
        technicalContact: {
          name: 'Mike Wilson',
          email: 'mike.wilson@gonxt.co.za',
          phone: '+27 11 123 4569'
        }
      },
      address: {
        street: '123 Business Park Drive',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa'
      },
      status: 'active',
      isActive: true,
      createdBy: null // Will be set after creating super admin
    });

    // 2. Create Super Admin User
    console.log('👤 Creating super admin user...');
    
    const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 10);
    const superAdmin = new User({
      employeeId: 'SUPER001',
      email: 'superadmin@tradeai.com',
      password: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      department: 'system',
      isActive: true,
      permissions: [
        {
          module: 'companies',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          module: 'users',
          actions: ['create', 'read', 'update', 'delete']
        },
        {
          module: 'system',
          actions: ['read', 'update', 'backup', 'restore']
        }
      ]
    });

    await superAdmin.save();
    gonxtCompany.createdBy = superAdmin._id;
    await gonxtCompany.save();

    // 3. Create GONXT Users
    console.log('👥 Creating GONXT users...');
    
    const gonxtUsers = [
      {
        employeeId: 'GONXT001',
        email: 'admin@gonxt.co.za',
        password: 'GonxtAdmin123!',
        firstName: 'John',
        lastName: 'Smith',
        role: 'admin',
        department: 'admin'
      },
      {
        employeeId: 'GONXT002',
        email: 'manager@gonxt.co.za',
        password: 'GonxtManager123!',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'manager',
        department: 'marketing'
      },
      {
        employeeId: 'GONXT003',
        email: 'kam1@gonxt.co.za',
        password: 'GonxtKam123!',
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'kam',
        department: 'sales'
      },
      {
        employeeId: 'GONXT004',
        email: 'kam2@gonxt.co.za',
        password: 'GonxtKam123!',
        firstName: 'Lisa',
        lastName: 'Brown',
        role: 'kam',
        department: 'sales'
      },
      {
        employeeId: 'GONXT005',
        email: 'analyst@gonxt.co.za',
        password: 'GonxtAnalyst123!',
        firstName: 'David',
        lastName: 'Taylor',
        role: 'analyst',
        department: 'finance'
      }
    ];

    const createdUsers = [];
    for (const userData of gonxtUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        company: gonxtCompany._id,
        ...userData,
        password: hashedPassword,
        isActive: true,
        permissions: getPermissionsByRole(userData.role)
      });
      await user.save();
      createdUsers.push(user);
    }

    // 4. Create Customers (South African Retailers)
    console.log('🏪 Creating customer data...');
    
    const customers = [];
    for (let i = 0; i < southAfricanRetailers.length; i++) {
      const retailer = southAfricanRetailers[i];
      const customer = new Customer({
        company: gonxtCompany._id,
        sapCustomerId: `SAP${String(i + 1).padStart(6, '0')}`,
        name: retailer.name,
        code: retailer.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10),
        customerType: retailer.type === 'Supermarket' ? 'retailer' : 
                     retailer.type === 'Premium Supermarket' ? 'retailer' :
                     retailer.type === 'Wholesale' ? 'wholesaler' : 'retailer',
        channel: retailer.type === 'Wholesale' ? 'b2b' : 'modern_trade',
        tier: retailer.region === 'National' ? 'gold' : 'silver',
        status: 'active',
        contactInfo: {
          primaryContact: {
            name: `${retailer.name} Buyer`,
            email: `buyer@${retailer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.za`,
            phone: `+27 ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`
          }
        },
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} ${retailer.name} Street`,
          city: retailer.region === 'National' ? 'Johannesburg' : ['Cape Town', 'Durban', 'Pretoria'][Math.floor(Math.random() * 3)],
          province: retailer.region === 'National' ? 'Gauteng' : ['Western Cape', 'KwaZulu-Natal', 'Gauteng'][Math.floor(Math.random() * 3)],
          postalCode: String(Math.floor(Math.random() * 9000) + 1000),
          country: 'South Africa'
        },
        paymentTerms: ['NET30', 'NET45', 'NET60'][Math.floor(Math.random() * 3)],
        currency: 'ZAR',
        creditLimit: Math.floor(Math.random() * 500000) + 100000,
        tradingTerms: {
          rebatePercent: Math.random() * 3,
          volumeDiscountTiers: [
            { minVolume: 1000, discountPercent: 2 },
            { minVolume: 5000, discountPercent: 5 },
            { minVolume: 10000, discountPercent: 8 }
          ]
        },
        accountManager: createdUsers.filter(u => u.role === 'kam')[Math.floor(Math.random() * 2)]._id
      });
      await customer.save();
      customers.push(customer);
    }

    // 5. Create Products
    console.log('📦 Creating product data...');
    
    const products = [];
    let productIndex = 0;
    for (const category of productCategories) {
      for (const productData of category.products) {
        productIndex++;
        const product = new Product({
          company: gonxtCompany._id,
          sapMaterialId: `MAT${String(productIndex).padStart(6, '0')}`,
          name: productData.name,
          sku: productData.sku,
          barcode: `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
          productType: 'own_brand',
          category: {
            primary: category.category,
            secondary: [category.category]
          },
          brand: {
            name: productData.brand,
            code: productData.brand.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5)
          },
          packaging: {
            unitOfMeasure: 'Each',
            packSize: 1,
            weight: Math.random() * 2 + 0.1, // Random weight between 0.1 and 2.1 kg
            dimensions: {
              length: Math.floor(Math.random() * 20) + 5,
              width: Math.floor(Math.random() * 15) + 5,
              height: Math.floor(Math.random() * 25) + 5
            }
          },
          pricing: {
            listPrice: productData.unitPrice,
            costPrice: productData.unitCost,
            currency: 'ZAR'
          },
          status: 'active',
          isActive: true,
          createdBy: createdUsers.find(u => u.role === 'manager')._id
        });
        await product.save();
        products.push(product);
      }
    }

    // 6. Create Budgets for 2023 and 2024
    console.log('💰 Creating budget data...');
    
    const budgets = [];
    for (const year of [2023, 2024]) {
      const budget = new Budget({
        company: gonxtCompany._id,
        name: `GONXT Annual Budget ${year}`,
        code: `GONXT-${year}`,
        year: year,
        budgetType: 'budget',
        version: 1,
        status: year === 2023 ? 'approved' : 'draft',
        scope: {
          level: 'company',
          entity: gonxtCompany._id
        },
        currency: 'ZAR',
        totalBudget: {
          marketing: year === 2023 ? 2500000 : 2750000,
          cashCoop: year === 2023 ? 1800000 : 2000000,
          tradingTerms: year === 2023 ? 1200000 : 1350000,
          rebates: year === 2023 ? 800000 : 900000,
          promotions: year === 2023 ? 3000000 : 3300000
        },
        monthlyBudgets: generateMonthlyBudgets(year === 2023 ? 9500000 : 10300000),
        approvalWorkflow: {
          isEnabled: true,
          currentStage: year === 2023 ? 'approved' : 'pending_approval',
          stages: [
            {
              stage: 'manager_approval',
              approver: createdUsers.find(u => u.role === 'manager')._id,
              status: year === 2023 ? 'approved' : 'pending',
              approvedAt: year === 2023 ? new Date(`${year}-03-15`) : null
            },
            {
              stage: 'admin_approval',
              approver: createdUsers.find(u => u.role === 'admin')._id,
              status: year === 2023 ? 'approved' : 'pending',
              approvedAt: year === 2023 ? new Date(`${year}-03-20`) : null
            }
          ]
        },
        createdBy: createdUsers.find(u => u.role === 'manager')._id,
        lastModifiedBy: createdUsers.find(u => u.role === 'manager')._id
      });
      await budget.save();
      budgets.push(budget);
    }

    // 7. Create Promotions
    console.log('🎯 Creating promotion data...');
    
    const promotions = [];
    const promotionTypes = ['price_discount', 'volume_discount', 'bogo', 'bundle', 'display'];
    
    for (let i = 0; i < 50; i++) {
      const startDate = generateRandomDate(new Date('2023-01-01'), new Date('2024-12-31'));
      const endDate = new Date(startDate.getTime() + (Math.random() * 90 + 7) * 24 * 60 * 60 * 1000);
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      
      const promotion = new Promotion({
        company: gonxtCompany._id,
        promotionId: `PROMO${String(i + 1).padStart(3, '0')}`,
        name: `${product.name} - ${customer.name} Promotion`,
        description: `Special promotion for ${product.name} at ${customer.name}`,
        promotionType: promotionTypes[Math.floor(Math.random() * promotionTypes.length)],
        status: endDate < new Date() ? 'completed' : startDate > new Date() ? 'planned' : 'active',
        period: {
          startDate: startDate,
          endDate: endDate
        },
        customer: customer._id,
        products: [{
          product: product._id,
          promotionPrice: product.pricing.unitPrice * (0.7 + Math.random() * 0.2), // 10-30% discount
          volumeTarget: Math.floor(Math.random() * 5000) + 1000
        }],
        budget: {
          totalBudget: generateRandomAmount(10000, 100000),
          spentToDate: 0,
          currency: 'ZAR'
        },
        mechanics: {
          discountType: 'percentage',
          discountValue: Math.floor(Math.random() * 30) + 10,
          minimumPurchase: Math.floor(Math.random() * 500) + 100
        },
        createdBy: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
        assignedTo: createdUsers.filter(u => u.role === 'kam')[Math.floor(Math.random() * 2)]._id
      });
      await promotion.save();
      promotions.push(promotion);
    }

    // 8. Create Trade Spend Records
    console.log('💸 Creating trade spend data...');
    
    const tradeSpends = [];
    const spendTypes = ['marketing', 'cash_coop', 'trading_terms', 'rebate', 'promotion'];
    const categories = {
      marketing: ['Advertising', 'In-store Display', 'Digital Marketing', 'Print Media'],
      cash_coop: ['Co-op Advertising', 'Promotional Support', 'Marketing Fund'],
      trading_terms: ['Volume Rebate', 'Early Payment Discount', 'Listing Fee'],
      rebate: ['Volume Rebate', 'Growth Rebate', 'Category Rebate'],
      promotion: ['Price Reduction', 'Buy One Get One', 'Bundle Deal']
    };

    for (let i = 0; i < 200; i++) {
      const spendDate = generateRandomDate(new Date('2023-01-01'), new Date('2024-12-31'));
      const spendType = spendTypes[Math.floor(Math.random() * spendTypes.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const categoryList = categories[spendType];
      
      const tradeSpend = new TradeSpend({
        company: gonxtCompany._id,
        spendId: `TS${String(i + 1).padStart(4, '0')}`,
        spendType: spendType,
        category: categoryList[Math.floor(Math.random() * categoryList.length)],
        description: `${spendType} spend for ${customer.name}`,
        customer: customer._id,
        amount: {
          requested: generateRandomAmount(5000, 50000),
          approved: generateRandomAmount(4000, 55000),
          spent: spendDate < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? generateRandomAmount(3000, 50000) : 0,
          currency: 'ZAR'
        },
        period: {
          startDate: spendDate,
          endDate: new Date(spendDate.getTime() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000)
        },
        status: spendDate < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'completed' : 'active',
        approvalStatus: 'approved',
        paymentStatus: Math.random() > 0.3 ? 'paid' : 'pending',
        createdBy: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
        approvedBy: createdUsers.find(u => u.role === 'manager')._id
      });
      await tradeSpend.save();
      tradeSpends.push(tradeSpend);
    }

    console.log('✅ GONXT demo data seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   - 1 Company (GONXT)`);
    console.log(`   - 1 Super Admin`);
    console.log(`   - ${createdUsers.length} Company Users`);
    console.log(`   - ${customers.length} Customers`);
    console.log(`   - ${products.length} Products`);
    console.log(`   - ${budgets.length} Budgets`);
    console.log(`   - ${promotions.length} Promotions`);
    console.log(`   - ${tradeSpends.length} Trade Spend Records`);
    
    console.log(`\n🔑 Login Credentials:`);
    console.log(`Super Admin: superadmin@tradeai.com / SuperAdmin123!`);
    console.log(`GONXT Admin: admin@gonxt.co.za / GonxtAdmin123!`);
    console.log(`GONXT Manager: manager@gonxt.co.za / GonxtManager123!`);
    console.log(`GONXT KAM 1: kam1@gonxt.co.za / GonxtKam123!`);
    console.log(`GONXT KAM 2: kam2@gonxt.co.za / GonxtKam123!`);
    console.log(`GONXT Analyst: analyst@gonxt.co.za / GonxtAnalyst123!`);

    return {
      company: gonxtCompany,
      superAdmin,
      users: createdUsers,
      customers,
      products,
      budgets,
      promotions,
      tradeSpends
    };

  } catch (error) {
    console.error('❌ Error seeding GONXT demo data:', error);
    throw error;
  }
};

// Helper function to generate monthly budgets
function generateMonthlyBudgets(totalBudget) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyBudgets = [];
  
  for (let i = 0; i < 12; i++) {
    const baseAmount = totalBudget / 12;
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const monthlyAmount = Math.round(baseAmount * (1 + variation));
    
    monthlyBudgets.push({
      month: months[i],
      budget: {
        marketing: Math.round(monthlyAmount * 0.26),
        cashCoop: Math.round(monthlyAmount * 0.19),
        tradingTerms: Math.round(monthlyAmount * 0.13),
        rebates: Math.round(monthlyAmount * 0.08),
        promotions: Math.round(monthlyAmount * 0.34)
      },
      actual: {
        marketing: i < new Date().getMonth() ? Math.round(monthlyAmount * 0.26 * (0.8 + Math.random() * 0.4)) : 0,
        cashCoop: i < new Date().getMonth() ? Math.round(monthlyAmount * 0.19 * (0.8 + Math.random() * 0.4)) : 0,
        tradingTerms: i < new Date().getMonth() ? Math.round(monthlyAmount * 0.13 * (0.8 + Math.random() * 0.4)) : 0,
        rebates: i < new Date().getMonth() ? Math.round(monthlyAmount * 0.08 * (0.8 + Math.random() * 0.4)) : 0,
        promotions: i < new Date().getMonth() ? Math.round(monthlyAmount * 0.34 * (0.8 + Math.random() * 0.4)) : 0
      }
    });
  }
  
  return monthlyBudgets;
}

// Helper function to get permissions by role
function getPermissionsByRole(role) {
  const permissions = {
    admin: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'budgets', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'promotions', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { module: 'trade_spend', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'analytics', actions: ['read'] },
      { module: 'reports', actions: ['create', 'read', 'export'] },
      { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'settings', actions: ['read', 'update'] }
    ],
    manager: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'budgets', actions: ['create', 'read', 'update', 'approve'] },
      { module: 'promotions', actions: ['create', 'read', 'update', 'approve'] },
      { module: 'trade_spend', actions: ['create', 'read', 'update'] },
      { module: 'analytics', actions: ['read'] },
      { module: 'reports', actions: ['create', 'read', 'export'] },
      { module: 'users', actions: ['read'] }
    ],
    kam: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'budgets', actions: ['read'] },
      { module: 'promotions', actions: ['create', 'read', 'update'] },
      { module: 'trade_spend', actions: ['create', 'read', 'update'] },
      { module: 'analytics', actions: ['read'] },
      { module: 'reports', actions: ['read'] }
    ],
    analyst: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'budgets', actions: ['read'] },
      { module: 'promotions', actions: ['read'] },
      { module: 'trade_spend', actions: ['read'] },
      { module: 'analytics', actions: ['read'] },
      { module: 'reports', actions: ['create', 'read', 'export'] }
    ]
  };
  
  return permissions[role] || [];
}

module.exports = { seedGONXTDemo };
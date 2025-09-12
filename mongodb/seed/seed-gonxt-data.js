// GONXT Company Seed Data - 2 Years of Comprehensive Data
// This script creates realistic data for GONXT company for 2023-2024

// Connect to the database
db = db.getSiblingDB('trade-ai');

// Helper functions
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Clear existing data for GONXT (if any)
print('Clearing existing GONXT data...');
const gonxtCompany = db.companies.findOne({ domain: 'gonxt.tech' });
if (gonxtCompany) {
    db.users.deleteMany({ companyId: gonxtCompany._id });
    db.customers.deleteMany({ companyId: gonxtCompany._id });
    db.products.deleteMany({ companyId: gonxtCompany._id });
    db.budgets.deleteMany({ companyId: gonxtCompany._id });
    db.promotions.deleteMany({ companyId: gonxtCompany._id });
    db.tradeSpends.deleteMany({ companyId: gonxtCompany._id });
    db.salesData.deleteMany({ companyId: gonxtCompany._id });
    db.companies.deleteOne({ _id: gonxtCompany._id });
}

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
            advancedReporting: true
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
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date()
});

// 2. Create Users
print('Creating GONXT users...');
const users = [
    {
        email: 'admin@gonxt.tech',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
        firstName: 'John',
        lastName: 'Smith',
        role: 'admin',
        status: 'active'
    },
    {
        email: 'manager@gonxt.tech',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'manager',
        status: 'active'
    },
    {
        email: 'analyst@gonxt.tech',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
        firstName: 'Mike',
        lastName: 'Chen',
        role: 'user',
        status: 'active'
    },
    {
        email: 'sales@gonxt.tech',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'user',
        status: 'active'
    }
];

const userIds = [];
users.forEach(user => {
    const userId = new ObjectId();
    userIds.push(userId);
    db.users.insertOne({
        _id: userId,
        ...user,
        companyId: gonxtCompanyId,
        profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            department: user.role === 'admin' ? 'IT' : user.role === 'manager' ? 'Sales' : 'Operations',
            phone: '+61 4' + randomInt(10000000, 99999999)
        },
        permissions: user.role === 'admin' ? ['all'] : ['read', 'write'],
        lastLogin: randomDate(new Date('2024-08-01'), new Date()),
        createdAt: new Date('2022-01-01'),
        updatedAt: new Date()
    });
});

// 3. Create Customers (50 customers)
print('Creating GONXT customers...');
const customerTypes = ['retail', 'wholesale', 'distributor', 'online'];
const customerNames = [
    'Woolworths', 'Coles', 'IGA', 'ALDI', 'Costco', 'Big W', 'Target', 'Kmart',
    'JB Hi-Fi', 'Harvey Norman', 'The Good Guys', 'Officeworks', 'Bunnings',
    'Dan Murphy\'s', 'BWS', 'Liquorland', 'First Choice', 'Vintage Cellars',
    'Chemist Warehouse', 'Priceline', 'Terry White', 'Amcal', 'My Chemist',
    'Rebel Sport', 'Amart Sports', 'BCF', 'Supercheap Auto', 'Repco',
    'Spotlight', 'Lincraft', 'Harris Scarfe', 'Myer', 'David Jones',
    'EB Games', 'Sanity', 'Dymocks', 'QBD Books', 'Angus & Robertson',
    'Baby Bunting', 'Toys R Us', 'Big W Toys', 'Kmart Toys', 'Target Toys',
    'Pet Barn', 'Petstock', 'City Farmers', 'Animates', 'Pets at Home'
];

const customerIds = [];
for (let i = 0; i < 50; i++) {
    const customerId = new ObjectId();
    customerIds.push(customerId);
    const customerName = customerNames[i] || `Customer ${i + 1}`;
    
    db.customers.insertOne({
        _id: customerId,
        name: customerName,
        code: `CUST${String(i + 1).padStart(3, '0')}`,
        companyId: gonxtCompanyId,
        type: randomChoice(customerTypes),
        status: 'active',
        contact: {
            email: `contact@${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.au`,
            phone: '+61 ' + randomInt(200000000, 999999999),
            primaryContact: `${randomChoice(['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa'])} ${randomChoice(['Smith', 'Johnson', 'Brown', 'Wilson', 'Davis'])}`
        },
        address: {
            street: `${randomInt(1, 999)} ${randomChoice(['Collins', 'Bourke', 'Flinders', 'Elizabeth', 'King'])} Street`,
            city: randomChoice(['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide']),
            state: randomChoice(['NSW', 'VIC', 'QLD', 'WA', 'SA']),
            postcode: String(randomInt(1000, 9999)),
            country: 'Australia'
        },
        salesData: {
            totalRevenue: randomFloat(100000, 5000000),
            averageOrderValue: randomFloat(500, 5000),
            lastOrderDate: randomDate(new Date('2024-01-01'), new Date()),
            creditLimit: randomFloat(50000, 1000000),
            paymentTerms: randomChoice(['Net 30', 'Net 60', 'COD', '2/10 Net 30'])
        },
        createdAt: randomDate(new Date('2022-01-01'), new Date('2023-01-01')),
        updatedAt: new Date()
    });
}

// 4. Create Products (100 products)
print('Creating GONXT products...');
const categories = ['Electronics', 'Home & Garden', 'Sports & Outdoors', 'Health & Beauty', 'Automotive', 'Books & Media', 'Toys & Games', 'Clothing & Accessories'];
const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Panasonic', 'Philips', 'Bosch', 'Dyson', 'Nike', 'Adidas', 'Puma', 'Under Armour'];

const productIds = [];
for (let i = 0; i < 100; i++) {
    const productId = new ObjectId();
    productIds.push(productId);
    const category = randomChoice(categories);
    const brand = randomChoice(brands);
    
    db.products.insertOne({
        _id: productId,
        name: `${brand} ${category} Product ${i + 1}`,
        sku: `SKU${String(i + 1).padStart(4, '0')}`,
        companyId: gonxtCompanyId,
        category: category,
        brand: brand,
        status: randomChoice(['active', 'active', 'active', 'inactive']), // 75% active
        pricing: {
            cost: randomFloat(10, 500),
            listPrice: randomFloat(20, 1000),
            wholesalePrice: randomFloat(15, 750),
            retailPrice: randomFloat(25, 1200),
            margin: randomFloat(20, 60)
        },
        specifications: {
            weight: randomFloat(0.1, 50),
            dimensions: {
                length: randomFloat(5, 100),
                width: randomFloat(5, 100),
                height: randomFloat(5, 100)
            },
            color: randomChoice(['Black', 'White', 'Silver', 'Blue', 'Red', 'Green']),
            material: randomChoice(['Plastic', 'Metal', 'Glass', 'Fabric', 'Leather'])
        },
        inventory: {
            currentStock: randomInt(0, 1000),
            reorderLevel: randomInt(10, 100),
            maxStock: randomInt(500, 2000)
        },
        createdAt: randomDate(new Date('2022-01-01'), new Date('2023-06-01')),
        updatedAt: new Date()
    });
}

// 5. Create Budgets for 2023 and 2024
print('Creating GONXT budgets...');
const budgetCategories = [
    { name: 'Trade Marketing', allocation: 0.4 },
    { name: 'Consumer Promotions', allocation: 0.25 },
    { name: 'Retailer Support', allocation: 0.2 },
    { name: 'Digital Marketing', allocation: 0.1 },
    { name: 'Events & Sponsorship', allocation: 0.05 }
];

const budgetIds = [];
for (let year = 2023; year <= 2024; year++) {
    const budgetId = new ObjectId();
    budgetIds.push(budgetId);
    const totalAmount = randomFloat(2000000, 5000000);
    
    db.budgets.insertOne({
        _id: budgetId,
        name: `GONXT Annual Budget ${year}`,
        companyId: gonxtCompanyId,
        year: year,
        totalAmount: totalAmount,
        allocatedAmount: totalAmount * 0.85,
        spentAmount: year === 2023 ? totalAmount * 0.78 : totalAmount * 0.45,
        status: year === 2023 ? 'completed' : 'active',
        categories: budgetCategories.map(cat => ({
            name: cat.name,
            budgetAmount: totalAmount * cat.allocation,
            spentAmount: year === 2023 ? totalAmount * cat.allocation * 0.92 : totalAmount * cat.allocation * 0.53,
            remainingAmount: year === 2023 ? totalAmount * cat.allocation * 0.08 : totalAmount * cat.allocation * 0.47
        })),
        createdAt: new Date(`${year - 1}-11-01`),
        updatedAt: new Date()
    });
}

// 6. Create Promotions (200 promotions over 2 years)
print('Creating GONXT promotions...');
const promotionTypes = ['discount', 'rebate', 'volume', 'display', 'listing', 'cooperative'];
const promotionIds = [];

for (let i = 0; i < 200; i++) {
    const promotionId = new ObjectId();
    promotionIds.push(promotionId);
    
    const startDate = randomDate(new Date('2023-01-01'), new Date('2024-10-01'));
    const endDate = new Date(startDate.getTime() + randomInt(7, 90) * 24 * 60 * 60 * 1000);
    const budget = randomFloat(5000, 100000);
    const spent = budget * randomFloat(0.1, 1.2);
    
    db.promotions.insertOne({
        _id: promotionId,
        name: `Promotion ${i + 1} - ${randomChoice(['Summer Sale', 'Winter Special', 'Back to School', 'Holiday Promo', 'New Product Launch', 'Clearance Event'])}`,
        companyId: gonxtCompanyId,
        type: randomChoice(promotionTypes),
        startDate: startDate,
        endDate: endDate,
        status: endDate < new Date() ? 'completed' : randomChoice(['active', 'active', 'draft']),
        budget: budget,
        spent: spent,
        customers: customerIds.slice(0, randomInt(5, 20)),
        products: productIds.slice(0, randomInt(3, 15)),
        terms: {
            discountPercentage: randomFloat(5, 30),
            minimumQuantity: randomInt(10, 100),
            maximumDiscount: randomFloat(1000, 10000),
            paymentTerms: randomChoice(['Net 30', 'Net 60', 'COD'])
        },
        performance: {
            participatingCustomers: randomInt(5, 20),
            totalSales: randomFloat(50000, 500000),
            incrementalSales: randomFloat(10000, 100000),
            roi: randomFloat(1.2, 4.5)
        },
        createdAt: randomDate(new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000), startDate),
        updatedAt: new Date()
    });
}

// 7. Create Trade Spends (5000 trade spend records)
print('Creating GONXT trade spends...');
for (let i = 0; i < 5000; i++) {
    const customerId = randomChoice(customerIds);
    const promotionId = randomChoice(promotionIds);
    const budgetId = randomChoice(budgetIds);
    const date = randomDate(new Date('2023-01-01'), new Date('2024-11-01'));
    
    db.tradeSpends.insertOne({
        companyId: gonxtCompanyId,
        customerId: customerId,
        promotionId: promotionId,
        budgetId: budgetId,
        amount: randomFloat(100, 10000),
        date: date,
        status: randomChoice(['approved', 'approved', 'paid', 'pending']),
        type: randomChoice(['accrual', 'payment', 'adjustment']),
        description: `Trade spend for ${randomChoice(['volume discount', 'display allowance', 'promotional support', 'listing fee', 'cooperative advertising'])}`,
        metadata: {
            invoiceNumber: `INV${String(i + 1).padStart(6, '0')}`,
            approvedBy: randomChoice(userIds),
            approvalDate: new Date(date.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000),
            paymentMethod: randomChoice(['Bank Transfer', 'Credit Note', 'Check']),
            reference: `REF${String(i + 1).padStart(6, '0')}`
        },
        createdAt: date,
        updatedAt: new Date()
    });
}

// 8. Create Sales Data (20000 sales records)
print('Creating GONXT sales data...');
for (let i = 0; i < 20000; i++) {
    const customerId = randomChoice(customerIds);
    const productId = randomChoice(productIds);
    const date = randomDate(new Date('2023-01-01'), new Date('2024-11-01'));
    const quantity = randomInt(1, 500);
    const unitPrice = randomFloat(20, 1000);
    const revenue = quantity * unitPrice;
    const cost = revenue * randomFloat(0.4, 0.8);
    
    db.salesData.insertOne({
        companyId: gonxtCompanyId,
        customerId: customerId,
        productId: productId,
        date: date,
        quantity: quantity,
        revenue: revenue,
        unitPrice: unitPrice,
        cost: cost,
        margin: ((revenue - cost) / revenue) * 100,
        channel: randomChoice(['Retail', 'Online', 'Wholesale', 'Direct']),
        region: randomChoice(['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT']),
        salesRep: randomChoice(userIds),
        orderNumber: `ORD${String(i + 1).padStart(8, '0')}`,
        createdAt: date,
        updatedAt: new Date()
    });
}

// 9. Create Test Company for Demo
print('Creating Test Company for demo...');
const testCompanyId = new ObjectId();
db.companies.insertOne({
    _id: testCompanyId,
    name: 'Test Company',
    domain: 'testcompany.demo',
    status: 'active',
    settings: {
        currency: 'USD',
        timezone: 'America/New_York',
        fiscalYearStart: 'January',
        features: {
            aiPredictions: true,
            realTimeAnalytics: true,
            multiCurrency: true,
            advancedReporting: true
        }
    },
    contact: {
        email: 'admin@testcompany.demo',
        phone: '+1 555 123 4567',
        address: {
            street: '456 Demo Street',
            city: 'New York',
            state: 'NY',
            postcode: '10001',
            country: 'USA'
        }
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
});

// Create test company admin user
const testUserId = new ObjectId();
db.users.insertOne({
    _id: testUserId,
    email: 'demo@testcompany.demo',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
    companyId: testCompanyId,
    role: 'admin',
    status: 'active',
    profile: {
        firstName: 'Demo',
        lastName: 'User',
        department: 'Administration',
        phone: '+1 555 123 4567'
    },
    permissions: ['all'],
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
});

// Create sample data for test company (smaller dataset)
print('Creating sample data for Test Company...');

// 10 customers for test company
const testCustomerIds = [];
for (let i = 0; i < 10; i++) {
    const customerId = new ObjectId();
    testCustomerIds.push(customerId);
    
    db.customers.insertOne({
        _id: customerId,
        name: `Test Customer ${i + 1}`,
        code: `TEST${String(i + 1).padStart(3, '0')}`,
        companyId: testCompanyId,
        type: randomChoice(customerTypes),
        status: 'active',
        contact: {
            email: `customer${i + 1}@testcompany.demo`,
            phone: '+1 555 ' + randomInt(1000000, 9999999),
            primaryContact: `Contact ${i + 1}`
        },
        address: {
            street: `${randomInt(1, 999)} Test Street`,
            city: 'Demo City',
            state: 'NY',
            postcode: String(randomInt(10000, 99999)),
            country: 'USA'
        },
        salesData: {
            totalRevenue: randomFloat(50000, 500000),
            averageOrderValue: randomFloat(500, 2000),
            lastOrderDate: randomDate(new Date('2024-01-01'), new Date()),
            creditLimit: randomFloat(25000, 100000),
            paymentTerms: 'Net 30'
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
    });
}

// 20 products for test company
const testProductIds = [];
for (let i = 0; i < 20; i++) {
    const productId = new ObjectId();
    testProductIds.push(productId);
    
    db.products.insertOne({
        _id: productId,
        name: `Test Product ${i + 1}`,
        sku: `TEST${String(i + 1).padStart(4, '0')}`,
        companyId: testCompanyId,
        category: randomChoice(categories),
        brand: 'Test Brand',
        status: 'active',
        pricing: {
            cost: randomFloat(10, 100),
            listPrice: randomFloat(20, 200),
            wholesalePrice: randomFloat(15, 150),
            retailPrice: randomFloat(25, 250),
            margin: randomFloat(20, 50)
        },
        specifications: {
            weight: randomFloat(0.1, 10),
            dimensions: {
                length: randomFloat(5, 50),
                width: randomFloat(5, 50),
                height: randomFloat(5, 50)
            }
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
    });
}

print('GONXT seed data creation completed successfully!');
print('Created:');
print('- 1 GONXT company with 4 users');
print('- 50 customers with detailed information');
print('- 100 products across multiple categories');
print('- 2 annual budgets (2023-2024)');
print('- 200 promotions over 2 years');
print('- 5,000 trade spend records');
print('- 20,000 sales data records');
print('- 1 Test Company with sample data for demo');
print('');
print('Login credentials:');
print('GONXT Admin: admin@gonxt.tech / password123');
print('Test Company: demo@testcompany.demo / password123');
print('');
print('Data spans from January 2023 to November 2024 with realistic business patterns');
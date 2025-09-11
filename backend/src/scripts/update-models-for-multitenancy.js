#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const modelsToUpdate = [
  'Promotion.js',
  'TradeSpend.js',
  'Customer.js',
  'Product.js',
  'Campaign.js',
  'ActivityGrid.js',
  'SalesHistory.js',
  'Vendor.js',
  'MasterData.js'
];

function updateModelForMultiTenancy(modelPath) {
  console.log(`Updating ${modelPath}...`);
  
  let content = fs.readFileSync(modelPath, 'utf8');
  
  // Skip if already has company reference
  if (content.includes('company: {') && content.includes('ref: \'Company\'')) {
    console.log(`  - Already updated, skipping`);
    return;
  }
  
  // Find the schema definition start
  const schemaStart = content.indexOf('new mongoose.Schema({');
  if (schemaStart === -1) {
    console.log(`  - Could not find schema definition, skipping`);
    return;
  }
  
  // Find the first field after the opening brace
  const openBrace = content.indexOf('{', schemaStart);
  const firstField = content.indexOf('\n', openBrace);
  
  // Insert company reference
  const companyRef = `
  // Company reference for multi-tenancy
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },`;
  
  content = content.slice(0, firstField) + companyRef + content.slice(firstField);
  
  // Update indexes to include company
  const indexPattern = /(\w+Schema\.index\(\s*{\s*)([^}]+)(\s*}\s*(?:,\s*{\s*[^}]*\s*})?\s*\);)/g;
  
  content = content.replace(indexPattern, (match, prefix, indexFields, suffix) => {
    // Skip if already includes company
    if (indexFields.includes('company:')) {
      return match;
    }
    
    // Add company to the beginning of the index
    const newIndexFields = `company: 1, ${indexFields}`;
    return `${prefix}${newIndexFields}${suffix}`;
  });
  
  // Handle unique indexes specially
  const uniqueIndexPattern = /(\w+Schema\.index\(\s*{\s*company:\s*1,\s*)([^}]+)(\s*}\s*,\s*{\s*unique:\s*true\s*}\s*\);)/g;
  
  content = content.replace(uniqueIndexPattern, (match, prefix, indexFields, suffix) => {
    return `${prefix}${indexFields}${suffix}`;
  });
  
  fs.writeFileSync(modelPath, content);
  console.log(`  - Updated successfully`);
}

// Update each model
modelsToUpdate.forEach(modelFile => {
  const modelPath = path.join(modelsDir, modelFile);
  if (fs.existsSync(modelPath)) {
    updateModelForMultiTenancy(modelPath);
  } else {
    console.log(`Model ${modelFile} not found, skipping`);
  }
});

console.log('Multi-tenancy update complete!');
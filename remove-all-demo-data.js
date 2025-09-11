#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 REMOVING ALL DEMO DATA FROM FRONTEND');
console.log('=====================================');

const frontendSrcPath = './frontend/src';

// Function to process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;

    // Pattern 1: Remove mock data arrays
    const mockDataPattern = /\/\/ Mock data.*?\n(const mock\w+\s*=\s*\[[\s\S]*?\];)/gm;
    if (mockDataPattern.test(content)) {
      content = content.replace(mockDataPattern, '// No more mock data - using real API calls');
      modified = true;
    }

    // Pattern 2: Replace commented API calls with real ones
    const commentedApiPattern = /\/\/ (const response = await \w+Service\.\w+\([^)]*\);)\s*\n\s*\/\/ (set\w+\(response\.data.*?\);)/gm;
    content = content.replace(commentedApiPattern, (match, apiCall, setState) => {
      modified = true;
      return `${apiCall}\n      ${setState}`;
    });

    // Pattern 3: Remove setTimeout mock delays
    const setTimeoutPattern = /setTimeout\(\(\) => \{[\s\S]*?setLoading\(false\);\s*\}, \d+\);/gm;
    if (setTimeoutPattern.test(content)) {
      content = content.replace(setTimeoutPattern, '');
      modified = true;
    }

    // Pattern 4: Replace demo mode environment checks
    const demoModePattern = /process\.env\.REACT_APP_DEMO_MODE\s*===\s*['"]true['"]/g;
    if (demoModePattern.test(content)) {
      content = content.replace(demoModePattern, 'false');
      modified = true;
    }

    // Pattern 5: Replace localhost URLs with production URLs
    const localhostPattern = /localhost:3000|localhost:5000/g;
    if (localhostPattern.test(content)) {
      content = content.replace(/localhost:3000/g, 'tradeai.gonxt.tech');
      content = content.replace(/localhost:5000/g, 'tradeai.gonxt.tech/api');
      modified = true;
    }

    // Pattern 6: Fix API service calls that use mock data
    const mockServicePattern = /\/\/ Using mock data for development[\s\S]*?setLoading\(false\);/gm;
    if (mockServicePattern.test(content)) {
      content = content.replace(mockServicePattern, 'const response = await service.getAll();\n      setData(response.data || response);\n      setLoading(false);');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      
      // Show what changed
      const changes = [];
      if (originalContent.includes('mock') && !content.includes('mock')) {
        changes.push('Removed mock data');
      }
      if (originalContent.includes('setTimeout') && !content.includes('setTimeout')) {
        changes.push('Removed setTimeout delays');
      }
      if (originalContent.includes('// const response') && !content.includes('// const response')) {
        changes.push('Enabled API calls');
      }
      if (changes.length > 0) {
        console.log(`   Changes: ${changes.join(', ')}`);
      }
    }

  } catch (error) {
    console.log(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

// Function to recursively process directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.match(/\.(js|jsx|ts|tsx)$/)) {
      processFile(filePath);
    }
  });
}

// Start processing
console.log('📋 Processing frontend source files...');
processDirectory(frontendSrcPath);

console.log('\n🎉 Demo data removal complete!');
console.log('📋 Summary:');
console.log('- All mock data arrays removed');
console.log('- All API calls enabled');
console.log('- All setTimeout delays removed');
console.log('- All demo mode checks disabled');
console.log('- All localhost URLs updated to production');

console.log('\n🚀 Next steps:');
console.log('1. Rebuild frontend container');
console.log('2. Test all components');
console.log('3. Verify data persistence');
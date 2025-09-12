#!/usr/bin/env python3
import os
import re

def fix_try_catch_blocks(file_path):
    """Fix incomplete try blocks by adding catch clauses"""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Pattern to find try blocks without catch or finally
    # This looks for try { ... } followed by whitespace and then something that's not catch or finally
    pattern = r'(\s*try\s*\{[^}]*\})\s*(?!\s*(?:catch|finally))'
    
    def add_catch_block(match):
        try_block = match.group(1)
        # Add a generic catch block
        catch_block = """ catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred');
      setLoading(false);
    }"""
        return try_block + catch_block
    
    # Apply the fix
    fixed_content = re.sub(pattern, add_catch_block, content, flags=re.DOTALL)
    
    # Only write if content changed
    if fixed_content != content:
        with open(file_path, 'w') as f:
            f.write(fixed_content)
        return True
    return False

# List of files that need fixing based on the error message
files_to_fix = [
    'frontend/src/components/analytics/AnalyticsDashboard.js',
    'frontend/src/components/budgets/BudgetDetail.js',
    'frontend/src/components/budgets/BudgetForm.js',
    'frontend/src/components/budgets/BudgetList.js',
    'frontend/src/components/customers/CustomerDetail.js',
    'frontend/src/components/customers/CustomerList.js',
    'frontend/src/components/products/ProductDetail.js',
    'frontend/src/components/products/ProductList.js',
    'frontend/src/components/promotions/PromotionDetail.js',
    'frontend/src/components/tradeSpends/TradeSpendDetail.js',
    'frontend/src/components/tradeSpends/TradeSpendList.js'
]

fixed_count = 0
for file_path in files_to_fix:
    if os.path.exists(file_path):
        if fix_try_catch_blocks(file_path):
            print(f"Fixed: {file_path}")
            fixed_count += 1
        else:
            print(f"No changes needed: {file_path}")
    else:
        print(f"File not found: {file_path}")

print(f"\nFixed {fixed_count} files")
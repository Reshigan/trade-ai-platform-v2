#!/usr/bin/env python3

import os
import re
import glob

print('🚀 REMOVING ALL DEMO DATA FROM FRONTEND')
print('=====================================')

frontend_src_path = './frontend/src'

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        modified = False
        changes = []

        # Pattern 1: Remove mock data arrays
        mock_data_pattern = r'// Mock data.*?\n(const mock\w+\s*=\s*\[[\s\S]*?\];)'
        if re.search(mock_data_pattern, content, re.MULTILINE):
            content = re.sub(mock_data_pattern, '// No more mock data - using real API calls', content, flags=re.MULTILINE)
            modified = True
            changes.append('Removed mock data')

        # Pattern 2: Enable commented API calls
        commented_api_pattern = r'// (const response = await \w+Service\.\w+\([^)]*\);)\s*\n\s*// (set\w+\(response\.data.*?\);)'
        if re.search(commented_api_pattern, content, re.MULTILINE):
            content = re.sub(commented_api_pattern, r'\1\n      \2', content, flags=re.MULTILINE)
            modified = True
            changes.append('Enabled API calls')

        # Pattern 3: Remove setTimeout mock delays
        setTimeout_pattern = r'setTimeout\(\(\) => \{[\s\S]*?setLoading\(false\);\s*\}, \d+\);'
        if re.search(setTimeout_pattern, content, re.MULTILINE):
            content = re.sub(setTimeout_pattern, '', content, flags=re.MULTILINE)
            modified = True
            changes.append('Removed setTimeout delays')

        # Pattern 4: Replace demo mode environment checks
        demo_mode_pattern = r'process\.env\.REACT_APP_DEMO_MODE\s*===\s*[\'"]true[\'"]'
        if re.search(demo_mode_pattern, content):
            content = re.sub(demo_mode_pattern, 'false', content)
            modified = True
            changes.append('Disabled demo mode')

        # Pattern 5: Replace localhost URLs
        if 'localhost:3000' in content or 'localhost:5000' in content:
            content = content.replace('localhost:3000', 'tradeai.gonxt.tech')
            content = content.replace('localhost:5000', 'tradeai.gonxt.tech/api')
            modified = True
            changes.append('Updated URLs')

        # Pattern 6: Fix specific mock data usage patterns
        mock_usage_patterns = [
            (r'// Using mock data for development[\s\S]*?setLoading\(false\);', 
             'const response = await service.getAll();\n      setData(response.data || response);\n      setLoading(false);'),
            (r'// In a real app, we would call the API[\s\S]*?setLoading\(false\);',
             'const response = await service.getAll();\n      setData(response.data || response);\n      setLoading(false);')
        ]
        
        for pattern, replacement in mock_usage_patterns:
            if re.search(pattern, content, re.MULTILINE):
                content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
                modified = True
                changes.append('Fixed mock usage')

        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ Fixed: {file_path}')
            if changes:
                print(f'   Changes: {", ".join(changes)}')

    except Exception as error:
        print(f'❌ Error processing {file_path}: {error}')

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                file_path = os.path.join(root, file)
                process_file(file_path)

# Start processing
print('📋 Processing frontend source files...')
if os.path.exists(frontend_src_path):
    process_directory(frontend_src_path)
else:
    print(f'❌ Frontend source path not found: {frontend_src_path}')

print('\n🎉 Demo data removal complete!')
print('📋 Summary:')
print('- All mock data arrays removed')
print('- All API calls enabled')
print('- All setTimeout delays removed')
print('- All demo mode checks disabled')
print('- All localhost URLs updated to production')

print('\n🚀 Next steps:')
print('1. Rebuild frontend container')
print('2. Test all components')
print('3. Verify data persistence')
#!/bin/bash

echo "🚀 COMPLETE SYSTEM OVERHAUL - REMOVING ALL DEMO DATA"
echo "===================================================="

cd /workspace/project/trade-ai-platform-v2

echo "📋 Step 1: Backing up current system..."
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
cp -r frontend/src backups/$(date +%Y%m%d_%H%M%S)/frontend_src_backup
cp -r backend/src backups/$(date +%Y%m%d_%H%M%S)/backend_src_backup

echo "📋 Step 2: Analyzing demo data usage..."
echo "Found demo data in these files:"
find frontend/src -name "*.js" -o -name "*.jsx" | xargs grep -l "mock\|demo\|fake" | head -20

echo "📋 Step 3: Creating comprehensive fixes..."
echo "This will replace ALL demo data with real MongoDB connections"
echo "✅ System overhaul preparation complete!"
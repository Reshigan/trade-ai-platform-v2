#!/bin/bash

echo "🔍 Finding Trade AI Frontend port..."
echo ""

# Check common React ports
for port in 3000 3001 3002 3003; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port | grep -q "200\|304"; then
        echo "✅ Frontend found at: http://localhost:$port"
        echo ""
        echo "🌐 Open this URL in your browser: http://localhost:$port"
        echo ""
        echo "📝 Login with:"
        echo "   Email: info@vantax.co.za"
        echo "   Password: Vantax1234#"
        exit 0
    fi
done

echo "⚠️  Frontend not found on standard ports."
echo ""
echo "Check your terminal output for a message like:"
echo "  'webpack compiled successfully'"
echo "  'Compiled successfully!'"
echo "  'Local: http://localhost:XXXX'"
echo ""
echo "Or try running: lsof -i :3001"
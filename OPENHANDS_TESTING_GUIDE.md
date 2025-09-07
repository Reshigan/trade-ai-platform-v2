# Testing Trade AI in OpenHands Environment

## 🧪 Overview

This guide explains how to test the Trade AI system within the OpenHands development environment.

## 🚀 Quick Test

### 1. Start the Backend Server

```bash
cd /workspace/trade-ai-final/backend
npm start
```

The backend will start on port 5000.

### 2. Start the Frontend (New Terminal)

```bash
cd /workspace/trade-ai-final/frontend
npm start
```

The frontend will start on port 3000.

## 🌐 Accessing the Application

OpenHands provides special URLs for accessing web applications:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

In OpenHands, you can also use:
- http://localhost:50306 (mapped port)
- http://localhost:56146 (mapped port)

## 🧪 Testing Methods

### 1. API Testing with Python

```python
import requests
import json

# Test login endpoint
response = requests.post(
    "http://localhost:5000/api/auth/login",
    json={"email": "admin@tradeai.com", "password": "password123"},
    headers={"Content-Type": "application/json"}
)
print("Login Response:", response.json())

# Test quick login
response = requests.post(
    "http://localhost:5000/api/auth/quick-login",
    json={"role": "admin"},
    headers={"Content-Type": "application/json"}
)
print("Quick Login Response:", response.json())
```

### 2. API Testing with cURL

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tradeai.com","password":"password123"}'

# Test with authentication
TOKEN="your-jwt-token"
curl http://localhost:5000/api/promotions \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Browser Testing

Use the OpenHands browser tool to test the UI:

```python
# Navigate to the application
goto('http://localhost:3000')

# Test login
fill('email-input', 'admin@tradeai.com')
fill('password-input', 'password123')
click('login-button')

# Navigate through the app
click('dashboard-link')
click('promotions-link')
```

## 📊 Test Scenarios

### Authentication Tests

1. **Regular Login**
   - Email: admin@tradeai.com
   - Password: password123

2. **Quick Login**
   - Select role: Admin/Manager/KAM

3. **Invalid Credentials**
   - Test with wrong password
   - Test with non-existent email

### Dashboard Tests

1. **Executive Dashboard**
   - Verify KPI cards load
   - Check chart rendering
   - Test date range filters

2. **Navigation**
   - Test all menu items
   - Verify routing works
   - Check responsive design

### CRUD Operations

1. **Promotions**
   - List promotions
   - Create new promotion
   - Edit existing promotion
   - Delete promotion

2. **Budgets**
   - View budget summary
   - Allocate budget
   - Track utilization

3. **Trade Spends**
   - Submit request
   - View approval chain
   - Track status

## 🔍 Debugging in OpenHands

### Check Server Logs

```bash
# Backend logs
cd /workspace/trade-ai-final/backend
# Logs will appear in the terminal

# Check for errors
grep -i error backend/logs/*.log
```

### Check Browser Console

When using the browser tool, errors will be visible in the response.

### Network Inspection

```bash
# Monitor API calls
tcpdump -i lo -n port 5000

# Check if ports are listening
netstat -an | grep LISTEN | grep -E '3000|5000'
```

## 🧪 Automated Testing

### Run Backend Tests

```bash
cd /workspace/trade-ai-final/backend
npm test
```

### Run Frontend Tests

```bash
cd /workspace/trade-ai-final/frontend
npm test
```

### API Integration Tests

Create a test file:

```python
# test_api.py
import requests
import pytest

BASE_URL = "http://localhost:5000/api"

def test_health_check():
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    assert response.json()["status"] == "OK"

def test_login():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "admin@tradeai.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "accessToken" in response.json()["data"]

# Run with: pytest test_api.py
```

## 🛠️ Common Issues & Solutions

### Port Already in Use

```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Dependencies Not Installed

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Mock Mode Not Working

Ensure `MOCK_MODE=true` in backend/.env

### CORS Issues

The backend is configured to accept requests from localhost:3000. If using different ports, update CORS settings.

## 📝 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access API documentation
- [ ] Login works (regular and quick)
- [ ] Dashboard loads with data
- [ ] Navigation between pages works
- [ ] Forms submit successfully
- [ ] Charts render properly
- [ ] Responsive design works
- [ ] Error handling works

## 🎯 Quick Commands

```bash
# Start both servers
cd /workspace/trade-ai-final/backend && npm start &
cd /workspace/trade-ai-final/frontend && npm start &

# Stop all Node processes
pkill -f node

# Check if servers are running
ps aux | grep node

# View real-time logs
tail -f backend/logs/app.log
```

## 💡 Tips for OpenHands Testing

1. Use multiple terminal windows for backend/frontend
2. Keep the browser tool open for UI testing
3. Use Python scripts for API testing
4. Monitor logs in real-time
5. Test in mock mode first before database setup
6. Use the task_tracker tool to organize test scenarios

## 🔗 Useful Resources

- [API Documentation](http://localhost:5000/api/docs)
- [System Overview](SYSTEM_OVERVIEW.md)
- [Deployment Guide](MACOS_DEPLOYMENT_GUIDE.md)
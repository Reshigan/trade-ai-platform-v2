# Trade AI - macOS Setup Guide

This guide will help you set up and run Trade AI on your macOS system.

## Prerequisites

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Required Software

```bash
# Install Node.js (v18 or later)
brew install node

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Install Git (if not already installed)
brew install git

# Install Docker Desktop (optional, for Docker deployment)
brew install --cask docker
```

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Reshigan/trade-ai-final.git
cd trade-ai-final
```

### 2. Start MongoDB

```bash
# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh --eval "db.version()"
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 4. Set Up Environment Variables

```bash
# Create backend .env file
cat > backend/.env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trade-ai
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
LOG_LEVEL=info
EOF

# Create frontend .env file
cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
EOF
```

### 5. Seed the Database

```bash
cd backend
npm run seed
cd ..
```

## Running the Application

### Option 1: Using the Start Script (Recommended)

```bash
# Make the script executable
chmod +x start.sh

# Run the application
./start.sh
```

### Option 2: Manual Start

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 3: Using Docker (if Docker Desktop is installed)

```bash
# Start Docker Desktop first (from Applications or menu bar)

# Make the script executable
chmod +x start-docker.sh

# Run with Docker
./start-docker.sh
```

## Accessing the Application

Once running, access the application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## Default Login Credentials

### Admin User
- Email: `info@vantax.co.za`
- Password: `Vantax1234#`

### Test Company Users
- Manager: `manager@testco.com` / `Vantax1234#`
- KAM 1: `kam1@testco.com` / `Vantax1234#`
- KAM 2: `kam2@testco.com` / `Vantax1234#`
- Finance: `finance@testco.com` / `Vantax1234#`

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Port Already in Use
```bash
# Find process using port 3000 (frontend)
lsof -i :3000

# Find process using port 5000 (backend)
lsof -i :5000

# Kill process (replace PID with actual process ID)
kill -9 PID
```

### Node Version Issues
```bash
# Check Node version (should be 18+)
node --version

# Update Node if needed
brew upgrade node
```

### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

## Stopping the Application

### If using start.sh:
Press `Ctrl+C` in the terminal where the script is running

### If running manually:
Press `Ctrl+C` in both terminal windows

### If using Docker:
```bash
docker-compose down
```

### Stop MongoDB:
```bash
brew services stop mongodb-community
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **API Testing**: Use the API documentation at http://localhost:5000/api/docs
3. **Database GUI**: Consider installing MongoDB Compass for visual database management
   ```bash
   brew install --cask mongodb-compass
   ```

## System Requirements

- macOS 10.15 (Catalina) or later
- 8GB RAM minimum (16GB recommended)
- 2GB free disk space
- Internet connection for initial setup

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the logs in `backend/logs/` directory
3. Create an issue on GitHub: https://github.com/Reshigan/trade-ai-final/issues

---

Happy coding! 🚀
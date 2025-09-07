# macOS Deployment Guide for Trade AI

## 📋 Prerequisites

### 1. Install Required Software

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and npm
brew install node

# Install Git
brew install git

# Optional: Install MongoDB (for production mode)
brew tap mongodb/brew
brew install mongodb-community

# Optional: Install Redis (for production mode)
brew install redis
```

### 2. Verify Installations

```bash
node --version  # Should be v18 or higher
npm --version   # Should be v9 or higher
git --version
```

## 🚀 Local Development Deployment

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/Reshigan/trade-ai-final.git
cd trade-ai-final
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
MOCK_MODE=true
EOF

# Start the backend server
npm start
```

The backend will run on http://localhost:5000

### Step 3: Frontend Setup (New Terminal)

```bash
# Open new terminal and navigate to frontend
cd trade-ai-final/frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
EOF

# Start the frontend development server
npm start
```

The frontend will run on http://localhost:3000

## 🏭 Production Deployment Options

### Option 1: Local Production Build

```bash
# Backend production mode
cd backend
npm run build  # If you have TypeScript
NODE_ENV=production npm start

# Frontend production build
cd ../frontend
npm run build
npm install -g serve
serve -s build -l 3000
```

### Option 2: Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'trade-ai-backend',
      script: './backend/server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'trade-ai-frontend',
      script: 'serve',
      args: '-s build -l 3000',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# Start both services
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Monitor processes
pm2 monit
```

### Option 3: Docker Deployment

Create Docker files:

```bash
# Backend Dockerfile
cat > backend/Dockerfile << EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
EOF

# Frontend Dockerfile
cat > frontend/Dockerfile << EOF
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Docker Compose
cat > docker-compose.yml << EOF
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MOCK_MODE=true
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
EOF

# Build and run
docker-compose up --build
```

## 🌐 Cloud Deployment Options

### Option 1: Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login to Heroku
heroku login

# Create apps
heroku create trade-ai-backend
heroku create trade-ai-frontend

# Deploy backend
cd backend
git init
heroku git:remote -a trade-ai-backend
git add .
git commit -m "Deploy backend"
git push heroku main

# Deploy frontend
cd ../frontend
git init
heroku git:remote -a trade-ai-frontend
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
git add .
git commit -m "Deploy frontend"
git push heroku main
```

### Option 2: Vercel (Frontend) + Railway (Backend)

```bash
# Frontend on Vercel
npm install -g vercel
cd frontend
vercel

# Backend on Railway
# Visit https://railway.app
# Connect GitHub repo and deploy
```

### Option 3: AWS EC2

```bash
# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs

# Clone and setup
git clone https://github.com/Reshigan/trade-ai-final.git
cd trade-ai-final

# Install and configure nginx
sudo yum install nginx
sudo systemctl start nginx
```

## 🔧 Production Configuration

### 1. Environment Variables

```bash
# Production .env for backend
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=5000
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
MONGODB_URI=mongodb://localhost:27017/tradeai
REDIS_URL=redis://localhost:6379
MOCK_MODE=false
EOF

# Production .env for frontend
cat > frontend/.env.production << EOF
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_ENV=production
EOF
```

### 2. SSL/HTTPS Setup (using Let's Encrypt)

```bash
# Install certbot
brew install certbot

# For nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Database Setup

```bash
# Start MongoDB
brew services start mongodb-community

# Start Redis
brew services start redis

# Create database and user
mongosh
> use tradeai
> db.createUser({
    user: "tradeai_user",
    pwd: "secure_password",
    roles: [{role: "readWrite", db: "tradeai"}]
  })
```

## 📊 Monitoring & Maintenance

### 1. Logs

```bash
# PM2 logs
pm2 logs

# System logs
tail -f /var/log/system.log

# Application logs
tail -f backend/logs/app.log
```

### 2. Performance Monitoring

```bash
# Install monitoring tools
npm install -g clinic
npm install -g autocannon

# Run performance tests
clinic doctor -- node backend/server.js
autocannon -c 100 -d 30 http://localhost:5000
```

### 3. Backup Script

```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db tradeai --out backup_$DATE
tar -czf backup_$DATE.tar.gz backup_$DATE
rm -rf backup_$DATE
echo "Backup completed: backup_$DATE.tar.gz"
EOF

chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

2. **Permission errors**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

3. **MongoDB connection issues**
```bash
# Check MongoDB status
brew services list
# Restart MongoDB
brew services restart mongodb-community
```

4. **Memory issues**
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 🔐 Security Checklist

- [ ] Change default JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up MongoDB authentication
- [ ] Regular security updates
- [ ] Implement backup strategy
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for secrets

## 📱 Quick Start Commands

```bash
# Development mode (both servers)
npm run dev

# Production build
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Stop all services
pm2 stop all

# Restart all services
pm2 restart all

# View status
pm2 status
```

## 🎯 Next Steps

1. Configure your domain name
2. Set up SSL certificates
3. Configure monitoring and alerts
4. Set up CI/CD pipeline
5. Implement automated backups
6. Configure CDN for static assets
7. Set up error tracking (Sentry)
8. Configure application monitoring (New Relic/DataDog)

## 📞 Support

If you encounter issues:
1. Check logs: `pm2 logs`
2. Verify all services are running: `pm2 status`
3. Check system resources: `top` or `htop`
4. Review environment variables
5. Ensure all ports are accessible
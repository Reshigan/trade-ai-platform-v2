# Trade AI Platform Deployment Guide

This comprehensive guide provides detailed instructions for deploying the Trade AI platform in various environments.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Deployment Options](#deployment-options)
3. [Local Development Deployment](#local-development-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Cloud Provider Deployments](#cloud-provider-deployments)
   - [AWS Deployment](#aws-deployment)
   - [Azure Deployment](#azure-deployment)
   - [Google Cloud Deployment](#google-cloud-deployment)
7. [Database Setup](#database-setup)
8. [Environment Configuration](#environment-configuration)
9. [Security Considerations](#security-considerations)
10. [Monitoring Setup](#monitoring-setup)
11. [Backup and Recovery](#backup-and-recovery)
12. [Scaling Considerations](#scaling-considerations)
13. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Operating System**: Ubuntu 20.04 LTS or later, CentOS 8+, or any modern Linux distribution
- **Database**: MongoDB 5.0+
- **Node.js**: v16.0.0 or later
- **Python**: 3.8 or later (for AI services)

### Recommended Requirements

- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Storage**: 100GB+ SSD
- **Database**: MongoDB 5.0+ with replica set
- **Cache**: Redis 6.0+
- **Load Balancer**: Nginx or similar

### Network Requirements

- Outbound internet access for package installation and updates
- Inbound access to the following ports:
  - HTTP: 80
  - HTTPS: 443
  - Backend API: 5000
  - Frontend Dev Server: 3000
  - AI Service: 8000
  - Monitoring Service: 8080
  - MongoDB: 27017 (internal only)
  - Redis: 6379 (internal only)

## Deployment Options

The Trade AI platform can be deployed in several ways depending on your requirements:

1. **Local Development**: Ideal for development and testing
2. **Docker Containers**: Simplified deployment with containerization
3. **Kubernetes**: For production environments requiring high availability and scalability
4. **Cloud Providers**: Managed services on AWS, Azure, or Google Cloud

## Local Development Deployment

### Prerequisites

1. Install Node.js (v16+)
2. Install MongoDB (v5.0+)
3. Install Python (v3.8+) with required packages
4. Clone the repository

### Backend Setup

```bash
# Navigate to backend directory
cd /path/to/trade-ai-github/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Start the backend server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd /path/to/trade-ai-github/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Start the frontend development server
npm start
```

### AI Services Setup

```bash
# Navigate to AI services directory
cd /path/to/trade-ai-github/ai-services

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the AI prediction service
python src/prediction_api.py
```

### Monitoring Service Setup

```bash
# Navigate to monitoring directory
cd /path/to/trade-ai-github/monitoring

# Install dependencies
pip install -r requirements.txt

# Start the monitoring service
python monitoring_service.py
```

## Docker Deployment

### Prerequisites

1. Install Docker and Docker Compose
2. Clone the repository

### Configuration

1. Create a `.env` file in the root directory with your configuration
2. Update the `docker-compose.yml` file if needed

### Deployment Steps

```bash
# Build and start all services
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

### Individual Container Deployment

```bash
# Build and run backend
docker build -t trade-ai-backend ./backend
docker run -d -p 5000:5000 --env-file .env --name trade-ai-backend trade-ai-backend

# Build and run frontend
docker build -t trade-ai-frontend ./frontend
docker run -d -p 80:80 --name trade-ai-frontend trade-ai-frontend

# Build and run AI services
docker build -t trade-ai-ai-services ./ai-services
docker run -d -p 8000:8000 --name trade-ai-ai-services trade-ai-ai-services

# Build and run monitoring
docker build -t trade-ai-monitoring ./monitoring
docker run -d -p 8080:8080 --name trade-ai-monitoring trade-ai-monitoring
```

## Kubernetes Deployment

### Prerequisites

1. Kubernetes cluster (v1.20+)
2. kubectl configured to access your cluster
3. Helm (v3+)

### Deployment Steps

```bash
# Navigate to kubernetes directory
cd /path/to/trade-ai-github/kubernetes

# Create namespace
kubectl create namespace trade-ai

# Apply ConfigMaps and Secrets
kubectl apply -f config/configmap.yaml -n trade-ai
kubectl apply -f config/secrets.yaml -n trade-ai

# Deploy MongoDB and Redis
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install mongodb bitnami/mongodb -n trade-ai -f config/mongodb-values.yaml
helm install redis bitnami/redis -n trade-ai -f config/redis-values.yaml

# Deploy application components
kubectl apply -f backend/deployment.yaml -n trade-ai
kubectl apply -f frontend/deployment.yaml -n trade-ai
kubectl apply -f ai-services/deployment.yaml -n trade-ai
kubectl apply -f monitoring/deployment.yaml -n trade-ai

# Deploy services
kubectl apply -f backend/service.yaml -n trade-ai
kubectl apply -f frontend/service.yaml -n trade-ai
kubectl apply -f ai-services/service.yaml -n trade-ai
kubectl apply -f monitoring/service.yaml -n trade-ai

# Deploy ingress
kubectl apply -f ingress.yaml -n trade-ai

# Check deployment status
kubectl get all -n trade-ai
```

### Scaling

```bash
# Scale backend deployment
kubectl scale deployment trade-ai-backend --replicas=3 -n trade-ai

# Scale frontend deployment
kubectl scale deployment trade-ai-frontend --replicas=2 -n trade-ai

# Scale AI services deployment
kubectl scale deployment trade-ai-ai-services --replicas=2 -n trade-ai
```

## Cloud Provider Deployments

### AWS Deployment

#### Using Elastic Beanstalk

1. Install the AWS CLI and EB CLI
2. Configure AWS credentials

```bash
# Initialize Elastic Beanstalk application
eb init trade-ai --platform node.js --region us-east-1

# Create environment for backend
cd backend
eb create trade-ai-backend-prod --envvars NODE_ENV=production,DB_URI=<your-mongodb-uri>

# Create environment for frontend
cd ../frontend
eb create trade-ai-frontend-prod

# Create environment for AI services
cd ../ai-services
eb create trade-ai-ai-services-prod

# Create environment for monitoring
cd ../monitoring
eb create trade-ai-monitoring-prod
```

#### Using ECS/Fargate

1. Create ECR repositories for each component
2. Build and push Docker images
3. Create ECS task definitions and services

```bash
# Example for pushing to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/trade-ai-backend:latest ./backend
docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/trade-ai-backend:latest

# Repeat for other components
```

### Azure Deployment

#### Using App Service

1. Install Azure CLI
2. Log in to Azure

```bash
# Log in to Azure
az login

# Create resource group
az group create --name trade-ai-rg --location eastus

# Create App Service plan
az appservice plan create --name trade-ai-plan --resource-group trade-ai-rg --sku P1V2

# Create and deploy backend
az webapp create --name trade-ai-backend --resource-group trade-ai-rg --plan trade-ai-plan --runtime "NODE|16-lts"
cd backend
zip -r backend.zip .
az webapp deployment source config-zip --resource-group trade-ai-rg --name trade-ai-backend --src backend.zip

# Create and deploy frontend
az webapp create --name trade-ai-frontend --resource-group trade-ai-rg --plan trade-ai-plan --runtime "NODE|16-lts"
cd ../frontend
npm run build
cd build
zip -r frontend.zip .
az webapp deployment source config-zip --resource-group trade-ai-rg --name trade-ai-frontend --src frontend.zip

# Create and deploy AI services
az webapp create --name trade-ai-ai-services --resource-group trade-ai-rg --plan trade-ai-plan --runtime "PYTHON|3.8"
cd ../../ai-services
zip -r ai-services.zip .
az webapp deployment source config-zip --resource-group trade-ai-rg --name trade-ai-ai-services --src ai-services.zip

# Create and deploy monitoring
az webapp create --name trade-ai-monitoring --resource-group trade-ai-rg --plan trade-ai-plan --runtime "PYTHON|3.8"
cd ../monitoring
zip -r monitoring.zip .
az webapp deployment source config-zip --resource-group trade-ai-rg --name trade-ai-monitoring --src monitoring.zip
```

#### Using Azure Container Instances

```bash
# Create Azure Container Registry
az acr create --name tradeairegistry --resource-group trade-ai-rg --sku Basic --admin-enabled true

# Build and push Docker images
az acr build --registry tradeairegistry --image trade-ai-backend:latest ./backend
az acr build --registry tradeairegistry --image trade-ai-frontend:latest ./frontend
az acr build --registry tradeairegistry --image trade-ai-ai-services:latest ./ai-services
az acr build --registry tradeairegistry --image trade-ai-monitoring:latest ./monitoring

# Deploy containers
az container create --resource-group trade-ai-rg --name trade-ai-backend --image tradeairegistry.azurecr.io/trade-ai-backend:latest --dns-name-label trade-ai-backend --ports 5000
az container create --resource-group trade-ai-rg --name trade-ai-frontend --image tradeairegistry.azurecr.io/trade-ai-frontend:latest --dns-name-label trade-ai-frontend --ports 80
az container create --resource-group trade-ai-rg --name trade-ai-ai-services --image tradeairegistry.azurecr.io/trade-ai-ai-services:latest --dns-name-label trade-ai-ai-services --ports 8000
az container create --resource-group trade-ai-rg --name trade-ai-monitoring --image tradeairegistry.azurecr.io/trade-ai-monitoring:latest --dns-name-label trade-ai-monitoring --ports 8080
```

### Google Cloud Deployment

#### Using Google App Engine

1. Install Google Cloud SDK
2. Initialize gcloud

```bash
# Initialize gcloud
gcloud init

# Deploy backend
cd backend
gcloud app deploy app.yaml

# Deploy frontend
cd ../frontend
gcloud app deploy app.yaml

# Deploy AI services
cd ../ai-services
gcloud app deploy app.yaml

# Deploy monitoring
cd ../monitoring
gcloud app deploy app.yaml
```

#### Using Google Kubernetes Engine (GKE)

```bash
# Create GKE cluster
gcloud container clusters create trade-ai-cluster --num-nodes=3 --zone=us-central1-a

# Get credentials
gcloud container clusters get-credentials trade-ai-cluster --zone=us-central1-a

# Build and push Docker images
gcloud builds submit --tag gcr.io/[PROJECT_ID]/trade-ai-backend:latest ./backend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/trade-ai-frontend:latest ./frontend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/trade-ai-ai-services:latest ./ai-services
gcloud builds submit --tag gcr.io/[PROJECT_ID]/trade-ai-monitoring:latest ./monitoring

# Deploy to GKE using Kubernetes manifests
# (Use the same Kubernetes deployment steps as above)
```

## Database Setup

### MongoDB Setup

#### Local Installation

```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
> use trade_ai
> db.createUser({
    user: "trade_ai_user",
    pwd: "your_secure_password",
    roles: [{ role: "readWrite", db: "trade_ai" }]
  })
```

#### MongoDB Atlas (Cloud)

1. Create an account on MongoDB Atlas
2. Create a new cluster
3. Configure network access and database users
4. Get the connection string
5. Update the `.env` file with the connection string

### Redis Setup (Optional)

```bash
# Install Redis
sudo apt-get install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set requirepass "your_secure_password"

# Restart Redis
sudo systemctl restart redis
```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=production
API_VERSION=v1
CORS_ORIGIN=https://your-frontend-domain.com

# Database Configuration
MONGODB_URI=mongodb://username:password@hostname:port/database
REDIS_URL=redis://username:password@hostname:port

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=1

# Email Configuration
EMAIL_FROM=noreply@trade-ai.com
SENDGRID_API_KEY=your_sendgrid_api_key

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
SECURITY_LOG_DIR=./logs/security
SECURITY_LOG_LEVEL=info

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_MONITORING=true
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_API_URL=https://api.your-domain.com/api/v1
REACT_APP_SOCKET_URL=https://api.your-domain.com
REACT_APP_AI_API_URL=https://ai.your-domain.com
REACT_APP_MONITORING_URL=https://monitoring.your-domain.com
REACT_APP_ENVIRONMENT=production
```

### AI Services Environment Variables

Create a `.env` file in the ai-services directory with the following variables:

```
PORT=8000
HOST=0.0.0.0
MODEL_DIR=./models
DATA_DIR=./data
LOG_LEVEL=info
MONGODB_URI=mongodb://username:password@hostname:port/database
```

### Monitoring Environment Variables

Create a `.env` file in the monitoring directory with the following variables:

```
PORT=8080
HOST=0.0.0.0
LOG_LEVEL=info
RETENTION_DAYS=30
SYSTEM_CHECK_INTERVAL=60
SERVICE_CHECK_INTERVAL=300
BACKEND_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
AI_SERVICES_URL=https://ai.your-domain.com
```

## Security Considerations

### SSL/TLS Configuration

Always use HTTPS in production environments. You can set up SSL/TLS using:

1. **Let's Encrypt** with Certbot
2. **Cloud provider** managed certificates
3. **Load balancer** SSL termination

Example Nginx configuration with SSL:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # AI Services
    location /ai {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Monitoring
    location /monitoring {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Firewall Configuration

Configure your firewall to allow only necessary traffic:

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow application ports (if directly exposed)
sudo ufw allow 5000/tcp  # Backend API
sudo ufw allow 8000/tcp  # AI Services
sudo ufw allow 8080/tcp  # Monitoring

# Enable firewall
sudo ufw enable
```

### Security Headers

Ensure your application sets appropriate security headers:

- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security
- Referrer-Policy

These are configured in the security middleware of the backend.

### Regular Updates

Keep all components updated:

```bash
# Update system packages
sudo apt update
sudo apt upgrade

# Update Node.js packages
cd backend
npm update
cd ../frontend
npm update

# Update Python packages
cd ../ai-services
pip install --upgrade -r requirements.txt
cd ../monitoring
pip install --upgrade -r requirements.txt
```

## Monitoring Setup

### System Monitoring

The Trade AI platform includes a built-in monitoring service that provides:

1. Real-time system metrics
2. Service health checks
3. Alerting for potential issues
4. Historical performance data

To access the monitoring dashboard:

```
https://your-domain.com/monitoring
```

### External Monitoring (Optional)

For additional monitoring, consider using:

1. **Prometheus** and **Grafana** for metrics collection and visualization
2. **ELK Stack** (Elasticsearch, Logstash, Kibana) for log management
3. **New Relic** or **Datadog** for application performance monitoring

## Backup and Recovery

### Database Backup

#### MongoDB Backup

```bash
# Create backup directory
mkdir -p /backup/mongodb

# Backup MongoDB database
mongodump --uri="mongodb://username:password@hostname:port/database" --out=/backup/mongodb/$(date +%Y-%m-%d)

# Compress backup
tar -zcvf /backup/mongodb/$(date +%Y-%m-%d).tar.gz /backup/mongodb/$(date +%Y-%m-%d)

# Remove uncompressed backup
rm -rf /backup/mongodb/$(date +%Y-%m-%d)

# Set up cron job for daily backups
echo "0 2 * * * mongodump --uri='mongodb://username:password@hostname:port/database' --out=/backup/mongodb/\$(date +\%Y-\%m-\%d) && tar -zcvf /backup/mongodb/\$(date +\%Y-\%m-\%d).tar.gz /backup/mongodb/\$(date +\%Y-\%m-\%d) && rm -rf /backup/mongodb/\$(date +\%Y-\%m-\%d)" | crontab -
```

#### MongoDB Atlas Backup

MongoDB Atlas provides automated backups. Configure backup policy in the Atlas console.

### Application Backup

```bash
# Create backup directory
mkdir -p /backup/application

# Backup application files
tar -zcvf /backup/application/trade-ai-$(date +%Y-%m-%d).tar.gz /path/to/trade-ai-github

# Set up cron job for weekly backups
echo "0 2 * * 0 tar -zcvf /backup/application/trade-ai-\$(date +\%Y-\%m-\%d).tar.gz /path/to/trade-ai-github" | crontab -
```

### Recovery Procedures

#### MongoDB Recovery

```bash
# Extract backup
tar -zxvf /backup/mongodb/YYYY-MM-DD.tar.gz -C /tmp

# Restore database
mongorestore --uri="mongodb://username:password@hostname:port/database" --drop /tmp/YYYY-MM-DD/database
```

#### Application Recovery

```bash
# Extract backup
tar -zxvf /backup/application/trade-ai-YYYY-MM-DD.tar.gz -C /tmp

# Copy files to application directory
cp -r /tmp/path/to/trade-ai-github/* /path/to/trade-ai-github/

# Restart services
cd /path/to/trade-ai-github
docker-compose down
docker-compose up -d
```

## Scaling Considerations

### Horizontal Scaling

For high-traffic environments, consider horizontally scaling components:

1. **Backend API**: Deploy multiple instances behind a load balancer
2. **Frontend**: Deploy to a CDN or multiple instances
3. **AI Services**: Deploy multiple instances for parallel processing
4. **Database**: Use MongoDB sharding for large datasets

### Vertical Scaling

Increase resources for individual components:

1. **CPU and Memory**: Upgrade server specifications
2. **Storage**: Add more disk space or faster SSDs
3. **Network**: Increase bandwidth and reduce latency

### Caching Strategies

Implement caching to improve performance:

1. **Redis Cache**: For frequently accessed data
2. **CDN**: For static assets
3. **In-memory Caching**: For API responses

## Troubleshooting

### Common Issues and Solutions

#### Backend Service Not Starting

```bash
# Check logs
cd backend
npm run logs

# Check environment variables
cat .env

# Check MongoDB connection
mongo mongodb://username:password@hostname:port/database --eval "db.stats()"

# Check port availability
sudo netstat -tulpn | grep 5000
```

#### Frontend Build Failing

```bash
# Check logs
cd frontend
npm run build -- --verbose

# Clear cache
npm cache clean --force
rm -rf node_modules
npm install
```

#### AI Services Issues

```bash
# Check logs
cd ai-services
cat logs/ai-services.log

# Check model files
ls -la models/

# Check Python environment
python -m pip list
```

#### Database Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongodb

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongodb.log

# Check network connectivity
telnet hostname 27017
```

### Log Locations

- **Backend**: `/path/to/trade-ai-github/backend/logs/`
- **Frontend**: Browser console or build logs
- **AI Services**: `/path/to/trade-ai-github/ai-services/logs/`
- **Monitoring**: `/path/to/trade-ai-github/monitoring/logs/`
- **MongoDB**: `/var/log/mongodb/mongodb.log`
- **Nginx**: `/var/log/nginx/`

### Support Resources

- **Documentation**: `/path/to/trade-ai-github/docs/`
- **GitHub Issues**: https://github.com/Reshigan/trade-ai-platform/issues
- **Email Support**: support@trade-ai.com

---

## Deployment Checklist

Use this checklist to ensure a successful deployment:

- [ ] System requirements verified
- [ ] Database set up and configured
- [ ] Environment variables configured
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] AI services deployed and running
- [ ] Monitoring service deployed and running
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured
- [ ] Backup procedures established
- [ ] Monitoring alerts configured
- [ ] Load testing performed
- [ ] Security testing performed
- [ ] Documentation updated

---

For additional assistance, please contact the Trade AI support team at support@trade-ai.com.
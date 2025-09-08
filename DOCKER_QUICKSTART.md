# Trade AI Platform - Docker Quick Start Guide

This guide provides quick instructions for deploying the Trade AI Platform using Docker.

## Prerequisites

- Docker Engine (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Reshigan/trade-ai-platform-v2.git
cd trade-ai-platform-v2
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file to configure your environment variables.

### 3. Start the Services

```bash
docker-compose up -d
```

This command will:
- Build all the necessary Docker images
- Create and start all the containers
- Set up the network and volumes

### 4. Verify the Deployment

```bash
docker-compose ps
```

All services should be running and healthy.

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- AI Services: http://localhost:8000
- Monitoring Dashboard: http://localhost:8080

## Service Overview

The Trade AI Platform consists of the following services:

- **MongoDB**: Database for storing application data
- **Redis**: Cache for performance optimization
- **Backend**: Node.js API for business logic
- **Frontend**: React application for user interface
- **AI Services**: Python-based machine learning services
- **Monitoring**: Real-time monitoring and alerting
- **Nginx**: Reverse proxy for routing and SSL termination

## Common Commands

### View Logs

```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f
```

### Stop Services

```bash
# Stop all services
docker-compose stop

# Stop a specific service
docker-compose stop backend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart a specific service
docker-compose restart backend
```

### Update Services

If you've made changes to the code or configuration:

```bash
# Rebuild and restart services
docker-compose up -d --build
```

### Remove Services

```bash
# Stop and remove containers, networks, and volumes
docker-compose down

# Also remove volumes (will delete all data)
docker-compose down -v
```

## Troubleshooting

### Check Service Health

```bash
# Check health of all services
docker-compose ps

# Check detailed health of a specific service
docker inspect trade-ai-backend | grep -A 10 Health
```

### Access Container Shell

```bash
# Access shell in a container
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongo -u admin -p password --authenticationDatabase admin
```

### View Container Logs

```bash
# View logs for a specific container
docker logs trade-ai-backend
```

## Next Steps

For more detailed information, refer to the [Deployment Guide](docs/DEPLOYMENT.md).

---

For more information, visit [trade-ai.com](https://trade-ai.com) or contact support@trade-ai.com.
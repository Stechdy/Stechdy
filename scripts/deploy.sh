#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/stechdy"
DOCKER_IMAGE="${DOCKER_IMAGE:-stechdy-backend}"

cd $DEPLOY_DIR

echo -e "${YELLOW}📥 Pulling latest Docker images...${NC}"
docker compose pull

echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker compose down --remove-orphans

echo -e "${YELLOW}🚀 Starting new containers...${NC}"
docker compose up -d

echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 15

# Check health status
echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Check backend health
BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' stechdy-backend 2>/dev/null || echo "unhealthy")
if [ "$BACKEND_HEALTH" != "healthy" ]; then
    echo -e "${RED}❌ Backend service is not healthy!${NC}"
    echo -e "${YELLOW}Backend logs:${NC}"
    docker compose logs --tail=50 backend
    
    echo -e "${YELLOW}🔄 Rolling back...${NC}"
    docker compose down
    exit 1
fi

# Check MongoDB health
MONGODB_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' stechdy-mongodb 2>/dev/null || echo "unhealthy")
if [ "$MONGODB_HEALTH" != "healthy" ]; then
    echo -e "${RED}❌ MongoDB service is not healthy!${NC}"
    echo -e "${YELLOW}MongoDB logs:${NC}"
    docker compose logs --tail=50 mongodb
    
    echo -e "${YELLOW}🔄 Rolling back...${NC}"
    docker compose down
    exit 1
fi

# Check Nginx
NGINX_STATUS=$(docker inspect --format='{{.State.Status}}' stechdy-nginx 2>/dev/null || echo "exited")
if [ "$NGINX_STATUS" != "running" ]; then
    echo -e "${RED}❌ Nginx service is not running!${NC}"
    echo -e "${YELLOW}Nginx logs:${NC}"
    docker compose logs --tail=50 nginx
    
    echo -e "${YELLOW}🔄 Rolling back...${NC}"
    docker compose down
    exit 1
fi

echo -e "${GREEN}✅ All services are healthy!${NC}"

# Show running containers
echo -e "\n${YELLOW}📊 Running containers:${NC}"
docker compose ps

# Show recent logs
echo -e "\n${YELLOW}📝 Recent logs:${NC}"
docker compose logs --tail=20

# Clean up old images
echo -e "\n${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -af --filter "until=24h"

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 API is available at: https://stechdy.ai.vn${NC}"

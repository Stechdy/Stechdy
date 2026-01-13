#!/bin/bash

set -e

echo "🔨 Rebuilding and deploying backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-tranvukien125}"
BACKEND_DIR="./Stechdy_BE/backend"
IMAGE_NAME="stechdy-backend"
FULL_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

echo -e "${YELLOW}📦 Building Docker image...${NC}"
cd $BACKEND_DIR
docker build -t $FULL_IMAGE .

echo -e "${YELLOW}📤 Pushing image to Docker Hub...${NC}"
docker push $FULL_IMAGE

echo -e "${GREEN}✅ Image built and pushed successfully!${NC}"
echo -e "${YELLOW}Now you can deploy on the server with:${NC}"
echo -e "${GREEN}ssh root@stechdy.ai.vn 'cd /opt/stechdy && docker compose pull backend && docker compose up -d backend'${NC}"

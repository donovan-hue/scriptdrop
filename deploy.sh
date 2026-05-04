#!/bin/bash

# KRONOS Super-App Deployment Script
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 KRONOS Super-App Deployment Script${NC}"
echo "=========================================="

# Step 1: Build backend
echo -e "${YELLOW}Step 1: Building backend...${NC}"
cd server
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}Backend build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Backend built successfully${NC}"

# Step 2: Build frontend
echo -e "${YELLOW}Step 2: Building frontend...${NC}"
cd ../client
npm install
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Frontend build failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 3: Run tests
echo -e "${YELLOW}Step 3: Running tests...${NC}"
cd ../server
npm test
if [ $? -ne 0 ]; then
  echo -e "${RED}Tests failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓ All tests passed${NC}"

# Step 4: Git operations
echo -e "${YELLOW}Step 4: Git operations...${NC}"
cd ..
git add .
git commit -m "Production deployment $(date +%Y-%m-%d\ %H:%M:%S)"
git push origin main
echo -e "${GREEN}✓ Code pushed to repository${NC}"

# Step 5: Deployment instructions
echo -e "${YELLOW}Step 5: Deployment instructions${NC}"
echo -e "${GREEN}Frontend deployment (Vercel):${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select 'kronos-super-app' project"
echo "3. Check deployment status"
echo ""
echo -e "${GREEN}Backend deployment (Render):${NC}"
echo "1. Go to https://dashboard.render.com"
echo "2. Select 'kronos-api' service"
echo "3. Check deployment status"
echo ""

# Step 6: Post-deployment checks
echo -e "${YELLOW}Step 6: Waiting for deployments to complete...${NC}"
echo "Checking in 30 seconds..."
sleep 30

echo -e "${YELLOW}Step 7: Running health checks...${NC}"
curl -s https://api.kronos.com/api/health | jq .
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Backend is healthy${NC}"
else
  echo -e "${RED}✗ Backend health check failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment script complete!${NC}"
echo "=========================================="
echo "Next steps:"
echo "1. Monitor both dashboards"
echo "2. Test critical user flows"
echo "3. Check error logs"
echo "4. Monitor performance metrics"
echo ""

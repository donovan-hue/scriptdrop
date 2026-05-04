#!/bin/bash

# Post-Deployment Checklist for KRONOS
# Run this after deployment to verify everything works

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  KRONOS Super-App - Post-Deployment Checklist        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
API_URL="https://kronos-api.render.com"
FRONTEND_URL="https://app.kronos.com"
TIMEOUT=10

test_count=0
pass_count=0

run_test() {
  test_count=$((test_count + 1))
  local test_name=$1
  local test_cmd=$2
  
  echo -ne "[$test_count] Testing: $test_name... "
  
  if eval "$test_cmd" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    pass_count=$((pass_count + 1))
  else
    echo -e "${RED}✗ FAIL${NC}"
  fi
}

# API Tests
echo -e "${YELLOW}API Endpoints:${NC}"
run_test "Health Check" "curl -s -m $TIMEOUT $API_URL/api/health"
run_test "Auth Routes Exist" "curl -s -m $TIMEOUT -X POST $API_URL/api/auth/login"
run_test "Products Endpoint" "curl -s -m $TIMEOUT $API_URL/api/products"
run_test "Stories Endpoint" "curl -s -m $TIMEOUT $API_URL/api/stories"
run_test "AR Endpoint" "curl -s -m $TIMEOUT $API_URL/api/ar"
run_test "Chat Endpoint" "curl -s -m $TIMEOUT $API_URL/api/securechat"
run_test "Delivery Endpoint" "curl -s -m $TIMEOUT $API_URL/api/delivery"

echo ""
echo -e "${YELLOW}Frontend:${NC}"
run_test "Frontend Accessible" "curl -s -m $TIMEOUT $FRONTEND_URL"
run_test "JS Bundle Loads" "curl -s -m $TIMEOUT $FRONTEND_URL | grep -q 'script'"

echo ""
echo -e "${YELLOW}Security Headers:${NC}"
run_test "HTTPS Enforced" "curl -I -s -m $TIMEOUT $API_URL | grep -qi 'strict-transport-security'"
run_test "CORS Configured" "curl -I -s -m $TIMEOUT $API_URL | grep -qi 'access-control'"
run_test "X-Content-Type" "curl -I -s -m $TIMEOUT $API_URL | grep -qi 'x-content-type'"

echo ""
echo -e "${YELLOW}Performance:${NC}"
RESPONSE_TIME=$(curl -s -m $TIMEOUT -w '%{time_total}' -o /dev/null $API_URL/api/health)
echo -ne "[*] API Response Time: "
echo "${RESPONSE_TIME}s"
if (( $(echo "$RESPONSE_TIME < 0.5" | bc -l) )); then
  echo -e "${GREEN}✓ Response time is good${NC}"
else
  echo -e "${YELLOW}⚠ Response time could be optimized${NC}"
fi

echo ""
echo -e "${YELLOW}Database:${NC}"
run_test "MongoDB Connection" "curl -s -m $TIMEOUT -X GET $API_URL/api/health | grep -q 'running'"

echo ""
echo -e "${YELLOW}Third-party Services:${NC}"
echo "[ ] Stripe Webhooks Configured"
echo "[ ] Cloudinary CDN Active"
echo "[ ] Google Translate API Active"
echo "[ ] Sentry Error Tracking Active"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Results:${NC}"
echo -e "${BLUE}║  Tests Passed: $pass_count / $test_count${NC}"

if [ $pass_count -eq $test_count ]; then
  echo -e "${BLUE}║  Status: ${GREEN}✓ ALL TESTS PASSED${NC}${BLUE}           ║${NC}"
else
  FAILED=$((test_count - pass_count))
  echo -e "${BLUE}║  Status: ${RED}⚠ $FAILED TESTS FAILED${NC}${BLUE}                ║${NC}"
fi
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${YELLOW}Manual Verification Checklist:${NC}"
echo "[ ] Try registering a new user"
echo "[ ] Create a social post"
echo "[ ] Browse products"
echo "[ ] Try creating a story"
echo "[ ] Test AR product try-on"
echo "[ ] Send a secure message"
echo "[ ] Order food with delivery tracking"
echo "[ ] Check admin dashboard"
echo "[ ] Review error logs in Sentry"
echo "[ ] Check analytics"
echo ""
echo -e "${YELLOW}If all manual checks pass, deployment is complete! 🎉${NC}"

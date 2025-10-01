#!/bin/bash

# Tenki Clone - Quick Setup Script
# This script helps verify and set up the Tenki Clone application

set -e

echo "🚀 Tenki Clone Setup Verification"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} Found: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check Docker
echo -n "Checking Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    echo -e "${GREEN}✓${NC} Found: $DOCKER_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Docker not found (optional for local dev)"
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1)
    echo -e "${GREEN}✓${NC} Found: $COMPOSE_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Docker Compose not found (optional for local dev)"
fi

echo ""
echo "📁 Project Structure"
echo "===================="

# Check backend
if [ -d "backend/src" ]; then
    BACKEND_FILES=$(find backend/src -name "*.ts" | wc -l)
    echo -e "${GREEN}✓${NC} Backend: $BACKEND_FILES TypeScript files"
else
    echo -e "${RED}✗${NC} Backend directory not found"
fi

# Check frontend
if [ -d "frontend/app" ]; then
    FRONTEND_FILES=$(find frontend/app -name "*.tsx" -o -name "*.ts" | wc -l)
    echo -e "${GREEN}✓${NC} Frontend: $FRONTEND_FILES files"
else
    echo -e "${RED}✗${NC} Frontend directory not found"
fi

# Check Prisma schema
if [ -f "backend/prisma/schema.prisma" ]; then
    MODELS=$(grep -c "^model" backend/prisma/schema.prisma)
    echo -e "${GREEN}✓${NC} Database schema: $MODELS models"
else
    echo -e "${RED}✗${NC} Prisma schema not found"
fi

echo ""
echo "📝 Environment Configuration"
echo "==========================="

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check critical variables
    if grep -q "GITHUB_CLIENT_ID=" .env && ! grep -q "your_github" .env; then
        echo -e "${GREEN}✓${NC} GitHub OAuth configured"
    else
        echo -e "${YELLOW}⚠${NC} GitHub OAuth needs configuration"
    fi
    
    if grep -q "JWT_SECRET=" .env && ! grep -q "your_jwt" .env; then
        echo -e "${GREEN}✓${NC} JWT secret configured"
    else
        echo -e "${YELLOW}⚠${NC} JWT secret needs configuration"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found"
    echo "  Run: cp .env.example .env"
fi

echo ""
echo "📦 Dependencies"
echo "==============="

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Backend dependencies not installed"
    echo "  Run: cd backend && npm install"
fi

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed"
    echo "  Run: cd frontend && npm install"
fi

echo ""
echo "🔨 Build Verification"
echo "===================="

# Try to build backend
echo -n "Testing backend build... "
if cd backend && npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend builds successfully"
    cd ..
else
    echo -e "${RED}✗${NC} Backend build failed"
    cd ..
fi

echo ""
echo "📚 Documentation"
echo "================"

DOCS=("README.md" "SETUP.md" "API.md" "IMPLEMENTATION.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
    else
        echo -e "${RED}✗${NC} $doc missing"
    fi
done

echo ""
echo "🎯 Next Steps"
echo "============="
echo ""
echo "1. Configure environment variables:"
echo "   cp .env.example .env"
echo "   nano .env  # Add your GitHub OAuth credentials"
echo ""
echo "2. Start with Docker (recommended):"
echo "   docker-compose up -d"
echo "   docker-compose exec backend npx prisma migrate dev"
echo "   docker-compose exec backend npm run db:seed"
echo ""
echo "3. OR start manually:"
echo "   # Terminal 1 - Backend"
echo "   cd backend"
echo "   npm install"
echo "   npx prisma generate"
echo "   npx prisma migrate dev"
echo "   npm run dev"
echo ""
echo "   # Terminal 2 - Frontend"
echo "   cd frontend"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "4. Open in browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "For detailed setup instructions, see SETUP.md"
echo ""

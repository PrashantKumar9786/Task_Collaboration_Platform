#!/bin/bash

echo "🚀 Task Collaboration Platform - Quick Start"
echo "==========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Start PostgreSQL with Docker
echo "📦 Starting PostgreSQL with Docker..."
docker run --name taskcollab-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskcollab \
  -p 5432:5432 \
  -d postgres:14 2>/dev/null || docker start taskcollab-postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Backend setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma migrate dev --name init

echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Backend setup complete!"
echo "   Starting backend server on http://localhost:5000"
echo ""

# Start backend in background
npm run dev &
BACKEND_PID=$!

# Frontend setup
cd ../frontend

echo ""
echo "🎨 Setting up Frontend..."

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

echo ""
echo "✅ Frontend setup complete!"
echo "   Starting frontend on http://localhost:5173"
echo ""

# Start frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Application is starting up!"
echo ""
echo "================================================"
echo "  📱 Frontend: http://localhost:5173"
echo "  🔌 Backend:  http://localhost:5000"
echo "================================================"
echo ""
echo "🔐 Demo Credentials:"
echo "   Email:    demo@example.com"
echo "   Password: Demo123!"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait

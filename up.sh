#!/bin/bash
echo "🚀 Starting Alpton Construction Local Environment..."

if [ ! -d "frontend" ]; then
  echo "Error: frontend directory not found. Are you currently in the project root?"
  exit 1
fi

echo "Starting Frontend Vite Server..."
cd frontend
npm run dev

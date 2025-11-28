#!/bin/bash
# Railway startup script for backend

echo "🚀 Starting Hackathon Platform Backend..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Database: Connected to Supabase"
echo "Mode: $DEFAULT_MODE"

# Start the server
npm run server
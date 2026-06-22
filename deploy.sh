# deploy.sh
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --only=production

# Build
npm run build

# Run database migrations
npx prisma migrate deploy

# Restart PM2
pm2 reload ecosystem.config.js

# Clear cache
pm2 flush

echo "✅ Deployment complete!"
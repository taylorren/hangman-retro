#!/bin/bash

# Sync script for deploying to VPS
# Usage: ./sync-to-server.sh

# Configuration
SSH_PORT=22220
SSH_USER="tr"
VPS_HOST="rsywx.net"
REMOTE_PATH="/home/tr/www/hangman"
LOCAL_OUTPUT=".output"

echo "🚀 Syncing to VPS..."

# Check if .output exists
if [ ! -d "$LOCAL_OUTPUT" ]; then
    echo "❌ .output directory not found. Please run 'npm run build' first."
    exit 1
fi

echo "📦 Found .output directory"

# Sync .output folder to remote
echo "📤 Syncing .output to $VPS_HOST:$REMOTE_PATH/.output..."
rsync -avz --delete -e "ssh -p $SSH_PORT" $LOCAL_OUTPUT/ $SSH_USER@$VPS_HOST:$REMOTE_PATH/.output/

if [ $? -eq 0 ]; then
    echo "✅ .output synced successfully"
else
    echo "❌ Sync failed"
    exit 1
fi

# Also sync .env file
echo "📤 Skipping .env sync (will be updated manually on server)..."

# Restart PM2 on remote server
echo "🔄 Restarting hangman app on VPS..."
ssh -p $SSH_PORT $SSH_USER@$VPS_HOST << EOF
    cd $REMOTE_PATH
    pm2 restart hangman || pm2 start .output/server/index.mjs --name hangman
    pm2 save
    echo "✅ App restarted successfully"
EOF

echo "🎉 Deployment completed!"
echo "🌐 Your app should be running at: https://hangman.rsywx.net"
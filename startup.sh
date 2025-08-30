#!/bin/sh
# startup.sh

# Remove old tsx socket pipes to prevent errors when restarting or crashing
echo "Cleaning up old pipes..."
rm -f /tmp/tsx-0/*.pipe || true

# Register Slash Commands
npm run register

# Start the bot
npm run dev

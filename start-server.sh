#!/bin/bash
# Start server with proper PATH for Node.js
export PATH="/nix/store/r1smm331j6crqs02mn986g06f7cpbggh-nodejs-22.17.0/bin:$PATH"
cd /home/runner/workspace
NODE_ENV=development exec npm run dev

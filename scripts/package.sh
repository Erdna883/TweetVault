#!/bin/bash

# Configuration
EXT_NAME="tweetvault"
VERSION=$(grep '"version":' manifest.json | cut -d '"' -f 4)
ZIP_NAME="${EXT_NAME}-v${VERSION}.zip"

# Clean up old zip
rm -f "$ZIP_NAME"

# Create new zip
echo "Packaging ${ZIP_NAME}..."

zip -r "$ZIP_NAME" . \
    -x "*.git*" \
    -x "*.DS_Store" \
    -x "scripts/*" \
    -x "docs/*" \
    -x "node_modules/*" \
    -x "*.zip" \
    -x ".vscode/*" \
    -x "DEVELOPMENT.md" \
    -x "SYNC_BY_KEYWORD.md"

echo "✅ Created ${ZIP_NAME}"
echo "Ready to upload to Chrome Web Store!"

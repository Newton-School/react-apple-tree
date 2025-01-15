#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if version name is provided
if [ -z "$1" ]; then
    echo "Error: No version name provided."
    echo "Usage: $0 <version-name>"
    exit 1
fi

VERSION=$1
DOCS_DIR="docs/$VERSION"

# Create the directory if it doesn't exist
mkdir -p $DOCS_DIR

# Build Storybook
storybook build -o $DOCS_DIR

echo "Storybook built successfully in $DOCS_DIR"

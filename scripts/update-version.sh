#!/bin/bash

# Path to package.json and versions.json
PACKAGE_JSON="package.json"
VERSIONS_JSON="versions.json"

# Read the current version from package.json
CURRENT_VERSION=$(jq -r '.version' "$PACKAGE_JSON")

# Check if the version already exists in versions.json
VERSION_EXISTS=$(jq --arg version "v$CURRENT_VERSION" '[.[] | select(.id == $version)] | length' "$VERSIONS_JSON")

# If the version does not exist, add it to versions.json
if [ "$VERSION_EXISTS" -eq 0 ]; then
    NEW_VERSION_ENTRY=$(jq -n --arg version "v$CURRENT_VERSION" '{id: $version, title: $version, url: ("/" + $version)}')
    jq --argjson newVersion "$NEW_VERSION_ENTRY" '. += [$newVersion]' "$VERSIONS_JSON" > tmp.$$.json && mv tmp.$$.json "$VERSIONS_JSON"
    echo "Version v$CURRENT_VERSION added to versions.json"
    
    # Run prettier on versions.json
    npx prettier --write "$VERSIONS_JSON"
else
    echo "Version v$CURRENT_VERSION already exists in versions.json"
fi

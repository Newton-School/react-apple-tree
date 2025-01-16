/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to package.json and versions.json
const PACKAGE_JSON = path.join(__dirname, '../package.json');
const VERSIONS_JSON = path.join(__dirname, '../versions.json');

// Read the current version from package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const currentVersion = packageJson.version;

// Parse the current version
const versionParts = currentVersion.split('-');
const mainVersionParts = versionParts[0].split('.').map(Number);
let preVersion = versionParts[1] ? parseInt(versionParts[1], 10) : null;

// Destructure the command line arguments
const args = process.argv.slice(2);
const isPre = args.includes('pre');
const isPatch = args.includes('patch');
const isMinor = args.includes('minor');
const isMajor = args.includes('major');

// Construct the new version based on the command line arguments
if (isMajor) {
  mainVersionParts[0] += 1;
  mainVersionParts[1] = 0;
  mainVersionParts[2] = 0;
  preVersion = isPre ? 0 : null;
} else if (isMinor) {
  mainVersionParts[1] += 1;
  mainVersionParts[2] = 0;
  preVersion = isPre ? 0 : null;
} else if (isPatch) {
  mainVersionParts[2] += 1;
  preVersion = isPre ? 0 : null;
} else if (isPre) {
  if (preVersion !== null) {
    preVersion += 1;
  } else {
    mainVersionParts[2] += 1;
    preVersion = 0;
  }
} else {
  mainVersionParts[2] += 1;
  preVersion = null;
}

const newVersion = `${mainVersionParts.join('.')}${preVersion !== null ? `-${preVersion}` : ''}`;

// Update package.json with the new version
packageJson.version = newVersion;
fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2), 'utf8');
console.log(`Updated version to ${newVersion}`);

// Run npm install
execSync('npm install', { stdio: 'inherit' });

if (!isPre) {
  // Read the versions.json file
  const versionsJson = JSON.parse(fs.readFileSync(VERSIONS_JSON, 'utf8'));

  // Check if the version already exists in versions.json
  const versionExists = versionsJson.some(
    (version) => version.id === `v${newVersion}`,
  );

  if (!versionExists) {
    // If the version does not exist, add it to versions.json
    const newVersionEntry = {
      id: `v${newVersion}`,
      title: `v${newVersion}`,
      url: `/${newVersion}`,
    };
    versionsJson.push(newVersionEntry);

    // Write the updated versions.json file
    fs.writeFileSync(
      VERSIONS_JSON,
      JSON.stringify(versionsJson, null, 2),
      'utf8',
    );
    console.log(`Version v${newVersion} added to versions.json`);

    // Run prettier on versions.json
    execSync(`npx prettier --write ${VERSIONS_JSON}`, { stdio: 'inherit' });
  } else {
    console.log(`Version v${newVersion} already exists`);
  }
}

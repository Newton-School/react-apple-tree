/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Exit immediately if a command exits with a non-zero status
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

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

// Display the old version and the new version
console.log(`Current version: ${currentVersion}`);
console.log(`Proposed new version: ${newVersion}`);

// Ask the user if they want to continue
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Do you want to continue? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Aborting version update.');
    process.exit(0);
  }
  rl.close();

  // Update package.json with the new version
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(packageJson, null, 2), 'utf8');
  execSync(`npx prettier --write ${PACKAGE_JSON}`, { stdio: 'inherit' });
  console.log(`Updated version to ${newVersion}`);

  // Run npm install
  execSync('npm install', { stdio: 'inherit' });

  if (!isPre && (isMajor || isMinor)) {
    // Read the versions.json file
    const versionsJson = JSON.parse(fs.readFileSync(VERSIONS_JSON, 'utf8'));

    // Check if the version already exists in versions.json
    const versionExists = versionsJson.some(
      (version) => version === `v${newVersion}`,
    );

    if (!versionExists) {
      // If the version does not exist, add it to versions.json
      versionsJson.push(`v${newVersion}`);

      // Ensure only the latest 10 versions are kept
      if (versionsJson.length > 10) {
        versionsJson.shift();
      }

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
});

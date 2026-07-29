const fs = require('fs');

const regex = /API_KEY_PREFIX\s*=\s*['"]([^'"]+)['"]/;

const backendSrc = fs.readFileSync(
  'packages/backend/src/common/constants/api-key.constants.ts',
  'utf8',
);
const sharedSrc = fs.readFileSync(
  'packages/shared/src/api-key.ts',
  'utf8',
);

const backendMatch = regex.exec(backendSrc);
const sharedMatch = regex.exec(sharedSrc);
const backendReexportsShared =
  /export\s*\{\s*API_KEY_PREFIX\s*\}\s*from\s*['"]tuple-shared['"]/.test(backendSrc);

if (!sharedMatch || (!backendMatch && !backendReexportsShared)) {
  console.error('Could not resolve API_KEY_PREFIX from the backend and shared packages');
  process.exit(1);
}

if (backendMatch && backendMatch[1] !== sharedMatch[1]) {
  console.error(
    `MISMATCH: backend="${backendMatch[1]}" shared="${sharedMatch[1]}"`,
  );
  process.exit(1);
}

console.log(`OK: API_KEY_PREFIX="${sharedMatch[1]}"`);

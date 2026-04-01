const fs = require('fs');
let content = fs.readFileSync('src/assets/i18n/ar.json', 'utf8');

const lines = content.split('\n');

// Remove x_placeholder_delete lines
const noPlaceholder = lines.filter(line => !line.includes('x_placeholder_delete'));

// Remove duplicate welcomeBackSubtitle - keep only the first occurrence in auth block
let seenWelcomeBack = false;
const deduped = noPlaceholder.filter(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('"welcomeBackSubtitle"')) {
    if (!seenWelcomeBack) {
      seenWelcomeBack = true;
      return true;
    }
    return false; // remove duplicate
  }
  return true;
});

const result = deduped.join('\n');
fs.writeFileSync('src/assets/i18n/ar.json', result, 'utf8');
console.log('Done. Lines:', deduped.length);

try {
  JSON.parse(result);
  console.log('JSON VALID');
} catch (e) {
  console.log('STILL ERROR: ' + e.message);
}

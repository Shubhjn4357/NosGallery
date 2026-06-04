const fs = require('fs');
const path = require('path');

const WIDGET_LIST_PATH = path.join(__dirname, '..', 'src', 'widget list.md');
const REGISTRY_PATH = path.join(__dirname, '..', 'src', 'widgets', 'registry.ts');

if (!fs.existsSync(WIDGET_LIST_PATH)) {
  console.error(`Error: widget list.md not found at ${WIDGET_LIST_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(REGISTRY_PATH)) {
  console.error(`Error: registry.ts not found at ${REGISTRY_PATH}`);
  process.exit(1);
}

// 1. Parse widget list.md
const listContent = fs.readFileSync(WIDGET_LIST_PATH, 'utf8');

const categoryMap = {
  '1. Clock Widgets': { key: 'clock', count: 60, names: [] },
  '2. Calendar Widgets': { key: 'calendar', count: 50, names: [] },
  '3. Weather Widgets': { key: 'weather', count: 50, names: [] },
  '4. Productivity Widgets': { key: 'productivity', count: 70, names: [] },
  '5. Health & Fitness': { key: 'health', count: 60, names: [] },
  '6. Finance': { key: 'finance', count: 60, names: [] },
  '7. Developer Widgets': { key: 'developer', count: 50, names: [] },
  '8. Social Widgets': { key: 'social', count: 50, names: [] },
  '9. Smart Home': { key: 'smart_home', count: 40, names: [] },
  '10. AI Widgets': { key: 'ai', count: 60, names: [] },
};

let currentCategory = null;
const lines = listContent.split('\n');

lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') && !trimmed.startsWith('##') && !trimmed.startsWith('###')) {
    // Check if it is a category header
    const cleanHeader = trimmed.replace(/#/g, '').trim();
    const matchedKey = Object.keys(categoryMap).find(cat => cleanHeader.includes(cat));
    if (matchedKey) {
      currentCategory = categoryMap[matchedKey];
    } else {
      currentCategory = null;
    }
  } else if (currentCategory && trimmed) {
    // Match item lines, e.g. "1. Minimal Digital" or "10. Liquid Clock"
    const match = trimmed.match(/^\d+\.\s+(.+)$/);
    if (match) {
      currentCategory.names.push(match[1].trim());
    }
  }
});

console.log('--- WIDGET LIST.MD PARSING REPORT ---');
let totalListCount = 0;
Object.keys(categoryMap).forEach(catHeader => {
  const cat = categoryMap[catHeader];
  console.log(`${catHeader}: Found ${cat.names.length} / ${cat.count} widgets`);
  totalListCount += cat.names.length;
});
console.log(`Total Widgets in list: ${totalListCount}\n`);

if (totalListCount !== 550) {
  console.error(`Error: Total widget count parsed from list is ${totalListCount}, expected 550!`);
  process.exit(1);
}

// 2. Parse registry.ts arrays using Regex
const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');

const parseRegistryArray = (arrayName) => {
  const regex = new RegExp(`const\\s+${arrayName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = registryContent.match(regex);
  if (!match) {
    console.error(`Error: Could not find array ${arrayName} in registry.ts`);
    process.exit(1);
  }
  return match[1]
    .split(',')
    .map(name => name.replace(/['"\r\n\t]/g, '').trim())
    .filter(name => name.length > 0);
};

const registryMap = {
  clock: parseRegistryArray('CLOCK_NAMES'),
  calendar: parseRegistryArray('CALENDAR_NAMES'),
  weather: parseRegistryArray('WEATHER_NAMES'),
  productivity: parseRegistryArray('PRODUCTIVITY_NAMES'),
  health: parseRegistryArray('HEALTH_NAMES'),
  finance: parseRegistryArray('FINANCE_NAMES'),
  developer: parseRegistryArray('DEV_NAMES'),
  social: parseRegistryArray('SOCIAL_NAMES'),
  smart_home: parseRegistryArray('HOME_NAMES'),
  ai: parseRegistryArray('AI_NAMES'),
};

console.log('--- REGISTRY.TS PARSING REPORT ---');
let totalRegistryCount = 0;
Object.keys(registryMap).forEach(key => {
  const names = registryMap[key];
  console.log(`Category [${key}]: Found ${names.length} registered names`);
  totalRegistryCount += names.length;
});
console.log(`Total Registered Widgets: ${totalRegistryCount}\n`);

if (totalRegistryCount !== 550) {
  console.error(`Error: Total registered count in registry.ts is ${totalRegistryCount}, expected 550!`);
  process.exit(1);
}

// 3. Assert widget lists are identical
let mismatchCount = 0;

Object.keys(categoryMap).forEach(catHeader => {
  const cat = categoryMap[catHeader];
  const registryNames = registryMap[cat.key];

  cat.names.forEach((name, idx) => {
    // Assert case insensitive match
    const found = registryNames.some(regName => regName.toLowerCase() === name.toLowerCase());
    if (!found) {
      console.error(`[MISMATCH] Mismatch in category ${cat.key}: Widget "${name}" (index ${idx + 1} in list) is missing from registry.ts!`);
      mismatchCount++;
    }
  });
});

console.log('--- VALIDATION SUMMARY ---');
if (mismatchCount === 0) {
  console.log('\x1b[32m%s\x1b[0m', 'SUCCESS: All 550 widgets listed in widget list.md are 100% matched, registered, and accounted for in registry.ts!');
  process.exit(0);
} else {
  console.error(`\x1b[31m%s\x1b[0m`, `FAILURE: Found ${mismatchCount} missing widgets in registry.ts!`);
  process.exit(1);
}

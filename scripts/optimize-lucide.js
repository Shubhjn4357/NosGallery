const fs = require('fs');
const path = require('path');

// Walk directories recursively
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = walk(srcDir);

let optimizedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');

  // We want to rewrite the imports to use named imports from 'lucide-react-native'
  // But wait, the file already has our custom import block. Let's find the custom import block and clean it up.
  // The custom import block looks like:
  // import IconName from 'lucide-react-native/dist/esm/icons/...';
  // ...
  // const LucideIcons = {
  //   IconName,
  //   ...
  // };

  // Let's parse all the icon names that were imported in the file.
  // We can do this by searching for all imports from 'lucide-react-native'
  // Both:
  // import * as LucideIcons from 'lucide-react-native';
  // and:
  // import IconName from 'lucide-react-native/dist/esm/icons/kebab-case';
  
  const iconsSet = new Set();

  // 1. Match any existing direct path imports
  const directPathRegex = /import\s+([A-Z][A-Za-z0-9]*)\s+from\s+'lucide-react-native\/dist\/esm\/icons\/[^']+'/g;
  let match;
  while ((match = directPathRegex.exec(content)) !== null) {
    iconsSet.add(match[1]);
  }

  // 2. Match any static references if there are any remaining (just in case)
  const staticRegex = /LucideIcons\.([A-Z][A-Za-z0-9]*)/g;
  while ((match = staticRegex.exec(content)) !== null) {
    iconsSet.add(match[1]);
  }

  // 3. Match wildcard import if still present
  const hasWildcard = content.includes("import * as LucideIcons from 'lucide-react-native';");
  
  // If the file doesn't have our optimized imports or wildcard, skip it
  if (iconsSet.size === 0 && !hasWildcard) {
    return;
  }

  // File-specific dynamic lookup presets
  const relativePath = path.relative(srcDir, file).replace(/\\/g, '/');
  if (relativePath === 'app/index.tsx') {
    const appPresets = [
      'LayoutGrid', 'SlidersHorizontal', 'Compass', 'Clock', 'Calendar', 
      'CloudSun', 'CheckSquare', 'Heart', 'TrendingUp', 'Terminal', 
      'MessageSquare', 'Home', 'Sparkles'
    ];
    appPresets.forEach(icon => iconsSet.add(icon));
  } else if (relativePath === 'widgets/widgetRenderer.tsx') {
    const rendererPresets = [
      'Clock', 'Timer', 'Calendar', 'CloudSun', 'CheckSquare', 'Heart', 
      'Coins', 'Terminal', 'MessageSquare', 'Home', 'Sparkles', 'Layout'
    ];
    rendererPresets.forEach(icon => iconsSet.add(icon));
  }

  if (iconsSet.size === 0) {
    iconsSet.add('Layout');
  }

  const sortedIcons = Array.from(iconsSet).sort();

  // Remove all individual import lines from the file
  content = content.replace(/import\s+[A-Z][A-Za-z0-9]*\s+from\s+'lucide-react-native\/dist\/esm\/icons\/[^']+';\r?\n/g, '');

  // Remove the old wildcard import if it's there
  content = content.replace("import * as LucideIcons from 'lucide-react-native';\r\n", "");
  content = content.replace("import * as LucideIcons from 'lucide-react-native';\n", "");

  // Remove any old const LucideIcons declaration block if present
  // Matches: const LucideIcons = { ... };
  content = content.replace(/const\s+LucideIcons\s+=\s+\{[\s\S]*?\};\r?\n\r?\n?/g, '');

  // Build the new clean named imports block
  const replacementImports = `import { ${sortedIcons.join(', ')} } from 'lucide-react-native';\n\nconst LucideIcons = {\n${sortedIcons.map(name => `  ${name},`).join('\n')}\n};`;

  // Insert it where the first lucide import was, or at the top of the file
  // Let's just put it at the top of the file after the first React/other imports
  // To keep it simple and clean, we can replace the first 'lucide-react-native' reference,
  // or prepend it to the file and we are done.
  // Actually, let's look for any import from 'lucide-react-native' that we removed,
  // but since we removed them, let's insert it before the first import in the file.
  // A clean way is to find the first 'import ' in the file and replace it with our imports + the first import.
  const firstImportMatch = content.match(/import\s+/);
  if (firstImportMatch) {
    content = content.replace(firstImportMatch[0], `${replacementImports}\nimport `);
  } else {
    content = replacementImports + '\n' + content;
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Optimized (Named) Lucide imports in: ${relativePath} (${sortedIcons.length} icons)`);
  optimizedCount++;
});

console.log(`\nSuccessfully optimized Lucide imports in ${optimizedCount} files!`);

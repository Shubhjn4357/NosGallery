const fs = require('fs');
const path = require('path');

const WIDGETS_DIR = path.resolve('src/widgets');
const CATEGORIES = [
  'clock',
  'calendar',
  'weather',
  'productivity',
  'health',
  'finance',
  'developer',
  'social',
  'smart_home',
  'ai'
];

let fixedCount = 0;

CATEGORIES.forEach(category => {
  const catPath = path.join(WIDGETS_DIR, category);
  if (!fs.existsSync(catPath)) return;

  const files = fs.readdirSync(catPath);
  files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;

    const filePath = path.join(catPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const hasAnyCustomizations = content.includes('customizations: any');

    if (hasAnyCustomizations) {
      // Replace customizations: any
      content = content.replace(/customizations:\s*any/g, 'customizations: WidgetCustomizations');

      // Add import if not present
      if (!content.includes('WidgetCustomizations')) {
        // Insert import right after React or at the top of imports
        const importLine = "import { WidgetCustomizations } from '../../store/widgetStore';\n";
        content = importLine + content;
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[Typed Cleaned] ${category}/${file}`);
      fixedCount++;
    }
  });
});

console.log(`\nTypings clean up completed successfully! Updated ${fixedCount} files.`);

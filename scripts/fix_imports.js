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

CATEGORIES.forEach(category => {
  const catPath = path.join(WIDGETS_DIR, category);
  if (!fs.existsSync(catPath)) return;

  const files = fs.readdirSync(catPath);
  files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;

    const filePath = path.join(catPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // If references WidgetCustomizations but doesn't import it
    const hasRef = content.includes('WidgetCustomizations');
    const hasImport = content.includes("import { WidgetCustomizations }") || 
                      content.includes("import { useWidgetStore, WidgetCustomizations }") ||
                      content.includes("import { WidgetCustomizations, useWidgetStore }");

    if (hasRef && !hasImport) {
      if (content.includes("import { useWidgetStore }")) {
        // Replace existing store import to include WidgetCustomizations
        content = content.replace(
          "import { useWidgetStore } from '../../store/widgetStore';",
          "import { useWidgetStore, WidgetCustomizations } from '../../store/widgetStore';"
        );
      } else {
        // Prepend new import at the very top
        const importLine = "import { WidgetCustomizations } from '../../store/widgetStore';\n";
        content = importLine + content;
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[Import Fixed] ${category}/${file}`);
    }
  });
});

console.log('Imports fixing finished!');

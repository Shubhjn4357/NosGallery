const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { parseTsxToKotlin } = require('./tsxParser');

function withAndroidWidgets(config) {
  const projectRoot = config.modRequest?.projectRoot || process.cwd();
  const widgetsJsonPath = path.join(projectRoot, 'src', 'widgets', 'widgets.json');
  let templateWidgets = [];
  try {
    templateWidgets = JSON.parse(fs.readFileSync(widgetsJsonPath, 'utf8'));
  } catch (e) {
    console.error('[withAndroidWidgets] Failed to load widgets.json from ' + widgetsJsonPath, e);
  }

  // Dynamic mapping helper to find the corresponding TSX file for a widget
  function findTsxFilePath(w, projectRoot) {
    const overrides = {
      'clock_dot': 'src/widgets/clock/DigitalClock.tsx',
    };
    if (overrides[w.id]) {
      return overrides[w.id];
    }

    const widgetsDir = path.join(projectRoot, 'src', 'widgets');
    if (!fs.existsSync(widgetsDir)) return null;

    // Find all subdirectories
    const categories = fs.readdirSync(widgetsDir).filter(f => fs.statSync(path.join(widgetsDir, f)).isDirectory());

    const coreName = w.className.replace(/^NOS/, '').replace(/Widget$/, '').toLowerCase();
    const idParts = w.id.split('_').filter(p => p !== w.category);

    const sortedCategories = [w.category, ...categories.filter(c => c !== w.category)];

    // 1. Match by class name across all folders
    for (const cat of sortedCategories) {
      const catDir = path.join(widgetsDir, cat);
      if (!fs.existsSync(catDir)) continue;

      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.tsx'));
      for (const file of files) {
        const fileName = file.replace('.tsx', '').toLowerCase();
        if (coreName.includes(fileName) || fileName.includes(coreName)) {
          return path.join('src', 'widgets', cat, file);
        }
      }
    }

    // 2. Match by ID fragments across all folders
    for (const cat of sortedCategories) {
      const catDir = path.join(widgetsDir, cat);
      if (!fs.existsSync(catDir)) continue;

      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.tsx'));
      for (const file of files) {
        const fileName = file.toLowerCase();
        if (idParts.length > 0 && idParts.every(p => fileName.includes(p))) {
          return path.join('src', 'widgets', cat, file);
        }
      }
    }

    // 3. Fallback: match any ID fragment across all folders
    for (const cat of sortedCategories) {
      const catDir = path.join(widgetsDir, cat);
      if (!fs.existsSync(catDir)) continue;

      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.tsx'));
      for (const file of files) {
        const fileName = file.toLowerCase();
        if (idParts.length > 0 && idParts.some(p => fileName.includes(p))) {
          return path.join('src', 'widgets', cat, file);
        }
      }
    }

    // 4. Ultimate fallback: first file in w.category
    const firstCatDir = path.join(widgetsDir, w.category);
    if (fs.existsSync(firstCatDir)) {
      const files = fs.readdirSync(firstCatDir).filter(f => f.endsWith('.tsx'));
      if (files.length > 0) return path.join('src', 'widgets', w.category, files[0]);
    }

    return null;
  }


  // 1. Add receivers to AndroidManifest.xml dynamically
  config = withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults;
    const mainApplication = manifest.manifest.application[0];
    
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }
    
    templateWidgets.forEach((tw) => {
      const receiverName = `com.nothing.nosgallery.widget.${tw.className}`;
      const resourceName = `@xml/widgetprovider_${tw.id.toLowerCase()}`;
      
      const exists = mainApplication.receiver.some(r => r.$['android:name'] === receiverName);
      if (!exists) {
        mainApplication.receiver.push({
          $: {
            'android:name': receiverName,
            'android:exported': 'true',
            'android:label': tw.label
          },
          'intent-filter': [
            {
              action: [
                { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
                { $: { 'android:name': 'com.nothing.nosgallery.WIDGET_CLICK' } }
              ]
            }
          ],
          'meta-data': [
            {
              $: {
                'android:name': 'android.appwidget.provider',
                'android:resource': resourceName
              }
            }
          ]
        });
      }
    });
    
    // Add NosWidgetPinReceiver
    const pinReceiverName = 'com.nothing.nosgallery.widget.NosWidgetPinReceiver';
    const pinExists = mainApplication.receiver.some(r => r.$['android:name'] === pinReceiverName);
    if (!pinExists) {
      mainApplication.receiver.push({
        $: {
          'android:name': pinReceiverName,
          'android:exported': 'false'
        }
      });
    }
    
    return modConfig;
  });

  // 2. Write Kotlin files, XML provider configs, and default_widgets.json
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      // 2a. Clean up legacy generated files in modules/expo-widget library module
      const legacyWidgetJavaDir = path.join(projectRoot, 'modules', 'expo-widget', 'android', 'src', 'main', 'java', 'com', 'nothing', 'nosgallery', 'widget');
      if (fs.existsSync(legacyWidgetJavaDir)) {
        const files = fs.readdirSync(legacyWidgetJavaDir);
        files.forEach((file) => {
          if (file.startsWith('NOS') && file.endsWith('Widget.kt')) {
            try {
              fs.unlinkSync(path.join(legacyWidgetJavaDir, file));
              console.log(`[withAndroidWidgets] Cleaned up legacy module Kotlin file: ${file}`);
            } catch (err) {
              console.warn(`[withAndroidWidgets] Failed to delete legacy Kotlin file ${file}:`, err.message);
            }
          }
        });
      }

      const legacyWidgetXmlDir = path.join(projectRoot, 'modules', 'expo-widget', 'android', 'src', 'main', 'res', 'xml');
      if (fs.existsSync(legacyWidgetXmlDir)) {
        const files = fs.readdirSync(legacyWidgetXmlDir);
        files.forEach((file) => {
          if (file.startsWith('widgetprovider_') && file.endsWith('.xml')) {
            try {
              fs.unlinkSync(path.join(legacyWidgetXmlDir, file));
              console.log(`[withAndroidWidgets] Cleaned up legacy module XML file: ${file}`);
            } catch (err) {
              console.warn(`[withAndroidWidgets] Failed to delete legacy XML file ${file}:`, err.message);
            }
          }
        });
      }

      // 2b. Kotlin files: android/app/src/main/java/com/nothing/nosgallery/widget/
      const widgetJavaDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', 'com', 'nothing', 'nosgallery', 'widget');
      if (!fs.existsSync(widgetJavaDir)) {
        fs.mkdirSync(widgetJavaDir, { recursive: true });
      }
      
      templateWidgets.forEach((w) => {
        let customMethods = '';
        let extraImports = '';
        
        const relPath = findTsxFilePath(w, projectRoot);
        if (relPath) {
          const tsxFilePath = path.join(projectRoot, relPath);
          if (fs.existsSync(tsxFilePath)) {
            const tsxContent = fs.readFileSync(tsxFilePath, 'utf8');
            const { kotlinCode, kotlinImports, xmlContent } = parseTsxToKotlin(tsxContent, w);
            
            if (xmlContent) {
              const layoutDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'layout');
              if (!fs.existsSync(layoutDir)) {
                fs.mkdirSync(layoutDir, { recursive: true });
              }
              const layoutName = `widgetprovider_${w.id.toLowerCase()}_layout.xml`;
              fs.writeFileSync(path.join(layoutDir, layoutName), xmlContent, 'utf8');
            }

            if (kotlinCode) {
              const defaultImports = [
                'android.appwidget.AppWidgetManager',
                'android.content.Context',
                'android.widget.RemoteViews',
                'org.json.JSONObject',
                'org.json.JSONArray',
                'com.nothing.nosgallery.R'
              ];
              const filteredImports = kotlinImports.filter(imp => !defaultImports.includes(imp));
              if (filteredImports.length > 0) {
                extraImports = '\n' + filteredImports.map(imp => `import ${imp}`).join('\n');
              }
              const indentedCode = kotlinCode.split('\n').map(line => `        ${line}`).join('\n');
              
              customMethods = `

    @Suppress("UNUSED_VARIABLE")
    override fun populateViews(
        context: Context,
        views: RemoteViews,
        config: JSONObject?,
        customs: JSONObject?,
        theme: String,
        appWidgetId: Int
    ) {
${indentedCode}
    }
`;
            }
          }
        }

        const ktContent = `package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject
import org.json.JSONArray
import com.nothing.nosgallery.R${extraImports}

class ${w.className} : NosBaseWidgetProvider() {
    override val defaultTemplateId = "${w.id}"${customMethods}
}
`;
        fs.writeFileSync(path.join(widgetJavaDir, `${w.className}.kt`), ktContent, 'utf8');
      });

      // 2c. XML provider configs: android/app/src/main/res/xml/
      const widgetXmlDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'xml');
      if (!fs.existsSync(widgetXmlDir)) {
        fs.mkdirSync(widgetXmlDir, { recursive: true });
      }
      
      templateWidgets.forEach((w) => {
        const minWidth = w.w === 4 ? 330 : 160;
        const minHeight = w.h === 4 ? 230 : 110;
        const layoutName = `widgetprovider_${w.id.toLowerCase()}_layout`;
        const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="${minWidth}dp"
    android:minHeight="${minHeight}dp"
    android:targetCellWidth="${w.w}"
    android:targetCellHeight="${w.h}"
    android:resizeMode="horizontal|vertical"
    android:initialLayout="@layout/${layoutName}"
    android:previewLayout="@layout/${layoutName}"
    android:previewImage="@drawable/${w.preview}"
    android:updatePeriodMillis="1800000"
    android:widgetCategory="home_screen">
</appwidget-provider>
`;
        fs.writeFileSync(path.join(widgetXmlDir, `widgetprovider_${w.id.toLowerCase()}.xml`), xmlContent, 'utf8');
      });

      // Retrieve Git repo stats for git_info.json
      let gitBranch = 'main';
      let gitCommit = 'a1b2c3d4';
      let gitAuthor = 'Shubh';
      let gitMessage = 'Feat: consolidate gallery studio layout templates';
      let gitDate = new Date().toISOString();

      try {
        const { execSync } = require('child_process');
        gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: projectRoot }).trim();
        gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8', cwd: projectRoot }).trim();
        gitAuthor = execSync('git log -1 --format=%an', { encoding: 'utf8', cwd: projectRoot }).trim();
        gitMessage = execSync('git log -1 --format=%s', { encoding: 'utf8', cwd: projectRoot }).trim();
        gitDate = execSync('git log -1 --format=%ad --date=iso', { encoding: 'utf8', cwd: projectRoot }).trim();
      } catch (e) {
        console.log('[withAndroidWidgets] Failed to run git commands, falling back to manual .git parsing:', e.message);
        try {
          const gitPath = path.join(projectRoot, '.git');
          if (fs.existsSync(gitPath)) {
            const headContent = fs.readFileSync(path.join(gitPath, 'HEAD'), 'utf8').trim();
            if (headContent.startsWith('ref:')) {
              gitBranch = headContent.replace('ref:', '').replace('refs/heads/', '').trim();
              const branchPath = path.join(gitPath, 'refs', 'heads', gitBranch);
              if (fs.existsSync(branchPath)) {
                gitCommit = fs.readFileSync(branchPath, 'utf8').trim().substring(0, 8);
              }
            } else {
              gitCommit = headContent.substring(0, 8);
            }

            const logPath = path.join(gitPath, 'logs', 'HEAD');
            if (fs.existsSync(logPath)) {
              const logLines = fs.readFileSync(logPath, 'utf8').trim().split('\n');
              const lastLine = logLines[logLines.length - 1];
              if (lastLine) {
                const parts = lastLine.split('\t');
                if (parts[1]) gitMessage = parts[1].trim();
                const authorPart = parts[0].split(' ');
                const emailIdx = authorPart.findIndex(p => p.startsWith('<'));
                if (emailIdx > 2) {
                  gitAuthor = authorPart.slice(2, emailIdx).join(' ');
                }
              }
            }
          }
        } catch (innerErr) {
          console.log('[withAndroidWidgets] Manual parsing also failed:', innerErr.message);
        }
      }

      const gitInfo = {
        branch: gitBranch,
        commit: gitCommit,
        author: gitAuthor,
        message: gitMessage,
        date: gitDate
      };

      const gitInfoDir = path.join(projectRoot, 'src', 'services');
      if (!fs.existsSync(gitInfoDir)) {
        fs.mkdirSync(gitInfoDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(gitInfoDir, 'git_info.json'),
        JSON.stringify(gitInfo, null, 2),
        'utf8'
      );

      // Generate default_widgets.json and save it in modules/expo-widget/android/src/main/assets/
      const targetAssets = path.join(projectRoot, 'modules', 'expo-widget', 'android', 'src', 'main', 'assets');
      if (!fs.existsSync(targetAssets)) {
        fs.mkdirSync(targetAssets, { recursive: true });
      }

      const defaultWidgets = generateDefaultWidgetsList(templateWidgets);
      fs.writeFileSync(
        path.join(targetAssets, 'default_widgets.json'),
        JSON.stringify(defaultWidgets, null, 2),
        'utf8'
      );

      console.log('[withAndroidWidgets] Generated build assets and default_widgets.json successfully');
      return modConfig;
    }
  ]);
}

// Helper to generate the default widgets JSON array
// Helper to generate the default widgets JSON array directly from templateWidgets
function generateDefaultWidgetsList(templateWidgets) {
  const widgets = [];
  const registeredIds = new Set();

  templateWidgets.forEach((tw) => {
    if (registeredIds.has(tw.id)) return;
    registeredIds.add(tw.id);

    const w = tw.w;
    const h = tw.h;

    const customizations = Object.assign({
      fontId: 'inter',
      fontSize: w === 4 ? 20 : 14,
      backgroundType: 'solid',
      backgroundColor: '#0c0c0c',
      borderRadius: 16,
      transparency: 10,
      blur: 10,
      shadowType: 'soft',
      titleText: tw.defaultTitle || tw.name.toUpperCase(),
      valueText: tw.defaultValue || '--',
      subValueText: 'TAP TO OPEN',
      footerText: `NOS • ${tw.category.toUpperCase().replace('_', ' ')}`,
      accentColor: '#7C9EFF',
      themeOverride: 'none',
      showProgressBar: false,
      progressBarValue: 0,
      progressBarMax: 100,
      showActionButtons: false,
      btnLeftText: '',
      btnLeftAction: '',
      btnRightText: '',
      btnRightAction: '',
    }, tw.customizations || {});

    const widgetEntry = {
      id: tw.id,
      templateId: tw.id,
      x: 0,
      y: 0,
      w: w,
      h: h,
      preview: tw.preview,
      customizations: customizations,
    };

    if (tw.clickHandlers) {
      widgetEntry.clickHandlers = tw.clickHandlers;
    }

    widgets.push(widgetEntry);
  });

  // Alias for developer_cicd
  if (!registeredIds.has('developer_cicd')) {
    widgets.push({
      id: 'developer_cicd',
      templateId: 'developer_build',
      x: 0, y: 0, w: 4, h: 2,
      customizations: {
        fontId: 'inter',
        fontSize: 20,
        backgroundType: 'solid',
        backgroundColor: '#0c0c0c',
        borderRadius: 16,
        transparency: 10,
        blur: 10,
        shadowType: 'soft',
        titleText: 'CI/CD STATUS',
        valueText: 'Deploying',
        subValueText: 'CI/CD PIPELINE • STAGE 3 / 5',
        footerText: 'NOS • CI/CD',
        accentColor: '#7C9EFF',
        themeOverride: 'none',
        showProgressBar: true,
        progressBarValue: 60,
        progressBarMax: 100,
        showActionButtons: false,
        btnLeftText: '',
        btnLeftAction: '',
        btnRightText: '',
        btnRightAction: '',
      }
    });
  }

  return widgets;
}

module.exports = withAndroidWidgets;

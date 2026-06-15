const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withAndroidWidgets(config) {
  const projectRoot = config.modRequest?.projectRoot || process.cwd();
  const widgetsJsonPath = path.join(projectRoot, 'modules', 'expo-widget', 'src', 'widgets.json');
  let templateWidgets = [];
  try {
    templateWidgets = JSON.parse(fs.readFileSync(widgetsJsonPath, 'utf8'));
  } catch (e) {
    console.error('[withAndroidWidgets] Failed to load widgets.json from ' + widgetsJsonPath, e);
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
        const ktContent = `package com.nothing.nosgallery.widget

class ${w.className} : NosBaseWidgetProvider() {
    override val defaultTemplateId = "${w.id}"
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
        const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="${minWidth}dp"
    android:minHeight="${minHeight}dp"
    android:targetCellWidth="${w.w}"
    android:targetCellHeight="${w.h}"
    android:resizeMode="horizontal|vertical"
    android:initialLayout="@layout/nos_widget_layout"
    android:previewLayout="@layout/nos_widget_layout"
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
function generateDefaultWidgetsList(templateWidgets) {
  const baseTemplates = {
    clock_digital: { w: 2, h: 2, titleText: 'DIGITAL CLOCK', valueText: '10:42 PM', subValueText: 'TAP TO OPEN', footerText: 'NOS • CLOCK', iconName: 'Clock', desc: 'Modern digital clock display.', launchUri: '', intentAction: 'android.intent.action.SHOW_ALARMS' },
    clock_dot: { w: 4, h: 2, titleText: 'NOTHING CLOCK', valueText: '10:42 PM', subValueText: 'TAP TO OPEN', footerText: 'NOS • CLOCK', iconName: 'Clock', desc: 'Signature Nothing style dot-matrix clock.', intentAction: 'android.intent.action.SHOW_ALARMS' },
    clock_analog: { w: 2, h: 2, titleText: 'ANALOG CLOCK', valueText: 'Ticking', subValueText: 'ANALOG CLOCK', footerText: 'NOS • CLOCK', iconName: 'Clock', desc: 'Minimal classic ticking analog clock.', intentAction: 'android.intent.action.SHOW_ALARMS' },
    clock_flip: { w: 4, h: 2, titleText: 'FLIP CLOCK', valueText: '21:09', subValueText: 'TAP TO OPEN', footerText: 'NOS • CLOCK', iconName: 'Clock', desc: 'Retro animated flip clock.', intentAction: 'android.intent.action.SHOW_ALARMS' },
    clock_stopwatch: { w: 2, h: 2, titleText: 'STOPWATCH', valueText: '00:00.0', subValueText: 'STOPWATCH', footerText: 'NOS • CHRONOMETER', iconName: 'Timer', desc: 'Interactive stopwatch timer.',
      showActionButtons: true, btnLeftText: 'START', btnLeftAction: 'toggle_stopwatch', btnRightText: 'RESET', btnRightAction: 'reset_stopwatch',
      clickHandlers: {
        toggle_stopwatch: { type: 'toggle', field: 'stopwatchRunning', displayField: 'valueText', trueLabel: 'RUNNING', falseLabel: '00:00.0' },
        reset_stopwatch: { type: 'set', field: 'stopwatchRunning', value: false, displayField: 'valueText', displayFormat: '00:00.0' }
      }
    },
    calendar_monthly: { w: 2, h: 2, titleText: 'CALENDAR', valueText: 'DAY', subValueText: 'TAP TO OPEN', footerText: 'NOS • CALENDAR', iconName: 'Calendar', desc: 'Grid display of the current month.' },
    calendar_agenda: { w: 4, h: 2, titleText: 'UPCOMING EVENTS', valueText: 'Meeting, Work Sync', subValueText: '▪ 09:30 DAILY SYNC  ▪ 11:00 REVIEW', footerText: 'NOS • CALENDAR', iconName: 'Calendar', desc: 'Timeline view of upcoming events.' },
    calendar_progress: { w: 2, h: 2, titleText: 'YEAR PROGRESS', valueText: '43%', subValueText: 'YEAR PROGRESS', footerText: 'NOS • CALENDAR', iconName: 'Calendar', desc: 'Percentage visualizer of the current year.', showProgressBar: true, progressBarValue: 43, progressBarMax: 100 },
    weather_current: { w: 2, h: 2, titleText: 'LOCATION', valueText: '18°C', subValueText: 'RAIN • HUM 74% • WIND 12 KM/H', footerText: 'NOS • WEATHER', iconName: 'CloudSun', desc: 'Live climate and temperature stats.', launchUri: 'https://www.google.com/search?q=weather' },
    weather_aqi: { w: 2, h: 2, titleText: 'LONDON AQI', valueText: '12 AQI', subValueText: 'AIR QUALITY • EXCELLENT', footerText: 'NOS • WEATHER', iconName: 'CloudSun', desc: 'Circular gauge showing air quality status.', showProgressBar: true, progressBarValue: 12, progressBarMax: 100 },
    weather_moon_phase: { w: 2, h: 2, titleText: 'MOON PHASE', valueText: 'Waxing Gibbous', subValueText: 'LUNAR CYCLE • ILLUMINATION 78%', footerText: 'NOS • WEATHER', iconName: 'Moon', desc: 'Calculates lunar phase details.' },
    productivity_todo: { w: 2, h: 2, titleText: 'TASKS', valueText: '3 / 5', subValueText: '☑ Deploy Branch  ☐ Refactor Store', footerText: 'NOS • TODO LIST', iconName: 'CheckSquare', desc: 'Simple task manager checklist.', showProgressBar: true, progressBarValue: 60, progressBarMax: 100 },
    productivity_focus: { w: 2, h: 2, titleText: 'FOCUS MODE', valueText: '25:00', subValueText: 'DEEP WORK • SESSION 2', footerText: 'NOS • FOCUS TIMER', iconName: 'CheckSquare', desc: 'Pomodoro focus countdown widget.' },
    productivity_calculator: { w: 2, h: 2, titleText: 'CALCULATOR', valueText: '0', subValueText: 'CALCULATOR • TAP TO OPEN', footerText: 'NOS • CALCULATOR', iconName: 'Calculator', desc: 'Interactive pocket calculator.' },
    productivity_camera: { w: 2, h: 2, titleText: 'CAMERA', valueText: 'TAP TO OPEN', subValueText: 'CAMERA • QUICK SHORTCUT', footerText: 'NOS • CAMERA', iconName: 'Camera', desc: 'Quick camera lens and capture.' },
    productivity_music: { w: 4, h: 2, titleText: 'MUSIC PLAYER', valueText: 'Nothing Beat', subValueText: 'PAUSED', footerText: 'NOS • MUSIC', iconName: 'Music', desc: 'System music player panel.',
      showActionButtons: true, btnLeftText: 'PLAY', btnLeftAction: 'music_play', btnRightText: 'SKIP', btnRightAction: 'music_skip',
      clickHandlers: {
        music_play: { type: 'toggle', field: 'musicPlaying', displayField: 'subValueText', trueLabel: 'PLAYING • VOLUME 50%', falseLabel: 'PAUSED' },
        music_skip: { type: 'cycle', field: 'currentTrack', values: ['Nothing Beat', 'Antigravity Chill', 'Glyph Ambient'], displayField: 'valueText', displayFormat: '{value}' }
      }
    },
    productivity_text_username: { w: 2, h: 2, titleText: 'TEXT INPUT', valueText: 'NOTHING USER', subValueText: 'USERNAME • TAP TO EDIT', footerText: 'NOS • PROFILE', iconName: 'Type', desc: 'Enter username for widgets.' },
    productivity_google_search: { w: 4, h: 2, titleText: 'GOOGLE SEARCH', valueText: 'Search...', subValueText: 'GOOGLE SEARCH • TAP TO SEARCH', footerText: 'NOS • SEARCH', iconName: 'Search', desc: 'Web search bar panel.', launchUri: 'https://www.google.com' },
    productivity_pomodoro: { w: 2, h: 2, titleText: 'POMODORO', valueText: '25:00', subValueText: 'DEEP WORK • SESSION 2', footerText: 'NOS • FOCUS TIMER', iconName: 'Hourglass', desc: 'Ticking pomodoro focus timer.' },
    productivity_folder: { w: 2, h: 2, titleText: 'APPS FOLDER', valueText: '4 Apps', subValueText: 'APP DRAWER • TAP TO OPEN', footerText: 'NOS • FOLDER', iconName: 'Folder', desc: 'App drawer shortcut container.' },
    productivity_photo_frame: { w: 2, h: 2, titleText: 'PHOTO FRAME', valueText: 'Memory Lane', subValueText: 'PHOTO FRAME • TAP TO VIEW', footerText: 'NOS • GALLERY', iconName: 'Image', desc: 'Slideshow frame of gallery.' },
    health_steps: { w: 2, h: 2, titleText: 'HEALTH', valueText: '8,432', subValueText: 'STEPS TODAY • GOAL 10,000', footerText: 'NOS • HEALTH', iconName: 'Heart', desc: 'Daily step goal progress tracking.', showProgressBar: true, progressBarValue: 84, progressBarMax: 100 },
    health_water: { w: 2, h: 2, titleText: 'HEALTH', valueText: '1000 ML', subValueText: 'HYDRATION • GOAL 2000 ML', footerText: 'NOS • HYDRATION', iconName: 'Heart', desc: 'Interactive water intake logger.',
      showProgressBar: true, progressBarValue: 50, progressBarMax: 100,
      showActionButtons: true, btnLeftText: '+250ML', btnLeftAction: 'add_water', btnRightText: 'RESET', btnRightAction: 'reset_water',
      clickHandlers: {
        add_water: { type: 'increment', field: 'waterIntake', amount: 250, displayField: 'valueText', displayFormat: '{value} ML' },
        reset_water: { type: 'set', field: 'waterIntake', value: 0, displayField: 'valueText', displayFormat: '0 ML' }
      }
    },
    health_breath: { w: 2, h: 2, titleText: 'HEALTH', valueText: 'Ready', subValueText: 'BREATHE WORK • 4-7-8 PATTERN', footerText: 'NOS • MINDFULNESS', iconName: 'Heart', desc: 'Animated breathing pacer.' },
    finance_crypto: { w: 2, h: 2, titleText: 'FINANCE', valueText: '$67,490', subValueText: 'BTC • +2.4% • ↑ TRENDING', footerText: 'NOS • CRYPTO', iconName: 'Coins', desc: 'Real-time stock/crypto trend tracker.', subValueColor: '#FF39ff14' },
    developer_git: { w: 4, h: 2, titleText: 'DEVELOPER', valueText: '27 Commits', subValueText: 'STREAK 14 DAYS • 7 REPOS ACTIVE', footerText: 'NOS • GITHUB', iconName: 'Terminal', desc: 'Contribution commits grid display.', showProgressBar: true, progressBarValue: 78, progressBarMax: 100 },
    developer_build: { w: 4, h: 2, titleText: 'DEVELOPER', valueText: 'Deploying...', subValueText: 'CI/CD PIPELINE • STAGE 3 / 5', footerText: 'NOS • CI/CD', iconName: 'Terminal', desc: 'Live build status deployment monitor.', showProgressBar: true, progressBarValue: 60, progressBarMax: 100 },
    developer_cpu: { w: 2, h: 2, titleText: 'DEVELOPER', valueText: 'CPU: 28%', subValueText: 'RAM 42% • DISK 61% • NET ↑ 1.2 MB/S', footerText: 'NOS • SYSTEM MONITOR', iconName: 'Terminal', desc: 'Live system load gauge processor monitor.', showProgressBar: true, progressBarValue: 28, progressBarMax: 100 },
    developer_quick_controls: { w: 4, h: 2, titleText: 'CONTROL CENTER', valueText: 'WiFi • BT', subValueText: 'QUICK CONTROLS • TAP TO OPEN', footerText: 'NOS • CONTROLS', iconName: 'Sliders', desc: 'System quick control panel.' },
    developer_battery: { w: 2, h: 2, titleText: 'DEVELOPER', valueText: '80%', subValueText: 'DISCHARGING • ON BATTERY', footerText: 'NOS • BATTERY', iconName: 'BatteryCharging', desc: 'Device and wireless buds level.', showProgressBar: true, progressBarValue: 80, progressBarMax: 100 },
    social_feed: { w: 4, h: 2, titleText: 'SOCIAL', valueText: '7 New', subValueText: 'NOTIFICATIONS • 3 MENTIONS', footerText: 'NOS • SOCIAL FEED', iconName: 'MessageSquare', desc: 'Aggregated social notifications stream.' },
    social_contact: { w: 2, h: 2, titleText: 'FAV CONTACT', valueText: 'FAV CONTACT', subValueText: 'TAP TO CALL • MOBILE', footerText: 'NOS • CONTACT', iconName: 'User', desc: 'Quick contact call and dialer.' },
    social_shortcuts: { w: 2, h: 2, titleText: 'SOCIAL DIRECT', valueText: 'Socials', subValueText: 'QUICK LINKS • TAP TO OPEN', footerText: 'NOS • SHORTCUTS', iconName: 'Share2', desc: 'Direct shortcuts to WhatsApp, TG, Insta.' },
    smart_home_controls: { w: 2, h: 2, titleText: 'SMART HOME', valueText: 'Lights  ON', subValueText: '3 ROOMS • BRIGHTNESS 70%', footerText: 'NOS • LIGHTING', iconName: 'Home', desc: 'Smart toggles for connected lights & appliances.', showProgressBar: true, progressBarValue: 70, progressBarMax: 100 },
    smart_home_torch: { w: 2, h: 2, titleText: 'TORCH', valueText: 'OFF', subValueText: 'SYSTEM FLASHLIGHT', footerText: 'NOS • FLASHLIGHT', iconName: 'Zap', desc: 'Toggle system flashlight.',
      showActionButtons: true, btnLeftText: 'TOGGLE', btnLeftAction: 'toggle_torch', btnRightText: 'RESET', btnRightAction: 'toggle_torch',
      clickHandlers: {
        toggle_torch: { type: 'native', nativeAction: 'toggle_torch', displayField: 'valueText' }
      }
    },
    smart_home_bluetooth: { w: 2, h: 2, titleText: 'BLUETOOTH', valueText: 'CONNECTED', subValueText: 'NOTHING EAR (2)', footerText: 'NOS • BLUETOOTH', iconName: 'Bluetooth', desc: 'Bluetooth accessory panel.' },
    smart_home_sound_control: { w: 2, h: 2, titleText: 'SOUND CONTROL', valueText: 'VIBRATE', subValueText: 'Calls silenced, motor active', footerText: 'NOS • SOUND PROFILE', iconName: 'VolumeX', desc: 'Sound profile sound/vibe/mute.',
      showActionButtons: true, btnLeftText: 'CYCLE', btnLeftAction: 'cycle_sound', btnRightText: 'RESET', btnRightAction: 'cycle_sound',
      clickHandlers: {
        cycle_sound: { type: 'cycle', field: 'soundProfile', values: ['sound', 'vibrate', 'silent'], displayField: 'valueText', displayFormat: '{value}' }
      }
    },
    ai_chat: { w: 4, h: 4, titleText: 'NOS AI', valueText: 'Ask NOS AI', subValueText: 'QUICK PROMPT • TAP TO OPEN', footerText: 'NOS • AI PROMPT', iconName: 'Sparkles', desc: 'Personal assistant chat interface.' },
    ai_summary: { w: 4, h: 2, titleText: 'NOS AI', valueText: 'Briefing Ready', subValueText: 'AI DAILY BRIEF • TAP TO READ', footerText: 'NOS • AI BRIEF', iconName: 'Sparkles', desc: 'Contextual summary of daily metrics.' },
    ai_bar: { w: 4, h: 2, titleText: 'NOS AI', valueText: 'AI Active', subValueText: 'AI ASSISTANT • READY', footerText: 'NOS • AI ROUTER', iconName: 'Sparkles', desc: 'AI model selection bar.' }
  };

  const widgets = [];
  const registeredIds = new Set();

  templateWidgets.forEach((tw) => {
    if (registeredIds.has(tw.id)) return;
    registeredIds.add(tw.id);

    const base = baseTemplates[tw.id] || {};
    const w = tw.w;
    const h = tw.h;

    const customizations = {
      fontId: 'inter',
      fontSize: w === 4 ? 20 : 14,
      backgroundType: 'solid',
      backgroundColor: '#0c0c0c',
      borderRadius: 16,
      transparency: 10,
      blur: 10,
      shadowType: 'soft',
      titleText: base.titleText || tw.defaultTitle || tw.name.toUpperCase(),
      valueText: base.valueText || tw.defaultValue || '--',
      subValueText: base.subValueText || 'TAP TO OPEN',
      footerText: base.footerText || `NOS • ${tw.category.toUpperCase().replace('_', ' ')}`,
      accentColor: '#7C9EFF',
      themeOverride: 'none',
      showProgressBar: base.showProgressBar || false,
      progressBarValue: base.progressBarValue || 0,
      progressBarMax: base.progressBarMax || 100,
      showActionButtons: base.showActionButtons || false,
      btnLeftText: base.btnLeftText || '',
      btnLeftAction: base.btnLeftAction || '',
      btnRightText: base.btnRightText || '',
      btnRightAction: base.btnRightAction || '',
    };

    if (base.subValueColor) customizations.subValueColor = base.subValueColor;
    if (base.launchUri) customizations.launchUri = base.launchUri;
    if (base.intentAction) customizations.intentAction = base.intentAction;

    const widgetEntry = {
      id: tw.id,
      templateId: tw.id,
      x: 0,
      y: 0,
      w: w,
      h: h,
      customizations: customizations,
    };

    if (base.clickHandlers) {
      widgetEntry.clickHandlers = base.clickHandlers;
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

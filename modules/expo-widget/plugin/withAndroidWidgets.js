const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withAndroidWidgets(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      // 1. Retrieve Git repo stats for git_info.json
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

      // 2. Generate default_widgets.json and save it in modules/expo-widget/android/src/main/assets/
      const targetAssets = path.join(projectRoot, 'modules', 'expo-widget', 'android', 'src', 'main', 'assets');
      if (!fs.existsSync(targetAssets)) {
        fs.mkdirSync(targetAssets, { recursive: true });
      }

      const defaultWidgets = generateDefaultWidgetsList(projectRoot);
      fs.writeFileSync(
        path.join(targetAssets, 'default_widgets.json'),
        JSON.stringify(defaultWidgets, null, 2),
        'utf8'
      );

      console.log('[withAndroidWidgets] Generated build assets and default_widgets.json successfully');
      return config;
    }
  ]);
}

// Helper to generate the default widgets JSON array with all 550 templates
function generateDefaultWidgetsList(projectRoot) {
  const mdPath = path.join(projectRoot, 'src', 'widget list.md');
  if (!fs.existsSync(mdPath)) {
    console.error('widget list.md not found at ' + mdPath);
    return [];
  }
  const content = fs.readFileSync(mdPath, 'utf8');
  const lines = content.split('\n');

  const categoryMap = {
    '1. Clock': 'clock',
    '2. Calendar': 'calendar',
    '3. Weather': 'weather',
    '4. Productivity': 'productivity',
    '5. Health': 'health',
    '6. Finance': 'finance',
    '7. Developer': 'developer',
    '8. Social': 'social',
    '9. Smart Home': 'smart_home',
    '10. AI': 'ai'
  };

  const categories = [];
  let currentCategory = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') && !trimmed.startsWith('##') && !trimmed.startsWith('###')) {
      const cleanHeader = trimmed.replace(/#/g, '').trim();
      const matchedKey = Object.keys(categoryMap).find(cat => cleanHeader.includes(cat));
      if (matchedKey) {
        currentCategory = categoryMap[matchedKey];
      } else {
        currentCategory = null;
      }
    } else if (currentCategory && trimmed) {
      const match = trimmed.match(/^\d+\.\s+(.+)$/);
      if (match) {
        categories.push({
          category: currentCategory,
          name: match[1].trim()
        });
      }
    }
  });

  const CUSTOM_ID_MAPPING = {
    "minimal digital": "clock_digital",
    "nos dot clock": "clock_dot",
    "classic analog": "clock_analog",
    "flip clock": "clock_flip",
    "stopwatch": "clock_stopwatch",
    "month view": "calendar_monthly",
    "agenda view": "calendar_agenda",
    "year progress": "calendar_progress",
    "current weather": "weather_current",
    "aqi": "weather_aqi",
    "moon phase": "weather_moon_phase",
    "to-do": "productivity_todo",
    "focus task": "productivity_focus",
    "focus mode": "productivity_focus",
    "calculator": "productivity_calculator",
    "camera": "productivity_camera",
    "music": "productivity_music",
    "text input": "productivity_text_username",
    "google search": "productivity_google_search",
    "pomodoro": "productivity_pomodoro",
    "folder": "productivity_folder",
    "photo frame": "productivity_photo_frame",
    "steps": "health_steps",
    "water intake": "health_water",
    "breathing exercise": "health_breath",
    "crypto": "finance_crypto",
    "github activity": "developer_git",
    "ci/cd status": "developer_build",
    "server cpu": "developer_cpu",
    "quick controls": "developer_quick_controls",
    "battery status": "developer_battery",
    "notifications": "social_feed",
    "fav contact": "social_contact",
    "social direct": "social_shortcuts",
    "lights": "smart_home_controls",
    "torch": "smart_home_torch",
    "bluetooth": "smart_home_bluetooth",
    "sound control": "smart_home_sound_control",
    "ai chat": "ai_chat",
    "ai summary": "ai_summary",
    "ai router": "ai_bar"
  };

  const sanitizeId = (category, name) => {
    const mapped = CUSTOM_ID_MAPPING[name.toLowerCase()];
    if (mapped) return mapped;
    return `${category}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  };

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


  const categoryDefaults = {
    clock: { value: '10:42 PM', icon: 'Clock', desc: 'timekeeping and stopwatch sessions' },
    calendar: { value: 'Monthly Overview', icon: 'Calendar', desc: 'tracking events and year progress' },
    weather: { value: '18°C Sunny', icon: 'CloudSun', desc: 'current and future forecasts' },
    productivity: { value: '3 Pending', icon: 'CheckSquare', desc: 'notes, tasks and focus sessions' },
    health: { value: '8,400 steps', icon: 'Heart', desc: 'activity and wellness stats' },
    finance: { value: '$67,400', icon: 'Coins', desc: 'financial budgets and markets tracking' },
    developer: { value: 'System active', icon: 'Terminal', desc: 'live builds and CPU status monitors' },
    social: { value: 'Stats updated', icon: 'MessageSquare', desc: 'social media statistics and notifications' },
    smart_home: { value: 'All devices ok', icon: 'Home', desc: 'smart toggles and scenes controller' },
    ai: { value: 'Briefing ready', icon: 'Sparkles', desc: 'contextual AI queries and summaries' }
  };

  const widgets = [];
  const registeredIds = new Set();

  categories.forEach(({ category, name }) => {
    const id = sanitizeId(category, name);
    if (registeredIds.has(id)) return;
    registeredIds.add(id);

    const base = baseTemplates[id] || {};
    const cDefault = categoryDefaults[category];

    let w = base.w || 2;
    let h = base.h || 2;

    const lowerName = name.toLowerCase();
    if (
      lowerName.includes('dot') ||
      lowerName.includes('flip') ||
      lowerName.includes('military') ||
      lowerName.includes('world') ||
      lowerName.includes('timezone') ||
      lowerName.includes('agenda') ||
      lowerName.includes('timeline') ||
      lowerName.includes('forecast') ||
      lowerName.includes('weekly') ||
      lowerName.includes('grid') ||
      lowerName.includes('checklist') ||
      lowerName.includes('board') ||
      lowerName.includes('kanban') ||
      lowerName.includes('daily plan') ||
      lowerName.includes('dashboard') ||
      lowerName.includes('activity') ||
      lowerName.includes('pipeline') ||
      lowerName.includes('status') ||
      lowerName.includes('feed') ||
      lowerName.includes('assistant') ||
      lowerName.includes('chat') ||
      lowerName.includes('summary') ||
      lowerName.includes('brief') ||
      lowerName.includes('command')
    ) {
      w = 4;
    }

    if (lowerName.includes('assistant') || lowerName.includes('chat') || lowerName.includes('kanban')) {
      h = 4;
    }

    // Build customizations with ALL native display fields
    const customizations = {
      fontId: 'inter',
      fontSize: w === 4 ? 20 : 14,
      backgroundType: 'solid',
      backgroundColor: '#0c0c0c',
      borderRadius: 16,
      transparency: 10,
      blur: 10,
      shadowType: 'soft',
      titleText: base.titleText || name.toUpperCase(),
      valueText: base.valueText || cDefault.value,
      subValueText: base.subValueText || 'TAP TO OPEN',
      footerText: base.footerText || `NOS • ${category.toUpperCase().replace('_', ' ')}`,
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

    // Add optional color overrides
    if (base.subValueColor) customizations.subValueColor = base.subValueColor;
    if (base.launchUri) customizations.launchUri = base.launchUri;
    if (base.intentAction) customizations.intentAction = base.intentAction;

    const widgetEntry = {
      id: id,
      templateId: id,
      x: 0,
      y: 0,
      w: w,
      h: h,
      customizations: customizations,
    };

    // Add clickHandlers at the top level if defined
    if (base.clickHandlers) {
      widgetEntry.clickHandlers = base.clickHandlers;
    }

    widgets.push(widgetEntry);

  });

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

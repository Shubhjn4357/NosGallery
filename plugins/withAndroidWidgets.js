const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

const templateWidgets = [
  // Clocks
  { id: 'clock_digital', className: 'NOSClockDigitalWidget', parentClass: 'NOSClockWidget', label: 'NOS Digital Clock', w: 2, h: 2, preview: 'nosclockwidget_preview' },
  { id: 'clock_dot', className: 'NOSClockDotWidget', parentClass: 'NOSClockWidget', label: 'NOS Nothing Clock', w: 4, h: 2, preview: 'nosclockwidget_preview' },
  { id: 'clock_analog', className: 'NOSClockAnalogWidget', parentClass: 'NOSClockWidget', label: 'NOS Analog Clock', w: 2, h: 2, preview: 'nosclockwidget_preview' },
  { id: 'clock_flip', className: 'NOSClockFlipWidget', parentClass: 'NOSClockWidget', label: 'NOS Flip Clock', w: 4, h: 2, preview: 'nosclockwidget_preview' },
  { id: 'clock_stopwatch', className: 'NOSClockStopwatchWidget', parentClass: 'NOSClockWidget', label: 'NOS Stopwatch', w: 2, h: 2, preview: 'nosclockwidget_preview' },

  // Calendars
  { id: 'calendar_monthly', className: 'NOSCalendarMonthlyWidget', parentClass: 'NOSCalendarWidget', label: 'NOS Monthly Calendar', w: 2, h: 2, preview: 'noscalendarwidget_preview' },
  { id: 'calendar_agenda', className: 'NOSCalendarAgendaWidget', parentClass: 'NOSCalendarWidget', label: 'NOS Agenda Calendar', w: 4, h: 2, preview: 'noscalendarwidget_preview' },
  { id: 'calendar_progress', className: 'NOSCalendarProgressWidget', parentClass: 'NOSCalendarWidget', label: 'NOS Year Progress', w: 2, h: 2, preview: 'noscalendarwidget_preview' },

  // Weather
  { id: 'weather_current', className: 'NOSWeatherCurrentWidget', parentClass: 'NOSWeatherWidget', label: 'NOS Current Weather', w: 2, h: 2, preview: 'nosweatherwidget_preview' },
  { id: 'weather_aqi', className: 'NOSWeatherAqiWidget', parentClass: 'NOSWeatherWidget', label: 'NOS Weather AQI', w: 2, h: 2, preview: 'nosweatherwidget_preview' },

  // Productivity
  { id: 'productivity_todo', className: 'NOSProductivityTodoWidget', parentClass: 'NOSProductivityWidget', label: 'NOS Tasks Todo', w: 2, h: 2, preview: 'nosproductivitywidget_preview' },
  { id: 'productivity_focus', className: 'NOSProductivityFocusWidget', parentClass: 'NOSProductivityWidget', label: 'NOS Focus Timer', w: 2, h: 2, preview: 'nosproductivitywidget_preview' },

  // Health
  { id: 'health_steps', className: 'NOSHealthStepsWidget', parentClass: 'NOSHealthWidget', label: 'NOS Steps Tracker', w: 2, h: 2, preview: 'noshealthwidget_preview' },
  { id: 'health_water', className: 'NOSHealthWaterWidget', parentClass: 'NOSHealthWidget', label: 'NOS Water Tracker', w: 2, h: 2, preview: 'noshealthwidget_preview' },
  { id: 'health_breath', className: 'NOSHealthBreathWidget', parentClass: 'NOSHealthWidget', label: 'NOS Breathing Pacer', w: 2, h: 2, preview: 'noshealthwidget_preview' },

  // Finance
  { id: 'finance_crypto', className: 'NOSFinanceCryptoWidget', parentClass: 'NOSFinanceWidget', label: 'NOS Crypto Tracker', w: 2, h: 2, preview: 'nosfinancewidget_preview' },

  // Developer
  { id: 'developer_git', className: 'NOSDeveloperGitWidget', parentClass: 'NOSDeveloperWidget', label: 'NOS GitHub Grid', w: 4, h: 2, preview: 'nosdeveloperwidget_preview' },
  { id: 'developer_build', className: 'NOSDeveloperBuildWidget', parentClass: 'NOSDeveloperWidget', label: 'NOS CI/CD Pipeline', w: 4, h: 2, preview: 'nosdeveloperwidget_preview' },
  { id: 'developer_cpu', className: 'NOSDeveloperCpuWidget', parentClass: 'NOSDeveloperWidget', label: 'NOS CPU Monitor', w: 2, h: 2, preview: 'nosdeveloperwidget_preview' },

  // Social
  { id: 'social_feed', className: 'NOSSocialFeedWidget', parentClass: 'NOSSocialWidget', label: 'NOS Social Feed', w: 4, h: 2, preview: 'nossocialwidget_preview' },

  // Smart Home
  { id: 'smart_home_controls', className: 'NOSSmartHomeControlsWidget', parentClass: 'NOSSmartHomeWidget', label: 'NOS Smart Room', w: 2, h: 2, preview: 'nossmarthomewidget_preview' },

  // AI
  { id: 'ai_chat', className: 'NOSAiChatWidget', parentClass: 'NOSAiWidget', label: 'NOS AI Chat', w: 4, h: 4, preview: 'nosaiwidget_preview' },
  { id: 'ai_summary', className: 'NOSAiSummaryWidget', parentClass: 'NOSAiWidget', label: 'NOS AI Summary', w: 4, h: 2, preview: 'nosaiwidget_preview' }
];

function withAndroidWidgets(config) {
  // 1. Add receivers to AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const mainApplication = manifest.manifest.application[0];
    
    // Ensure we have a receivers list or initialize it
    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }
    
    // We want to add these receivers if they aren't already there
    const widgetsToInject = [
      { name: '.widget.NOSClockWidget', label: 'NOS Clock Widget', resource: '@xml/widgetprovider_nosclockwidget' },
      { name: '.widget.NOSCalendarWidget', label: 'NOS Calendar Widget', resource: '@xml/widgetprovider_noscalendarwidget' },
      { name: '.widget.NOSWeatherWidget', label: 'NOS Weather Widget', resource: '@xml/widgetprovider_nosweatherwidget' },
      { name: '.widget.NOSProductivityWidget', label: 'NOS Tasks Widget', resource: '@xml/widgetprovider_nosproductivitywidget' },
      { name: '.widget.NOSHealthWidget', label: 'NOS Health Widget', resource: '@xml/widgetprovider_noshealthwidget' },
      { name: '.widget.NOSFinanceWidget', label: 'NOS Finance Widget', resource: '@xml/widgetprovider_nosfinancewidget' },
      { name: '.widget.NOSDeveloperWidget', label: 'NOS Developer Widget', resource: '@xml/widgetprovider_nosdeveloperwidget' },
      { name: '.widget.NOSSocialWidget', label: 'NOS Social Widget', resource: '@xml/widgetprovider_nossocialwidget' },
      { name: '.widget.NOSSmartHomeWidget', label: 'NOS Smart Home Widget', resource: '@xml/widgetprovider_nossmarthomewidget' },
      { name: '.widget.NOSAiWidget', label: 'NOS AI Widget', resource: '@xml/widgetprovider_nosaiwidget' }
    ];

    templateWidgets.forEach((tw) => {
      widgetsToInject.push({
        name: `.widget.${tw.className}`,
        label: tw.label,
        resource: `@xml/widgetprovider_${tw.id.toLowerCase()}`
      });
    });
    
    widgetsToInject.forEach((w) => {
      // Check if already exists
      const exists = mainApplication.receiver.some(r => r.$['android:name'] === w.name);
      if (!exists) {
        mainApplication.receiver.push({
          $: {
            'android:name': w.name,
            'android:exported': 'true',
            'android:label': w.label
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
                'android:resource': w.resource
              }
            }
          ]
        });
      }
    });
    
    // Add NosWidgetPinReceiver
    const pinReceiverName = '.widget.NosWidgetPinReceiver';
    const pinExists = mainApplication.receiver.some(r => r.$['android:name'] === pinReceiverName);
    if (!pinExists) {
      mainApplication.receiver.push({
        $: {
          'android:name': pinReceiverName,
          'android:exported': 'false'
        }
      });
    }
    
    return config;
  });
  
  // 2. Copy code and resources to generated android directory, and generate assets
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const targetBase = path.join(projectRoot, 'android', 'app', 'src', 'main');

      // Generate template-specific Kotlin classes in src/native/android/java/com/nothing/nosgallery/widget/
      const srcWidgetJavaDir = path.join(projectRoot, 'src', 'native', 'android', 'java', 'com', 'nothing', 'nosgallery', 'widget');
      if (!fs.existsSync(srcWidgetJavaDir)) {
        fs.mkdirSync(srcWidgetJavaDir, { recursive: true });
      }
      templateWidgets.forEach((w) => {
        const ktContent = `package com.nothing.nosgallery.widget

class ${w.className} : ${w.parentClass}() {
    override val defaultTemplateId = "${w.id}"
}
`;
        fs.writeFileSync(path.join(srcWidgetJavaDir, `${w.className}.kt`), ktContent, 'utf8');
      });

      // Generate template-specific XML provider configs in src/native/android/res/xml/
      const srcWidgetXmlDir = path.join(projectRoot, 'src', 'native', 'android', 'res', 'xml');
      if (!fs.existsSync(srcWidgetXmlDir)) {
        fs.mkdirSync(srcWidgetXmlDir, { recursive: true });
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
        fs.writeFileSync(path.join(srcWidgetXmlDir, `widgetprovider_${w.id.toLowerCase()}.xml`), xmlContent, 'utf8');
      });
      
      // Copy Kotlin widget code
      const srcJava = path.join(projectRoot, 'src', 'native', 'android', 'java');
      const targetJava = path.join(targetBase, 'java');
      copyFolderSync(srcJava, targetJava);
      
      // Copy resources (layout, xml, drawable)
      const srcRes = path.join(projectRoot, 'src', 'native', 'android', 'res');
      const targetRes = path.join(targetBase, 'res');
      copyFolderSync(srcRes, targetRes);
      
      // Generate default_widgets.json at build time and save it in assets/
      const targetAssets = path.join(targetBase, 'assets');
      if (!fs.existsSync(targetAssets)) {
        fs.mkdirSync(targetAssets, { recursive: true });
      }
      
      // Build default widgets JSON from the manifest or registry definition
      const defaultWidgets = generateDefaultWidgetsList(projectRoot);
      fs.writeFileSync(
        path.join(targetAssets, 'default_widgets.json'),
        JSON.stringify(defaultWidgets, null, 2),
        'utf8'
      );
      
      console.log('[withAndroidWidgets] Copied native code, resources, and generated assets/default_widgets.json');
      return config;
    }
  ]);
  
  return config;
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
    "to-do": "productivity_todo",
    "focus task": "productivity_focus",
    "focus mode": "productivity_focus",
    "steps": "health_steps",
    "water intake": "health_water",
    "breathing exercise": "health_breath",
    "crypto": "finance_crypto",
    "github activity": "developer_git",
    "ci/cd status": "developer_build",
    "server cpu": "developer_cpu",
    "notifications": "social_feed",
    "lights": "smart_home_controls",
    "ai chat": "ai_chat",
    "ai summary": "ai_summary"
  };
  
  const sanitizeId = (category, name) => {
    const mapped = CUSTOM_ID_MAPPING[name.toLowerCase()];
    if (mapped) return mapped;
    return `${category}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  };
  
  const baseTemplates = {
    clock_digital: { w: 2, h: 2, titleText: 'DIGITAL CLOCK', valueText: '10:42 PM', iconName: 'Clock', desc: 'Modern digital clock display.' },
    clock_dot: { w: 4, h: 2, titleText: 'NOTHING CLOCK', valueText: '10:42 PM', iconName: 'Clock', desc: 'Signature Nothing style dot-matrix clock.' },
    clock_analog: { w: 2, h: 2, titleText: 'ANALOG CLOCK', valueText: 'Ticking', iconName: 'Clock', desc: 'Minimal classic ticking analog clock.' },
    clock_flip: { w: 4, h: 2, titleText: 'FLIP CLOCK', valueText: '21:09', iconName: 'Clock', desc: 'Retro animated flip clock.' },
    clock_stopwatch: { w: 2, h: 2, titleText: 'STOPWATCH', valueText: '00:00.0', iconName: 'Timer', desc: 'Interactive stopwatch timer.' },
    calendar_monthly: { w: 2, h: 2, titleText: 'JUNE 2026', valueText: 'Monthly Calendar', iconName: 'Calendar', desc: 'Grid display of the current month.' },
    calendar_agenda: { w: 4, h: 2, titleText: 'UPCOMING EVENTS', valueText: 'Meeting, Work Sync', iconName: 'Calendar', desc: 'Timeline view of upcoming events.' },
    calendar_progress: { w: 2, h: 2, titleText: 'YEAR PROGRESS', valueText: '43%', iconName: 'Calendar', desc: 'Percentage visualizer of the current year.' },
    weather_current: { w: 2, h: 2, titleText: 'LONDON', valueText: '18°C Rain', iconName: 'CloudSun', desc: 'Live climate and temperature stats.' },
    weather_aqi: { w: 2, h: 2, titleText: 'LONDON AQI', valueText: '12 AQI', iconName: 'CloudSun', desc: 'Circular gauge showing air quality status.' },
    productivity_todo: { w: 2, h: 2, titleText: 'TODAY TASKS', valueText: '3 Remaining', iconName: 'CheckSquare', desc: 'Simple task manager checklist.' },
    productivity_focus: { w: 2, h: 2, titleText: 'FOCUS MODE', valueText: '25:00', iconName: 'CheckSquare', desc: 'Pomodoro focus countdown widget.' },
    health_steps: { w: 2, h: 2, titleText: 'STEPS TODAY', valueText: '8,432', iconName: 'Heart', desc: 'Daily step goal progress tracking.' },
    health_water: { w: 2, h: 2, titleText: 'WATER INTAKE', valueText: '1,200 ml', iconName: 'Heart', desc: 'Interactive water intake logger.' },
    health_breath: { w: 2, h: 2, titleText: 'BREATH WORK', valueText: 'Ready', iconName: 'Heart', desc: 'Animated breathing pacer.' },
    finance_crypto: { w: 2, h: 2, titleText: 'BTC / USD', valueText: '$67,490', iconName: 'Coins', desc: 'Real-time stock/crypto trend tracker.' },
    developer_git: { w: 4, h: 2, titleText: 'GITHUB ACTIVITY', valueText: 'Commits', iconName: 'Terminal', desc: 'Contribution commits grid display.' },
    developer_build: { w: 4, h: 2, titleText: 'CI/CD PIPELINE', valueText: 'Deploying', iconName: 'Terminal', desc: 'Live build status deployment monitor.' },
    developer_cpu: { w: 2, h: 2, titleText: 'SYSTEM CPU', valueText: '28% usage', iconName: 'Terminal', desc: 'Live system load gauge processor monitor.' },
    social_feed: { w: 4, h: 2, titleText: 'SOCIAL NOTIFICATIONS', valueText: 'New Mentions', iconName: 'MessageSquare', desc: 'Aggregated social notifications stream.' },
    smart_home_controls: { w: 2, h: 2, titleText: 'SMART ROOM', valueText: 'Lights and Plugs', iconName: 'Home', desc: 'Smart toggles for connected lights & appliances.' },
    ai_chat: { w: 4, h: 4, titleText: 'AI ASSISTANT', valueText: 'Ask anything', iconName: 'Sparkles', desc: 'Personal assistant chat interface.' },
    ai_summary: { w: 4, h: 2, titleText: 'AI METRICS BRIEF', valueText: 'Weekly digest ready', iconName: 'Sparkles', desc: 'Contextual summary of daily metrics.' }
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
    
    widgets.push({
      id: id,
      templateId: id,
      x: 0,
      y: 0,
      w: w,
      h: h,
      customizations: {
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
        accentColor: '#7C9EFF',
        themeOverride: 'none'
      }
    });
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
        accentColor: '#7C9EFF',
        themeOverride: 'none'
      }
    });
  }
  
  return widgets;
}

module.exports = withAndroidWidgets;

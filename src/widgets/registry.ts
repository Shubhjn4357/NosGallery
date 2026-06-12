export type WidgetCategory =
  | 'clock'
  | 'calendar'
  | 'weather'
  | 'productivity'
  | 'health'
  | 'finance'
  | 'developer'
  | 'social'
  | 'smart_home'
  | 'ai';

export interface WidgetTemplate {
  id: string;
  name: string;
  category: WidgetCategory;
  defaultWidth: number; // in grid cells (2 or 4)
  defaultHeight: number; // in grid cells (2 or 4)
  defaultTitle: string;
  defaultValue: string;
  iconName: string;
  description: string;
}

// 23 Real Widget Names Arrays + 17 New Widgets
const CLOCK_NAMES = [
  "Minimal Digital",
  "NOS Dot Clock",
  "Classic Analog",
  "Flip Clock",
  "Stopwatch"
];

const CALENDAR_NAMES = [
  "Month View",
  "Agenda View",
  "Year Progress"
];

const WEATHER_NAMES = [
  "Current Weather",
  "AQI",
  "Moon Phase"
];

const PRODUCTIVITY_NAMES = [
  "To-Do",
  "Focus Task",
  "Calculator",
  "Camera",
  "Music",
  "Text Input",
  "Google Search",
  "Pomodoro",
  "Folder",
  "Photo Frame"
];

const HEALTH_NAMES = [
  "Steps",
  "Water Intake",
  "Breathing Exercise"
];

const FINANCE_NAMES = [
  "Crypto"
];

const DEV_NAMES = [
  "GitHub Activity",
  "CI/CD Status",
  "Server CPU",
  "Quick Controls",
  "Battery Status"
];

const SOCIAL_NAMES = [
  "Notifications",
  "Fav Contact",
  "Social Direct"
];

const HOME_NAMES = [
  "Lights",
  "Torch",
  "Bluetooth",
  "Sound Control"
];

const AI_NAMES = [
  "AI Chat",
  "AI Summary",
  "AI Router"
];

// Specific overrides for hand-crafted widgets
const baseTemplates: Record<string, Partial<WidgetTemplate>> = {
  clock_digital: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'DIGITAL CLOCK',
    defaultValue: '10:42 PM',
    iconName: 'Clock',
    description: 'Modern digital clock display.',
  },
  clock_dot: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'NOTHING CLOCK',
    defaultValue: '10:42 PM',
    iconName: 'Clock',
    description: 'Signature Nothing style dot-matrix clock.',
  },
  clock_analog: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'ANALOG CLOCK',
    defaultValue: 'Ticking',
    iconName: 'Clock',
    description: 'Minimal classic ticking analog clock.',
  },
  clock_flip: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'FLIP CLOCK',
    defaultValue: '21:09',
    iconName: 'Clock',
    description: 'Retro animated flip clock.',
  },
  clock_stopwatch: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'STOPWATCH',
    defaultValue: '00:00.0',
    iconName: 'Timer',
    description: 'Interactive stopwatch timer.',
  },
  calendar_monthly: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'JUNE 2026',
    defaultValue: 'Monthly Calendar',
    iconName: 'Calendar',
    description: 'Grid display of the current month.',
  },
  calendar_agenda: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'UPCOMING EVENTS',
    defaultValue: 'Meeting, Work Sync',
    iconName: 'Calendar',
    description: 'Timeline view of upcoming events.',
  },
  calendar_progress: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'YEAR PROGRESS',
    defaultValue: '43%',
    iconName: 'Calendar',
    description: 'Percentage visualizer of the current year.',
  },
  weather_current: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'LONDON',
    defaultValue: '18°C Rain',
    iconName: 'CloudSun',
    description: 'Live climate and temperature stats.',
  },
  weather_aqi: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'LONDON AQI',
    defaultValue: '12 AQI',
    iconName: 'CloudSun',
    description: 'Circular gauge showing air quality status.',
  },
  productivity_todo: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'TODAY TASKS',
    defaultValue: '3 Remaining',
    iconName: 'CheckSquare',
    description: 'Simple task manager checklist.',
  },
  productivity_focus: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'FOCUS MODE',
    defaultValue: '25:00',
    iconName: 'CheckSquare',
    description: 'Pomodoro focus countdown widget.',
  },
  health_steps: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'STEPS TODAY',
    defaultValue: '8,432',
    iconName: 'Heart',
    description: 'Daily step goal progress tracking.',
  },
  health_water: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'WATER INTAKE',
    defaultValue: '1,200 ml',
    iconName: 'Heart',
    description: 'Interactive water intake logger.',
  },
  health_breath: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'BREATH WORK',
    defaultValue: 'Ready',
    iconName: 'Heart',
    description: 'Animated breathing pacer.',
  },
  finance_crypto: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'BTC / USD',
    defaultValue: '$67,490',
    iconName: 'Coins',
    description: 'Real-time stock/crypto trend tracker.',
  },
  developer_git: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'GITHUB ACTIVITY',
    defaultValue: 'Commits',
    iconName: 'Terminal',
    description: 'Contribution commits grid display.',
  },
  developer_build: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'CI/CD PIPELINE',
    defaultValue: 'Deploying',
    iconName: 'Terminal',
    description: 'Live build status deployment monitor.',
  },
  developer_cicd: { // Alias for preset pack references
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'CI/CD PIPELINE',
    defaultValue: 'Deploying',
    iconName: 'Terminal',
    description: 'Live build status deployment monitor.',
  },
  developer_cpu: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'SYSTEM CPU',
    defaultValue: '28% usage',
    iconName: 'Terminal',
    description: 'Live system load gauge processor monitor.',
  },
  social_feed: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'SOCIAL NOTIFICATIONS',
    defaultValue: 'New Mentions',
    iconName: 'MessageSquare',
    description: 'Aggregated social notifications stream.',
  },
  smart_home_controls: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'SMART ROOM',
    defaultValue: 'Lights and Plugs',
    iconName: 'Home',
    description: 'Smart toggles for connected lights & appliances.',
  },
  ai_chat: {
    defaultWidth: 4,
    defaultHeight: 4,
    defaultTitle: 'AI ASSISTANT',
    defaultValue: 'Ask anything',
    iconName: 'Sparkles',
    description: 'Personal assistant chat interface.',
  },
  ai_summary: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'AI METRICS BRIEF',
    defaultValue: 'Weekly digest ready',
    iconName: 'Sparkles',
    description: 'Contextual summary of daily metrics.',
  },
  smart_home_torch: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'TORCH',
    defaultValue: 'OFF',
    iconName: 'Zap',
    description: 'Toggle system flashlight.',
  },
  productivity_calculator: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'CALCULATOR',
    defaultValue: '0',
    iconName: 'Calculator',
    description: 'Interactive pocket calculator.',
  },
  developer_quick_controls: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'CONTROL CENTER',
    defaultValue: 'WiFi • BT',
    iconName: 'Sliders',
    description: 'System quick control panel.',
  },
  developer_battery: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'BATTERY STATUS',
    defaultValue: '80%',
    iconName: 'BatteryCharging',
    description: 'Device and wireless buds level.',
  },
  smart_home_bluetooth: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'BLUETOOTH',
    defaultValue: 'Nothing Ear Connected',
    iconName: 'Bluetooth',
    description: 'Bluetooth accessory panel.',
  },
  productivity_camera: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'CAMERA',
    defaultValue: 'Tap to open',
    iconName: 'Camera',
    description: 'Quick camera lens and capture.',
  },
  social_contact: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'FAV CONTACT',
    defaultValue: 'Shubh',
    iconName: 'User',
    description: 'Quick contact call and dialer.',
  },
  smart_home_sound_control: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'SOUND CONTROL',
    defaultValue: 'Vibrate',
    iconName: 'VolumeX',
    description: 'Sound profile sound/vibe/mute.',
  },
  productivity_music: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'MUSIC PLAYER',
    defaultValue: 'Nothing Beat - LoFi',
    iconName: 'Music',
    description: 'System music player panel.',
  },
  productivity_text_username: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'TEXT INPUT',
    defaultValue: 'User Name',
    iconName: 'Type',
    description: 'Enter username for widgets.',
  },
  social_shortcuts: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'SOCIAL DIRECT',
    defaultValue: 'WhatsApp • Telegram',
    iconName: 'Share2',
    description: 'Direct shortcuts to WhatsApp, TG, Insta.',
  },
  productivity_google_search: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'GOOGLE SEARCH',
    defaultValue: 'Search the web',
    iconName: 'Search',
    description: 'Web search bar panel.',
  },
  ai_bar: {
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'AI ROUTER',
    defaultValue: 'Gemini • GPT',
    iconName: 'Sparkles',
    description: 'AI model selection bar.',
  },
  productivity_pomodoro: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'POMODORO',
    defaultValue: '25:00',
    iconName: 'Hourglass',
    description: 'Ticking pomodoro focus timer.',
  },
  productivity_folder: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'APPS FOLDER',
    defaultValue: '4 Shortcuts',
    iconName: 'Folder',
    description: 'App drawer shortcut container.',
  },
  weather_moon_phase: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'MOON PHASE',
    defaultValue: 'Waxing Gibbous',
    iconName: 'Moon',
    description: 'Calculates lunar phase details.',
  },
  productivity_photo_frame: {
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'PHOTO FRAME',
    defaultValue: 'Auto-Scrolling',
    iconName: 'Image',
    description: 'Slideshow frame of gallery.',
  },
};

const CUSTOM_ID_MAPPING: Record<string, string> = {
  // Clock
  "minimal digital": "clock_digital",
  "nos dot clock": "clock_dot",
  "classic analog": "clock_analog",
  "flip clock": "clock_flip",
  "stopwatch": "clock_stopwatch",
  // Calendar
  "month view": "calendar_monthly",
  "agenda view": "calendar_agenda",
  "year progress": "calendar_progress",
  // Weather
  "current weather": "weather_current",
  "aqi": "weather_aqi",
  "moon phase": "weather_moon_phase",
  // Productivity
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
  // Health
  "steps": "health_steps",
  "water intake": "health_water",
  "breathing exercise": "health_breath",
  // Finance
  "crypto": "finance_crypto",
  // Developer
  "github activity": "developer_git",
  "ci/cd status": "developer_build",
  "server cpu": "developer_cpu",
  "quick controls": "developer_quick_controls",
  "battery status": "developer_battery",
  // Social
  "notifications": "social_feed",
  "fav contact": "social_contact",
  "social direct": "social_shortcuts",
  // Smart Home
  "lights": "smart_home_controls",
  "torch": "smart_home_torch",
  "bluetooth": "smart_home_bluetooth",
  // AI
  "ai chat": "ai_chat",
  "ai summary": "ai_summary",
  "ai router": "ai_bar",
};

// Populate the central widgetRegistry containing all 550 dynamic configurations
export const widgetRegistry: Record<string, WidgetTemplate> = {};

const sanitizeId = (category: string, name: string) => {
  const mapped = CUSTOM_ID_MAPPING[name.toLowerCase()];
  if (mapped) return mapped;
  return `${category}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
};

// Helper function to dynamically register category widgets
const registerCategoryWidgets = (
  category: WidgetCategory,
  names: string[],
  defaultTitleSuffix: string,
  defaultValue: string,
  iconName: string,
  desc: string
) => {
  names.forEach((name) => {
    const id = sanitizeId(category, name);
    
    // Only register if not already registered (avoid duplicate mappings)
    if (!widgetRegistry[id]) {
      const base = baseTemplates[id] || {};
      
      // Dynamic Sizing heuristic based on widget name matching
      let defaultWidth = base.defaultWidth || 2;
      let defaultHeight = base.defaultHeight || 2;
      
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
        defaultWidth = 4;
      }
      
      if (lowerName.includes('assistant') || lowerName.includes('chat') || lowerName.includes('kanban')) {
        defaultHeight = 4;
      }

      widgetRegistry[id] = {
        id,
        name,
        category,
        defaultWidth,
        defaultHeight,
        defaultTitle: base.defaultTitle || name.toUpperCase(),
        defaultValue: base.defaultValue || defaultValue,
        iconName: base.iconName || iconName,
        description: base.description || `${name} widget for ${desc}.`,
      };
    }
  });
};

// Register all categories
registerCategoryWidgets('clock', CLOCK_NAMES, 'CLOCK', '10:42 PM', 'Clock', 'timekeeping and stopwatch sessions');
registerCategoryWidgets('calendar', CALENDAR_NAMES, 'CALENDAR', 'Monthly Overview', 'Calendar', 'tracking events and year progress');
registerCategoryWidgets('weather', WEATHER_NAMES, 'WEATHER', '18°C Sunny', 'CloudSun', 'current and future forecasts');
registerCategoryWidgets('productivity', PRODUCTIVITY_NAMES, 'TASK', '3 Pending', 'CheckSquare', 'notes, tasks and focus sessions');
registerCategoryWidgets('health', HEALTH_NAMES, 'HEALTH', '8,400 steps', 'Heart', 'activity and wellness stats');
registerCategoryWidgets('finance', FINANCE_NAMES, 'FINANCE', '$67,400', 'Coins', 'financial budgets and markets tracking');
registerCategoryWidgets('developer', DEV_NAMES, 'DEVELOPER', 'System active', 'Terminal', 'live builds and CPU status monitors');
registerCategoryWidgets('social', SOCIAL_NAMES, 'SOCIAL', 'Stats updated', 'MessageSquare', 'social media statistics and notifications');
registerCategoryWidgets('smart_home', HOME_NAMES, 'HOME', 'All devices ok', 'Home', 'smart toggles and scenes controller');
registerCategoryWidgets('ai', AI_NAMES, 'AI', 'Briefing ready', 'Sparkles', 'contextual AI queries and summaries');

// Make sure developer_cicd is registered for references
if (!widgetRegistry['developer_cicd']) {
  widgetRegistry['developer_cicd'] = {
    id: 'developer_cicd',
    name: 'CI/CD Status',
    category: 'developer',
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'CI/CD STATUS',
    defaultValue: 'Deploying',
    iconName: 'Terminal',
    description: 'Live build status deployment monitor.',
  };
}

export const getTemplateById = (id: string): WidgetTemplate => {
  return widgetRegistry[id] || widgetRegistry.clock_digital;
};

export const getTemplatesByCategory = (category: WidgetCategory): WidgetTemplate[] => {
  return Object.values(widgetRegistry).filter((t) => t.category === category);
};

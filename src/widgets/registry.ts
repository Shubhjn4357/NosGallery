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

export const widgetRegistry: Record<string, WidgetTemplate> = {
  // Clock Widgets
  clock_digital: {
    id: 'clock_digital',
    name: 'Digital Clock',
    category: 'clock',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'DIGITAL CLOCK',
    defaultValue: '10:42 PM',
    iconName: 'Clock',
    description: 'Modern digital clock display.',
  },
  clock_dot: {
    id: 'clock_dot',
    name: 'NOS Dot Clock',
    category: 'clock',
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'NOTHING CLOCK',
    defaultValue: '10:42 PM',
    iconName: 'Clock',
    description: 'Signature Nothing style dot-matrix clock.',
  },
  clock_analog: {
    id: 'clock_analog',
    name: 'Analog Clock',
    category: 'clock',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'ANALOG CLOCK',
    defaultValue: 'Ticking',
    iconName: 'Clock',
    description: 'Minimal classic ticking analog clock.',
  },
  clock_flip: {
    id: 'clock_flip',
    name: 'Flip Clock',
    category: 'clock',
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'FLIP CLOCK',
    defaultValue: '21:09',
    iconName: 'Clock',
    description: 'Retro animated flip clock.',
  },
  clock_stopwatch: {
    id: 'clock_stopwatch',
    name: 'Stopwatch',
    category: 'clock',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'STOPWATCH',
    defaultValue: '00:00.0',
    iconName: 'Timer',
    description: 'Interactive stopwatch timer.',
  },

  // Calendar Widgets
  calendar_monthly: {
    id: 'calendar_monthly',
    name: 'Monthly Calendar',
    category: 'calendar',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'JUNE 2026',
    defaultValue: 'Monthly Calendar',
    iconName: 'Calendar',
    description: 'Grid display of the current month.',
  },
  calendar_agenda: {
    id: 'calendar_agenda',
    name: 'Agenda Planner',
    category: 'calendar',
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'UPCOMING EVENTS',
    defaultValue: 'Meeting, Work Sync',
    iconName: 'Calendar',
    description: 'Timeline view of upcoming events.',
  },
  calendar_progress: {
    id: 'calendar_progress',
    name: 'Year Progress',
    category: 'calendar',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'YEAR PROGRESS',
    defaultValue: '43%',
    iconName: 'Calendar',
    description: 'Percentage visualizer of the current year.',
  },

  // Weather Widgets
  weather_current: {
    id: 'weather_current',
    name: 'Current Weather',
    category: 'weather',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'LONDON',
    defaultValue: '18°C Rain',
    iconName: 'CloudSun',
    description: 'Live climate and temperature stats.',
  },
  weather_aqi: {
    id: 'weather_aqi',
    name: 'AQI Index',
    category: 'weather',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'LONDON AQI',
    defaultValue: '12 AQI',
    iconName: 'CloudSun',
    description: 'Circular gauge showing air quality status.',
  },

  // Productivity Widgets
  productivity_todo: {
    id: 'productivity_todo',
    name: 'Task Checklist',
    category: 'productivity',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'TODAY TASKS',
    defaultValue: '3 Remaining',
    iconName: 'CheckSquare',
    description: 'Simple task manager checklist.',
  },
  productivity_focus: {
    id: 'productivity_focus',
    name: 'Focus Timer',
    category: 'productivity',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'FOCUS MODE',
    defaultValue: '25:00',
    iconName: 'CheckSquare',
    description: 'Pomodoro focus countdown widget.',
  },

  // Health & Fitness Widgets
  health_steps: {
    id: 'health_steps',
    name: 'Steps Counter',
    category: 'health',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'STEPS TODAY',
    defaultValue: '8,432',
    iconName: 'Heart',
    description: 'Daily step goal progress tracking.',
  },
  health_water: {
    id: 'health_water',
    name: 'Water Tracker',
    category: 'health',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'WATER INTAKE',
    defaultValue: '1,200 ml',
    iconName: 'Heart',
    description: 'Interactive water intake logger.',
  },
  health_breath: {
    id: 'health_breath',
    name: 'Breathing Guide',
    category: 'health',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'BREATH WORK',
    defaultValue: 'Ready',
    iconName: 'Heart',
    description: 'Animated breathing pacer.',
  },

  // Finance Widgets
  finance_crypto: {
    id: 'finance_crypto',
    name: 'Crypto Watch',
    category: 'finance',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'BTC / USD',
    defaultValue: '$67,490',
    iconName: 'Coins',
    description: 'Real-time stock/crypto trend tracker.',
  },

  // Developer Widgets
  developer_git: {
    id: 'developer_git',
    name: 'GitHub Activity',
    category: 'developer',
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'GITHUB ACTIVITY',
    defaultValue: 'Commits',
    iconName: 'Terminal',
    description: 'Contribution commits grid display.',
  },
  developer_build: {
    id: 'developer_build',
    name: 'CI/CD Pipeline',
    category: 'developer',
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'CI/CD PIPELINE',
    defaultValue: 'Deploying',
    iconName: 'Terminal',
    description: 'Live build status deployment monitor.',
  },
  developer_cpu: {
    id: 'developer_cpu',
    name: 'CPU Monitor',
    category: 'developer',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'SYSTEM CPU',
    defaultValue: '28% usage',
    iconName: 'Terminal',
    description: 'Live system load gauge processor monitor.',
  },

  // Social Widgets
  social_feed: {
    id: 'social_feed',
    name: 'Social Feed',
    category: 'social',
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'SOCIAL NOTIFICATIONS',
    defaultValue: 'New Mentions',
    iconName: 'MessageSquare',
    description: 'Aggregated social notifications stream.',
  },

  // Smart Home Widgets
  smart_home_controls: {
    id: 'smart_home_controls',
    name: 'Home Controls',
    category: 'smart_home',
    defaultWidth: 2,
    defaultHeight: 2,
    defaultTitle: 'SMART ROOM',
    defaultValue: 'Lights and Plugs',
    iconName: 'Home',
    description: 'Smart toggles for connected lights & appliances.',
  },

  // AI Widgets
  ai_chat: {
    id: 'ai_chat',
    name: 'AI Assistant',
    category: 'ai',
    defaultWidth: 4,
    defaultHeight: 4,
    defaultTitle: 'AI ASSISTANT',
    defaultValue: 'Ask anything',
    iconName: 'Sparkles',
    description: 'Personal assistant chat interface.',
  },
  ai_summary: {
    id: 'ai_summary',
    name: 'AI Summary',
    category: 'ai',
    defaultWidth: 4,
    defaultHeight: 2,
    defaultTitle: 'AI METRICS BRIEF',
    defaultValue: 'Weekly digest ready',
    iconName: 'Sparkles',
    description: 'Contextual summary of daily metrics.',
  },
};

export const getTemplateById = (id: string): WidgetTemplate => {
  return widgetRegistry[id] || widgetRegistry.clock_digital;
};

export const getTemplatesByCategory = (category: WidgetCategory): WidgetTemplate[] => {
  return Object.values(widgetRegistry).filter((t) => t.category === category);
};

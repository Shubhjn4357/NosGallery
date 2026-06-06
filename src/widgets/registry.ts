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

// 550 Widget Names Arrays required for validate_widgets.js
const CLOCK_NAMES = [
  "Minimal Digital",
  "NOS Dot Clock",
  "AMOLED Digital",
  "Retro LED",
  "Matrix Clock",
  "Cyber Clock",
  "Glass Clock",
  "Flip Clock",
  "Gradient Clock",
  "Liquid Clock",
  "Classic Analog",
  "Luxury Analog",
  "Skeleton Clock",
  "Modern Analog",
  "Swiss Clock",
  "Material Clock",
  "Transparent Analog",
  "Neon Analog",
  "Minimal Analog",
  "Vintage Analog",
  "World Clock",
  "Multi Timezone",
  "UTC Clock",
  "Military Clock",
  "Pomodoro Clock",
  "Focus Clock",
  "Study Clock",
  "Work Session Clock",
  "Shift Clock",
  "Sunrise Clock",
  "Particle Clock",
  "Morph Clock",
  "Fluid Clock",
  "Orbit Clock",
  "Circular Clock",
  "Arc Clock",
  "Ring Clock",
  "Gauge Clock",
  "Wheel Clock",
  "Progress Clock",
  "Calendar Clock",
  "Weather Clock",
  "Battery Clock",
  "Event Clock",
  "Moon Clock",
  "Prayer Clock",
  "Countdown Clock",
  "Anniversary Clock",
  "Habit Clock",
  "Health Clock",
  "Stopwatch",
  "Timer",
  "Countdown",
  "Work Break",
  "Sleep Timer",
  "Fitness Timer",
  "Interval Timer",
  "Chess Timer",
  "Cooking Timer",
  "Exam Timer"
];

const CALENDAR_NAMES = [
  "Month View",
  "Week View",
  "Day View",
  "Agenda View",
  "Timeline View",
  "Event List",
  "Birthday Calendar",
  "Anniversary Calendar",
  "Holiday Calendar",
  "Festival Calendar",
  "Work Calendar",
  "Academic Calendar",
  "Project Calendar",
  "Exam Calendar",
  "Meeting Calendar",
  "Family Calendar",
  "Shared Calendar",
  "Shift Calendar",
  "Travel Calendar",
  "Content Calendar",
  "Social Calendar",
  "Subscription Calendar",
  "Habit Calendar",
  "Workout Calendar",
  "Goal Calendar",
  "Lunar Calendar",
  "Panchang Calendar",
  "Islamic Calendar",
  "Chinese Calendar",
  "Finance Calendar",
  "Bill Due Calendar",
  "GST Calendar",
  "Tax Calendar",
  "Income Calendar",
  "Sales Calendar",
  "Attendance Calendar",
  "School Calendar",
  "Medicine Calendar",
  "Pregnancy Calendar",
  "Gardening Calendar",
  "Watering Calendar",
  "Reading Calendar",
  "Journal Calendar",
  "Sleep Calendar",
  "AI Planner Calendar",
  "Productivity Calendar",
  "Weekly Overview",
  "Monthly Insights",
  "Year Progress",
  "Life Calendar"
];

const WEATHER_NAMES = [
  "Current Weather",
  "Hourly Forecast",
  "Weekly Forecast",
  "AQI",
  "UV Index",
  "Wind Speed",
  "Humidity",
  "Rain Chance",
  "Temperature Trend",
  "Sunrise",
  "Sunset",
  "Moon Phase",
  "Pollen",
  "Visibility",
  "Storm Alert",
  "Heat Alert",
  "Snow Forecast",
  "Coastal Weather",
  "Travel Weather",
  "Farming Weather",
  "Running Weather",
  "Cycling Weather",
  "Hiking Weather",
  "Fishing Weather",
  "Beach Weather",
  "Surf Weather",
  "Air Pressure",
  "Dew Point",
  "Feels Like",
  "Radar View",
  "Weather Timeline",
  "Weather Map",
  "Lightning Tracker",
  "Hurricane Tracker",
  "Cloud Coverage",
  "Ski Conditions",
  "Desert Conditions",
  "Mountain Conditions",
  "Health Weather",
  "Allergy Forecast",
  "AQI Ring",
  "AQI Gauge",
  "Dynamic Weather",
  "Animated Weather",
  "Glass Weather",
  "Minimal Weather",
  "Material Weather",
  "NOS Weather",
  "Travel Forecast",
  "Global Weather"
];

const PRODUCTIVITY_NAMES = [
  "To-Do",
  "Tasks",
  "Smart Tasks",
  "Checklist",
  "Daily Plan",
  "Weekly Plan",
  "Monthly Goals",
  "Kanban",
  "Project Board",
  "Focus Task",
  "Deep Work",
  "Pomodoro",
  "Eisenhower Matrix",
  "Habit Tracker",
  "Goal Tracker",
  "Vision Board",
  "Reminder List",
  "Quick Notes",
  "Voice Notes",
  "Sticky Notes",
  "Journal",
  "Brain Dump",
  "Meeting Notes",
  "Daily Reflection",
  "Gratitude",
  "Reading Goals",
  "Study Goals",
  "Learning Tracker",
  "Writing Tracker",
  "Progress Tracker",
  "Assignment Tracker",
  "Sprint Tracker",
  "Milestone Tracker",
  "KPI Tracker",
  "Daily Wins",
  "Weekly Review",
  "Monthly Review",
  "Life Dashboard",
  "Productivity Score",
  "Focus Mode",
  "Work Timer",
  "Break Timer",
  "Priority Board",
  "Time Blocking",
  "Daily Routine",
  "Morning Routine",
  "Night Routine",
  "Decision Matrix",
  "Notes Grid",
  "Calendar Tasks",
  "AI Planner",
  "AI Goals",
  "AI Priorities",
  "AI Insights",
  "Team Tasks",
  "Team Goals",
  "Team Progress",
  "Shared Notes",
  "Shared Projects",
  "Attendance",
  "Time Tracking",
  "Work Hours",
  "Invoice Tracker",
  "Deliverables",
  "OKR Dashboard",
  "Strategic Goals",
  "Content Planner",
  "Social Planner",
  "Launch Planner",
  "Founder Dashboard"
];

const HEALTH_NAMES = [
  "Steps",
  "Calories",
  "Water Intake",
  "Sleep",
  "Weight",
  "BMI",
  "Workout",
  "Running",
  "Cycling",
  "Walking",
  "Meditation",
  "Yoga",
  "Heart Rate",
  "Blood Oxygen",
  "Stress",
  "Mood",
  "Recovery",
  "Activity Ring",
  "Daily Health",
  "Weekly Health",
  "Monthly Health",
  "Fasting",
  "Nutrition",
  "Protein",
  "Carbs",
  "Fat Intake",
  "Vitamins",
  "Medicine Reminder",
  "Hydration Ring",
  "Fitness Goals",
  "Exercise Plan",
  "Gym Progress",
  "PR Tracker",
  "Workout Streak",
  "Calories Burned",
  "Distance Tracker",
  "Sports Tracker",
  "Swim Tracker",
  "Hike Tracker",
  "Menstrual Cycle",
  "Fertility Tracker",
  "Pregnancy Tracker",
  "Baby Growth",
  "Wellness Dashboard",
  "Habit Health",
  "Sleep Quality",
  "Energy Score",
  "Mental Health",
  "Breathing Exercise",
  "Recovery Score",
  "Marathon Prep",
  "Athlete Dashboard",
  "Body Metrics",
  "Smart Scale",
  "ECG",
  "Blood Pressure",
  "Glucose",
  "Health Trends",
  "AI Coach",
  "Health Insights"
];

const FINANCE_NAMES = [
  "Expense Tracker",
  "Income Tracker",
  "Budget Planner",
  "Savings Goal",
  "Net Worth",
  "Cash Flow",
  "Daily Spending",
  "Monthly Spending",
  "Credit Card",
  "Bank Balance",
  "Investment Dashboard",
  "SIP Tracker",
  "Mutual Funds",
  "Stocks",
  "Crypto",
  "Gold Tracker",
  "Silver Tracker",
  "Forex",
  "Portfolio",
  "Dividend Tracker",
  "Loan Tracker",
  "EMI Tracker",
  "Mortgage",
  "Tax Tracker",
  "GST Tracker",
  "GST Due",
  "Invoices",
  "Receivables",
  "Payables",
  "Profit Loss",
  "Revenue",
  "Business Cashflow",
  "Inventory Value",
  "Order Value",
  "Sales Dashboard",
  "Daily Collection",
  "Expenses Breakdown",
  "Subscription Tracker",
  "Rent Tracker",
  "Utility Bills",
  "Insurance",
  "Emergency Fund",
  "Retirement Goal",
  "FIRE Tracker",
  "Wealth Dashboard",
  "Trading Dashboard",
  "Crypto Wallet",
  "AI Budget",
  "AI Spending Insights",
  "AI Investment Insights",
  "Business Finance",
  "Retail Dashboard",
  "Textile Dashboard",
  "GST Sales",
  "GST Purchase",
  "TDS Tracker",
  "Profit Forecast",
  "Business KPI",
  "Financial Calendar",
  "Net Profit"
];

const DEV_NAMES = [
  "GitHub Activity",
  "GitHub PRs",
  "GitHub Issues",
  "GitHub Stars",
  "GitHub Streak",
  "GitLab Activity",
  "Bitbucket Activity",
  "CI/CD Status",
  "Build Status",
  "Deployment Status",
  "Vercel Deployments",
  "Railway Status",
  "Docker Containers",
  "Kubernetes Pods",
  "Server CPU",
  "Server RAM",
  "Disk Usage",
  "Uptime",
  "Error Logs",
  "Sentry Errors",
  "API Health",
  "Endpoint Status",
  "Database Status",
  "PostgreSQL Health",
  "Redis Health",
  "Queue Status",
  "Background Jobs",
  "Cron Monitor",
  "Analytics Dashboard",
  "Revenue Dashboard",
  "SaaS Dashboard",
  "App Downloads",
  "App Ratings",
  "User Activity",
  "Active Users",
  "OpenAI Usage",
  "Claude Usage",
  "Gemini Usage",
  "Token Usage",
  "Cost Dashboard",
  "Domain Status",
  "SSL Status",
  "Security Alerts",
  "Dev News",
  "Stack Overflow Feed",
  "Product Hunt Feed",
  "AI Research Feed",
  "Coding Streak",
  "LeetCode Progress",
  "Developer Command Center"
];

const SOCIAL_NAMES = [
  "WhatsApp",
  "Telegram",
  "Discord",
  "Instagram",
  "Facebook",
  "X Feed",
  "LinkedIn",
  "Reddit",
  "Threads",
  "Snapchat",
  "YouTube Feed",
  "Subscriber Count",
  "Follower Count",
  "Engagement Rate",
  "Likes Dashboard",
  "Comments Dashboard",
  "Messages Dashboard",
  "Social Inbox",
  "Trending Posts",
  "Creator Dashboard",
  "Content Calendar",
  "Analytics Dashboard",
  "Live Stream",
  "Community Activity",
  "Group Activity",
  "Mentions",
  "Notifications",
  "Reels Tracker",
  "Shorts Tracker",
  "Stories Tracker",
  "Channel Growth",
  "Creator Revenue",
  "Watch Time",
  "Audience Insights",
  "Viral Tracker",
  "Brand Mentions",
  "Marketing Dashboard",
  "Campaign Dashboard",
  "Affiliate Dashboard",
  "Ad Performance",
  "AI Content Planner",
  "AI Captions",
  "AI Post Ideas",
  "AI Trends",
  "AI Social Insights",
  "Subscriber Goals",
  "Creator Tasks",
  "Community Health",
  "Social KPI",
  "Social Command Center"
];

const HOME_NAMES = [
  "Lights",
  "Fan",
  "AC",
  "Heater",
  "Smart Lock",
  "Doorbell",
  "Camera",
  "Energy Usage",
  "Water Usage",
  "Solar Dashboard",
  "EV Charger",
  "Smart Plug",
  "Security System",
  "Room Temperature",
  "Humidity",
  "Air Purifier",
  "Vacuum",
  "Smart Scenes",
  "Home Automation",
  "Device Status",
  "Appliance Status",
  "Home Dashboard",
  "Garage Door",
  "Curtains",
  "Garden Watering",
  "Pet Feeder",
  "Smart Speaker",
  "WiFi Dashboard",
  "Internet Speed",
  "Mesh Network",
  "Electricity Cost",
  "Water Tank",
  "Generator",
  "Battery Backup",
  "Home Alerts",
  "Home Security",
  "Presence Detection",
  "Family Tracker",
  "Smart Routines",
  "Home Command Center"
];

const AI_NAMES = [
  "AI Assistant",
  "AI Chat",
  "AI Search",
  "AI Notes",
  "AI Summary",
  "AI Planner",
  "AI Scheduler",
  "AI Goals",
  "AI Tasks",
  "AI Journal",
  "AI Habit Coach",
  "AI Health Coach",
  "AI Fitness Coach",
  "AI Finance Coach",
  "AI Spending Insights",
  "AI Investment Insights",
  "AI Study Coach",
  "AI Language Coach",
  "AI Coding Assistant",
  "AI Code Review",
  "AI Research",
  "AI Daily Brief",
  "AI News",
  "AI Digest",
  "AI Productivity",
  "AI Time Blocking",
  "AI Meeting Notes",
  "AI Email Drafts",
  "AI Writing Assistant",
  "AI Translation",
  "AI Voice Assistant",
  "AI Memory",
  "AI Brainstorm",
  "AI Recommendations",
  "AI Personal Dashboard",
  "AI Business Dashboard",
  "AI Startup Dashboard",
  "AI Developer Dashboard",
  "AI CRM",
  "AI Sales Insights",
  "AI Inventory Insights",
  "AI GST Insights",
  "AI Accounting Insights",
  "AI Weather Insights",
  "AI Shopping Assistant",
  "AI Travel Planner",
  "AI Event Planner",
  "AI Home Assistant",
  "AI Smart Home",
  "AI Notifications",
  "AI Market Analysis",
  "AI Stock Analysis",
  "AI Crypto Analysis",
  "AI Trend Analysis",
  "AI Content Generator",
  "AI Image Generator",
  "AI Workflow Builder",
  "AI Automation",
  "AI Command Center",
  "AI Operating System"
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
  // Productivity
  "to-do": "productivity_todo",
  "focus task": "productivity_focus",
  "focus mode": "productivity_focus",
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
  // Social
  "notifications": "social_feed",
  // Smart Home
  "lights": "smart_home_controls",
  // AI
  "ai chat": "ai_chat",
  "ai summary": "ai_summary",
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

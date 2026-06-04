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

// 1. Clock Names (60)
const CLOCK_NAMES = [
  'Minimal Digital', 'NOS Dot Clock', 'AMOLED Digital', 'Retro LED', 'Matrix Clock',
  'Cyber Clock', 'Glass Clock', 'Flip Clock', 'Gradient Clock', 'Liquid Clock',
  'Classic Analog', 'Luxury Analog', 'Skeleton Clock', 'Modern Analog', 'Swiss Clock',
  'Material Clock', 'Transparent Analog', 'Neon Analog', 'Minimal Analog', 'Vintage Analog',
  'World Clock', 'Multi Timezone', 'UTC Clock', 'Military Clock', 'Pomodoro Clock',
  'Focus Clock', 'Study Clock', 'Work Session Clock', 'Shift Clock', 'Sunrise Clock',
  'Particle Clock', 'Morph Clock', 'Fluid Clock', 'Orbit Clock', 'Circular Clock',
  'Arc Clock', 'Ring Clock', 'Gauge Clock', 'Wheel Clock', 'Progress Clock',
  'Calendar Clock', 'Weather Clock', 'Battery Clock', 'Event Clock', 'Moon Clock',
  'Prayer Clock', 'Countdown Clock', 'Anniversary Clock', 'Habit Clock', 'Health Clock',
  'Stopwatch', 'Timer', 'Countdown', 'Work Break', 'Sleep Timer',
  'Fitness Timer', 'Interval Timer', 'Chess Timer', 'Cooking Timer', 'Exam Timer'
];

// 2. Calendar Names (50)
const CALENDAR_NAMES = [
  'Month View', 'Week View', 'Day View', 'Agenda View', 'Timeline View',
  'Event List', 'Birthday Calendar', 'Anniversary Calendar', 'Holiday Calendar', 'Festival Calendar',
  'Work Calendar', 'Academic Calendar', 'Project Calendar', 'Exam Calendar', 'Meeting Calendar',
  'Family Calendar', 'Shared Calendar', 'Shift Calendar', 'Travel Calendar', 'Content Calendar',
  'Social Calendar', 'Subscription Calendar', 'Habit Calendar', 'Workout Calendar', 'Goal Calendar',
  'Lunar Calendar', 'Panchang Calendar', 'Islamic Calendar', 'Chinese Calendar', 'Finance Calendar',
  'Bill Due Calendar', 'GST Calendar', 'Tax Calendar', 'Income Calendar', 'Sales Calendar',
  'Attendance Calendar', 'School Calendar', 'Medicine Calendar', 'Pregnancy Calendar', 'Gardening Calendar',
  'Watering Calendar', 'Reading Calendar', 'Journal Calendar', 'Sleep Calendar', 'AI Planner Calendar',
  'Productivity Calendar', 'Weekly Overview', 'Monthly Insights', 'Year Progress', 'Life Calendar'
];

// 3. Weather Names (50)
const WEATHER_NAMES = [
  'Current Weather', 'Hourly Forecast', 'Weekly Forecast', 'AQI', 'UV Index',
  'Wind Speed', 'Humidity', 'Rain Chance', 'Temperature Trend', 'Sunrise',
  'Sunset', 'Moon Phase', 'Pollen', 'Visibility', 'Storm Alert',
  'Heat Alert', 'Snow Forecast', 'Coastal Weather', 'Travel Weather', 'Farming Weather',
  'Running Weather', 'Cycling Weather', 'Hiking Weather', 'Fishing Weather', 'Beach Weather',
  'Surf Weather', 'Air Pressure', 'Dew Point', 'Feels Like', 'Radar View',
  'Weather Timeline', 'Weather Map', 'Lightning Tracker', 'Hurricane Tracker', 'Cloud Coverage',
  'Ski Conditions', 'Desert Conditions', 'Mountain Conditions', 'Health Weather', 'Allergy Forecast',
  'AQI Ring', 'AQI Gauge', 'Dynamic Weather', 'Animated Weather', 'Glass Weather',
  'Minimal Weather', 'Material Weather', 'NOS Weather', 'Travel Forecast', 'Global Weather'
];

// 4. Productivity Names (70)
const PRODUCTIVITY_NAMES = [
  'To-Do', 'Tasks', 'Smart Tasks', 'Checklist', 'Daily Plan',
  'Weekly Plan', 'Monthly Goals', 'Kanban', 'Project Board', 'Focus Task',
  'Deep Work', 'Pomodoro', 'Eisenhower Matrix', 'Habit Tracker', 'Goal Tracker',
  'Vision Board', 'Reminder List', 'Quick Notes', 'Voice Notes', 'Sticky Notes',
  'Journal', 'Brain Dump', 'Meeting Notes', 'Daily Reflection', 'Gratitude',
  'Reading Goals', 'Study Goals', 'Learning Tracker', 'Writing Tracker', 'Progress Tracker',
  'Assignment Tracker', 'Sprint Tracker', 'Milestone Tracker', 'KPI Tracker', 'Daily Wins',
  'Weekly Review', 'Monthly Review', 'Life Dashboard', 'Productivity Score', 'Focus Mode',
  'Work Timer', 'Break Timer', 'Priority Board', 'Time Blocking', 'Daily Routine',
  'Morning Routine', 'Night Routine', 'Decision Matrix', 'Notes Grid', 'Calendar Tasks',
  'AI Planner', 'AI Goals', 'AI Priorities', 'AI Insights', 'Team Tasks',
  'Team Goals', 'Team Progress', 'Shared Notes', 'Shared Projects', 'Attendance',
  'Time Tracking', 'Work Hours', 'Invoice Tracker', 'Deliverables', 'OKR Dashboard',
  'Strategic Goals', 'Content Planner', 'Social Planner', 'Launch Planner', 'Founder Dashboard'
];

// 5. Health & Fitness Names (60)
const HEALTH_NAMES = [
  'Steps', 'Calories', 'Water Intake', 'Sleep', 'Weight',
  'BMI', 'Workout', 'Running', 'Cycling', 'Walking',
  'Meditation', 'Yoga', 'Heart Rate', 'Blood Oxygen', 'Stress',
  'Mood', 'Recovery', 'Activity Ring', 'Daily Health', 'Weekly Health',
  'Monthly Health', 'Fasting', 'Nutrition', 'Protein', 'Carbs',
  'Fat Intake', 'Vitamins', 'Medicine Reminder', 'Hydration Ring', 'Fitness Goals',
  'Exercise Plan', 'Gym Progress', 'PR Tracker', 'Workout Streak', 'Calories Burned',
  'Distance Tracker', 'Sports Tracker', 'Swim Tracker', 'Hike Tracker', 'Menstrual Cycle',
  'Fertility Tracker', 'Pregnancy Tracker', 'Baby Growth', 'Wellness Dashboard', 'Habit Health',
  'Sleep Quality', 'Energy Score', 'Mental Health', 'Breathing Exercise', 'Recovery Score',
  'Marathon Prep', 'Athlete Dashboard', 'Body Metrics', 'Smart Scale', 'ECG',
  'Blood Pressure', 'Glucose', 'Health Trends', 'AI Coach', 'Health Insights'
];

// 6. Finance Names (60)
const FINANCE_NAMES = [
  'Expense Tracker', 'Income Tracker', 'Budget Planner', 'Savings Goal', 'Net Worth',
  'Cash Flow', 'Daily Spending', 'Monthly Spending', 'Credit Card', 'Bank Balance',
  'Investment Dashboard', 'SIP Tracker', 'Mutual Funds', 'Stocks', 'Crypto',
  'Gold Tracker', 'Silver Tracker', 'Forex', 'Portfolio', 'Dividend Tracker',
  'Loan Tracker', 'EMI Tracker', 'Mortgage', 'Tax Tracker', 'GST Tracker',
  'GST Due', 'Invoices', 'Receivables', 'Payables', 'Profit Loss',
  'Revenue', 'Business Cashflow', 'Inventory Value', 'Order Value', 'Sales Dashboard',
  'Daily Collection', 'Expenses Breakdown', 'Subscription Tracker', 'Rent Tracker', 'Utility Bills',
  'Insurance', 'Emergency Fund', 'Retirement Goal', 'FIRE Tracker', 'Wealth Dashboard',
  'Trading Dashboard', 'Crypto Wallet', 'AI Budget', 'AI Spending Insights', 'AI Investment Insights',
  'Business Finance', 'Retail Dashboard', 'Textile Dashboard', 'GST Sales', 'GST Purchase',
  'TDS Tracker', 'Profit Forecast', 'Business KPI', 'Financial Calendar', 'Net Profit'
];

// 7. Developer Names (50)
const DEV_NAMES = [
  'GitHub Activity', 'GitHub PRs', 'GitHub Issues', 'GitHub Stars', 'GitHub Streak',
  'GitLab Activity', 'Bitbucket Activity', 'CI/CD Status', 'Build Status', 'Deployment Status',
  'Vercel Deployments', 'Railway Status', 'Docker Containers', 'Kubernetes Pods', 'Server CPU',
  'Server RAM', 'Disk Usage', 'Uptime', 'Error Logs', 'Sentry Errors',
  'API Health', 'Endpoint Status', 'Database Status', 'PostgreSQL Health', 'Redis Health',
  'Queue Status', 'Background Jobs', 'Cron Monitor', 'Analytics Dashboard', 'Revenue Dashboard',
  'SaaS Dashboard', 'App Downloads', 'App Ratings', 'User Activity', 'Active Users',
  'OpenAI Usage', 'Claude Usage', 'Gemini Usage', 'Token Usage', 'Cost Dashboard',
  'Domain Status', 'SSL Status', 'Security Alerts', 'Dev News', 'Stack Overflow Feed',
  'Product Hunt Feed', 'AI Research Feed', 'Coding Streak', 'LeetCode Progress', 'Developer Command Center'
];

// 8. Social Names (50)
const SOCIAL_NAMES = [
  'WhatsApp', 'Telegram', 'Discord', 'Instagram', 'Facebook',
  'X Feed', 'LinkedIn', 'Reddit', 'Threads', 'Snapchat',
  'YouTube Feed', 'Subscriber Count', 'Follower Count', 'Engagement Rate', 'Likes Dashboard',
  'Comments Dashboard', 'Messages Dashboard', 'Social Inbox', 'Trending Posts', 'Creator Dashboard',
  'Content Calendar', 'Analytics Dashboard', 'Live Stream', 'Group Activity', 'Community Activity',
  'Mentions', 'Notifications', 'Reels Tracker', 'Shorts Tracker', 'Stories Tracker',
  'Channel Growth', 'Creator Revenue', 'Watch Time', 'Audience Insights', 'Viral Tracker',
  'Brand Mentions', 'Marketing Dashboard', 'Campaign Dashboard', 'Affiliate Dashboard', 'Ad Performance',
  'AI Content Planner', 'AI Captions', 'AI Post Ideas', 'AI Trends', 'AI Social Insights',
  'Subscriber Goals', 'Creator Tasks', 'Community Health', 'Social KPI', 'Social Command Center'
];

// 9. Smart Home Names (40)
const HOME_NAMES = [
  'Lights', 'Fan', 'AC', 'Heater', 'Smart Lock',
  'Doorbell', 'Camera', 'Energy Usage', 'Water Usage', 'Solar Dashboard',
  'EV Charger', 'Smart Plug', 'Security System', 'Room Temperature', 'Humidity',
  'Air Purifier', 'Vacuum', 'Smart Scenes', 'Home Automation', 'Device Status',
  'Appliance Status', 'Home Dashboard', 'Garage Door', 'Curtains', 'Garden Watering',
  'Pet Feeder', 'Smart Speaker', 'WiFi Dashboard', 'Internet Speed', 'Mesh Network',
  'Electricity Cost', 'Water Tank', 'Generator', 'Battery Backup', 'Home Alerts',
  'Home Security', 'Presence Detection', 'Family Tracker', 'Smart Routines', 'Home Command Center'
];

// 10. AI Names (60)
const AI_NAMES = [
  'AI Assistant', 'AI Chat', 'AI Search', 'AI Notes', 'AI Summary',
  'AI Planner', 'AI Scheduler', 'AI Goals', 'AI Tasks', 'AI Journal',
  'AI Habit Coach', 'AI Health Coach', 'AI Fitness Coach', 'AI Finance Coach', 'AI Spending Insights',
  'AI Investment Insights', 'AI Study Coach', 'AI Language Coach', 'AI Coding Assistant', 'AI Code Review',
  'AI Research', 'AI Daily Brief', 'AI News', 'AI Digest', 'AI Productivity',
  'AI Time Blocking', 'AI Meeting Notes', 'AI Email Drafts', 'AI Writing Assistant', 'AI Translation',
  'AI Voice Assistant', 'AI Memory', 'AI Brainstorm', 'AI Recommendations', 'AI Personal Dashboard',
  'AI Business Dashboard', 'AI Startup Dashboard', 'AI Developer Dashboard', 'AI CRM', 'AI Sales Insights',
  'AI Inventory Insights', 'AI GST Insights', 'AI Accounting Insights', 'AI Weather Insights', 'AI Shopping Assistant',
  'AI Travel Planner', 'AI Event Planner', 'AI Home Assistant', 'AI Smart Home', 'AI Notifications',
  'AI Market Analysis', 'AI Stock Analysis', 'AI Crypto Analysis', 'AI Trend Analysis', 'AI Content Generator',
  'AI Image Generator', 'AI Workflow Builder', 'AI Automation', 'AI Command Center', 'AI Operating System'
];

// Registry Mapping Helper
const buildRegistry = (): Record<string, WidgetTemplate> => {
  const registry: Record<string, WidgetTemplate> = {};

  const addItems = (names: string[], category: WidgetCategory) => {
    names.forEach((name, idx) => {
      const cleanId = `${category}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
      
      // Determine sizes based on name properties
      let defaultWidth = 2;
      let defaultHeight = 2;

      const isLarge = name.includes('View') || name.includes('Dashboard') || name.includes('Grid') || 
                      name.includes('Map') || name.includes('Board') || name.includes('Matrix') || 
                      name.includes('Outlook') || name.includes('Overview') || name.includes('Console') ||
                      name.includes('Activity') || name.includes('Planner');

      const isWide = name.includes('Weekly') || name.includes('Forecast') || name.includes('Timeline') || 
                     name.includes('Agenda') || name.includes('Summary') || name.includes('Brief') || 
                     name.includes('Progress') || name.includes('Expense') || name.includes('Stocks') || 
                     name.includes('Streak') || name.includes('Feed');

      if (isLarge) {
        defaultWidth = 4;
        defaultHeight = 4;
      } else if (isWide) {
        defaultWidth = 4;
        defaultHeight = 2;
      }

      // Assign Icon names programmatically
      let iconName = 'Layout';
      const lowercaseName = name.toLowerCase();

      if (lowercaseName.includes('clock') || lowercaseName.includes('time') || lowercaseName.includes('digital') || lowercaseName.includes('analog') || lowercaseName.includes('military') || lowercaseName.includes('timezone')) {
        iconName = 'Clock';
      } else if (lowercaseName.includes('stopwatch') || lowercaseName.includes('timer') || lowercaseName.includes('countdown')) {
        iconName = 'Timer';
      } else if (lowercaseName.includes('calendar') || lowercaseName.includes('view') || lowercaseName.includes('agenda') || lowercaseName.includes('event')) {
        iconName = 'Calendar';
      } else if (lowercaseName.includes('weather') || lowercaseName.includes('forecast') || lowercaseName.includes('temp') || lowercaseName.includes('sun') || lowercaseName.includes('sunset') || lowercaseName.includes('sunrise') || lowercaseName.includes('rain') || lowercaseName.includes('aqi') || lowercaseName.includes('storm')) {
        iconName = 'CloudSun';
      } else if (lowercaseName.includes('task') || lowercaseName.includes('todo') || lowercaseName.includes('plan') || lowercaseName.includes('check') || lowercaseName.includes('goal')) {
        iconName = 'CheckSquare';
      } else if (lowercaseName.includes('step') || lowercaseName.includes('run') || lowercaseName.includes('walk') || lowercaseName.includes('health') || lowercaseName.includes('sleep') || lowercaseName.includes('water') || lowercaseName.includes('mood') || lowercaseName.includes('heart')) {
        iconName = 'Heart';
      } else if (lowercaseName.includes('expense') || lowercaseName.includes('budget') || lowercaseName.includes('spend') || lowercaseName.includes('stock') || lowercaseName.includes('crypto') || lowercaseName.includes('portfolio') || lowercaseName.includes('profit') || lowercaseName.includes('invoice') || lowercaseName.includes('gst')) {
        iconName = 'Coins';
      } else if (lowercaseName.includes('github') || lowercaseName.includes('gitlab') || lowercaseName.includes('ci/cd') || lowercaseName.includes('build') || lowercaseName.includes('deploy') || lowercaseName.includes('server') || lowercaseName.includes('cpu') || lowercaseName.includes('ram') || lowercaseName.includes('db') || lowercaseName.includes('code')) {
        iconName = 'Terminal';
      } else if (lowercaseName.includes('whatsapp') || lowercaseName.includes('telegram') || lowercaseName.includes('discord') || lowercaseName.includes('instagram') || lowercaseName.includes('message') || lowercaseName.includes('social') || lowercaseName.includes('inbox') || lowercaseName.includes('feed')) {
        iconName = 'MessageSquare';
      } else if (lowercaseName.includes('light') || lowercaseName.includes('fan') || lowercaseName.includes('ac') || lowercaseName.includes('door') || lowercaseName.includes('lock') || lowercaseName.includes('plug') || lowercaseName.includes('speaker') || lowercaseName.includes('wifi') || lowercaseName.includes('home')) {
        iconName = 'Home';
      } else if (lowercaseName.includes('ai') || lowercaseName.includes('assistant') || lowercaseName.includes('summary') || lowercaseName.includes('brief') || lowercaseName.includes('coach')) {
        iconName = 'Sparkles';
      }

      registry[cleanId] = {
        id: cleanId,
        name,
        category,
        defaultWidth,
        defaultHeight,
        defaultTitle: name.toUpperCase(),
        defaultValue: `${name} value descriptor.`,
        iconName,
        description: `Premium interactive widget representing ${name} configured for ${category} collection.`
      };
    });
  };

  addItems(CLOCK_NAMES, 'clock');
  addItems(CALENDAR_NAMES, 'calendar');
  addItems(WEATHER_NAMES, 'weather');
  addItems(PRODUCTIVITY_NAMES, 'productivity');
  addItems(HEALTH_NAMES, 'health');
  addItems(FINANCE_NAMES, 'finance');
  addItems(DEV_NAMES, 'developer');
  addItems(SOCIAL_NAMES, 'social');
  addItems(HOME_NAMES, 'smart_home');
  addItems(AI_NAMES, 'ai');

  return registry;
};

export const widgetRegistry = buildRegistry();

export const getTemplateById = (id: string): WidgetTemplate => {
  return widgetRegistry[id] || widgetRegistry.clock_minimal_digital;
};

export const getTemplatesByCategory = (category: WidgetCategory): WidgetTemplate[] => {
  return Object.values(widgetRegistry).filter((t) => t.category === category);
};

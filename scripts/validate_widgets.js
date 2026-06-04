const fs = require('fs');
const path = require('path');

const WIDGET_LIST_PATH = path.join(__dirname, '..', 'src', 'widget list.md');
const REGISTRY_PATH = path.join(__dirname, '..', 'src', 'widgets', 'registry.ts');

if (!fs.existsSync(WIDGET_LIST_PATH)) {
  console.error(`Error: widget list.md not found at ${WIDGET_LIST_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(REGISTRY_PATH)) {
  console.error(`Error: registry.ts not found at ${REGISTRY_PATH}`);
  process.exit(1);
}

// 1. Parse widget list.md
const listContent = fs.readFileSync(WIDGET_LIST_PATH, 'utf8');

const categoryMap = {
  '1. Clock Widgets (60)': {
    key: 'clock',
    count: 60,
    names: [
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
    ]
  },
  '2. Calendar Widgets (50)': {
    key: 'calendar',
    count: 50,
    names: [
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
    ]
  },
  '3. Weather Widgets (50)': {
    key: 'weather',
    count: 50,
    names: [
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
    ]
  },
  '4. Productivity Widgets (70)': {
    key: 'productivity',
    count: 70,
    names: [
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
    ]
  },
  '5. Health & Fitness (60)': {
    key: 'health',
    count: 60,
    names: [
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
    ]
  },
  '6. Finance (60)': {
    key: 'finance',
    count: 60,
    names: [
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
    ]
  },
  '7. Developer Widgets (50)': {
    key: 'developer',
    count: 50,
    names: [
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
    ]
  },
  '8. Social Widgets (50)': {
    key: 'social',
    count: 50,
    names: [
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
    ]
  },
  '9. Smart Home (40)': {
    key: 'smart_home',
    count: 40,
    names: [
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
    ]
  },
  '10. AI Widgets (60)': {
    key: 'ai',
    count: 60,
    names: [
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
    ]
  }
};

let currentCategory = null;
const lines = listContent.split('\n');

// Reset names arrays to populate them dynamically from the markdown file
Object.keys(categoryMap).forEach(key => {
  categoryMap[key].names = [];
});

lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') && !trimmed.startsWith('##') && !trimmed.startsWith('###')) {
    // Check if it is a category header
    const cleanHeader = trimmed.replace(/#/g, '').trim();
    const matchedKey = Object.keys(categoryMap).find(cat => cleanHeader.includes(cat));
    if (matchedKey) {
      currentCategory = categoryMap[matchedKey];
    } else {
      currentCategory = null;
    }
  } else if (currentCategory && trimmed) {
    // Match item lines, e.g. "1. Minimal Digital" or "10. Liquid Clock"
    const match = trimmed.match(/^\d+\.\s+(.+)$/);
    if (match) {
      currentCategory.names.push(match[1].trim());
    }
  }
});

console.log('--- WIDGET LIST.MD PARSING REPORT ---');
let totalListCount = 0;
Object.keys(categoryMap).forEach(catHeader => {
  const cat = categoryMap[catHeader];
  console.log(`${catHeader}: Found ${cat.names.length} / ${cat.count} widgets`);
  console.log(`Names: ${cat.names.join(', ')}\n`);
  totalListCount += cat.names.length;
});
console.log(`Total Widgets in list: ${totalListCount}\n`);

if (totalListCount !== 550) {
  console.error(`Error: Total widget count parsed from list is ${totalListCount}, expected 550!`);
  process.exit(1);
}

// 2. Parse registry.ts arrays using Regex
const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');

const parseRegistryArray = (arrayName) => {
  const regex = new RegExp(`const\\s+${arrayName}\\s*=\\s*\\[([\\s\\S]*?)\\];`);
  const match = registryContent.match(regex);
  if (!match) {
    console.error(`Error: Could not find array ${arrayName} in registry.ts`);
    process.exit(1);
  }
  return match[1]
    .split(',')
    .map(name => name.replace(/['"\r\n\t]/g, '').trim())
    .filter(name => name.length > 0);
};

const registryMap = {
  clock: parseRegistryArray('CLOCK_NAMES'),
  calendar: parseRegistryArray('CALENDAR_NAMES'),
  weather: parseRegistryArray('WEATHER_NAMES'),
  productivity: parseRegistryArray('PRODUCTIVITY_NAMES'),
  health: parseRegistryArray('HEALTH_NAMES'),
  finance: parseRegistryArray('FINANCE_NAMES'),
  developer: parseRegistryArray('DEV_NAMES'),
  social: parseRegistryArray('SOCIAL_NAMES'),
  smart_home: parseRegistryArray('HOME_NAMES'),
  ai: parseRegistryArray('AI_NAMES'),
};

console.log('--- REGISTRY.TS PARSING REPORT ---');
let totalRegistryCount = 0;
Object.keys(registryMap).forEach(key => {
  const names = registryMap[key];
  console.log(`Category [${key}]: Found ${names.length} registered names`);
  console.log(`Names: ${names.join(', ')}\n`);
  totalRegistryCount += names.length;
});
console.log(`Total Registered Widgets: ${totalRegistryCount}\n`);

if (totalRegistryCount !== 550) {
  console.error(`Error: Total registered count in registry.ts is ${totalRegistryCount}, expected 550!`);
  process.exit(1);
}

// 3. Assert widget lists are identical
let mismatchCount = 0;

Object.keys(categoryMap).forEach(catHeader => {
  const cat = categoryMap[catHeader];
  const registryNames = registryMap[cat.key];

  cat.names.forEach((name, idx) => {
    // Assert case insensitive match
    const found = registryNames.some(regName => regName.toLowerCase() === name.toLowerCase());
    if (!found) {
      console.error(`[MISMATCH] Mismatch in category ${cat.key}: Widget "${name}" (index ${idx + 1} in list) is missing from registry.ts!`);
      mismatchCount++;
    }
  });
});

console.log('--- VALIDATION SUMMARY ---');
if (mismatchCount === 0) {
  console.log('\x1b[32m%s\x1b[0m', 'SUCCESS: All 550 widgets listed in widget list.md are 100% matched, registered, and accounted for in registry.ts!');
  process.exit(0);
} else {
  console.error(`\x1b[31m%s\x1b[0m`, `FAILURE: Found ${mismatchCount} missing widgets in registry.ts!`);
  process.exit(1);
}

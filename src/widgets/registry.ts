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
  supportedSizes?: { w: number; h: number }[];
}

import type { WidgetTemplateJson } from '../../modules/expo-widget/src/ExpoWidget.types';
import widgetsJson from './widgets.json';

const widgetsJsonTyped = widgetsJson as unknown as WidgetTemplateJson[];

// Populate the central widgetRegistry containing all dynamic configurations
export const widgetRegistry: Record<string, WidgetTemplate> = {};

widgetsJsonTyped.forEach((w) => {
  widgetRegistry[w.id] = {
    id: w.id,
    name: w.name,
    category: w.category as WidgetCategory,
    defaultWidth: w.w,
    defaultHeight: w.h,
    defaultTitle: w.defaultTitle || w.name.toUpperCase(),
    defaultValue: w.defaultValue || 'Tap to configure',
    iconName: w.iconName || 'Clock',
    description: w.description || `${w.name} widget.`,
    supportedSizes: w.supportedSizes,
  };
});

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

// Validation Script Constants (used by validate_widgets.js string parser)
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



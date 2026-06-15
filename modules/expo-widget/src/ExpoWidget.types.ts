/**
 * TypeScript types for the expo-widget package.
 * These define the shape of widget configurations that the native side reads.
 */

/** Supported widget sizes (grid cells) */
export type WidgetSize = '1x1' | '2x1' | '2x2' | '4x2' | '4x4';

/** Click handler action types */
export interface ClickHandler {
  /** Action type: increment a number, toggle a boolean, cycle through values, set a value, or call native API */
  type: 'increment' | 'toggle' | 'cycle' | 'set' | 'native';
  /** State field name to mutate */
  field: string;
  /** For 'increment': amount to add (default: 1) */
  amount?: number;
  /** For 'cycle': array of values to cycle through */
  values?: string[];
  /** For 'set': the value to set */
  value?: any;
  /** Which customization field to update for display (default: 'valueText') */
  displayField?: string;
  /** Format string for the display value. Use {value} as placeholder. */
  displayFormat?: string;
  /** For 'toggle': label when true */
  trueLabel?: string;
  /** For 'toggle': label when false */
  falseLabel?: string;
  /** For 'native': which native action to execute (e.g. 'toggle_torch') */
  nativeAction?: string;
}

/** Full widget customizations — these control what the native widget displays */
export interface WidgetCustomizations {
  // ── Display Text ──
  /** Header label text (uppercased by native side) */
  titleText?: string;
  /** Primary value display */
  valueText?: string;
  /** Secondary info line */
  subValueText?: string;
  /** Footer tag line (uppercased by native side) */
  footerText?: string;

  // ── Colors ──
  /** Background color (#AARRGGBB or #RRGGBB) */
  backgroundColor?: string;
  /** Accent color for dot and footer */
  accentColor?: string;
  /** Main text color */
  textColor?: string;
  /** Sub-value text color */
  subValueColor?: string;

  // ── Progress Bar ──
  /** Whether to show a progress bar */
  showProgressBar?: boolean;
  /** Progress bar current value */
  progressBarValue?: number;
  /** Progress bar maximum value */
  progressBarMax?: number;

  // ── Action Buttons ──
  /** Whether to show the bottom action buttons row */
  showActionButtons?: boolean;
  /** Left button label */
  btnLeftText?: string;
  /** Left button click action ID (matched against clickHandlers) */
  btnLeftAction?: string;
  /** Right button label */
  btnRightText?: string;
  /** Right button click action ID */
  btnRightAction?: string;

  // ── Tap Action ──
  /** What happens when the widget is tapped: 'open_uri', 'open_app', or unset for host app */
  clickAction?: string;
  /** URI to open (for clickAction='open_uri') */
  launchUri?: string;
  /** Package name to launch (for clickAction='open_app') */
  launchPackage?: string;
  /** Activity class to launch */
  launchClass?: string;
  /** Custom intent action string */
  intentAction?: string;
  /** Extras to attach to the custom intent */
  intentExtras?: Record<string, string | boolean | number>;

  // ── RN-only styling (not read by native side) ──
  fontId?: string;
  fontSize?: number;
  backgroundType?: string;
  borderRadius?: number;
  transparency?: number;
  blur?: number;
  shadowType?: string;
  themeOverride?: string;
}

/** Complete widget configuration object */
export interface WidgetConfig {
  /** Unique ID for this widget instance */
  id: string;
  /** Template ID (e.g. 'clock_digital', 'weather_current') */
  templateId: string;
  /** Grid position X (for layout, not used by native) */
  x?: number;
  /** Grid position Y */
  y?: number;
  /** Width in grid cells */
  w: number;
  /** Height in grid cells */
  h: number;
  /** Display customizations */
  customizations: WidgetCustomizations;
  /** Click action handlers (keyed by action ID) */
  clickHandlers?: Record<string, ClickHandler>;
}

/** Configuration template item structure in widgets.json */
export interface WidgetTemplateJson {
  id: string;
  name: string;
  category: string;
  className: string;
  w: number;
  h: number;
  label: string;
  preview: string;
  defaultTitle?: string;
  defaultValue?: string;
  iconName?: string;
  description?: string;
  supportedSizes?: { w: number; h: number }[];
  kotlinCode?: string;
  kotlinImports?: string[];
}


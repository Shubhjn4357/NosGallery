import { useWidgetStore } from '../../../src/store/widgetStore';
import widgetsJson from '../../../src/widgets/widgets.json';

export interface WidgetCustomizations {
  titleText?: string;
  valueText?: string;
  subValueText?: string;
  footerText?: string;
  backgroundColor?: string;
  accentColor?: string;
  textColor?: string;
  subValueColor?: string;
  borderRadius?: number;
  fontSize?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface WidgetConfig {
  id: string;
  templateId: string;
  x?: number;
  y?: number;
  w: number;
  h: number;
  customizations: WidgetCustomizations;
}

export function useWidgetState<T>(field: string, defaultValue: T): [T, (val: T) => void] {
  const store = useWidgetStore();
  const value = (store as unknown as Record<string, unknown>)[field] as T;
  const setterName = `set${field.charAt(0).toUpperCase()}${field.slice(1)}`;
  const setter = (store as unknown as Record<string, (val: T) => void>)[setterName];

  const setValue = (val: T) => {
    if (typeof setter === 'function') {
      setter(val);
    }
  };

  return [value !== undefined ? value : defaultValue, setValue];
}

export function useWidgetConfig(widgetId: string, templateId: string): [WidgetConfig, (config: Partial<WidgetConfig>) => void] {
  const store = useWidgetStore();
  
  const activeWidget = store.widgets.find(w => w.id === widgetId);
  const templateConfig = widgetsJson.find(w => w.id === templateId || w.id === activeWidget?.templateId);
  const defaultCustoms = (templateConfig?.customizations || {}) as WidgetCustomizations;
  
  const config: WidgetConfig = {
    id: widgetId,
    templateId: templateId || activeWidget?.templateId || 'clock_digital',
    w: activeWidget?.w || templateConfig?.w || 2,
    h: activeWidget?.h || templateConfig?.h || 2,
    customizations: {
      ...defaultCustoms
    }
  };

  const setConfig = (newConfig: Partial<WidgetConfig>) => {
    // In-memory update logs
    console.log('[useWidgetConfig] setConfig:', newConfig);
  };

  return [config, setConfig];
}
export type useWidgetStateResult<T> = [T, (val: T) => void];
export type useWidgetConfigResult = [WidgetConfig, (config: Partial<WidgetConfig>) => void];

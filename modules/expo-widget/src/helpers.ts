import type { WidgetConfig, WidgetCustomizations, ClickHandler, WidgetTemplateJson } from './ExpoWidget.types';

import widgetsJson from './widgets.json';

const widgetsJsonTyped = widgetsJson as unknown as WidgetTemplateJson[];

/**
 * Get the native Android widget provider class name based on template ID.
 *
 * @param templateId - The template ID of the widget
 * @returns Provider class name (e.g. "NOSClockDigitalWidget")
 */
export function getWidgetProviderName(templateId: string): string {
  const found = widgetsJsonTyped.find(w => w.id === templateId);
  return found?.className || 'NOSClockDigitalWidget';
}


/**
 * Build a complete WidgetConfig with all native display fields populated.
 * Merges user overrides with sensible defaults.
 *
 * @param id - Unique widget instance ID
 * @param templateId - Template ID (e.g. 'clock_digital')
 * @param w - Width in grid cells
 * @param h - Height in grid cells
 * @param customizations - User customization overrides
 * @param clickHandlers - Optional click handler definitions
 * @returns Complete WidgetConfig ready to be serialized and sent to native
 */
export function buildWidgetConfig(
  id: string,
  templateId: string,
  w: number,
  h: number,
  customizations: Partial<WidgetCustomizations> = {},
  clickHandlers?: Record<string, ClickHandler>
): WidgetConfig {
  const config: WidgetConfig = {
    id,
    templateId,
    x: 0,
    y: 0,
    w,
    h,
    customizations: {
      titleText: 'NOS WIDGET',
      valueText: '--',
      subValueText: '',
      footerText: 'NOS • STUDIO',
      backgroundColor: '#FF000000',
      accentColor: '#FFff0000',
      textColor: '#FFFFFFFF',
      showProgressBar: false,
      progressBarValue: 0,
      progressBarMax: 100,
      showActionButtons: false,
      ...customizations,
    },
  };

  if (clickHandlers) {
    config.clickHandlers = clickHandlers;
  }

  return config;
}

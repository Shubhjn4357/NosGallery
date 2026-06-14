import type { WidgetConfig, WidgetCustomizations, ClickHandler } from './ExpoWidget.types';

/**
 * Get the native Android widget provider class name based on widget size.
 * Maps grid dimensions to the 5 size-based provider classes.
 *
 * @param w - Width in grid cells
 * @param h - Height in grid cells
 * @returns Provider class name (e.g. "NOSWidget2x2")
 */
export function getWidgetProviderName(w: number, h: number): string {
  // Clamp to supported sizes
  const validSizes: Record<string, string> = {
    '1x1': 'NOSWidget1x1',
    '2x1': 'NOSWidget2x1',
    '2x2': 'NOSWidget2x2',
    '4x2': 'NOSWidget4x2',
    '4x4': 'NOSWidget4x4',
  };
  const key = `${w}x${h}`;
  return validSizes[key] || 'NOSWidget2x2';
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

import { useMemo } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { ThemeId, themes, ThemeConfig } from '../themes/themes';
import { getFontStyle } from '../fonts/fonts';
import { WidgetCustomizations } from '../store/widgetStore';

export const useWidgetStyle = (customizations: WidgetCustomizations, globalTheme: ThemeId) => {
  const styles = useMemo(() => {
    const activeThemeId = customizations.themeOverride && customizations.themeOverride !== 'none'
      ? customizations.themeOverride
      : globalTheme;

    const themeConfig: ThemeConfig = themes[activeThemeId] || themes.nos;
    const fontStyle = getFontStyle(customizations.fontId);

    const accent = customizations.accentColor || themeConfig.accentColor;
    const opacity = 1 - (customizations.transparency / 100);

    // 1. Resolve Background Style
    let backgroundStyle: ViewStyle = {};
    if (customizations.backgroundType === 'none') {
      backgroundStyle = { backgroundColor: 'transparent' };
    } else if (customizations.backgroundType === 'glass') {
      backgroundStyle = {
        backgroundColor: `rgba(255, 255, 255, ${0.12 * opacity})`,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
      };
    } else if (customizations.backgroundType === 'gradient') {
      const colors = customizations.gradientColors || themeConfig.gradient || ['#333333', '#111111'];
      backgroundStyle = { backgroundColor: colors[0] };
    } else {
      // Solid background
      const baseColor = customizations.backgroundColor || themeConfig.backgroundColor;
      if (baseColor.startsWith('#')) {
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        backgroundStyle = { backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})` };
      } else {
        backgroundStyle = { backgroundColor: baseColor };
      }
    }

    // 2. Resolve Border Style
    const borderStyle: ViewStyle = {
      borderRadius: customizations.borderRadius !== undefined ? customizations.borderRadius : themeConfig.borderRadius,
      borderWidth: themeConfig.borderWidth,
      borderColor: activeThemeId === 'amoled' || activeThemeId === 'cyberpunk' || activeThemeId === 'luxury'
        ? accent
        : themeConfig.borderColor,
    };

    // 3. Resolve Shadow Style
    let shadowStyle: ViewStyle = {};
    if (customizations.shadowType === 'glow') {
      shadowStyle = {
        shadowColor: accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
        elevation: 8,
      };
    } else if (customizations.shadowType === 'soft') {
      shadowStyle = {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
      };
    } else if (customizations.shadowType === 'medium') {
      shadowStyle = {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
      };
    } else if (customizations.shadowType === 'hard') {
      shadowStyle = {
        shadowColor: themeConfig.textColor,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 0,
        elevation: 4,
      };
    }

    // 4. Resolve Typography Styles
    const textStyle: TextStyle = {
      fontFamily: fontStyle.fontFamily,
      color: customizations.textColor || themeConfig.textColor,
      letterSpacing: fontStyle.letterSpacing,
      textTransform: fontStyle.textTransform || 'none',
    };

    const subtextStyle: TextStyle = {
      fontFamily: fontStyle.fontFamily,
      color: themeConfig.subtextColor,
      letterSpacing: fontStyle.letterSpacing,
      opacity: 0.85,
    };

    // Resolve theme-specific semantic colors
    let successColor = '#34c759';
    let errorColor = '#ff3b30';
    let warningColor = '#ff9500';

    if (activeThemeId === 'nos') {
      successColor = '#ffffff';
      errorColor = '#ff0000';
      warningColor = '#888888';
    } else if (activeThemeId === 'luxury') {
      successColor = '#dfba6b';
      errorColor = '#cf352e';
      warningColor = '#df8d4f';
    } else if (activeThemeId === 'cyberpunk' || activeThemeId === 'amoled') {
      successColor = '#39ff14';
      errorColor = '#ff0055';
      warningColor = '#f1f100';
    } else if (activeThemeId === 'glassmorphism') {
      successColor = 'rgba(52, 199, 89, 0.8)';
      errorColor = 'rgba(255, 59, 48, 0.8)';
      warningColor = 'rgba(255, 149, 0, 0.8)';
    }

    return {
      containerStyle: {
        ...backgroundStyle,
        ...borderStyle,
        ...shadowStyle,
      } as ViewStyle,
      textStyle,
      subtextStyle,
      accentColor: accent,
      successColor,
      errorColor,
      warningColor,
      themeConfig,
    };
  }, [customizations, globalTheme]);

  return styles;
};
export type WidgetStyleResult = ReturnType<typeof useWidgetStyle>;

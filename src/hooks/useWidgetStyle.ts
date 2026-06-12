import { useMemo } from 'react';
import { ViewStyle, TextStyle, Platform } from 'react-native';
import { ThemeId, themes, ThemeConfig } from '../themes/themes';
import { getFontStyle } from '../fonts/fonts';

export const useWidgetStyle = (customizations: any, globalTheme?: ThemeId) => {
  const activeThemeId = (globalTheme || (typeof customizations === 'string' ? customizations : 'nos')) as ThemeId;
  return useMemo(() => {
    const themeConfig: ThemeConfig = themes[activeThemeId] || themes.nos;
    
    // Choose font based on theme
    const fontId = activeThemeId === 'nos' ? 'nos_dot' : 'inter';
    const fontStyle = getFontStyle(fontId);
    const accent = themeConfig.accentColor;

    // 1. Resolve Background Style
    let backgroundStyle: ViewStyle = {};
    if (activeThemeId === 'glassmorphism') {
      backgroundStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
      };
    } else if (activeThemeId === 'liquidglass') {
      backgroundStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        borderColor: 'rgba(255, 255, 255, 0.35)',
        borderWidth: 1.5,
      };
    } else if (themeConfig.gradient) {
      backgroundStyle = { backgroundColor: themeConfig.gradient[0] };
    } else {
      backgroundStyle = { backgroundColor: themeConfig.backgroundColor };
    }

    // 2. Resolve Border Style
    const borderStyle: ViewStyle = {
      borderRadius: themeConfig.borderRadius,
      borderWidth: themeConfig.borderWidth,
      borderColor: activeThemeId === 'amoled' || activeThemeId === 'cyberpunk' || activeThemeId === 'luxury'
        ? accent
        : themeConfig.borderColor,
    };

    // 3. Resolve Shadow Style
    let shadowStyle: ViewStyle = {};
    if (Platform.OS === 'web') {
      if (themeConfig.glow) {
        shadowStyle = {
          boxShadow: `0px 0px 12px ${accent}`,
        } as any;
      } else {
        shadowStyle = {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        } as any;
      }
    } else {
      if (themeConfig.glow) {
        shadowStyle = {
          shadowColor: accent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 12,
          elevation: 8,
        };
      } else {
        shadowStyle = {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 2,
        };
      }
    }

    // 4. Resolve Typography Styles
    const textStyle: TextStyle = {
      fontFamily: fontStyle.fontFamily,
      color: themeConfig.textColor,
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
    let errorColor = '#7C9EFF';
    let warningColor = '#ff9500';

    if (activeThemeId === 'nos') {
      successColor = '#ffffff';
      errorColor = '#7C9EFF';
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
  }, [activeThemeId]);
};

export type WidgetStyleResult = ReturnType<typeof useWidgetStyle>;

import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface NOSWidgetProps {
  widgets: any[];
  activeTheme: string;
}

export function NOSWidgetComponent({ widgets, activeTheme }: NOSWidgetProps) {
  // Determine accent color based on theme
  let accentColor: `#${string}` = '#7C9EFF'; // Nothing OS signature red
  let backgroundColor: `#${string}` = '#000000';
  let textColor: `#${string}` = '#ffffff';
  let borderColor: `#${string}` = '#222222';
  const borderRadius = 16;

  if (activeTheme === 'amoled') {
    accentColor = '#39ff14'; // Neon green
  } else if (activeTheme === 'cyberpunk') {
    accentColor = '#00ffff'; // Neon cyan
    backgroundColor = '#1a0826';
    borderColor = '#ff0055';
  } else if (activeTheme === 'luxury') {
    accentColor = '#dfba6b'; // Gold
    backgroundColor = '#0a0a0a';
  } else if (activeTheme === 'native' || activeTheme === 'materialyou') {
    accentColor = '#007aff';
    backgroundColor = '#f2f2f7';
    textColor = '#000000';
  }

  // Handle empty state
  if (widgets.length === 0) {
    return (
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          backgroundColor,
          padding: 16,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius,
        }}
      >
        <TextWidget
          text="N O S  G A L L E R Y"
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: accentColor,
            marginBottom: 6,
          }}
        />
        <TextWidget
          text="Open the app to add interactive widgets."
          style={{
            fontSize: 10,
            color: textColor,
            textAlign: 'center',
          }}
        />
      </FlexWidget>
    );
  }

  // Render the first 1 or 2 widgets configured by the user
  const displayWidgets = widgets.slice(0, 2);

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius,
      }}
    >
      {displayWidgets.map((w, idx) => {
        const title = w.customizations?.titleText || 'WIDGET';
        const value = w.customizations?.valueText || 'Active';
        const widgetAccent: `#${string}` = w.customizations?.accentColor || accentColor;
        const textMutedColor: `#${string}` = activeTheme === 'native' || activeTheme === 'materialyou' ? '#666666' : '#999999';

        return (
          <FlexWidget
            key={w.id || idx}
            style={{
              flex: 1,
              height: 'match_parent',
              backgroundColor: activeTheme === 'nos' ? '#0c0c0c' : 'rgba(255, 255, 255, 0.03)' as any,
              borderRadius: 12,
              padding: 8,
              marginHorizontal: displayWidgets.length > 1 ? 4 : 0,
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderWidth: 1,
              borderColor,
            }}
          >
            {/* Header info */}
            <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 'match_parent', justifyContent: 'space-between' }}>
              <TextWidget
                text={title.toUpperCase()}
                style={{
                  fontSize: 7,
                  fontWeight: 'bold',
                  color: textMutedColor,
                }}
              />
              <TextWidget
                text="•"
                style={{
                  fontSize: 8,
                  color: widgetAccent,
                }}
              />
            </FlexWidget>

            {/* Main Value Display */}
            <TextWidget
              text={value}
              style={{
                fontSize: w.w === 4 ? 18 : 14,
                fontWeight: 'bold',
                color: textColor,
                marginTop: 6,
              }}
            />

            {/* Bottom dot decorative indicator */}
            <TextWidget
              text="NOS • STUDIO"
              style={{
                fontSize: 6,
                fontWeight: 'bold',
                color: widgetAccent,
                marginTop: 6,
              }}
            />
          </FlexWidget>
        );
      })}
    </FlexWidget>
  );
}

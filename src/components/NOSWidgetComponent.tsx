import React from 'react';
import { FlexWidget, TextWidget, ColorProp } from 'react-native-android-widget';
import { ThemeId, themes } from '../themes/themes';

interface NOSWidgetProps {
  widgets: any[];
  activeTheme: string;
}

function renderNativeWidgetContent(w: any, accentColor: ColorProp, textColor: ColorProp, subtextColor: ColorProp) {
  const template = w.templateId || '';
  const title = (w.customizations?.titleText || w.name || 'WIDGET').toUpperCase();
  const value = w.customizations?.valueText || '';

  // 1. CLOCK WIDGETS
  if (template.startsWith('clock_')) {
    let timeText = value || '10:42 PM';
    let sub = 'SAT, JUN 06';
    if (template.includes('stopwatch') || template.includes('timer') || template.includes('countdown')) {
      timeText = value || '00:00.0';
      sub = 'STOPWATCH';
    } else if (template.includes('analog')) {
      timeText = '10:42';
      sub = 'ANALOG CLOCK';
    } else if (template.includes('flip')) {
      timeText = '21:09';
      sub = 'FLIP CLOCK';
    }
    
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ marginVertical: 4 }}>
          <TextWidget text={timeText} style={{ fontSize: 20, fontWeight: 'bold', color: textColor }} />
        </FlexWidget>
        <TextWidget text={sub} style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // 2. CALENDAR WIDGETS
  if (template.startsWith('calendar_')) {
    if (template.includes('progress')) {
      // ProgressBar layout using flexes
      return (
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
            <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
          </FlexWidget>
          <FlexWidget style={{ width: 'match_parent', marginVertical: 4 }}>
            <TextWidget text={value || '43%'} style={{ fontSize: 13, fontWeight: 'bold', color: textColor }} />
            {/* Progress Bar Container */}
            <FlexWidget style={{ width: 'match_parent', height: 4, backgroundColor: '#222222' as ColorProp, borderRadius: 2, marginTop: 4, flexDirection: 'row' }}>
              <FlexWidget style={{ flex: 43, height: 'match_parent', backgroundColor: accentColor, borderRadius: 2 }} />
              <FlexWidget style={{ flex: 57, height: 'match_parent', backgroundColor: 'transparent' as ColorProp }} />
            </FlexWidget>
          </FlexWidget>
          <TextWidget text="YEAR PROGRESS" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
        </FlexWidget>
      );
    }
    
    if (template.includes('agenda') || template.includes('list') || template.includes('timeline')) {
      // Agenda List layout
      return (
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
            <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
          </FlexWidget>
          <FlexWidget style={{ marginVertical: 2, gap: 1 } as any}>
            <TextWidget text="▪ 09:30 AM Daily Sync" style={{ fontSize: 8, color: textColor }} />
            <TextWidget text="▪ 11:00 AM Sprint Review" style={{ fontSize: 8, color: textColor }} />
          </FlexWidget>
          <TextWidget text="UPCOMING EVENTS" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
        </FlexWidget>
      );
    }
    
    // Monthly Calendar layout (Mini Grid)
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ marginVertical: 2, width: 'match_parent' }}>
          {/* Days row */}
          <TextWidget text="S  M  T  W  T  F  S" style={{ fontSize: 7, color: subtextColor, fontWeight: 'bold' }} />
          {/* Days line */}
          <TextWidget text="3  4  5  [6]  7  8  9" style={{ fontSize: 7, color: textColor, fontWeight: 'bold', marginTop: 2 }} />
        </FlexWidget>
        <TextWidget text="JUNE 2026" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // 3. WEATHER WIDGETS
  if (template.startsWith('weather_')) {
    let temp = value || '18°C';
    let status = 'RAIN';
    if (template.includes('aqi')) {
      temp = value || '12 AQI';
      status = 'EXCELLENT';
    }
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ marginVertical: 4 }}>
          <TextWidget text={temp} style={{ fontSize: 20, fontWeight: 'bold', color: textColor }} />
        </FlexWidget>
        <TextWidget text={status} style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // 4. PRODUCTIVITY WIDGETS
  if (template.startsWith('productivity_')) {
    if (template.includes('todo') || template.includes('task') || template.includes('checklist')) {
      return (
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
            <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
          </FlexWidget>
          <FlexWidget style={{ marginVertical: 2, gap: 1 } as any}>
            <TextWidget text="☑ Deploy Branch" style={{ fontSize: 8, color: textColor }} />
            <TextWidget text="☐ Refactor Store" style={{ fontSize: 8, color: textColor }} />
          </FlexWidget>
          <TextWidget text="TODO LIST" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
        </FlexWidget>
      );
    }
    // Pomodoro Timer layout
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ marginVertical: 4 }}>
          <TextWidget text={value || '25:00'} style={{ fontSize: 18, fontWeight: 'bold', color: textColor }} />
        </FlexWidget>
        <TextWidget text="DEEP WORK Focus" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // 5. HEALTH WIDGETS
  if (template.startsWith('health_')) {
    let healthVal = value || '8,432 steps';
    let label = 'STEPS GOAL';
    let progressPct = 84;
    let showProgress = true;
    if (template.includes('water')) {
      healthVal = value || '1,200 ml';
      label = 'WATER INTAKE';
      progressPct = 48;
    } else if (template.includes('breath') || template.includes('meditation')) {
      healthVal = 'Ready';
      label = 'BREATHE WORK';
      showProgress = false;
    }

    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ width: 'match_parent', marginVertical: 4 }}>
          <TextWidget text={healthVal} style={{ fontSize: 13, fontWeight: 'bold', color: textColor }} />
          {showProgress && (
            <FlexWidget style={{ width: 'match_parent', height: 4, backgroundColor: '#222222' as ColorProp, borderRadius: 2, marginTop: 4, flexDirection: 'row' }}>
              <FlexWidget style={{ flex: progressPct, height: 'match_parent', backgroundColor: accentColor, borderRadius: 2 }} />
              <FlexWidget style={{ flex: 100 - progressPct, height: 'match_parent', backgroundColor: 'transparent' as ColorProp }} />
            </FlexWidget>
          )}
        </FlexWidget>
        <TextWidget text={label} style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // 6. FINANCE WIDGETS
  if (template.startsWith('finance_')) {
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ marginVertical: 4 }}>
          <TextWidget text={value || '$67,490'} style={{ fontSize: 15, fontWeight: 'bold', color: textColor }} />
        </FlexWidget>
        <TextWidget text="+2.4% Ticker Up" style={{ fontSize: 7, fontWeight: 'bold', color: '#39ff14' as ColorProp }} />
      </FlexWidget>
    );
  }

  // 7. DEVELOPER WIDGETS
  if (template.startsWith('developer_')) {
    if (template.includes('git')) {
      // 5x2 grid of commits boxes!
      return (
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
            <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
          </FlexWidget>
          {/* Commits Grid Simulation */}
          <FlexWidget style={{ marginVertical: 4, flexDirection: 'column', gap: 2 } as any}>
            <FlexWidget style={{ flexDirection: 'row', gap: 2 } as any}>
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: '#111111' as ColorProp, borderRadius: 1 }} />
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: accentColor, borderRadius: 1 }} />
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: '#333333' as ColorProp, borderRadius: 1 }} />
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: accentColor, borderRadius: 1 }} />
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: '#111111' as ColorProp, borderRadius: 1 }} />
            </FlexWidget>
            <FlexWidget style={{ flexDirection: 'row', gap: 2 } as any}>
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: accentColor, borderRadius: 1 }} />
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: '#111111' as ColorProp, borderRadius: 1 }} />
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: accentColor, borderRadius: 1 }} />
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: '#333333' as ColorProp, borderRadius: 1 }} />
              <FlexWidget style={{ width: 8, height: 8, backgroundColor: accentColor, borderRadius: 1 }} />
            </FlexWidget>
          </FlexWidget>
          <TextWidget text="COMMITS STATUS" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
        </FlexWidget>
      );
    }
    
    if (template.includes('build') || template.includes('cicd') || template.includes('ci/cd') || template.includes('deploy')) {
      return (
        <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
          <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
            <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
          </FlexWidget>
          <FlexWidget style={{ marginVertical: 4 }}>
            <TextWidget text={value || 'Deploying...'} style={{ fontSize: 13, fontWeight: 'bold', color: textColor }} />
            <FlexWidget style={{ width: 'match_parent', height: 4, backgroundColor: '#222222' as ColorProp, borderRadius: 2, marginTop: 4, flexDirection: 'row' }}>
              <FlexWidget style={{ flex: 60, height: 'match_parent', backgroundColor: '#39ff14' as ColorProp, borderRadius: 2 }} />
              <FlexWidget style={{ flex: 40, height: 'match_parent', backgroundColor: 'transparent' as ColorProp }} />
            </FlexWidget>
          </FlexWidget>
          <TextWidget text="CI/CD PIPELINE" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
        </FlexWidget>
      );
    }

    // Server CPU layout
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ width: 'match_parent', marginVertical: 4 }}>
          <TextWidget text={value || 'CPU: 28%'} style={{ fontSize: 13, fontWeight: 'bold', color: textColor }} />
          <FlexWidget style={{ width: 'match_parent', height: 4, backgroundColor: '#222222' as ColorProp, borderRadius: 2, marginTop: 4, flexDirection: 'row' }}>
            <FlexWidget style={{ flex: 28, height: 'match_parent', backgroundColor: accentColor, borderRadius: 2 }} />
            <FlexWidget style={{ flex: 72, height: 'match_parent', backgroundColor: 'transparent' as ColorProp }} />
          </FlexWidget>
        </FlexWidget>
        <TextWidget text="SYSTEM CPU" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // 8. SOCIAL WIDGETS
  if (template.startsWith('social_')) {
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ marginVertical: 4 }}>
          <TextWidget text={value || 'Stats update'} style={{ fontSize: 13, fontWeight: 'bold', color: textColor }} />
        </FlexWidget>
        <TextWidget text="SOCIAL FEED" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // 9. SMART HOME WIDGETS
  if (template.startsWith('smart_home_')) {
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ marginVertical: 4 }}>
          <TextWidget text={value || 'Lights Active'} style={{ fontSize: 13, fontWeight: 'bold', color: textColor }} />
        </FlexWidget>
        <TextWidget text="SMART HOME DEVICE" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // 10. AI WIDGETS
  if (template.startsWith('ai_')) {
    return (
      <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
          <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
        </FlexWidget>
        <FlexWidget style={{ marginVertical: 4 }}>
          <TextWidget text={value || 'Briefing ready'} style={{ fontSize: 13, fontWeight: 'bold', color: textColor }} />
        </FlexWidget>
        <TextWidget text="AI ASSISTANT" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
      </FlexWidget>
    );
  }

  // Fallback
  return (
    <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'space-between' }}>
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextWidget text={title} style={{ fontSize: 8, fontWeight: 'bold', color: subtextColor }} />
        <TextWidget text="•" style={{ fontSize: 8, color: accentColor }} />
      </FlexWidget>
      <FlexWidget style={{ marginVertical: 4 }}>
        <TextWidget text={value || 'Active'} style={{ fontSize: 13, fontWeight: 'bold', color: textColor }} />
      </FlexWidget>
      <TextWidget text="NOS • STUDIO" style={{ fontSize: 7, fontWeight: 'bold', color: accentColor }} />
    </FlexWidget>
  );
}

export function NOSWidgetComponent({ widgets, activeTheme }: NOSWidgetProps) {
  // Get active theme config
  const theme = themes[activeTheme as ThemeId] || themes.nos;
  const accentColor = theme.accentColor as ColorProp;
  const backgroundColor = theme.backgroundColor as ColorProp;
  const textColor = theme.textColor as ColorProp;
  const borderColor = theme.borderColor as ColorProp;
  const borderRadius = theme.borderRadius;
  const borderWidth = theme.borderWidth;

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
          borderWidth,
          borderColor,
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
        borderWidth,
        borderColor,
      }}
    >
      {displayWidgets.map((w, idx) => {
        const customizations = w.customizations || {};
        const widgetThemeId = customizations.themeOverride && customizations.themeOverride !== 'none'
          ? customizations.themeOverride
          : activeTheme;
        const widgetTheme = themes[widgetThemeId as ThemeId] || theme;
        
        const widgetBg = (customizations.backgroundColor || widgetTheme.backgroundColor) as ColorProp;
        const widgetText = (customizations.textColor || widgetTheme.textColor) as ColorProp;
        const widgetSubtext = widgetTheme.subtextColor as ColorProp;
        const widgetAccent = (customizations.accentColor || widgetTheme.accentColor) as ColorProp;
        const widgetBorderColor = widgetTheme.borderColor as ColorProp;
        const widgetBorderRadius = customizations.borderRadius !== undefined ? customizations.borderRadius : widgetTheme.borderRadius;
        const widgetBorderWidth = widgetTheme.borderWidth;

        return (
          <FlexWidget
            key={w.id || idx}
            style={{
              flex: 1,
              height: 'match_parent',
              backgroundColor: widgetBg,
              borderRadius: widgetBorderRadius,
              padding: 10,
              marginHorizontal: displayWidgets.length > 1 ? 6 : 0,
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderWidth: widgetBorderWidth,
              borderColor: widgetBorderColor,
            }}
          >
            {renderNativeWidgetContent(w, widgetAccent, widgetText, widgetSubtext)}
          </FlexWidget>
        );
      })}
    </FlexWidget>
  );
}

import React from 'react';
import widgetsJson from '../../../src/widgets/widgets.json';
import { WidgetLayoutProvider, LayoutNode } from './context';

// Import All Widget Components
import { DigitalClock } from '../../../src/widgets/clock/DigitalClock';
import { AnalogClock } from '../../../src/widgets/clock/AnalogClock';
import { StopwatchWidget } from '../../../src/widgets/clock/StopwatchWidget';
import { FlipClock } from '../../../src/widgets/clock/FlipClock';
import { CalendarMonthly } from '../../../src/widgets/calendar/CalendarMonthly';
import { AgendaWidget } from '../../../src/widgets/calendar/AgendaWidget';
import { YearProgress } from '../../../src/widgets/calendar/YearProgress';
import { WeatherCurrent } from '../../../src/widgets/weather/WeatherCurrent';
import { WeatherAqi } from '../../../src/widgets/weather/WeatherAqi';
import { MoonPhaseWidget } from '../../../src/widgets/weather/MoonPhaseWidget';
import { TodoWidget } from '../../../src/widgets/productivity/TodoWidget';
import { FocusWidget } from '../../../src/widgets/productivity/FocusWidget';
import { CalculatorWidget } from '../../../src/widgets/productivity/CalculatorWidget';
import { CameraWidget } from '../../../src/widgets/productivity/CameraWidget';
import { MusicWidget } from '../../../src/widgets/productivity/MusicWidget';
import { TextUsernameWidget } from '../../../src/widgets/productivity/TextUsernameWidget';
import { GoogleSearchWidget } from '../../../src/widgets/productivity/GoogleSearchWidget';
import { PomodoroWidget } from '../../../src/widgets/productivity/PomodoroWidget';
import { FolderWidget } from '../../../src/widgets/productivity/FolderWidget';
import { PhotoFrameWidget } from '../../../src/widgets/productivity/PhotoFrameWidget';
import { WaterWidget } from '../../../src/widgets/health/WaterWidget';
import { BreathingWidget } from '../../../src/widgets/health/BreathingWidget';
import { StepsWidget } from '../../../src/widgets/health/StepsWidget';
import { FinanceStockCrypto } from '../../../src/widgets/finance/FinanceStockCrypto';
import { GithubGrid } from '../../../src/widgets/developer/GithubGrid';
import { CicdPipeline } from '../../../src/widgets/developer/CicdPipeline';
import { CpuMonitor } from '../../../src/widgets/developer/CpuMonitor';
import { QuickControlsWidget } from '../../../src/widgets/smart_home/QuickControlsWidget';
import { BatteryWidget } from '../../../src/widgets/smart_home/BatteryWidget';
import { SocialFeed } from '../../../src/widgets/social/SocialFeed';
import { ContactWidget } from '../../../src/widgets/social/ContactWidget';
import { SocialShortcutsWidget } from '../../../src/widgets/social/SocialShortcutsWidget';
import { SmartHomeControls } from '../../../src/widgets/smart_home/SmartHomeControls';
import { TorchWidget } from '../../../src/widgets/smart_home/TorchWidget';
import { BluetoothWidget } from '../../../src/widgets/smart_home/BluetoothWidget';
import { SoundControlWidget } from '../../../src/widgets/smart_home/SoundControlWidget';
import { AiChatWidget } from '../../../src/widgets/ai/AiChatWidget';
import { AiSummaryWidget } from '../../../src/widgets/ai/AiSummaryWidget';
import { AiBarWidget } from '../../../src/widgets/ai/AiBarWidget';

interface WidgetData {
  id: string;
  templateId: string;
  w: number;
  h: number;
  customizations?: Record<string, string | number | boolean | undefined>;
}

// Get the corresponding React component for a template ID
function getWidgetComponent(templateId: string): React.ComponentType<any> {
  if (templateId.startsWith('clock_')) {
    if (templateId.includes('stopwatch')) return StopwatchWidget;
    if (templateId.includes('analog')) return AnalogClock;
    if (templateId.includes('flip')) return FlipClock;
    return DigitalClock;
  }
  if (templateId.startsWith('calendar_')) {
    if (templateId.includes('progress')) return YearProgress;
    if (templateId.includes('agenda')) return AgendaWidget;
    return CalendarMonthly;
  }
  if (templateId.startsWith('weather_')) {
    if (templateId.includes('aqi')) return WeatherAqi;
    if (templateId.includes('moon')) return MoonPhaseWidget;
    return WeatherCurrent;
  }
  if (templateId.startsWith('productivity_')) {
    if (templateId.includes('todo')) return TodoWidget;
    if (templateId.includes('calculator')) return CalculatorWidget;
    if (templateId.includes('camera')) return CameraWidget;
    if (templateId.includes('music')) return MusicWidget;
    if (templateId.includes('text') || templateId.includes('username')) return TextUsernameWidget;
    if (templateId.includes('search')) return GoogleSearchWidget;
    if (templateId.includes('pomodoro')) return PomodoroWidget;
    if (templateId.includes('folder')) return FolderWidget;
    if (templateId.includes('photo')) return PhotoFrameWidget;
    return FocusWidget;
  }
  if (templateId.startsWith('health_')) {
    if (templateId.includes('water')) return WaterWidget;
    if (templateId.includes('breath')) return BreathingWidget;
    return StepsWidget;
  }
  if (templateId.startsWith('finance_')) {
    return FinanceStockCrypto;
  }
  if (templateId.startsWith('developer_')) {
    if (templateId.includes('git')) return GithubGrid;
    if (templateId.includes('build') || templateId.includes('cicd')) return CicdPipeline;
    if (templateId.includes('controls')) return QuickControlsWidget;
    if (templateId.includes('battery')) return BatteryWidget;
    return CpuMonitor;
  }
  if (templateId.startsWith('social_')) {
    if (templateId.includes('contact')) return ContactWidget;
    if (templateId.includes('shortcuts')) return SocialShortcutsWidget;
    return SocialFeed;
  }
  if (templateId.startsWith('smart_home_')) {
    if (templateId.includes('torch')) return TorchWidget;
    if (templateId.includes('bluetooth')) return BluetoothWidget;
    if (templateId.includes('sound')) return SoundControlWidget;
    return SmartHomeControls;
  }
  if (templateId.startsWith('ai_')) {
    if (templateId.includes('chat')) return AiChatWidget;
    if (templateId.includes('bar') || templateId.includes('router')) return AiBarWidget;
    return AiSummaryWidget;
  }
  return AiSummaryWidget;
}

// Build props for the widget based on template expectations
function buildWidgetProps(templateId: string, customizations: Record<string, string | number | boolean | undefined>, state: Record<string, any>): Record<string, unknown> {
  const commonProps = {
    currentTime: new Date(),
    customizations,
    globalTheme: state.activeTheme || 'nos',
    interactive: false
  };

  if (templateId.startsWith('clock_')) {
    if (templateId.includes('stopwatch')) {
      return {
        ...commonProps,
        swTime: state.stopwatchTime || 0,
        swActive: state.stopwatchRunning || false,
        handleStopwatch: () => {},
        handleStopwatchReset: () => {}
      };
    }
  }

  if (templateId.startsWith('developer_')) {
    if (templateId.includes('build') || templateId.includes('cicd')) {
      return {
        ...commonProps,
        buildStatus: 'success',
        buildProgress: 100,
        triggerCICDBuild: () => {}
      };
    }
  }

  if (templateId.startsWith('smart_home_')) {
    if (templateId === 'smart_home_controls') {
      return {
        ...commonProps,
        lightOn: state.lightOn !== undefined ? state.lightOn : true,
        toggleLight: () => {}
      };
    }
  }

  if (templateId.startsWith('ai_')) {
    if (templateId.includes('chat')) {
      return {
        ...commonProps,
        aiInput: '',
        aiResponse: '',
        aiThinking: false,
        setAiInput: () => {},
        triggerAIChat: () => {}
      };
    }
    if (templateId === 'ai_summary') {
      return {
        ...commonProps,
        valText: customizations.valueText || ''
      };
    }
  }

  return commonProps;
}

// Recursively traverse and evaluate the React Element tree
function resolveElementTree(element: React.ReactNode): void {
  if (!element) return;
  if (Array.isArray(element)) {
    element.forEach(resolveElementTree);
    return;
  }

  const reactElement = element as React.ReactElement<any>;
  if (typeof reactElement.type === 'function') {
    try {
      const Component = reactElement.type as any;
      if (Component.prototype && typeof Component.prototype.render === 'function') {
        const instance = new Component(reactElement.props);
        resolveElementTree(instance.render());
      } else {
        const rendered = Component(reactElement.props);
        resolveElementTree(rendered);
      }
    } catch (e) {
      // Catch exceptions gracefully
    }
  } else if (reactElement.props && reactElement.props.children) {
    const children = reactElement.props.children;
    if (Array.isArray(children)) {
      children.forEach(resolveElementTree);
    } else {
      resolveElementTree(children);
    }
  }
}

// Dynamic JSX compiler pass (generates layoutJSON tree completely dynamically)
export function compileWidgetToLayout(widget: WidgetData, state: Record<string, any>): LayoutNode {
  const templateId = widget.templateId;
  const templateConfig = widgetsJson.find((w: any) => w.id === templateId);
  const defaults = (templateConfig?.customizations || {}) as Record<string, string | number | boolean | undefined>;
  const customizations = { ...defaults, ...(widget.customizations || {}) };

  const Component = getWidgetComponent(templateId);
  const props = buildWidgetProps(templateId, customizations, state);

  let compiledLayout: LayoutNode = {
    type: 'view',
    style: { width: '100%', height: '100%', flexDirection: 'column' },
    children: []
  };

  // Mock standard React Hooks temporarily to run functional component evaluation
  const originalUseMemo = React.useMemo;
  const originalUseState = React.useState;
  const originalUseEffect = React.useEffect;
  const originalUseRef = React.useRef;
  const originalUseCallback = React.useCallback;
  const originalContext = React.useContext;

  const ReactAny = React as any;
  ReactAny.useMemo = (factory: () => unknown) => factory();
  ReactAny.useState = (initialValue: unknown) => [
    typeof initialValue === 'function' ? (initialValue as Function)() : initialValue,
    () => {}
  ];
  ReactAny.useEffect = () => {};
  ReactAny.useRef = (initialValue: unknown) => ({ current: initialValue });
  ReactAny.useCallback = (callback: unknown) => callback;
  ReactAny.useContext = () => ({});

  // Enable compilation flags globally
  const globalObj = globalThis as any;
  globalObj.__WIDGET_COMPILING__ = true;
  globalObj.__WIDGET_COMPILING_STATE__ = state;
  globalObj.__WIDGET_COMPILING_CUSTOMS__ = customizations;

  try {
    const layoutProvider = React.createElement(WidgetLayoutProvider, {
      onLayoutCollected: (layout: LayoutNode) => {
        compiledLayout = layout;
      },
      children: React.createElement(Component, props)
    });

    resolveElementTree(layoutProvider);
  } catch (err) {
    console.error('[LayoutCompiler] Dynamic compilation failed for template:', templateId, err);
  } finally {
    // Restore React hooks
    ReactAny.useMemo = originalUseMemo;
    ReactAny.useState = originalUseState;
    ReactAny.useEffect = originalUseEffect;
    ReactAny.useRef = originalUseRef;
    ReactAny.useCallback = originalUseCallback;
    ReactAny.useContext = originalContext;

    // Clear flags
    delete globalObj.__WIDGET_COMPILING__;
    delete globalObj.__WIDGET_COMPILING_STATE__;
    delete globalObj.__WIDGET_COMPILING_CUSTOMS__;
  }

  // Ensure children contains root wrappers if root collected children
  return compiledLayout;
}

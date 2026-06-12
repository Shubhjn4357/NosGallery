import { Calendar, CheckSquare, Clock, CloudSun, Coins, Heart, Home, Layout, MessageSquare, Sparkles, Terminal, Timer } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useWidgetStore, ActiveWidget } from '../store/widgetStore';
import { ThemeId } from '../themes/themes';
import { useWidgetStyle } from '../hooks/useWidgetStyle';
import { useFeedback } from '../hooks/useFeedback';
import { widgetRegistry } from './registry';

// Modular Component Imports
import { DigitalClock } from './clock/DigitalClock';
import { AnalogClock } from './clock/AnalogClock';
import { StopwatchWidget } from './clock/StopwatchWidget';
import { FlipClock } from './clock/FlipClock';

import { CalendarMonthly } from './calendar/CalendarMonthly';
import { AgendaWidget } from './calendar/AgendaWidget';
import { YearProgress } from './calendar/YearProgress';

import { WeatherCurrent } from './weather/WeatherCurrent';
import { WeatherAqi } from './weather/WeatherAqi';
import { MoonPhaseWidget } from './weather/MoonPhaseWidget';

import { TodoWidget } from './productivity/TodoWidget';
import { FocusWidget } from './productivity/FocusWidget';
import { CalculatorWidget } from './productivity/CalculatorWidget';
import { CameraWidget } from './productivity/CameraWidget';
import { MusicWidget } from './productivity/MusicWidget';
import { TextUsernameWidget } from './productivity/TextUsernameWidget';
import { GoogleSearchWidget } from './productivity/GoogleSearchWidget';
import { PomodoroWidget } from './productivity/PomodoroWidget';
import { FolderWidget } from './productivity/FolderWidget';
import { PhotoFrameWidget } from './productivity/PhotoFrameWidget';

import { WaterWidget } from './health/WaterWidget';
import { BreathingWidget } from './health/BreathingWidget';
import { StepsWidget } from './health/StepsWidget';

import { FinanceStockCrypto } from './finance/FinanceStockCrypto';

import { GithubGrid } from './developer/GithubGrid';
import { CicdPipeline } from './developer/CicdPipeline';
import { CpuMonitor } from './developer/CpuMonitor';
import { QuickControlsWidget } from './smart_home/QuickControlsWidget';
import { BatteryWidget } from './smart_home/BatteryWidget';

import { SocialFeed } from './social/SocialFeed';
import { ContactWidget } from './social/ContactWidget';
import { SocialShortcutsWidget } from './social/SocialShortcutsWidget';
import { queryAiProvider } from '../services/aiService';

import { SmartHomeControls } from './smart_home/SmartHomeControls';
import { TorchWidget } from './smart_home/TorchWidget';
import { BluetoothWidget } from './smart_home/BluetoothWidget';
import { SoundControlWidget } from './smart_home/SoundControlWidget';

import { AiChatWidget } from './ai/AiChatWidget';
import { AiSummaryWidget } from './ai/AiSummaryWidget';
import { AiBarWidget } from './ai/AiBarWidget';

const LucideIcons = {
  Calendar,
  CheckSquare,
  Clock,
  CloudSun,
  Coins,
  Heart,
  Home,
  Layout,
  MessageSquare,
  Sparkles,
  Terminal,
  Timer,
};

interface WidgetRendererProps {
  widget: ActiveWidget;
  globalTheme: ThemeId;
  onPress?: () => void;
  interactive?: boolean;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  globalTheme,
  onPress,
  interactive = false,
}) => {
  const { triggerHaptic, triggerSound } = useFeedback();

  // State definitions for interactive widgets
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Stopwatch State
  const [swActive, setSwActive] = useState(false);
  const [swTime, setSwTime] = useState(0); // in deciseconds
  const swInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // 2. CI/CD Build Pipeline State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'testing' | 'success' | 'failed'>('success');
  const [buildProgress, setBuildProgress] = useState(100);

  // 3. Smart Home Toggles
  const [lightOn, setLightOn] = useState(true);

  // 4. AI Chat input
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiThinking, setAiThinking] = useState(false);

  // Timers and Ticking Loops
  useEffect(() => {
    if (!interactive) return;

    // Clock Ticker
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(clockTimer);
      if (swInterval.current) clearInterval(swInterval.current);
    };
  }, [interactive]);

  // Stopwatch controls
  const handleStopwatch = () => {
    if (!interactive) return;
    triggerHaptic('light');
    if (swActive) {
      if (swInterval.current) clearInterval(swInterval.current);
      setSwActive(false);
    } else {
      setSwActive(true);
      swInterval.current = setInterval(() => {
        setSwTime((prev) => prev + 1);
      }, 100);
    }
  };

  const handleStopwatchReset = () => {
    if (!interactive) return;
    triggerHaptic('medium');
    if (swInterval.current) clearInterval(swInterval.current);
    setSwActive(false);
    setSwTime(0);
  };

  // CI/CD Build runner
  const triggerCICDBuild = () => {
    if (!interactive || buildStatus === 'building' || buildStatus === 'testing') return;
    triggerHaptic('medium');
    triggerSound('apply');
    setBuildStatus('building');
    setBuildProgress(20);

    setTimeout(() => {
      setBuildStatus('testing');
      setBuildProgress(60);
      setTimeout(() => {
        const passed = Math.random() > 0.15;
        setBuildStatus(passed ? 'success' : 'failed');
        setBuildProgress(100);
        if (passed) {
          triggerHaptic('success');
        } else {
          triggerHaptic('error');
        }
      }, 1500);
    }, 1500);
  };

  // AI chat response
  const triggerAIChat = () => {
    if (!aiInput.trim()) return;
    triggerHaptic('selection');
    setAiThinking(true);
    const query = aiInput;
    setAiInput('');

    const activeProvider = useWidgetStore.getState().activeAiProvider;
    const apiKey = useWidgetStore.getState().geminiApiKey;

    queryAiProvider(activeProvider, query, apiKey)
      .then((res) => {
        setAiThinking(false);
        setAiResponse(res.response);
      })
      .catch((err) => {
        setAiThinking(false);
        setAiResponse(`Error: ${err.message}`);
      });
  };

  const customizations = {};
  const { containerStyle, accentColor, textStyle } = useWidgetStyle(customizations, globalTheme);

  // Selector for modular rendering
  const renderWidgetContent = () => {
    const template = widget.templateId;

    // 1. CLOCK
    if (template.startsWith('clock_')) {
      if (template.includes('stopwatch') || template.includes('timer') || template.includes('countdown')) {
        return (
          <StopwatchWidget
            swTime={swTime}
            swActive={swActive}
            customizations={customizations as any}
            globalTheme={globalTheme}
            interactive={interactive}
            handleStopwatch={handleStopwatch}
            handleStopwatchReset={handleStopwatchReset}
          />
        );
      }
      if (template.includes('analog')) {
        return (
          <AnalogClock
            currentTime={currentTime}
            customizations={customizations as any}
            globalTheme={globalTheme}
          />
        );
      }
      if (template.includes('flip')) {
        return (
          <FlipClock
            currentTime={currentTime}
            customizations={customizations as any}
            globalTheme={globalTheme}
          />
        );
      }
      return (
        <DigitalClock
          currentTime={currentTime}
          customizations={customizations as any}
          globalTheme={globalTheme}
        />
      );
    }

    // 2. CALENDAR
    if (template.startsWith('calendar_')) {
      if (template.includes('progress')) {
        return (
          <YearProgress
            currentTime={currentTime}
            customizations={customizations as any}
            globalTheme={globalTheme}
          />
        );
      }
      if (template.includes('agenda') || template.includes('list') || template.includes('timeline')) {
        return (
          <AgendaWidget
            customizations={customizations as any}
            globalTheme={globalTheme}
          />
        );
      }
      return (
        <CalendarMonthly
          currentTime={currentTime}
          customizations={customizations as any}
          globalTheme={globalTheme}
        />
      );
    }

    // 3. WEATHER
    if (template.startsWith('weather_')) {
      if (template.includes('aqi')) {
        return (
          <WeatherAqi
            customizations={customizations as any}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('moon')) {
        return (
          <MoonPhaseWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <WeatherCurrent
          customizations={customizations as any}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 4. PRODUCTIVITY
    if (template.startsWith('productivity_')) {
      if (template.includes('todo') || template.includes('task') || template.includes('checklist')) {
        return (
          <TodoWidget
            customizations={customizations as any}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('calculator')) {
        return (
          <CalculatorWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('camera')) {
        return (
          <CameraWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('music')) {
        return (
          <MusicWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('text') || template.includes('username')) {
        return (
          <TextUsernameWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('search')) {
        return (
          <GoogleSearchWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('pomodoro')) {
        return (
          <PomodoroWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('folder')) {
        return (
          <FolderWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('photo')) {
        return (
          <PhotoFrameWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <FocusWidget
          customizations={customizations as any}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 5. HEALTH
    if (template.startsWith('health_')) {
      if (template.includes('water')) {
        return (
          <WaterWidget
            customizations={customizations as any}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('breath') || template.includes('meditation')) {
        return (
          <BreathingWidget
            customizations={customizations as any}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <StepsWidget
          customizations={customizations as any}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 6. FINANCE
    if (template.startsWith('finance_')) {
      return (
        <FinanceStockCrypto
          customizations={customizations as any}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 7. DEVELOPER
    if (template.startsWith('developer_')) {
      if (template.includes('git')) {
        return (
          <GithubGrid
            customizations={customizations as any}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template === 'developer_build' || template.includes('build') || template.includes('ci/cd') || template.includes('cicd') || template.includes('deploy')) {
        return (
          <CicdPipeline
            buildStatus={buildStatus}
            buildProgress={buildProgress}
            customizations={customizations as any}
            globalTheme={globalTheme}
            interactive={interactive}
            triggerCICDBuild={triggerCICDBuild}
          />
        );
      }
      if (template.includes('controls')) {
        return (
          <QuickControlsWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('battery')) {
        return (
          <BatteryWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <CpuMonitor
          customizations={customizations as any}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 8. SOCIAL
    if (template.startsWith('social_')) {
      if (template.includes('contact')) {
        return (
          <ContactWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('shortcuts')) {
        return (
          <SocialShortcutsWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <SocialFeed
          customizations={customizations as any}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 9. SMART HOME
    if (template.startsWith('smart_home_')) {
      if (template.includes('torch')) {
        return (
          <TorchWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('bluetooth')) {
        return (
          <BluetoothWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('sound_control')) {
        return (
          <SoundControlWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <SmartHomeControls
          lightOn={lightOn}
          customizations={customizations as any}
          globalTheme={globalTheme}
          interactive={interactive}
          toggleLight={() => {
            triggerHaptic('light');
            setLightOn(prev => !prev);
          }}
        />
      );
    }

    // 10. AI
    if (template.startsWith('ai_')) {
      if (template.includes('chat') || template.includes('assistant') || template.includes('search')) {
        return (
          <AiChatWidget
            aiInput={aiInput}
            aiResponse={aiResponse}
            aiThinking={aiThinking}
            customizations={customizations as any}
            globalTheme={globalTheme}
            interactive={interactive}
            setAiInput={setAiInput}
            triggerAIChat={triggerAIChat}
          />
        );
      }
      if (template.includes('bar') || template.includes('router')) {
        return (
          <AiBarWidget
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <AiSummaryWidget
          valText={(customizations as any).valueText || ''}
          customizations={customizations as any}
          globalTheme={globalTheme}
        />
      );
    }

    // Fallback general icons card
    const templateConfig = widgetRegistry[template];
    const iconName = templateConfig?.iconName || 'Layout';
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[iconName] || LucideIcons.Layout;
    return (
      <View style={styles.fallbackContainer}>
        <IconComponent size={14} color={accentColor} />
        <Text style={[styles.fallbackText, textStyle]}>{(customizations as any).valueText || 'Information Card'}</Text>
      </View>
    );
  };

  const widgetWidth = widget.w * 80;
  const widgetHeight = widget.h * 80;
  const isLiquidGlass = globalTheme === 'liquidglass';
  const borderRadius = (containerStyle.borderRadius as number) || 16;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.widgetCard,
        containerStyle,
        {
          width: widgetWidth,
          height: widgetHeight,
        },
      ]}
    >
      {renderWidgetContent()}

      {/* Iridescent Chromatic Aberration corner sheen for 2026 Liquid Glass style */}
      {isLiquidGlass && (
        <>
          <View style={[styles.sheenRed, { borderTopLeftRadius: borderRadius }]} />
          <View style={[styles.sheenCyan, { borderTopLeftRadius: borderRadius }]} />
          <View style={[styles.sheenWhite, { borderTopLeftRadius: borderRadius }]} />
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  widgetCard: {
    padding: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fallbackText: {
    fontSize: 10,
  },
  sheenRed: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 32,
    height: 32,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#ff0055',
    opacity: 0.6,
  },
  sheenCyan: {
    position: 'absolute',
    top: -0.5,
    left: -0.5,
    width: 32,
    height: 32,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#00ffff',
    opacity: 0.6,
  },
  sheenWhite: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#ffffff',
    opacity: 0.85,
  },
});

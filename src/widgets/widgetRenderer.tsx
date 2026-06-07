import { Calendar, CheckSquare, Clock, CloudSun, Coins, Heart, Home, Layout, MessageSquare, Sparkles, Terminal, Timer } from 'lucide-react-native';

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

import { TodoWidget } from './productivity/TodoWidget';
import { FocusWidget } from './productivity/FocusWidget';

import { WaterWidget } from './health/WaterWidget';
import { BreathingWidget } from './health/BreathingWidget';
import { StepsWidget } from './health/StepsWidget';

import { FinanceStockCrypto } from './finance/FinanceStockCrypto';

import { GithubGrid } from './developer/GithubGrid';
import { CicdPipeline } from './developer/CicdPipeline';
import { CpuMonitor } from './developer/CpuMonitor';

import { SocialFeed } from './social/SocialFeed';
import { SmartHomeControls } from './smart_home/SmartHomeControls';

import { AiChatWidget } from './ai/AiChatWidget';
import { AiSummaryWidget } from './ai/AiSummaryWidget';

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
  const { googleUser } = useWidgetStore();
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

    setTimeout(() => {
      setAiThinking(false);
      const responses: Record<string, string> = {
        weather: 'Open-Meteo local stations report dry spells. Humidity is dropping.',
        stocks: 'AAPL has a +1.2% daily drift. Bitcoin ranges at support levels.',
        todo: 'Check the Vercel branch. Standup starts in 10 minutes.',
      };

      const matchedKey = Object.keys(responses).find(key => query.toLowerCase().includes(key));
      const prefix = googleUser ? `Hello ${googleUser.name}! ` : '';
      setAiResponse(matchedKey ? prefix + responses[matchedKey] : prefix + 'Query processed. Daily schedule metrics look optimal.');
    }, 1200);
  };

  const customizations = widget.customizations;
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
            customizations={customizations}
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
            customizations={customizations}
            globalTheme={globalTheme}
          />
        );
      }
      if (template.includes('flip')) {
        return (
          <FlipClock
            currentTime={currentTime}
            customizations={customizations}
            globalTheme={globalTheme}
          />
        );
      }
      return (
        <DigitalClock
          currentTime={currentTime}
          customizations={customizations}
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
            customizations={customizations}
            globalTheme={globalTheme}
          />
        );
      }
      if (template.includes('agenda') || template.includes('list') || template.includes('timeline')) {
        return (
          <AgendaWidget
            customizations={customizations}
            globalTheme={globalTheme}
          />
        );
      }
      return (
        <CalendarMonthly
          currentTime={currentTime}
          customizations={customizations}
          globalTheme={globalTheme}
        />
      );
    }

    // 3. WEATHER
    if (template.startsWith('weather_')) {
      if (template.includes('aqi')) {
        return (
          <WeatherAqi
            customizations={customizations}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <WeatherCurrent
          customizations={customizations}
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
            customizations={customizations}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <FocusWidget
          customizations={customizations}
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
            customizations={customizations}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      if (template.includes('breath') || template.includes('meditation')) {
        return (
          <BreathingWidget
            customizations={customizations}
            globalTheme={globalTheme}
            interactive={interactive}
          />
        );
      }
      return (
        <StepsWidget
          customizations={customizations}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 6. FINANCE
    if (template.startsWith('finance_')) {
      return (
        <FinanceStockCrypto
          customizations={customizations}
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
            customizations={customizations}
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
            customizations={customizations}
            globalTheme={globalTheme}
            interactive={interactive}
            triggerCICDBuild={triggerCICDBuild}
          />
        );
      }
      return (
        <CpuMonitor
          customizations={customizations}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 8. SOCIAL
    if (template.startsWith('social_')) {
      return (
        <SocialFeed
          customizations={customizations}
          globalTheme={globalTheme}
          interactive={interactive}
        />
      );
    }

    // 9. SMART HOME
    if (template.startsWith('smart_home_')) {
      return (
        <SmartHomeControls
          lightOn={lightOn}
          customizations={customizations}
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
            customizations={customizations}
            globalTheme={globalTheme}
            interactive={interactive}
            setAiInput={setAiInput}
            triggerAIChat={triggerAIChat}
          />
        );
      }
      return (
        <AiSummaryWidget
          valText={customizations.valueText || ''}
          customizations={customizations}
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
        <Text style={[styles.fallbackText, textStyle]}>{customizations.valueText || 'Information Card'}</Text>
      </View>
    );
  };

  const widgetWidth = widget.w * 80;
  const widgetHeight = widget.h * 80;

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
    </TouchableOpacity>
  );
};



const styles = StyleSheet.create({
  widgetCard: {
    padding: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
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
});

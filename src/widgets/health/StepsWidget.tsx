import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface StepsWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

export const StepsWidget: React.FC<StepsWidgetProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'FITNESS';
  const lowercaseTitle = title.toLowerCase();

  // 1. Dynamic States
  const [steps, setSteps] = useState(() => {
    if (customizations.valueText && !lowercaseTitle.includes('cal') && !lowercaseTitle.includes('burn') && !lowercaseTitle.includes('sleep') && !lowercaseTitle.includes('rest') && !lowercaseTitle.includes('water') && !lowercaseTitle.includes('hydration') && !lowercaseTitle.includes('mood') && !lowercaseTitle.includes('stress')) {
      const parsed = parseInt(customizations.valueText.replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 8432 : parsed;
    }
    return 8432;
  });

  const [calories, setCalories] = useState(() => {
    if (customizations.valueText && (lowercaseTitle.includes('cal') || lowercaseTitle.includes('burn'))) {
      const parsed = parseInt(customizations.valueText.replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 482 : parsed;
    }
    return 482;
  });

  const [sleepMinutes, setSleepMinutes] = useState(() => {
    if (customizations.valueText && (lowercaseTitle.includes('sleep') || lowercaseTitle.includes('rest'))) {
      const matches = customizations.valueText.match(/(\d+)\s*h\s*(\d+)\s*m/i);
      if (matches) {
        return parseInt(matches[1], 10) * 60 + parseInt(matches[2], 10);
      }
      const parsed = parseInt(customizations.valueText.replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 462 : parsed;
    }
    return 7 * 60 + 42;
  });

  const [waterLogged, setWaterLogged] = useState(() => {
    if (customizations.valueText && (lowercaseTitle.includes('water') || lowercaseTitle.includes('hydration'))) {
      const parsed = parseInt(customizations.valueText.split('/')[0].replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 5 : parsed;
    }
    return 5;
  });

  const [stressVal, setStressVal] = useState(() => {
    if (customizations.valueText && (lowercaseTitle.includes('mood') || lowercaseTitle.includes('stress'))) {
      const parsed = parseInt(customizations.valueText.replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 38 : parsed;
    }
    return 38;
  });

  // 2. Simulated real-time increments
  useEffect(() => {
    if (!interactive) return;
    const ticker = setInterval(() => {
      // Ticking steps up randomly to simulate walking
      setSteps(prev => prev + Math.floor(Math.random() * 3));
      // Ticking calories slightly up
      setCalories(prev => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 3000);
    return () => clearInterval(ticker);
  }, [interactive]);

  // 3. Click handler
  const handlePress = () => {
    if (!interactive) return;
    if (lowercaseTitle.includes('cal') || lowercaseTitle.includes('burn')) {
      setCalories(prev => prev + 15);
    } else if (lowercaseTitle.includes('sleep') || lowercaseTitle.includes('rest')) {
      setSleepMinutes(prev => prev + 15);
    } else if (lowercaseTitle.includes('water') || lowercaseTitle.includes('hydration')) {
      setWaterLogged(prev => (prev >= 8 ? 0 : prev + 1));
    } else if (lowercaseTitle.includes('mood') || lowercaseTitle.includes('stress')) {
      setStressVal(prev => Math.max(10, Math.min(100, prev + Math.floor(Math.random() * 21) - 10)));
    } else {
      setSteps(prev => prev + 250);
      setCalories(prev => prev + 10);
    }
  };

  const getStats = () => {
    if (lowercaseTitle.includes('cal') || lowercaseTitle.includes('burn')) {
      const pct = Math.min(100, Math.round((calories / 700) * 100));
      return { val: `${calories} kcal`, sub: `${pct}% of daily target` };
    }
    if (lowercaseTitle.includes('sleep') || lowercaseTitle.includes('rest')) {
      const h = Math.floor(sleepMinutes / 60);
      const m = sleepMinutes % 60;
      const score = Math.min(100, Math.round((sleepMinutes / 480) * 100)); // target 8h
      return { val: `${h}h ${m}m`, sub: `${score}% sleep quality score` };
    }
    if (lowercaseTitle.includes('water') || lowercaseTitle.includes('hydration')) {
      const pct = Math.round((waterLogged / 8) * 100);
      return { val: `${waterLogged} / 8 cups`, sub: `${pct}% completed` };
    }
    if (lowercaseTitle.includes('mood') || lowercaseTitle.includes('stress')) {
      const moodLabel = stressVal < 35 ? 'Resting' : stressVal < 65 ? 'Calm' : 'Alert';
      return { val: `${moodLabel} (${stressVal})`, sub: 'ECG heart rate normal' };
    }
    // Default steps
    const pct = Math.min(100, Math.round((steps / 10000) * 100));
    return { val: `${steps.toLocaleString()} steps`, sub: `${pct}% of steps goal` };
  };

  const stats = getStats();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!interactive}
      onPress={handlePress}
      style={styles.container}
    >
      <Text style={[styles.title, subtextStyle]}>{title}</Text>
      <Text style={[styles.value, textStyle]}>{stats.val}</Text>
      <Text style={[styles.desc, subtextStyle, { color: accentColor }]}>{stats.sub}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 9.5,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import * as LucideIcons from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

interface StepsWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

interface ProgressRingProps {
  size: number;
  progress: number; // 0 to 1
  strokeWidth: number;
  color: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ size, progress, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(120, 120, 120, 0.1)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="transparent"
      />
    </Svg>
  );
};

export const StepsWidget: React.FC<StepsWidgetProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { containerStyle, textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'TOTAL THIS WEEK';
  const lowercaseTitle = title.toLowerCase();

  const isLightBackground = customizations.backgroundColor === '#ffffff';
  const themeTextColor = isLightBackground ? '#000000' : '#ffffff';
  const themeSubtextColor = isLightBackground ? '#888888' : '#aaaaaa';

  // State values
  const [kcal, setKcal] = useState(13000);
  const [steps, setSteps] = useState(8432);

  useEffect(() => {
    if (!interactive) return;
    const interval = setInterval(() => {
      setKcal((prev) => prev + Math.floor(Math.random() * 3));
      setSteps((prev) => prev + Math.floor(Math.random() * 2));
    }, 4000);
    return () => clearInterval(interval);
  }, [interactive]);

  const handlePress = () => {
    if (!interactive) return;
    setKcal((prev) => prev + 150);
    setSteps((prev) => prev + 100);
  };

  // If title indicates calorie/week overview (like Image 1)
  const isCalorieView = lowercaseTitle.includes('cal') || lowercaseTitle.includes('week') || lowercaseTitle.includes('macro');

  if (isCalorieView) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={!interactive}
        style={styles.calorieContainer}
      >
        {/* Header row */}
        <View style={styles.calHeaderRow}>
          <View>
            <Text style={[styles.calSubTitle, { color: themeSubtextColor }]}>{title.toUpperCase()}</Text>
            <View style={styles.calValueGroup}>
              <Text style={[styles.calValueText, { color: themeTextColor }]}>{kcal.toLocaleString()}</Text>
              <Text style={[styles.calUnitText, { color: themeSubtextColor }]}> kcal</Text>
            </View>
            <Text style={[styles.calGoalText, { color: themeSubtextColor }]}>Goal: 14,000 kcal</Text>
          </View>
          <View style={styles.flameCircle}>
            <LucideIcons.Flame size={20} color="#ff9500" fill="#ff9500" />
          </View>
        </View>

        {/* Macros row with circular progress rings */}
        <View style={styles.macrosRow}>
          <View style={styles.macroCol}>
            <ProgressRing size={34} progress={1.0} strokeWidth={3.5} color="#007aff" />
            <View style={styles.macroLabelRow}>
              <LucideIcons.Beef size={9} color="#007aff" />
              <Text style={[styles.macroLabel, { color: themeTextColor }]}>Protein</Text>
            </View>
            <Text style={[styles.macroValue, { color: themeSubtextColor }]}>700/700g</Text>
          </View>

          <View style={styles.macroCol}>
            <ProgressRing size={34} progress={0.88} strokeWidth={3.5} color="#34c759" />
            <View style={styles.macroLabelRow}>
              <LucideIcons.Wheat size={9} color="#34c759" />
              <Text style={[styles.macroLabel, { color: themeTextColor }]}>Carbs</Text>
            </View>
            <Text style={[styles.macroValue, { color: themeSubtextColor }]}>1605/1765</Text>
          </View>

          <View style={styles.macroCol}>
            <ProgressRing size={34} progress={0.91} strokeWidth={3.5} color="#ffcc00" />
            <View style={styles.macroLabelRow}>
              <LucideIcons.Droplet size={9} color="#ffcc00" />
              <Text style={[styles.macroLabel, { color: themeTextColor }]}>Fat</Text>
            </View>
            <Text style={[styles.macroValue, { color: themeSubtextColor }]}>420/460g</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Otherwise, render a premium standard steps count layout
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={!interactive}
      style={styles.stepsContainer}
    >
      <View style={styles.stepsHeader}>
        <View style={styles.stepsBadge}>
          <LucideIcons.Footprints size={11} color={accentColor} />
          <Text style={[styles.stepsBadgeText, { color: accentColor }]}>WALK</Text>
        </View>
        <Text style={[styles.stepsGoalText, { color: themeSubtextColor }]}>Target: 10k</Text>
      </View>

      <View style={styles.stepsMain}>
        <Text style={[styles.stepsValueText, { color: themeTextColor }]}>{steps.toLocaleString()}</Text>
        <Text style={[styles.stepsLabelText, { color: themeSubtextColor }]}>STEPS TODAY</Text>
      </View>

      {/* Mini Horizontal Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: isLightBackground ? '#efeff4' : '#1a1a1c' }]}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, (steps / 10000) * 100)}%`, backgroundColor: accentColor }]} />
        </View>
        <Text style={[styles.progressPctText, { color: accentColor }]}>
          {Math.round((steps / 10000) * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  calorieContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  calHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  calSubTitle: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  calValueGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  calValueText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  calUnitText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  calGoalText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    marginTop: 1,
  },
  flameCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120, 120, 120, 0.08)',
  },
  macroCol: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  macroLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  macroValue: {
    fontSize: 7,
    fontWeight: '500',
    marginTop: 1,
  },
  // Steps fallback styles
  stepsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(120, 120, 120, 0.06)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    gap: 3,
  },
  stepsBadgeText: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  stepsGoalText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  stepsMain: {
    marginVertical: 4,
  },
  stepsValueText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  stepsLabelText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBarBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPctText: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 22,
    textAlign: 'right',
  },
});

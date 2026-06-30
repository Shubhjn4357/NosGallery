// @widget developer_cpu
import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from '../../../modules/expo-widget/src';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface CpuMonitorProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

export const CpuMonitor: React.FC<CpuMonitorProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { textStyle, subtextStyle } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'NOISE';
  const lowercaseTitle = title.toLowerCase();

  const isNoiseWidget = lowercaseTitle.includes('noise') || 
                        lowercaseTitle.includes('decibel') || 
                        lowercaseTitle.includes('sound') || 
                        lowercaseTitle.includes('db');

  // Value state (decibels or CPU percentage)
  const [value, setValue] = useState(() => {
    if (customizations.valueText) {
      const parsed = parseFloat(customizations.valueText.replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? (isNoiseWidget ? 47.8 : 12) : parsed;
    }
    return isNoiseWidget ? 47.8 : 12;
  });

  // Sound bars for CPU/RAM chart (16 bars)
  const [barHeights, setBarHeights] = useState<number[]>([
    12, 18, 28, 42, 50, 45, 30, 20, 25, 38, 55, 60, 40, 22, 15, 8
  ]);

  useEffect(() => {
    if (!interactive) return;
    const ticker = setInterval(() => {
      if (isNoiseWidget) {
        setValue(prev => {
          const delta = (Math.random() * 4) - 2; // -2 to +2 dB
          return Math.min(80, Math.max(32, parseFloat((prev + delta).toFixed(1))));
        });
      } else {
        setValue(prev => {
          const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4%
          return Math.min(99, Math.max(2, prev + delta));
        });
        setBarHeights(prev => 
          prev.map(h => Math.min(90, Math.max(8, h + (Math.floor(Math.random() * 21) - 10))))
        );
      }
    }, 1200);

    return () => clearInterval(ticker);
  }, [interactive, isNoiseWidget]);

  // Noise decibel widget layout (Image 4)
  if (isNoiseWidget) {
    const minVal = 32;
    const maxVal = 80;
    const clampedVal = Math.min(maxVal, Math.max(minVal, value));
    
    // Angle of needle (0 represents 180 degrees left, PI represents 0 degrees right)
    const angleRad = ((clampedVal - minVal) / (maxVal - minVal)) * Math.PI;
    const r = 24;
    // Needle tip relative to bottom-center of gauge (35, 35)
    const needleX = 35 - r * Math.cos(angleRad);
    const needleY = 32 - r * Math.sin(angleRad);

    return (
      <View style={[styles.noiseContainer, { backgroundColor: '#ff9500' }]}>
        {/* Top Range */}
        <Text style={styles.noiseRangeText}>32-80</Text>

        {/* Center decibel readout */}
        <View style={styles.dbValueContainer}>
          <Text style={styles.dbText}>{value.toFixed(1)}</Text>
          <Text style={styles.dbUnit}>dB</Text>
        </View>

        {/* Bottom Needle Dial */}
        <View style={styles.dialContainer}>
          <Svg width={70} height={35} style={styles.gaugeSvg}>
            {/* Outline Arc */}
            <Path
              d="M 10,32 A 25,25 0 0,1 60,32"
              stroke="rgba(0, 0, 0, 0.15)"
              strokeWidth={3}
              fill="none"
            />
            {/* Needle */}
            <Line
              x1={35}
              y1={32}
              x2={needleX}
              y2={needleY}
              stroke="#000000"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Pivot */}
            <Circle cx={35} cy={32} r={2} fill="#000000" />
          </Svg>
          <Text style={styles.dialLabel}>Noise</Text>
        </View>
      </View>
    );
  }

  // Otherwise, render a premium vertical yellow bar chart CPU monitor (Image 3)
  const isLight = customizations.backgroundColor === '#ffffff';
  const accentYellow = customizations.accentColor || '#ffcc00';

  return (
    <View style={styles.cpuContainer}>
      {/* Title Header */}
      <View style={styles.cpuHeader}>
        <Text style={[styles.cpuTitle, subtextStyle]}>{title}</Text>
        <Text style={[styles.cpuPercentage, textStyle, { color: accentYellow }]}>{Math.round(value)}%</Text>
      </View>

      {/* Vertical Frequency Bars */}
      <View style={styles.frequencyRow}>
        {barHeights.map((height, idx) => (
          <View
            key={idx}
            style={[
              styles.frequencyBar,
              {
                height: `${height}%`,
                backgroundColor: idx < (value / 100 * barHeights.length)
                  ? accentYellow
                  : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'),
              }
            ]}
          />
        ))}
      </View>

      {/* Sub Label */}
      <Text style={[styles.cpuSubtext, subtextStyle]}>Realtime Core Activity</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Noise Widget Styles
  noiseContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 24,
    alignItems: 'center',
  },
  noiseRangeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.5,
  },
  dbValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dbText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  dbUnit: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 1,
  },
  dialContainer: {
    alignItems: 'center',
    width: '100%',
    height: 42,
  },
  gaugeSvg: {
    alignSelf: 'center',
  },
  dialLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#000000',
    marginTop: -2,
    opacity: 0.8,
  },

  // CPU Widget Styles
  cpuContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cpuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cpuTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cpuPercentage: {
    fontSize: 11,
    fontWeight: '900',
  },
  frequencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 36,
    marginVertical: 4,
    paddingHorizontal: 2,
  },
  frequencyBar: {
    width: 2.8,
    borderRadius: 1.5,
  },
  cpuSubtext: {
    fontSize: 7.5,
    fontWeight: 'bold',
    opacity: 0.6,
  },
});

